// const db = require("../config/db");

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

// // ================= REGISTER DRIVER (SAME LOGIC FOR AUTH/SIGNUP) =================
// const registerDriver = (user_id, license_no, callback) => {
//     createDriver(user_id, license_no, callback);
// };

// // ================= GET ALL DRIVERS (WITH STATUS & USER DETAILS) =================
// const getAllDrivers = (callback) => {
//     const sql = `
//         SELECT
//             drivers.id,
//             drivers.user_id,
//             drivers.license_no,
//             drivers.status,
//             users.name,
//             users.email,
//             users.phone
//         FROM drivers
//         JOIN users
//         ON drivers.user_id = users.id
//         ORDER BY drivers.id DESC
//     `;

//     db.query(
//         sql,
//         callback
//     );
// };

// // ================= UPDATE DRIVER STATUS (ADMIN APPROVE/REJECT) =================
// const updateDriverStatus = (driver_id, status, callback) => {
//     const sql = `UPDATE drivers SET status = ? WHERE id = ?`;
//     db.query(sql, [status, driver_id], callback);
// };

// module.exports = {
//     createDriver,
//     registerDriver,
//     getAllDrivers,
//     updateDriverStatus
// };

const db = require("../config/db");

//regissterDriver
const registerDriver = (driverData, callback) => {
    const { user_id, license_no, model, vehicle_number, vehicle_type, price_per_km } = driverData;

    // 1. Drivers Table me Record Insert Karein (Default Status: 'pending')
    const sqlDriver = `INSERT INTO drivers (user_id, license_no, status) VALUES (?, ?, 'pending')`;

    db.query(sqlDriver, [user_id, license_no], (err, result) => {
        if (err) return callback(err);

        const driver_id = result.insertId; // Nayi Driver ID get karein

        // 2. Vehicles Table me Vehicle Link Karein
        const sqlVehicle = `
            INSERT INTO vehicles (driver_id, model, vehicle_number, vehicle_type, price_per_km) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sqlVehicle, [driver_id, model, vehicle_number, vehicle_type || 'Electric Car', price_per_km || 12.00], (err2, result2) => {
            if (err2) return callback(err2);
            callback(null, { driver_id, message: "Driver and Vehicle registered successfully" });
        });
    });
};

// Get all drivers with User & Status details
const getAllDrivers = (callback) => {
    const sql = `
        SELECT 
            drivers.id, 
            drivers.user_id, 
            drivers.license_no, 
            drivers.status,
            users.name, 
            users.email, 
            users.phone,
            vehicles.model AS vehicle,
            vehicles.vehicle_number AS registrationNumber
        FROM drivers 
        LEFT JOIN users ON drivers.user_id = users.id 
        LEFT JOIN vehicles ON drivers.id = vehicles.driver_id
        ORDER BY drivers.id DESC
    `;
    db.query(sql, callback);
};

//updated status
const updateDriverStatus = (driverId, status, callback) => {
    const sql = `UPDATE drivers SET status = ? WHERE id = ?`;
    db.query(sql, [status, driverId], callback);
};





// ================= GET MY DRIVER =================

const getMyDriver = (user_id, callback) => {

    const sql = `
        SELECT
            users.id AS user_id,
            users.name,
            users.email,
            users.phone,

            drivers.id AS driver_id,
            drivers.license_no,
            drivers.status,

            vehicles.model AS vehicle,
            vehicles.vehicle_number AS vehicle_number,
            vehicles.vehicle_type,
            vehicles.price_per_km

        FROM users

        LEFT JOIN drivers
            ON users.id = drivers.user_id

        LEFT JOIN vehicles
            ON drivers.id = vehicles.driver_id

        WHERE users.id = ?
    `;

    db.query(
        sql,
        [user_id],
        callback
    );

};






module.exports = { createDriver,registerDriver, getAllDrivers, updateDriverStatus,getMyDriver  };