const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const db = require("../config/db");


// ================= SIGNUP =================

exports.signup = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone,
            role
        } = req.body;

        if (!name || !email || !password || !phone) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        const checkSql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(
            checkSql,
            [email],
            async (err, results) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });

                }

                if (results.length > 0) {

                    return res.status(400).json({
                        success: false,
                        message: "Email already exists"
                    });

                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO users
                    (name, email, password, phone, role)
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword,
                        phone,
                        role || "user"
                    ],
                    (err, result) => {

                        if (err) {

                            return res.status(500).json({
                                success: false,
                                message: "Signup failed"
                            });

                        }

                        res.status(201).json({
                            success: true,
                            message: "Signup successful",
                            userId: result.insertId
                        });

                    }
                );

            }
        );

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// ================= LOGIN =================

exports.login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });

    }

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        async (err, results) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });

            }

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                success: true,
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });

        }
    );

};

exports.requestPasswordReset = (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER;
    const smtpPassword = (process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.MAIL_PASS || "").replace(/\s/g, "");
    if (!smtpUser || !smtpPassword) {
        return res.status(503).json({ success: false, message: "Password reset email is not configured on the server" });
    }

    db.query("SELECT id, email FROM users WHERE LOWER(email) = ? LIMIT 1", [email], (err, users) => {
        if (err) {
            console.error("Password reset lookup failed:", err.message);
            return res.status(500).json({ success: false, message: "Could not process password reset" });
        }

        if (users.length === 0) {
            return res.json({ success: true, message: "If the email exists, reset instructions have been sent" });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        db.query("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [token, expiresAt, user.id], async (updateError) => {
            if (updateError) {
                console.error("Password reset token save failed:", updateError.message);
                return res.status(500).json({ success: false, message: "Could not create a reset link" });
            }

            const port = Number(process.env.SMTP_PORT || 587);
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port,
                secure: port === 465,
                auth: { user: smtpUser, pass: smtpPassword }
            });
            const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
            const resetUrl = `${frontendUrl}/reset-password/${token}`;

            try {
                await transporter.sendMail({
                    from: process.env.SMTP_FROM || smtpUser,
                    to: user.email,
                    subject: "Reset your VoltRide password",
                    text: `Use this link to reset your VoltRide password. It expires in 15 minutes: ${resetUrl}`,
                    html: `<p>Use the link below to reset your VoltRide password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Reset password</a></p>`
                });
                return res.json({ success: true, message: "If the email exists, reset instructions have been sent" });
            } catch (mailError) {
                db.query("UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ? AND reset_token = ?", [user.id, token]);
                console.error("Password reset email failed:", mailError.message);
                return res.status(502).json({ success: false, message: "Reset email could not be sent. Check SMTP configuration." });
            }
        });
    });
};

exports.resetPassword = (req, res) => {
    const { token } = req.params;
    const password = String(req.body.password || "");
    if (!token || !password || password.length < 6) {
        return res.status(400).json({ success: false, message: "A valid reset token and password of at least 6 characters are required" });
    }

    db.query("SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1", [token], async (err, users) => {
        if (err) {
            console.error("Password reset validation failed:", err.message);
            return res.status(500).json({ success: false, message: "Could not reset password" });
        }
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ? AND reset_token = ?", [hashedPassword, users[0].id, token], (updateError, result) => {
                if (updateError) {
                    console.error("Password update failed:", updateError.message);
                    return res.status(500).json({ success: false, message: "Password update failed" });
                }
                if (result.affectedRows === 0) {
                    return res.status(400).json({ success: false, message: "Reset link is invalid or expired" });
                }
                return res.json({ success: true, message: "Password reset successful" });
            });
        } catch (hashError) {
            console.error("Password hashing failed:", hashError.message);
            return res.status(500).json({ success: false, message: "Password update failed" });
        }
    });
};