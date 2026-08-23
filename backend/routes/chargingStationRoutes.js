const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= 1. GET ALL CHARGING STATIONS =================
router.get("/", authMiddleware, (req, res) => {
    const sql = `SELECT * FROM charging_stations WHERE status = 'active' ORDER BY id DESC`;

    db.query(sql, (err, stations) => {
        if (err) {
            console.log("Fetch stations error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch charging stations"
            });
        }

        res.status(200).json({
            success: true,
            count: stations.length,
            stations: stations
        });
    });
});

// ================= 2. ADD NEW CHARGING STATION (Admin/System) =================
router.post("/", authMiddleware, (req, res) => {
    const { name, location, total_ports, available_ports, price_per_unit } = req.body;

    if (!name || !location || !total_ports || !price_per_unit) {
        return res.status(400).json({
            success: false,
            message: "All station fields are required"
        });
    }

    const sql = `
        INSERT INTO charging_stations (name, location, total_ports, available_ports, price_per_unit, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `;

    db.query(
        sql,
        [name, location, total_ports, available_ports || total_ports, price_per_unit],
        (err, result) => {
            if (err) {
                console.log("Add station error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to add charging station"
                });
            }

            res.status(201).json({
                success: true,
                message: "Charging station added successfully",
                stationId: result.insertId
            });
        }
    );
});

module.exports = router;