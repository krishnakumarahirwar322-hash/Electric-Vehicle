const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// 1. Create Slot Booking
router.post("/book", authMiddleware, (req, res) => {
    const { station_id, booking_time } = req.body;
    const user_id = req.user.id;

    if (!station_id || !booking_time) {
        return res.status(400).json({ 
            success: false, 
            message: "station_id aur booking_time zaruri hain" 
        });
    }

    // Check availability
    const checkQuery = "SELECT available_ports FROM charging_stations WHERE id = ? AND status = 'active'";
    db.query(checkQuery, [station_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: "Station nahi mila ya inactive hai" });
        }

        if (results[0].available_ports <= 0) {
            return res.status(400).json({ success: false, message: "Is station par koi port khali nahi hai" });
        }

        // Insert Booking entry
        const bookQuery = "INSERT INTO charging_bookings (user_id, station_id, booking_time, status) VALUES (?, ?, ?, 'confirmed')";
        db.query(bookQuery, [user_id, station_id, booking_time], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Booking fail ho gayi", error: err.message });
            }

            // Reduce available ports in charging_stations table
            db.query("UPDATE charging_stations SET available_ports = available_ports - 1 WHERE id = ?", [station_id]);

            res.status(201).json({
                success: true,
                message: "Charging slot kamyabi se book ho gaya!",
                booking_id: result.insertId
            });
        });
    });
});

// 2. Get Logged-in User's Bookings
router.get("/my-bookings", authMiddleware, (req, res) => {
    const sql = `
        SELECT cb.id, cs.name AS station_name, cs.location, cb.booking_time, cb.status, cb.created_at
        FROM charging_bookings cb
        JOIN charging_stations cs ON cb.station_id = cs.id
        WHERE cb.user_id = ?
        ORDER BY cb.created_at DESC
    `;
    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database query fail ho gayi" });
        res.status(200).json({ success: true, bookings: results });
    });
});

module.exports = router;