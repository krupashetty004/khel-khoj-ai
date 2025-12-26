require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

const athleteRoutes = require("./routes/athletes");
const authMiddleware = require("./middleware/firebaseAuth");

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/athletes", athleteRoutes);

app.get("/api/dashboard", authMiddleware, (req, res) => {
  res.json({ msg: "Protected dashboard", uid: req.userUid });
});

app.get("/", (req, res) => res.json({ msg: "Hello World" }));

// Start server regardless of MongoDB connection
app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
  
  // Connect to MongoDB if URI is provided
  const mongoUri = process.env.MONGODB_URI?.trim();
  if (mongoUri && mongoUri !== "<REPLACE_WITH_YOUR_ATLAS_URI>" && mongoUri.startsWith("mongodb")) {
    console.log("Attempting to connect to MongoDB...");
    mongoose.connect(mongoUri)
      .then(() => console.log("✅ MongoDB connected successfully"))
      .catch(err => {
        console.error("❌ MongoDB Error:", err.message);
        console.error("URI format check:", mongoUri.substring(0, 20) + "...");
      });
  } else {
    console.log("⚠️  MongoDB URI not configured. Some endpoints may not work.");
    if (mongoUri) {
      console.log("URI value:", mongoUri.substring(0, 30) + "...");
    }
  }
});

