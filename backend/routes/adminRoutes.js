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
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed') AS total_revenue,
            (SELECT SUM(available_ports) FROM charging_stations WHERE status = 'active') AS total_available_charging_ports
    `;

    db.query(statsQuery, (err, results) => {
        if (err) {
            console.log("Admin stats error:", err);
            return res.status(500).json({ success: false, message: "Database query failed" });
        }
        res.status(200).json({ success: true, dashboard: results[0] });
    });
});

// ================= 2. GET ALL ACCOUNTS =================
router.get("/accounts", adminController.getAllAccounts);

// ================= 3. GET ALL RIDES (Admin) =================
router.get("/rides", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const sql = `
        SELECT 
            r.id,
            r.pickup,
            r.destination,
            r.fare,
            r.distance,
            r.status,
            r.created_at,
            u.name AS user_name,
            u.email AS user_email,
            d_user.name AS driver_name
        FROM rides r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN drivers d ON r.driver_id = d.id
        LEFT JOIN users d_user ON d.user_id = d_user.id
        ORDER BY r.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Admin rides error:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch rides" });
        }
        res.json({ success: true, rides: results });
    });
});

// ================= 4. DELETE DRIVER =================
router.delete("/drivers/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
    const driverId = req.params.id;
    db.query("DELETE FROM drivers WHERE id = ?", [driverId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Delete failed" });
        res.json({ success: true, message: "Driver deleted" });
    });
});

module.exports = router;