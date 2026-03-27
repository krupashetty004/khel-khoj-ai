const mongoose = require("mongoose");

const AnalysisJobSchema = new mongoose.Schema(
  {
    videoId: { type: String, required: true },
    athleteId: { type: String },
    uploadedBy: { type: String },
    uploaderType: { type: String, enum: ["athlete", "coach", "anonymous"], default: "anonymous" },
    exerciseType: { type: String },
    status: { type: String, default: "queued", enum: ["queued", "processing", "completed", "failed"] },
    taskId: { type: String },
    videoPath: { type: String },
    metrics: { type: Object },
    exercise_metrics: { type: Array, default: [] },
    exercise_metadata: { type: Object },
    report: { type: Object },
    action: { type: String },
    classifier_action: { type: String },
    similar_athletes: { type: Array, default: [] },
    artifacts: { type: Object },
    error: { type: String },
    pollError: { type: String },
    info: { type: Object },
    isPublic: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AnalysisJob", AnalysisJobSchema);
