const db = require("../config/db");

// ================= CREATE DRIVER (DEFAULT PENDING STATUS) =================
const createDriver = (user_id, license_no, callback) => {
    const sql = `
        INSERT INTO drivers
        (user_id, license_no, status)
        VALUES (?, ?, 'pending')
    `;
    db.query(sql, [user_id, license_no], callback);
};

// ================= REGISTER DRIVER =================
const registerDriver = (driverData, callback) => {
    const { user_id, license_no, model, vehicle_number, vehicle_type, price_per_km } = driverData;

    const sqlDriver = `INSERT INTO drivers (user_id, license_no, status) VALUES (?, ?, 'pending')`;

    db.query(sqlDriver, [user_id, license_no], (err, result) => {
        if (err) return callback(err);

        const driver_id = result.insertId;

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

// ================= GET ALL DRIVERS =================
const getAllDrivers = (callback) => {
    const sql = `
        SELECT 
            drivers.id AS driver_id,
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

// ================= UPDATE DRIVER STATUS (FIXED CONNECTION LEAK) =================
const updateDriverStatus = (driverId, status, callback) => {
    db.getConnection((connError, connection) => {
        if (connError) return callback(connError);

        connection.beginTransaction((transactionError) => {
            if (transactionError) {
                connection.release();
                return callback(transactionError);
            }

            connection.query("SELECT user_id FROM drivers WHERE id = ? FOR UPDATE", [driverId], (lookupError, drivers) => {
                if (lookupError || !drivers || drivers.length === 0) {
                    return connection.rollback(() => {
                        connection.release(); // Fix: Connection release ensure kiya gaya hai
                        callback(lookupError || new Error("Driver application not found"));
                    });
                }

                connection.query("UPDATE drivers SET status = ?, is_online = 0 WHERE id = ?", [status, driverId], (updateError) => {
                    if (updateError) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(updateError);
                        });
                    }

                    const accountRole = status === "approved" ? "driver" : status === "rejected" ? "user" : null;
                    
                    const finish = (roleError) => {
                        if (roleError) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(roleError);
                            });
                        }
                        connection.commit((commitError) => {
                            if (commitError) {
                                return connection.rollback(() => {
                                    connection.release();
                                    callback(commitError);
                                });
                            }
                            connection.release();
                            return callback(null, { affectedRows: 1 });
                        });
                    };

                    if (!accountRole) return finish(null);
                    connection.query("UPDATE users SET role = ? WHERE id = ?", [accountRole, drivers[0].user_id], (roleError) => finish(roleError));
                });
            });
        });
    });
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
            drivers.is_online,

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

    db.query(sql, [user_id], callback);
};

module.exports = { 
    createDriver, 
    registerDriver, 
    getAllDrivers, 
    updateDriverStatus, 
    getMyDriver 
};