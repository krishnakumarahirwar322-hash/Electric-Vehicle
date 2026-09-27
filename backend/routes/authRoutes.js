const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const {
    signup,
    login
} = require("../controllers/authController");

// ================= SIGNUP =================
router.post("/signup", signup);

// ================= LOGIN =================
router.post("/login", login);

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (results.length === 0) return res.status(404).json({ success: false, message: "Email not found" });

        const token = require("crypto").randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour

        db.query(
            "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
            [token, expires, email],
            (err2) => {
                if (err2) return res.status(500).json({ success: false, message: "Token save failed" });
                res.json({
                    success: true,
                    message: "Password reset token generated",
                    token // In production, send via email
                });
            }
        );
    });
});

// ================= RESET PASSWORD =================
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: "Password required" });

    db.query(
        "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token],
        async (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (results.length === 0) return res.status(400).json({ success: false, message: "Invalid or expired token" });

            const hashed = await bcrypt.hash(password, 10);
            db.query(
                "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
                [hashed, results[0].id],
                (err2) => {
                    if (err2) return res.status(500).json({ success: false, message: "Password update failed" });
                    res.json({ success: true, message: "Password reset successful" });
                }
            );
        }
    );
});

module.exports = router;