const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ================= CREATE USER =================
router.post("/", (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const sql = `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, email, password, phone, role], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "User insert failed" });
        res.status(201).json({ success: true, message: "User inserted successfully", userId: result.insertId });
    });
});

// ================= GET USER PROFILE =================
router.get("/profile", authMiddleware, (req, res) => {
    const userId = req.user.id;
    db.query(
        "SELECT id, name, email, phone, role FROM users WHERE id = ?",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (results.length === 0) return res.status(404).json({ success: false, message: "User not found" });
            res.json({ success: true, user: results[0] });
        }
    );
});

// ================= UPDATE USER PROFILE =================
router.put("/profile", authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { name, phone } = req.body;

    db.query(
        "UPDATE users SET name = ?, phone = ? WHERE id = ?",
        [name, phone, userId],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Update failed" });
            res.json({ success: true, message: "Profile updated successfully" });
        }
    );
});

module.exports = router;