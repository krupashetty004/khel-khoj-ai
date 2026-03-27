const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String },
    userType: { type: String, enum: ["athlete", "coach", "admin"], default: "athlete" },
    athleteProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Athlete" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
