const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const db = require("../config/db");

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

router.put("/online", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const isOnline = req.body.is_online ? 1 : 0;
    db.query("UPDATE drivers SET is_online = ? WHERE user_id = ? AND status = 'approved'", [isOnline, req.user.id], (err, result) => {
        if (err) {
            console.error("Driver online status update failed:", err.message);
            return res.status(500).json({ success: false, message: "Could not update online status" });
        }
        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, message: "Only approved drivers can go online" });
        }
        return res.json({ success: true, is_online: Boolean(isOnline) });
    });
});

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
    authMiddleware,
    roleMiddleware("admin"),
    driverController.updateDriverStatus
);

module.exports = router;