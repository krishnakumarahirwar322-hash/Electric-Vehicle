const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const adminController = require("../controllers/adminController");

// ================= 1. GET ADMIN DASHBOARD STATS =================
router.get("/stats", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'driver') AS total_drivers,
            (SELECT COUNT(*) FROM rides) AS total_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'accepted' OR status = 'ongoing') AS active_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'completed') AS completed_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'cancelled') AS cancel_rides,
            (SELECT COALESCE(SUM(COALESCE(platform_share, amount * 0.8)), 0) FROM payments WHERE payment_status = 'paid') AS total_revenue,
            (SELECT SUM(available_ports) FROM charging_stations WHERE status = 'active') AS total_available_charging_ports
    `;

    db.query(statsQuery, (err, results) => {
        if (err) {
            console.log("Admin stats error:", err);
            return res.status(500).json({ success: false, message: "Database query failed" });
        }

        res.status(200).json({
            success: true,
            dashboard: results[0]
        });
    });
});

router.get("/rides", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT r.id, r.pickup, r.destination, r.distance, r.fare, r.status, r.created_at,
            u.name AS user_name, du.name AS driver_name, v.model AS vehicle_model
        FROM rides r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN drivers d ON d.id = r.driver_id
        LEFT JOIN users du ON du.id = d.user_id
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        ORDER BY r.created_at DESC, r.id DESC
    `;
    db.query(sql, (err, rides) => {
        if (err) {
            console.error("Admin rides query failed:", err.message);
            return res.status(500).json({ success: false, message: "Failed to load rides" });
        }
        return res.json({ success: true, rides });
    });
});

// ================= 2. GET ALL USERS & DRIVERS ACCOUNTS =================
// Note: Agar direct test kar rahe hain (bina login header ke) toh authMiddleware hata kar bhi test kar sakte hain.
router.get("/accounts", adminController.getAllAccounts);

module.exports = router;