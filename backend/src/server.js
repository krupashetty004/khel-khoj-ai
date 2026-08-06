require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const axios = require("axios");

const athleteRoutes = require("./routes/athletes");
const jobRoutes = require("./routes/jobs");
const userRoutes = require("./routes/users");
const authMiddleware = require("./middleware/firebaseAuth");

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI?.trim();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/athletes", athleteRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);

app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({
    msg: "Protected dashboard",
    uid: req.userUid,
    role: req.userRole,
  });
});

app.get("/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;

  res.json({
    status: "ok",
    service: "khel-khoj-node-api",
    mongodb: {
      ready: mongoState === 1,
      state: mongoState,
    },
    fastapi_url: process.env.FASTAPI_BASE_URL || "http://localhost:8000",
  });
});

/* ---------- FASTAPI CONNECTIVITY TEST ---------- */

app.get("/test-fastapi", async (req, res) => {
  const url = `${process.env.FASTAPI_BASE_URL}/health`;

  try {
    console.log("Testing FastAPI:", url);

    const response = await axios.get(url);

    return res.json({
      success: true,
      url,
      data: response.data,
    });
  } catch (err) {
    console.error("FASTAPI TEST FAILED");
    console.error(err);

    return res.status(500).json({
      success: false,
      url,
      message: err.message,
      code: err.code,
      status: err.response?.status,
      data:
        typeof err.response?.data === "object"
          ? err.response.data
          : err.response?.data,
    });
  }
});

/* ----------------------------------------------- */

app.get("/", (req, res) => {
  res.json({
    msg: "Hello World",
    docs: "/health",
    test: "/test-fastapi",
  });
});

function hasValidMongoUri(uri) {
  return Boolean(
    uri &&
      uri !== "<REPLACE_WITH_YOUR_ATLAS_URI>" &&
      (uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))
  );
}

async function connectMongoIfConfigured() {
  if (!hasValidMongoUri(MONGODB_URI)) {
    console.log(
      "⚠️ MongoDB URI not configured. Athlete endpoints will return 503."
    );
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await connectMongoIfConfigured();
});