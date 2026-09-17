const db = require("../config/db");

// Admin panel ke liye Users, Drivers aur Admin fetch karne ka code
const getAllAccounts = (req, res) => {
    // Basic columns fetch karein jo users table me guarantee ke sath hain
    const query = `
        SELECT id, name, email, phone, role 
        FROM users 
        ORDER BY id DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL Error in getAllAccounts:", err);
            return res.status(500).json({
                success: false,
                message: "Database query error",
                error: err.message
            });
        }

        // Safe array check
        const data = results || [];

        // Role filtering
        const users = data.filter(row => row.role === 'user');
        const drivers = data.filter(row => row.role === 'driver');
        const admins = data.filter(row => row.role === 'admin');

        res.status(200).json({
            success: true,
            totalCount: data.length,
            users: users,
            drivers: drivers,
            admins: admins
        });
    });
};

module.exports = {
    getAllAccounts
};