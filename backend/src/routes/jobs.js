const express = require("express");
const multer = require("multer");
const path = require("path");
const { createJob, getJob } = require("../controllers/jobController");
const { UPLOAD_DIR } = require("../services/jobService");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const base = path.parse(file.originalname).name.replace(/\s+/g, "-");
    const ts = Date.now();
    cb(null, `${base}-${ts}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post("/", optionalAuth, upload.single("video"), createJob);
router.get("/:id", getJob);

module.exports = router;
