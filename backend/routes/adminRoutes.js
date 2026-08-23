const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ================= GET ADMIN DASHBOARD STATS =================
router.get("/stats", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
            (SELECT COUNT(*) FROM drivers) AS total_drivers,
            (SELECT COUNT(*) FROM rides) AS total_rides,
            (SELECT COUNT(*) FROM rides WHERE status = 'completed') AS completed_rides,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed') AS total_revenue,
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

module.exports = router;