const express = require("express");
const router = express.Router();

const db = require("../config/db");

router.post("/", (req, res) => {

    console.log("POST /users request received");

    const { name, email, password, phone, role } = req.body;

    const sql = `
        INSERT INTO users (name, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, password,phone,role],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "User insert failed"
                });
            }

            res.status(201).json({
                success: true,
                message: "User inserted successfully",
                userId: result.insertId
            });
        }
    );
});

module.exports = router;