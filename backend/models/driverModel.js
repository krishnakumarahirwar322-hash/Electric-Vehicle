const db = require("../config/db");


// ================= CREATE DRIVER =================

const createDriver = (user_id, license_no, callback) => {

    const sql = `
        INSERT INTO drivers
        (user_id, license_no)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [user_id, license_no],
        callback
    );
};


// ================= GET ALL DRIVERS =================

const getAllDrivers = (callback) => {

    const sql = `
        SELECT
            drivers.id,
            drivers.user_id,
            drivers.license_no,
            users.name,
            users.email,
            users.phone
        FROM drivers
        JOIN users
        ON drivers.user_id = users.id
    `;

    db.query(
        sql,
        callback
    );
};


module.exports = {
    createDriver,
    getAllDrivers
};