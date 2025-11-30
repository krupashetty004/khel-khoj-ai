const Athlete = require("../models/Athlete");

exports.getAllAthletes = async (req, res) => {
  try {
    const athletes = await Athlete.find();
    res.json(athletes);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAthleteById = async (req, res) => {
  try {
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: "Not found" });
    res.json(athlete);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

