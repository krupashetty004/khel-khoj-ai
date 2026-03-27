const User = require("../models/User");
const Athlete = require("../models/Athlete");
const mongoose = require("mongoose");
const { formatResponse } = require("../utils/response");

function dbReady() {
  return mongoose.connection.readyState === 1;
}

exports.registerUser = async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json(
        formatResponse({
          ok: false,
          error: "Database not connected",
        })
      );
    }

    const { firebaseUid, email, displayName, userType } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json(
        formatResponse({ ok: false, error: "firebaseUid and email are required" })
      );
    }

    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.json(formatResponse({ data: { user: existingUser, isNew: false } }));
    }

    const user = await User.create({
      firebaseUid,
      email,
      displayName: displayName || email.split("@")[0],
      userType: userType || "athlete",
    });

    if (userType === "athlete") {
      const athleteProfile = await Athlete.create({
        name: displayName || email.split("@")[0],
        firebaseUid,
        email,
        userType: "athlete",
      });
      user.athleteProfile = athleteProfile._id;
      await user.save();
    }

    return res.status(201).json(formatResponse({ data: { user, isNew: true } }));
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json(formatResponse({ ok: false, error: error.message }));
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json(
        formatResponse({ ok: false, error: "Database not connected" })
      );
    }

    const user = await User.findOne({ firebaseUid: req.userUid }).populate("athleteProfile");
    if (!user) {
      return res.status(404).json(formatResponse({ ok: false, error: "User not found" }));
    }

    return res.json(formatResponse({ data: { user } }));
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json(formatResponse({ ok: false, error: error.message }));
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json(
        formatResponse({ ok: false, error: "Database not connected" })
      );
    }

    const { displayName, sport, bio, region, location } = req.body;

    const user = await User.findOne({ firebaseUid: req.userUid });
    if (!user) {
      return res.status(404).json(formatResponse({ ok: false, error: "User not found" }));
    }

    if (displayName) user.displayName = displayName;
    await user.save();

    if (user.athleteProfile) {
      const athleteUpdate = {};
      if (displayName) athleteUpdate.name = displayName;
      if (sport) athleteUpdate.sport = sport;
      if (bio) athleteUpdate.bio = bio;
      if (region) athleteUpdate.region = region;
      if (location) athleteUpdate.location = location;

      await Athlete.findByIdAndUpdate(user.athleteProfile, athleteUpdate);
    }

    const updatedUser = await User.findById(user._id).populate("athleteProfile");
    return res.json(formatResponse({ data: { user: updatedUser } }));
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json(formatResponse({ ok: false, error: error.message }));
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    // If not authenticated, return empty array (not an error)
    if (!req.userUid) {
      return res.json(formatResponse({ data: { jobs: [] } }));
    }

    if (!dbReady()) {
      return res.status(503).json(
        formatResponse({ ok: false, error: "Database not connected" })
      );
    }

    const AnalysisJob = require("../models/AnalysisJob");
    const jobs = await AnalysisJob.find({ uploadedBy: req.userUid })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(formatResponse({ data: { jobs } }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json(formatResponse({ ok: false, error: error.message }));
  }
};
