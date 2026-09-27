const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../config/db");

// ================= CREATE DRIVER =================
router.post("/", driverController.createDriver);

// ================= REGISTER DRIVER (PENDING STATUS) =================
router.post("/register", authMiddleware, driverController.registerDriver);

// ================= GET LOGGED-IN DRIVER =================
router.get("/me", authMiddleware, driverController.getMyDriver);

// ================= DRIVER DASHBOARD STATS =================
router.get("/dashboard", authMiddleware, driverController.getDashboardStats);

// ================= DRIVER EARNINGS =================
router.get("/earnings", authMiddleware, driverController.getDriverEarnings);

// ================= TOGGLE DRIVER ONLINE STATUS =================
router.put("/online", authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { is_online } = req.body;

    db.query(
        "UPDATE drivers SET is_online = ? WHERE user_id = ?",
        [is_online ? 1 : 0, userId],
        (err, result) => {
            if (err) {
                console.error("Toggle online error:", err);
                return res.status(500).json({ success: false, message: "Failed to update online status" });
            }
            res.json({
                success: true,
                message: is_online ? "You are now online" : "You are now offline",
                is_online: is_online ? 1 : 0
            });
        }
    );
});

// ================= GET ALL DRIVERS =================
router.get("/", driverController.getAllDrivers);

// ================= UPDATE DRIVER STATUS =================
router.put("/status", driverController.updateDriverStatus);

module.exports = router;