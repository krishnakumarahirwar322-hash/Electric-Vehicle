const db = require("../config/db");

// ================= CREATE DRIVER (DEFAULT PENDING STATUS) =================
const createDriver = (user_id, license_no, callback) => {
    // Column status add kiya aur DEFAULT value 'pending' pass ki
    const sql = `
        INSERT INTO drivers
        (user_id, license_no, status)
        VALUES (?, ?, 'pending')
    `;

    db.query(
        sql,
        [user_id, license_no],
        callback
    );
};

// ================= REGISTER DRIVER (SAME LOGIC FOR AUTH/SIGNUP) =================
const registerDriver = (user_id, license_no, callback) => {
    createDriver(user_id, license_no, callback);
};

// ================= GET ALL DRIVERS (WITH STATUS & USER DETAILS) =================
const getAllDrivers = (callback) => {
    const sql = `
        SELECT
            drivers.id,
            drivers.user_id,
            drivers.license_no,
            drivers.status,
            users.name,
            users.email,
            users.phone
        FROM drivers
        JOIN users
        ON drivers.user_id = users.id
        ORDER BY drivers.id DESC
    `;

    db.query(
        sql,
        callback
    );
};

// ================= UPDATE DRIVER STATUS (ADMIN APPROVE/REJECT) =================
const updateDriverStatus = (driver_id, status, callback) => {
    const sql = `UPDATE drivers SET status = ? WHERE id = ?`;
    db.query(sql, [status, driver_id], callback);
};

module.exports = {
    createDriver,
    registerDriver,
    getAllDrivers,
    updateDriverStatus
};