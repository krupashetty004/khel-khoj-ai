require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

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
  res.json({ msg: "Protected dashboard", uid: req.userUid, role: req.userRole });
});

app.get("/health", (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoReady = mongoState === 1;

  res.json({
    status: "ok",
    service: "khel-khoj-node-api",
    mongodb: {
      ready: mongoReady,
      state: mongoState,
    },
    fastapi_url: process.env.FASTAPI_BASE_URL || "http://localhost:8000",
  });
});

app.get("/", (req, res) => {
  res.json({ msg: "Hello World", docs: "/health" });
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
    console.log("⚠️  MongoDB URI not configured. Athlete endpoints will return 503.");
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
