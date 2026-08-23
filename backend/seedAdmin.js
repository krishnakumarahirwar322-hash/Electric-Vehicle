require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function run() {
    const hash = await bcrypt.hash("admin123", 10);
    const sql = "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, ["Super Admin", "admin@evweb.com", "9876543210", hash, "admin"], (err) => {
        if (err) console.log("Error:", err.message);
        else console.log("✅ Admin account created successfully!");
        process.exit();
    });
}
run();
