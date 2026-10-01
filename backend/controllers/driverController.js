const driverModel = require("../models/driverModel");
const db = require("../config/db");

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
    driverModel.registerDriver(req.body, (err, result) => {
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
    // Auth Middleware se Logged-in User ID milegi (fallback testing ID: 7)
    const userId = req.user?.id || 7;

    const driverQuery = `SELECT id FROM drivers WHERE user_id = ?`;

    db.query(driverQuery, [userId], (err, driverResults) => {
        // Agar user_id se direct record na mile, toh id ko direct driver_id maan kar test kar lein
        const driverId = (driverResults && driverResults.length > 0) ? driverResults[0].id : userId;

        // 1. Total Earnings Query
        const earningsQuery = `
            SELECT COALESCE(SUM(fare), 0) AS totalEarned
            FROM rides 
            WHERE driver_id = ? AND LOWER(status) = 'completed'
        `;

        db.query(earningsQuery, [driverId], (err, earningsResults) => {
            if (err) {
                console.error("Earnings Query Error:", err);
                return res.status(500).json({ success: false, message: "Failed to fetch earnings" });
            }

            // 2. Recent Rides Query
            const ridesQuery = `
                SELECT id, pickup, destination, fare, status 
                FROM rides 
                WHERE driver_id = ? AND LOWER(status) = 'completed'
                ORDER BY id DESC 
                LIMIT 5
            `;

            db.query(ridesQuery, [driverId], (err, rideResults) => {
                if (err) {
                    console.error("Recent Rides Error:", err);
                    return res.status(500).json({ success: false, message: "Failed to fetch recent rides" });
                }

                // 3. Wallet Query
                const walletQuery = `SELECT wallet_balance FROM drivers WHERE id = ?`;
                db.query(walletQuery, [driverId], (err, walletResults) => {
                    const total = earningsResults[0]?.totalEarned || 0;
                    const wallet = walletResults && walletResults.length > 0 ? walletResults[0].wallet_balance : 0;

                    res.status(200).json({
                        success: true,
                        totalEarned: Number(total),
                        wallet: Number(wallet),
                        today: Number(total),
                        week: Number(total),
                        month: Number(total),
                        recentRides: rideResults || []
                    });
                });
            });
        });
    });
};

// ================= EXPORTS =================
module.exports = {
    createDriver,
    registerDriver,
    getAllDrivers,
    updateDriverStatus,
    getMyDriver,
    getDashboardStats,
    getDriverEarnings // Naya export add kar diya
};