const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const authMiddleware = require("../middleware/authMiddleware"); // Auth middleware import karein

// ================= CREATE DRIVER =================
router.post(
    "/",
    driverController.createDriver
);

// ================= REGISTER DRIVER (PENDING STATUS) =================
router.post(
    "/register",
    authMiddleware,
    driverController.registerDriver
);

// ================= GET ALL DRIVERS =================
router.get(
    "/",
    driverController.getAllDrivers
);

module.exports = router;