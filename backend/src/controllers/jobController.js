const { formatResponse, handleError } = require("../utils/response");
const { createJob, refreshJob, getJob, UPLOAD_DIR } = require("../services/jobService");
const path = require("path");
const fs = require("fs");
const { z } = require("zod");

const createSchema = z.object({
  athleteId: z.string().optional(),
  notes: z.string().optional(),
  isPublic: z.string().optional(),
  exerciseType: z.string().optional(),
});

exports.createJob = async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(formatResponse({ ok: false, error: parsed.error.flatten() }));
    }

    const file = req.file;
    if (!file) return res.status(400).json(formatResponse({ ok: false, error: "video file is required" }));

    const videoId = path.parse(file.filename).name;
    
    const uploadedBy = req.userUid || null;
    const uploaderType = req.userRole || "anonymous";
    
    const athleteId = parsed.data.athleteId || (uploaderType === "athlete" ? uploadedBy : null);
    
    const job = await createJob({
      videoId,
      athleteId,
      filePath: file.path,
      uploadedBy,
      uploaderType,
      notes: parsed.data.notes,
      isPublic: parsed.data.isPublic === "true",
      exerciseType: parsed.data.exerciseType,
    });
    
    return res.status(201).json(formatResponse({ data: job }));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await getJob(id);
    if (!job) return res.status(404).json(formatResponse({ ok: false, error: "Job not found" }));
    if (job.taskId) {
      const refreshed = await refreshJob(job.taskId, id);
      return res.json(formatResponse({ data: refreshed }));
    }
    return res.json(formatResponse({ data: job }));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.downloadArtifact = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
    return res.download(filePath);
  } catch (error) {
    return handleError(res, error);
  }
};
