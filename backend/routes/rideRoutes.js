const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const requireUserAccount = (req, res, next) => {
    db.query("SELECT role FROM users WHERE id = ? LIMIT 1", [req.user.id], (err, users) => {
        if (err) {
            console.error("User role lookup failed:", err.message);
            return res.status(500).json({ success: false, message: "Could not verify account access" });
        }
        if (!users.length) {
            return res.status(401).json({ success: false, message: "User account not found; please sign in again" });
        }
        if (String(users[0].role).toLowerCase() !== "user") {
            return res.status(403).json({ success: false, message: "Ride history is available to user accounts only" });
        }
        return next();
    });
};

// CREATE RIDE (USER ONLY)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {
        const { driver_id, vehicle_id, pickup, destination, distance, fare } = req.body;

        if (!driver_id || !vehicle_id || !pickup || !destination || !distance || !fare) {
            return res.status(400).json({
                success: false,
                message: "All ride fields are required"
            });
        }

        const user_id = req.user.id;
        const sql = `
            INSERT INTO rides (user_id, driver_id, vehicle_id, pickup, destination, distance, fare, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [user_id, driver_id, vehicle_id, pickup, destination, distance, fare, "requested"],
            (err, result) => {
                if (err) {
                    console.error("Ride insert error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Ride booking failed",
                        error: err.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Ride booked successfully",
                    rideId: result.insertId
                });
            }
        );
    }
);

// GET MY RIDES (USER ONLY) - FIXED SQL QUERY
router.get(
    "/my-rides",
    authMiddleware,
    (req, res) => {
        const user_id = req.user.id;

        const sql = `
            SELECT
                r.id,
                r.user_id,
                r.driver_id,
                r.vehicle_id,
                r.pickup,
                r.destination,
                r.distance,
                r.fare,
                r.status,
                r.created_at,
                p.payment_status,
                p.payment_method,
                d.license_no,
                v.model,
                v.vehicle_number,
                v.vehicle_type
            FROM rides r
            LEFT JOIN drivers d ON r.driver_id = d.id
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN (
                SELECT p1.*
                FROM payments p1
                INNER JOIN (
                    SELECT ride_id, MAX(id) AS max_id
                    FROM payments
                    GROUP BY ride_id
                ) p2 ON p1.ride_id = p2.ride_id AND p1.id = p2.max_id
            ) p ON p.ride_id = r.id
            WHERE r.user_id = ?
            ORDER BY r.id DESC
        `;

        db.query(sql, [user_id], (err, results) => {
            if (err) {
                console.error("Get my rides error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch rides",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                rides: results
            });
        });
    }
);

// GET DRIVER RIDE REQUESTS (DRIVER ONLY)
router.get(
    "/driver/requests",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const driverUserId = req.user.id;

        const sql = `
            SELECT
                rides.id,
                rides.user_id,
                rides.driver_id,
                rides.vehicle_id,
                rides.pickup,
                rides.destination,
                rides.distance,
                rides.fare,
                rides.status,
                users.name AS user_name,
                users.phone AS user_phone,
                vehicles.model,
                vehicles.vehicle_number,
                vehicles.vehicle_type
            FROM rides
            JOIN drivers ON rides.driver_id = drivers.id
            JOIN users ON rides.user_id = users.id
            LEFT JOIN vehicles ON rides.vehicle_id = vehicles.id
            WHERE drivers.user_id = ? AND rides.status = 'requested'
            ORDER BY rides.id DESC
        `;

        db.query(sql, [driverUserId], (err, results) => {
            if (err) {
                console.error("Driver requests error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch ride requests",
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                requests: results
            });
        });
    }
);

// ACCEPT RIDE
router.put(
    "/:rideId/accept",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const sql = `
            UPDATE rides
            JOIN drivers ON rides.driver_id = drivers.id
            SET rides.status = 'accepted'
            WHERE rides.id = ? AND drivers.user_id = ? AND rides.status = 'requested'
        `;

        db.query(sql, [rideId, driverUserId], (err, result) => {
            if (err) {
                console.error("Accept ride error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to accept ride",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found or already accepted"
                });
            }

            res.json({
                success: true,
                message: "Ride accepted successfully",
                rideId: rideId
            });
        });
    }
);

// START RIDE
router.put(
    "/:rideId/start",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const sql = `
            UPDATE rides
            JOIN drivers ON rides.driver_id = drivers.id
            SET rides.status = 'started'
            WHERE rides.id = ? AND drivers.user_id = ? AND rides.status = 'accepted'
        `;

        db.query(sql, [rideId, driverUserId], (err, result) => {
            if (err) {
                console.error("Start ride error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to start ride",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found or ride is not accepted"
                });
            }

            res.json({
                success: true,
                message: "Ride started successfully",
                rideId: rideId
            });
        });
    }
);

// COMPLETE RIDE
router.put(
    "/:rideId/complete",
    authMiddleware,
    roleMiddleware("driver"),
    (req, res) => {
        const rideId = req.params.rideId;
        const driverUserId = req.user.id;

        const sql = `
            UPDATE rides
            JOIN drivers ON rides.driver_id = drivers.id
            SET rides.status = 'completed'
            WHERE rides.id = ? AND drivers.user_id = ? AND rides.status = 'started'
        `;

        db.query(sql, [rideId, driverUserId], (err, result) => {
            if (err) {
                console.error("Complete ride error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to complete ride",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found or ride is not started"
                });
            }

            res.json({
                success: true,
                message: "Ride completed successfully",
                rideId: rideId
            });
        });
    }
);

// GET RIDE HISTORY
router.get(
    "/history",
    authMiddleware,
    (req, res) => {
        const userId = req.user.id;

        const sql = `
            SELECT
                r.id AS ride_id,
                r.user_id,
                r.fare,
                r.status AS ride_status,
                p.id AS payment_id,
                p.amount AS payment_amount,
                p.payment_method,
                p.payment_status
            FROM rides r
            LEFT JOIN payments p ON r.id = p.ride_id
            WHERE r.user_id = ?
            ORDER BY r.id DESC
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error("Fetch history error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch ride history"
                });
            }

            res.status(200).json({
                success: true,
                rides: results
            });
        });
    }
);

// GET RIDE BY ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {
        const rideId = req.params.id;
        const user_id = req.user.id;

        const sql = `
            SELECT
                rides.id,
                rides.user_id,
                rides.driver_id,
                rides.vehicle_id,
                rides.pickup,
                rides.destination,
                rides.distance,
                rides.fare,
                rides.status,
                drivers.license_no,
                vehicles.model,
                vehicles.vehicle_number,
                vehicles.vehicle_type
            FROM rides
            LEFT JOIN drivers ON rides.driver_id = drivers.id
            LEFT JOIN vehicles ON rides.vehicle_id = vehicles.id
            WHERE rides.id = ? AND rides.user_id = ?
        `;

        db.query(sql, [rideId, user_id], (err, results) => {
            if (err) {
                console.error("Get ride error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch ride",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found"
                });
            }

            res.status(200).json({
                success: true,
                ride: results[0]
            });
        });
    }
);

// CANCEL RIDE
router.delete(
    "/:rideId",
    authMiddleware,
    (req, res) => {
        const rideId = req.params.rideId;
        const userId = req.user.id;

        const checkRideSql = `SELECT id, user_id, status FROM rides WHERE id = ?`;

        db.query(checkRideSql, [rideId], (err, rides) => {
            if (err) {
                console.error("Cancel check error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (rides.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Ride not found"
                });
            }

            const ride = rides[0];

            if (ride.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot cancel this ride"
                });
            }

            if (ride.status === "completed") {
                return res.status(400).json({
                    success: false,
                    message: "Completed ride cannot be cancelled"
                });
            }

            if (ride.status === "cancelled") {
                return res.status(400).json({
                    success: false,
                    message: "Ride is already cancelled"
                });
            }

            const updateRideSql = `UPDATE rides SET status = 'cancelled' WHERE id = ?`;

            db.query(updateRideSql, [rideId], (err, result) => {
                if (err) {
                    console.error("Cancel update error:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to cancel ride"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Ride cancelled successfully",
                    rideId: rideId
                });
            });
        });
    }
);

module.exports = router;