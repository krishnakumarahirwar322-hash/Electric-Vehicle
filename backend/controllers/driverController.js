const driverModel = require("../models/driverModel");

// ================= CREATE DRIVER (DIRECT/ADMIN) =================
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

// ================= REGISTER DRIVER (WITH PENDING STATUS) =================
const registerDriver = (req, res) => {
    const { license_no } = req.body;
    const user_id = req.user ? req.user.id : req.body.user_id; // JWT Token se ya Body se

    if (!license_no) {
        return res.status(400).json({
            success: false,
            message: "license_no is required"
        });
    }

    driverModel.registerDriver(user_id, license_no, (err, result) => {
        if (err) {
            console.log("Driver registration error:", err);
            return res.status(500).json({
                success: false,
                message: "Registration failed",
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: "Driver registered successfully! Waiting for Admin Approval.",
            driverId: result.insertId
        });
    });
};



const updateDriverStatus = (req, res) => {
    // URL Params se lein YA Body se (dono handle karega)
    const driver_id = req.params.id || req.body.driver_id || req.body.driverId;
    const { status } = req.body;

    if (!driver_id || !status) {
        return res.status(400).json({ 
            success: false, 
            message: "driver_id and status are required" 
        });
    }

    driverModel.updateDriverStatus(driver_id, status, (err, result) => {
        if (err) {
            console.log("Status update error:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        
        res.status(200).json({ 
            success: true, 
            message: `Driver status updated to ${status}` 
        });
    });
};

// ================= GET ALL DRIVERS =================
const getAllDrivers = (req, res) => {
    driverModel.getAllDrivers((err, results) => {
        if (err) {
            console.log("Get drivers error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch drivers",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            drivers: results
        });
    });
};

module.exports = {
    updateDriverStatus ,
    createDriver,
    registerDriver,
    getAllDrivers
};