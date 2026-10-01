const driverModel = require("../models/driverModel");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const applyForDriver = async (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const licenseNo = String(req.body.license_no || "").trim();
    const model = String(req.body.model || "").trim();
    const vehicleNumber = String(req.body.vehicle_number || "").trim().toUpperCase();
    const vehicleType = String(req.body.vehicle_type || "Electric Car").trim();
    const pricePerKm = Number(req.body.price_per_km);

    if (!name || !email || !phone || !password || !licenseNo || !model || !vehicleNumber) {
        return res.status(400).json({ success: false, message: "Complete all personal, license, and vehicle fields" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must contain at least 8 characters" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9\s()-]{8,20}$/.test(phone)) {
        return res.status(400).json({ success: false, message: "Enter a valid email and phone number" });
    }
    if (!Number.isFinite(pricePerKm) || pricePerKm <= 0) {
        return res.status(400).json({ success: false, message: "Enter a valid positive price per kilometre" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.beginTransaction((transactionError) => {
            if (transactionError) return res.status(500).json({ success: false, message: "Could not start driver application" });

            const rollback = (statusCode, message) => db.rollback(() => res.status(statusCode).json({ success: false, message }));
            db.query("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", [email], (lookupError, users) => {
                if (lookupError) return rollback(500, "Could not check email address");
                if (users.length) return rollback(409, "An account with this email already exists");

                db.query(
                    "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'driver_pending')",
                    [name, email, hashedPassword, phone],
                    (userError, userResult) => {
                        if (userError) return rollback(500, "Could not create driver account");

                        db.query(
                            "INSERT INTO drivers (user_id, license_no, status, is_online) VALUES (?, ?, 'pending', 0)",
                            [userResult.insertId, licenseNo],
                            (driverError, driverResult) => {
                                if (driverError) return rollback(500, "Could not save driver application");

                                db.query(
                                    "INSERT INTO vehicles (driver_id, model, vehicle_number, vehicle_type, price_per_km) VALUES (?, ?, ?, ?, ?)",
                                    [driverResult.insertId, model, vehicleNumber, vehicleType, pricePerKm],
                                    (vehicleError) => {
                                        if (vehicleError) return rollback(500, "Could not save vehicle details");

                                        db.commit((commitError) => {
                                            if (commitError) return db.rollback(() => res.status(500).json({ success: false, message: "Could not submit driver application" }));
                                            return res.status(201).json({ success: true, message: "Driver application sent for admin approval" });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    } catch (error) {
        console.error("Driver application password hashing failed:", error.message);
        return res.status(500).json({ success: false, message: "Could not submit driver application" });
    }
};

// ================= 1. CREATE DRIVER (DIRECT/ADMIN) =================
const createDriver = (req, res) => {
    const { user_id, license_no } = req.body;

    if (!user_id || !license_no) {
        return res.status(400).json({
            success: false,
            message: "user_id and license_no are required"
        });
    }

    driverModel.createDriver(user_id, license_no, (err, result) => {
        if (err) {
            console.log("Driver insert error:", err);
            return res.status(500).json({
                success: false,
                message: "Driver insert failed",
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Driver added successfully (Pending Approval)",
            driverId: result.insertId
        });
    });
};

// ================= 2. REGISTER DRIVER (WITH VEHICLE) =================
const registerDriver = (req, res) => {
    driverModel.registerDriver({ ...req.body, user_id: req.user.id }, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            data: result
        });
    });
};

// ================= 3. GET ALL DRIVERS =================
const getAllDrivers = (req, res) => {
    driverModel.getAllDrivers((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            drivers: results
        });
    });
};

// ================= 4. UPDATE DRIVER STATUS =================
const updateDriverStatus = (req, res) => {
    const driver_id = req.body.driver_id || req.body.id;
    const { status } = req.body;

    if (!driver_id || !status) {
        return res.status(400).json({
            success: false,
            message: "driver_id and status required"
        });
    }

    driverModel.updateDriverStatus(
        driver_id,
        status,
        (err, result) => {
            if (err) {
                console.error("SQL Update Error:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Status updated successfully"
            });
        }
    );
};

// ================= 5. GET LOGGED-IN DRIVER =================
const getMyDriver = (req, res) => {
    const user_id = req.user.id;

    driverModel.getMyDriver(
        user_id,
        (err, results) => {
            if (err) {
                console.error("Get my driver error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch driver profile"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Driver profile not found"
                });
            }

            res.status(200).json({
                success: true,
                driver: results[0]
            });
        }
    );
};

// ================= 6. DRIVER DASHBOARD STATS =================
const getDashboardStats = (req, res) => {
    const userId = req.user.id;

    const driverQuery = `SELECT id FROM drivers WHERE user_id = ?`;

    db.query(driverQuery, [userId], (err, driverResults) => {
        if (err || driverResults.length === 0) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        const driverId = driverResults[0].id;

        const ridesQuery = `SELECT COUNT(*) AS totalRides FROM rides WHERE driver_id = ?`;
        db.query(ridesQuery, [driverId], (err, rideResults) => {
            if (err) return res.status(500).json({ success: false, message: "Failed to fetch total rides" });

            const ratingQuery = `SELECT COALESCE(AVG(rating), 0) AS rating FROM reviews WHERE driver_id = ?`;
            db.query(ratingQuery, [driverId], (err, ratingResults) => {
                if (err) return res.status(500).json({ success: false, message: "Failed to fetch rating" });

                const walletQuery = `
                    SELECT COALESCE(SUM(COALESCE(p.driver_settlement, p.amount * 0.2)), 0) AS wallet
                    FROM payments p
                    INNER JOIN rides r ON p.ride_id = r.id
                    WHERE r.driver_id = ? AND p.payment_status = 'paid'
                `;
                db.query(walletQuery, [driverId], (err, walletResults) => {
                    if (err) return res.status(500).json({ success: false, message: "Failed to fetch wallet" });

                    res.status(200).json({
                        success: true,
                        dashboard: {
                            totalRides: rideResults[0].totalRides,
                            rating: Number(ratingResults[0].rating),
                            wallet: Number(walletResults[0].wallet)
                        }
                    });
                });
            });
        });
    });
};

// ================= 7. GET DRIVER EARNINGS (NEWLY ADDED) =================
const getDriverEarnings = (req, res) => {
    db.query("SELECT id FROM drivers WHERE user_id = ? AND status = 'approved' LIMIT 1", [req.user.id], (driverError, drivers) => {
        if (driverError) {
            console.error("Driver earnings lookup failed:", driverError.message);
            return res.status(500).json({ success: false, message: "Failed to load driver earnings" });
        }
        if (!drivers.length) {
            return res.status(403).json({ success: false, message: "An approved driver account is required to view earnings" });
        }

        const driverId = drivers[0].id;
        const paidRideJoin = `
            FROM rides r
            JOIN (
                SELECT ride_id, MAX(id) AS payment_id
                FROM payments
                WHERE payment_status = 'paid'
                GROUP BY ride_id
            ) latest ON latest.ride_id = r.id
            JOIN payments p ON p.id = latest.payment_id
            WHERE r.driver_id = ? AND r.status = 'completed'
        `;
        const driverShare = "COALESCE(p.driver_settlement, p.amount * 0.2)";
        const summarySql = `
            SELECT
                COALESCE(SUM(${driverShare}), 0) AS totalEarned,
                COALESCE(SUM(CASE WHEN DATE(r.created_at) = CURDATE() THEN ${driverShare} ELSE 0 END), 0) AS today,
                COALESCE(SUM(CASE WHEN r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN ${driverShare} ELSE 0 END), 0) AS week,
                COALESCE(SUM(CASE WHEN YEAR(r.created_at) = YEAR(CURDATE()) AND MONTH(r.created_at) = MONTH(CURDATE()) THEN ${driverShare} ELSE 0 END), 0) AS month
            ${paidRideJoin}
        `;

        db.query(summarySql, [driverId], (summaryError, summaries) => {
            if (summaryError) {
                console.error("Driver earnings summary failed:", summaryError.message);
                return res.status(500).json({ success: false, message: "Failed to calculate paid earnings" });
            }

            const recentSql = `
                SELECT r.id, r.pickup, r.destination, r.status,
                    p.amount AS gross_fare, ${driverShare} AS fare, p.payment_method
                ${paidRideJoin}
                ORDER BY r.id DESC
                LIMIT 5
            `;
            db.query(recentSql, [driverId], (ridesError, rides) => {
                if (ridesError) {
                    console.error("Recent paid driver rides failed:", ridesError.message);
                    return res.status(500).json({ success: false, message: "Failed to load recent paid rides" });
                }

                const earnings = summaries[0] || {};
                const total = Number(earnings.totalEarned || 0);
                return res.json({
                    success: true,
                    totalEarned: total,
                    wallet: total,
                    today: Number(earnings.today || 0),
                    week: Number(earnings.week || 0),
                    month: Number(earnings.month || 0),
                    recentRides: rides || []
                });
            });
        });
    });
};

// ================= EXPORTS =================
module.exports = {
    applyForDriver,
    createDriver,
    registerDriver,
    getAllDrivers,
    updateDriverStatus,
    getMyDriver,
    getDashboardStats,
    getDriverEarnings // Naya export add kar diya
};