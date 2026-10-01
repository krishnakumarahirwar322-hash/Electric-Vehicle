const crypto = require("crypto");
const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const readUserActiveRide = (userId, res) => {
    const sql = `
        SELECT r.id, r.user_id, r.driver_id, r.vehicle_id, r.pickup, r.destination,
            r.distance, r.fare, r.status, r.payment_method, r.pickup_lat AS user_lat,
            r.pickup_lng AS user_lng, r.destination_lat, r.destination_lng,
            r.driver_lat, r.driver_lng, r.otp AS otp_code, r.otp_expires_at,
            driver_user.name AS driver_name, driver_user.phone AS driver_phone,
            v.model, v.vehicle_number, v.vehicle_type
        FROM rides r
        LEFT JOIN drivers d ON d.id = r.driver_id
        LEFT JOIN users driver_user ON driver_user.id = d.user_id
        LEFT JOIN vehicles v ON v.id = r.vehicle_id
        WHERE r.user_id = ? AND r.status IN ('requested', 'accepted', 'arrived', 'started')
        ORDER BY r.id DESC LIMIT 1
    `;
    db.query(sql, [userId], (err, rides) => {
        if (err) return res.status(500).json({ success: false, message: "Could not load active ride" });
        return res.json({ success: true, ride: rides[0] || null });
    });
};

const verifyRideOtp = (req, res) => {
    const rideId = req.params.rideId;
    const otp = String(req.body.otp || "").trim();
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ success: false, message: "Enter the 6-digit passenger OTP" });
    }

    const sql = `
        UPDATE rides r
        JOIN drivers d ON d.id = r.driver_id
        SET r.status = 'started', r.otp = NULL, r.otp_expires_at = NULL
        WHERE r.id = ? AND d.user_id = ? AND r.status = 'arrived'
            AND r.otp = ? AND (r.otp_expires_at IS NULL OR r.otp_expires_at > NOW())
    `;
    db.query(sql, [rideId, req.user.id, otp], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Could not verify OTP" });
        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "OTP is incorrect or expired" });
        }
        return res.json({ success: true, message: "OTP verified; ride started" });
    });
};

router.post("/", authMiddleware, roleMiddleware("user"), (req, res) => {
    const { pickup, destination, distance, fare, payment_method: paymentMethod, pickup_lat: pickupLat, pickup_lng: pickupLng, destination_lat: destinationLat, destination_lng: destinationLng } = req.body;
    const validCoordinate = (value, limit) => Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit;
    if (!pickup || !destination || !Number.isFinite(Number(distance)) || Number(distance) <= 0 || !Number.isFinite(Number(fare)) || Number(fare) <= 0) {
        return res.status(400).json({ success: false, message: "Pickup, destination, distance, and fare are required" });
    }
    if (!validCoordinate(pickupLat, 90) || !validCoordinate(pickupLng, 180) || !validCoordinate(destinationLat, 90) || !validCoordinate(destinationLng, 180)) {
        return res.status(400).json({ success: false, message: "Valid pickup and destination coordinates are required" });
    }

    const sql = `
        INSERT INTO rides (user_id, driver_id, vehicle_id, pickup, destination, distance, fare,
            status, pickup_lat, pickup_lng, destination_lat, destination_lng, payment_method)
        VALUES (?, NULL, NULL, ?, ?, ?, ?, 'requested', ?, ?, ?, ?, ?)
    `;
    db.query(sql, [req.user.id, pickup, destination, distance, fare, pickupLat, pickupLng, destinationLat, destinationLng, paymentMethod || "cash"], (err, result) => {
        if (err) {
            console.error("Ride booking failed:", err.message);
            return res.status(500).json({ success: false, message: "Ride booking failed" });
        }
        return res.status(201).json({ success: true, message: "Ride request sent to online drivers", rideId: result.insertId });
    });
});

router.get("/available-drivers", authMiddleware, roleMiddleware("user"), (req, res) => {
    const sql = `
        SELECT d.id AS driver_id, v.id AS vehicle_id, v.price_per_km,
            u.name AS driver_name, v.model, v.vehicle_type
        FROM drivers d
        JOIN users u ON u.id = d.user_id
        LEFT JOIN vehicles v ON v.driver_id = d.id
        WHERE d.status = 'approved' AND d.is_online = 1
            AND NOT EXISTS (SELECT 1 FROM rides active WHERE active.driver_id = d.id AND active.status IN ('accepted', 'arrived', 'started'))
        ORDER BY d.id
    `;
    db.query(sql, (err, drivers) => {
        if (err) return res.status(500).json({ success: false, message: "Could not load available drivers" });
        return res.json({ success: true, drivers });
    });
});

router.get("/active", authMiddleware, roleMiddleware("user"), (req, res) => readUserActiveRide(req.user.id, res));

router.get("/driver/requests", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const sql = `
        SELECT r.id, r.user_id, r.pickup, r.destination, r.distance, r.fare,
            r.pickup_lat, r.pickup_lng, r.destination_lat, r.destination_lng,
            u.name AS user_name, u.phone AS user_phone
        FROM rides r
        JOIN users u ON u.id = r.user_id
        JOIN drivers d ON d.user_id = ? AND d.status = 'approved' AND d.is_online = 1
        WHERE r.status = 'requested' AND r.driver_id IS NULL
            AND NOT EXISTS (SELECT 1 FROM ride_driver_rejections x WHERE x.ride_id = r.id AND x.driver_id = d.id)
            AND NOT EXISTS (SELECT 1 FROM rides active WHERE active.driver_id = d.id AND active.status IN ('accepted', 'arrived', 'started'))
        ORDER BY r.id DESC
    `;
    db.query(sql, [req.user.id], (err, requests) => {
        if (err) return res.status(500).json({ success: false, message: "Could not load ride requests" });
        return res.json({ success: true, requests });
    });
});

router.get("/driver/active", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const sql = `
        SELECT r.id, r.user_id, r.driver_id, r.vehicle_id, r.pickup, r.destination,
            r.distance, r.fare, r.status, r.pickup_lat AS user_lat, r.pickup_lng AS user_lng,
            r.destination_lat, r.destination_lng, r.driver_lat, r.driver_lng,
            r.otp_expires_at, r.cancel_reason, u.name AS user_name, u.phone AS user_phone
        FROM rides r JOIN drivers d ON d.id = r.driver_id
        JOIN users u ON u.id = r.user_id
        WHERE d.user_id = ? AND r.status IN ('accepted', 'arrived', 'started', 'cancelled')
        ORDER BY r.id DESC LIMIT 1
    `;
    db.query(sql, [req.user.id], (err, rides) => {
        if (err) return res.status(500).json({ success: false, message: "Could not load active ride" });
        return res.json({ success: true, ride: rides[0] || null });
    });
});

router.put("/:rideId/accept", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const driverSql = `
        SELECT d.id AS driver_id,
            (SELECT v.id FROM vehicles v WHERE v.driver_id = d.id ORDER BY v.id LIMIT 1) AS vehicle_id
        FROM drivers d WHERE d.user_id = ? AND d.status = 'approved' AND d.is_online = 1
            AND NOT EXISTS (SELECT 1 FROM rides active WHERE active.driver_id = d.id AND active.status IN ('accepted', 'arrived', 'started'))
        LIMIT 1
    `;
    db.query(driverSql, [req.user.id], (driverError, drivers) => {
        if (driverError) return res.status(500).json({ success: false, message: "Could not verify driver status" });
        if (!drivers.length) return res.status(403).json({ success: false, message: "An approved online driver is required to accept rides" });
        const { driver_id: driverId, vehicle_id: vehicleId } = drivers[0];
        const sql = "UPDATE rides SET driver_id = ?, vehicle_id = ?, status = 'accepted', otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 3 MINUTE) WHERE id = ? AND status = 'requested' AND driver_id IS NULL";
        db.query(sql, [driverId, vehicleId, otp, req.params.rideId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Could not accept ride" });
            if (!result.affectedRows) return res.status(409).json({ success: false, message: "Ride was already accepted or is no longer available" });
            db.query("DELETE FROM ride_driver_rejections WHERE ride_id = ?", [req.params.rideId]);
            return res.json({ success: true, message: "Ride accepted", rideId: Number(req.params.rideId) });
        });
    });
});

router.post("/:rideId/reject", authMiddleware, roleMiddleware("driver"), (req, res) => {
    db.query("SELECT id FROM drivers WHERE user_id = ?", [req.user.id], (driverError, drivers) => {
        if (driverError) return res.status(500).json({ success: false, message: "Could not verify driver" });
        if (!drivers.length) return res.status(404).json({ success: false, message: "Driver profile not found" });
        const driverId = drivers[0].id;
        db.query("SELECT id FROM rides WHERE id = ? AND status = 'requested' AND driver_id IS NULL", [req.params.rideId], (rideError, rides) => {
            if (rideError) return res.status(500).json({ success: false, message: "Could not check ride request" });
            if (!rides.length) return res.status(409).json({ success: false, message: "Ride request is no longer available" });
            db.query("INSERT IGNORE INTO ride_driver_rejections (ride_id, driver_id) VALUES (?, ?)", [req.params.rideId, driverId], (insertError) => {
                if (insertError) return res.status(500).json({ success: false, message: "Could not reject ride request" });
                return res.json({ success: true, message: "Ride request rejected for this driver" });
            });
        });
    });
});

router.post("/:rideId/arrived", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const renewedOtp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    const sql = `
        UPDATE rides r JOIN drivers d ON d.id = r.driver_id
        SET r.status = 'arrived', r.otp = ?, r.otp_expires_at = DATE_ADD(NOW(), INTERVAL 3 MINUTE)
        WHERE r.id = ? AND d.user_id = ? AND r.status IN ('accepted', 'arrived')
    `;
    db.query(sql, [renewedOtp, req.params.rideId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Could not update arrival status" });
        if (!result.affectedRows) return res.status(409).json({ success: false, message: "Ride is not assigned to you or is no longer accepted" });
        db.query("SELECT otp_expires_at FROM rides WHERE id = ?", [req.params.rideId], (expiryError, rows) => {
            if (expiryError) return res.status(500).json({ success: false, message: "OTP created, but expiry could not be loaded" });
            return res.json({ success: true, message: "Arrival recorded; OTP expires in 3 minutes", otp_expires_at: rows[0]?.otp_expires_at || null });
        });
    });
});

router.post("/:rideId/verify-otp", authMiddleware, roleMiddleware("driver"), verifyRideOtp);
router.put("/:rideId/start", authMiddleware, roleMiddleware("driver"), verifyRideOtp);

router.post("/:rideId/location", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);
    if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) {
        return res.status(400).json({ success: false, message: "Valid latitude and longitude are required" });
    }
    const sql = `
        UPDATE rides r JOIN drivers d ON d.id = r.driver_id
        SET r.driver_lat = ?, r.driver_lng = ?
        WHERE r.id = ? AND d.user_id = ? AND r.status IN ('accepted', 'arrived', 'started')
    `;
    db.query(sql, [lat, lng, req.params.rideId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Could not update driver location" });
        if (!result.affectedRows && !result.changedRows) return res.status(404).json({ success: false, message: "Active ride not found" });
        return res.json({ success: true });
    });
});

router.put("/:rideId/complete", authMiddleware, roleMiddleware("driver"), (req, res) => {
    const sql = `
        UPDATE rides r JOIN drivers d ON d.id = r.driver_id
        SET r.status = 'completed', r.otp = NULL, r.otp_expires_at = NULL
        WHERE r.id = ? AND d.user_id = ? AND r.status = 'started'
    `;
    db.query(sql, [req.params.rideId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Could not complete ride" });
        if (!result.affectedRows) return res.status(409).json({ success: false, message: "Only your started ride can be completed" });
        return res.json({ success: true, message: "Ride completed" });
    });
});

router.delete("/:rideId", authMiddleware, roleMiddleware("user"), (req, res) => {
    const reason = String(req.body.reason || "").trim();
    if (!reason) return res.status(400).json({ success: false, message: "Select a cancellation reason" });
    const sql = `
        UPDATE rides SET status = 'cancelled', cancel_reason = ?, otp = NULL, otp_expires_at = NULL
        WHERE id = ? AND user_id = ? AND status IN ('requested', 'accepted', 'arrived')
    `;
    db.query(sql, [reason.slice(0, 255), req.params.rideId, req.user.id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Could not cancel ride" });
        if (!result.affectedRows) return res.status(409).json({ success: false, message: "Ride cannot be cancelled after the trip starts" });
        return res.json({ success: true, message: "Ride cancelled" });
    });
});

module.exports = router;