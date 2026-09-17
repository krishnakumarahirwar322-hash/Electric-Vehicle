const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const authMiddleware = require("../middleware/authMiddleware");

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

// ================= GET LOGGED-IN DRIVER =================
router.get(
    "/me",
    authMiddleware,
    driverController.getMyDriver
);

// ================= DRIVER DASHBOARD STATS =================
router.get(
    "/dashboard",
    authMiddleware,
    driverController.getDashboardStats
);

// ================= DRIVER EARNINGS (NEW ADDED ROUTE) =================
router.get(
    "/earnings",
    authMiddleware,
    driverController.getDriverEarnings
);

// ================= GET ALL DRIVERS =================
router.get(
    "/",
    driverController.getAllDrivers
);

// ================= UPDATE DRIVER STATUS =================
router.put(
    "/status",
    driverController.updateDriverStatus
);

module.exports = router;