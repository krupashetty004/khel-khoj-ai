const mongoose = require("mongoose");

const AthleteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sport: String,
  bio: String,
  imageUrl: String,
  region: String,
  firebaseUid: { type: String, unique: true, sparse: true },
  email: { type: String },
  userType: { type: String, enum: ["athlete", "coach"], default: "athlete" },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: "Athlete" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }
  },
  createdAt: { type: Date, default: Date.now }
});

AthleteSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Athlete", AthleteSchema);

