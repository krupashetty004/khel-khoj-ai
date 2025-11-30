const mongoose = require("mongoose");
require("dotenv").config();
const Athlete = require("./models/Athlete");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Athlete.deleteMany({});
  await Athlete.create([
    { name: "Ravi Kumar", sport: "Kabaddi", bio: "Quick and agile" },
    { name: "Virat Kohli", sport: "Cricket", bio: "Consistent batter" }
  ]);

  console.log("Seed complete!");
  process.exit(0);
}
seed();

