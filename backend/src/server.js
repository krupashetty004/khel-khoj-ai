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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error("MongoDB Error:", err));

