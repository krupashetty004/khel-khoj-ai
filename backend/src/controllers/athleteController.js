const Athlete = require("../models/Athlete");
const mongoose = require("mongoose");

exports.getAllAthletes = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: "Database not connected", 
        message: "Please configure MongoDB URI in .env file" 
      });
    }
    
    const athletes = await Athlete.find();
    res.json(athletes);
  } catch (e) {
    console.error("Error fetching athletes:", e);
    res.status(500).json({ error: "Server error", details: e.message });
  }
};

exports.getAthleteById = async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: "Database not connected", 
        message: "Please configure MongoDB URI in .env file" 
      });
    }
    
    const athlete = await Athlete.findById(req.params.id);
    if (!athlete) return res.status(404).json({ error: "Not found" });
    res.json(athlete);
  } catch (e) {
    console.error("Error fetching athlete:", e);
    res.status(500).json({ error: "Server error", details: e.message });
  }
};

