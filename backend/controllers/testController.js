const { pool } = require("../config/db");

const testDatabase = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS database_test");

        res.status(200).json({
            success: true,
            message: "Database connection successful",
            database: "MySQL",
            result: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
};

module.exports = {
    testDatabase,
};