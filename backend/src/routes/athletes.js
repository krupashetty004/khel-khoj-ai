const express = require("express");
const router = express.Router();
const c = require("../controllers/athleteController");

router.get("/", c.getAllAthletes);
router.get("/:id", c.getAthleteById);
router.post("/", c.createAthlete);

module.exports = router;
