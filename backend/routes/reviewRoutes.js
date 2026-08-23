const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= ADD REVIEW & RATING =================
router.post("/:rideId", authMiddleware, (req, res) => {
    const rideId = req.params.rideId;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating (1 to 5) is required"
        });
    }

    // Check karein ki ride completed aur user ki hi hai
    const checkRideSql = `SELECT * FROM rides WHERE id = ? AND user_id = ? AND status = 'completed'`;

    db.query(checkRideSql, [rideId, userId], (err, rides) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });

        if (rides.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Ride not found, not completed, or unauthorized"
            });
        }

        const driverId = rides[0].driver_id;

        // Review Insert Karein
        const insertSql = `
            INSERT INTO reviews (ride_id, user_id, driver_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [rideId, userId, driverId, rating, comment || ""], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: false, message: "Failed to submit review" });
            }

            res.status(201).json({
                success: true,
                message: "Review submitted successfully",
                reviewId: result.insertId
            });
        });
    });
});

module.exports = router;