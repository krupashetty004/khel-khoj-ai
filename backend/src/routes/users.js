const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/firebaseAuth");
const optionalAuth = require("../middleware/optionalAuth");

router.post("/register", userController.registerUser);

router.get("/me", authMiddleware, userController.getCurrentUser);

router.put("/me", authMiddleware, userController.updateUserProfile);

// Use optional auth - returns empty array if not authenticated
router.get("/me/jobs", optionalAuth, userController.getMyJobs);

module.exports = router;
