const express = require("express");

const router = express.Router();

const db = require("../config/db");


// ================= ADD VEHICLE =================

router.post("/", (req, res) => {

    const {
        driver_id,
        model,
        vehicle_number,
        vehicle_type,
        price_per_km
    } = req.body;


    const sql = `
        INSERT INTO vehicles
        (
            driver_id,
            model,
            vehicle_number,
            vehicle_type,
            price_per_km
        )
        VALUES (?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            driver_id,
            model,
            vehicle_number,
            vehicle_type,
            price_per_km
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Vehicle insert failed"
                });

            }


            res.status(201).json({
                success: true,
                message: "Vehicle added successfully",
                vehicleId: result.insertId
            });

        }
    );

});


// ================= GET VEHICLES =================

router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM vehicles
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch vehicles"
                });

            }


            res.json({
                success: true,
                vehicles: results
            });

        }
    );

});


module.exports = router;