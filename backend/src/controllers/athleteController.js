const Athlete = require("../models/Athlete");
const mongoose = require("mongoose");

const fallbackAthletes = [
  {
    _id: "demo-1",
    name: "Ravi Kumar",
    sport: "Kabaddi",
    bio: "Explosive first step and strong lower-body balance.",
    region: "Mandya, Karnataka",
  },
  {
    _id: "demo-2",
    name: "Lalita Devi",
    sport: "Athletics",
    bio: "Consistent sprint mechanics and strong acceleration profile.",
    region: "Belagavi, Karnataka",
  },
];

function dbReady() {
  return mongoose.connection.readyState === 1;
}

exports.getAllAthletes = async (req, res) => {
  try {
    if (!dbReady()) {
      return res.json({
        source: "fallback",
        message: "MongoDB is not connected. Returning demo athletes.",
        athletes: fallbackAthletes,
      });
    }

    const athletes = await Athlete.find().sort({ createdAt: -1 });
    return res.json({ source: "database", athletes });
  } catch (error) {
    console.error("Error fetching athletes:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.getAthleteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!dbReady()) {
      const fallback = fallbackAthletes.find((athlete) => athlete._id === id);
      if (!fallback) return res.status(404).json({ error: "Not found" });
      return res.json({ source: "fallback", athlete: fallback });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid athlete id" });
    }

    const athlete = await Athlete.findById(id);
    if (!athlete) return res.status(404).json({ error: "Not found" });

    return res.json({ source: "database", athlete });
  } catch (error) {
    console.error("Error fetching athlete:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.createAthlete = async (req, res) => {
  try {
    if (!dbReady()) {
      return res.status(503).json({
        error: "Database not connected",
        message: "Configure MONGODB_URI to create persistent athletes.",
      });
    }

    const { name, sport, bio, imageUrl, region } = req.body;

    if (!name || !sport) {
      return res.status(400).json({ error: "name and sport are required" });
    }

    const athlete = await Athlete.create({ name, sport, bio, imageUrl, region });
    return res.status(201).json({ athlete });
  } catch (error) {
    console.error("Error creating athlete:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};
