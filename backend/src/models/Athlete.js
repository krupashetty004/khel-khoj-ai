const mongoose = require("mongoose");

const AthleteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: String,
  bio: String,
  imageUrl: String,
  region: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Athlete", AthleteSchema);

