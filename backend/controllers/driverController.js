const driverModel = require("../models/driverModel");


// ================= CREATE DRIVER =================

const createDriver = (req, res) => {

    const {
        user_id,
        license_no
    } = req.body;


    // Validation

    if (!user_id || !license_no) {

        return res.status(400).json({
            success: false,
            message: "user_id and license_no are required"
        });

    }


    driverModel.createDriver(
        user_id,
        license_no,
        (err, result) => {

            if (err) {

                console.log(
                    "Driver insert error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Driver insert failed",
                    error: err.message
                });

            }


            res.status(201).json({
                success: true,
                message: "Driver added successfully",
                driverId: result.insertId
            });

        }
    );

};


// ================= GET ALL DRIVERS =================

const getAllDrivers = (req, res) => {

    driverModel.getAllDrivers(
        (err, results) => {

            if (err) {

                console.log(
                    "Get drivers error:",
                    err
                );

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

        }
    );

};


module.exports = {
    createDriver,
    getAllDrivers
};