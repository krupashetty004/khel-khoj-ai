const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const axios = require("axios");
const mongoose = require("mongoose");
const AnalysisJob = require("../models/AnalysisJob");
const FormData = require("form-data");

const FASTAPI_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, "../../datasets/uploads");
// const PY_VIDEO_DIR = process.env.PY_VIDEO_DIR || path.resolve(__dirname, "../../../python-api/video_input");
console.log("[jobService] UPLOAD_DIR:", UPLOAD_DIR);
// console.log("[jobService] PY_VIDEO_DIR:", PY_VIDEO_DIR);
console.log("[jobService] __dirname:", __dirname);
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// fs.mkdirSync(PY_VIDEO_DIR, { recursive: true });

const memoryJobs = new Map();

function dbReady() {
  return mongoose.connection.readyState === 1;
}

async function createJob({
  videoId,
  athleteId,
  filePath,
  uploadedBy,
  uploaderType,
  notes,
  isPublic,
  exerciseType,
}) {
  const base = {
    videoId,
    athleteId,
    videoPath: filePath,
    status: "queued",
    uploadedBy: uploadedBy || null,
    uploaderType: uploaderType || "anonymous",
    notes: notes || null,
    isPublic: isPublic || false,
    exerciseType: exerciseType || null,
  };

  const job = dbReady()
    ? await AnalysisJob.create(base)
    : { _id: crypto.randomUUID(), ...base };

  memoryJobs.set(job._id || job.id, job);

  // Upload video directly to FastAPI
  const form = new FormData();

  form.append("video", fs.createReadStream(filePath));
  form.append("video_id", videoId);
  form.append("athlete_id", athleteId || "unknown");

  if (exerciseType) {
    form.append("exercise_hint", exerciseType);
  }

let taskResp;

try {
  console.log("Posting to:", `${FASTAPI_URL}/api/v1/analyze-video`);

  taskResp = await axios.post(
    `${FASTAPI_URL}/api/v1/analyze-video`,
    form,
    {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000,
    }
  );

  console.log("FastAPI response:", taskResp.data);

} catch (err) {
  console.error("========== FASTAPI REQUEST FAILED ==========");
  console.error(err);

  console.error("Message:", err.message);
  console.error("Code:", err.code);

  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Response:", err.response.data);
  }

  if (err.request) {
    console.error("No response received from FastAPI");
  }

  console.error("Stack:", err.stack);

  throw err;
}


  const taskId = taskResp.data.task_id;

  job.taskId = taskId;
  job.status = "processing";

  if (dbReady()) {
    await AnalysisJob.findByIdAndUpdate(job._id, {
      taskId,
      status: "processing",
    });
  }

  memoryJobs.set(job._id || job.id, job);

  return job;
}

async function refreshJob(taskId, jobId) {
  const url = `${FASTAPI_URL}/api/v1/task/${taskId}`;
  let payload;
  let existingJob;
  if (dbReady()) {
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      existingJob = await AnalysisJob.findById(jobId);
    }
    if (!existingJob) {
      existingJob = await AnalysisJob.findOne({ videoId: jobId });
    }
  }
  if (!existingJob) {
    existingJob = memoryJobs.get(jobId);
  }
  try {
    const resp = await axios.get(url);
    payload = resp.data;
    console.log("[refreshJob] FastAPI response:", JSON.stringify(payload, null, 2));
  } catch (err) {
    const msg = err.response?.data || err.message || "FastAPI task poll failed";
    console.warn("[refreshJob] transient poll error:", msg);

    let existingJob;
    if (dbReady()) {
      if (mongoose.Types.ObjectId.isValid(jobId)) {
        existingJob = await AnalysisJob.findById(jobId);
      }
      if (!existingJob) {
        existingJob = await AnalysisJob.findOne({ videoId: jobId });
      }
    }

    const baseJob = existingJob || memoryJobs.get(jobId) || {};
    const normalizedBase = typeof baseJob.toObject === "function" ? baseJob.toObject() : baseJob;
    return {
      ...normalizedBase,
      status: normalizedBase.status || "processing",
      pollError: String(msg),
    };
  }
  const update = {};
  if (payload.state === "SUCCESS") {
    const taskReportedFailure = payload.result?.status === "failed";
    if (taskReportedFailure) {
      update.status = "failed";
      update.error = payload.result?.error || payload.error || "Task reported failed status";
    } else {
    update.status = "completed";
    update.metrics = payload.result?.metrics;
    update.report = payload.result?.report;
    update.artifacts = payload.result?.artifacts;
    update.action = payload.result?.action || payload.result?.report?.action_label || null;
    update.classifier_action = payload.result?.classifier_action || null;
    update.exercise_metrics = payload.result?.exercise_metrics;
    update.exercise_metadata = payload.result?.exercise_metadata;
    update.similar_athletes = payload.result?.similar_athletes;
    update.error = payload.result?.error;
    }
    console.log("[refreshJob] Extracted update:", JSON.stringify(update, null, 2));
  } else if (payload.state === "FAILURE") {
    update.status = "failed";
    update.error = payload.error || payload.result?.error;
  } else if (payload.state === "ERROR") {
    update.status = "failed";
    update.error = payload.error;
  } else {
    const nextStatus = payload.state.toLowerCase();
    const hasCompletedData = Boolean(existingJob?.metrics || existingJob?.report || existingJob?.artifacts);

    if ((existingJob?.status === "completed" || hasCompletedData) && (nextStatus === "pending" || nextStatus === "started" || nextStatus === "processing")) {
      update.status = "completed";
    } else if (existingJob?.status === "failed" && (nextStatus === "pending" || nextStatus === "started" || nextStatus === "processing")) {
      update.status = "failed";
    } else {
      update.status = nextStatus;
    }
    update.info = payload.info;
  }

  if (dbReady()) {
    // Try update by ObjectId first, fallback to videoId
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      await AnalysisJob.findByIdAndUpdate(jobId, update, { new: true });
    } else {
      await AnalysisJob.findOneAndUpdate({ videoId: jobId }, update, { new: true });
    }
  }
  // Fetch the updated job
  let job;
  if (dbReady()) {
    if (mongoose.Types.ObjectId.isValid(jobId)) {
      job = await AnalysisJob.findById(jobId);
    }
    if (!job) {
      job = await AnalysisJob.findOne({ videoId: jobId });
    }
  }
  if (!job) {
    job = { ...(memoryJobs.get(jobId) || {}), ...update };
  }
  memoryJobs.set(jobId, job);
  return job;
}

async function getJob(jobId) {
  if (dbReady()) {
    // Try finding by MongoDB ObjectId first
    try {
      if (mongoose.Types.ObjectId.isValid(jobId)) {
        const job = await AnalysisJob.findById(jobId);
        if (job) return job;
      }
    } catch (err) {
      console.log("[getJob] findById failed, trying by videoId:", err.message);
    }
    // Fallback: find by videoId field
    const jobByVideoId = await AnalysisJob.findOne({ videoId: jobId });
    if (jobByVideoId) return jobByVideoId;
  }
  return memoryJobs.get(jobId);
}

module.exports = { createJob, refreshJob, getJob, UPLOAD_DIR };
