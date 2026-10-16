const db = require("../config/db");

const testDatabase = (req, res) => {
    db.query("SELECT 1 AS database_test", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Database connection successful",
            database: "MySQL",
            result: rows
        });
    });
};

module.exports = {
    testDatabase,
};