const db = require("../config/db");

const roleMiddleware = (...allowedRoles) => {
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toLowerCase());

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const tokenRole = String(req.user.role || "").toLowerCase();
        if (normalizedAllowedRoles.includes(tokenRole)) {
            req.user.role = tokenRole;
            return next();
        }

        db.query("SELECT role FROM users WHERE id = ? LIMIT 1", [req.user.id], (err, users) => {
            if (err) {
                console.error("Role verification failed:", err.message);
                return res.status(500).json({ success: false, message: "Could not verify account access" });
            }

            const currentRole = String(users[0]?.role || "").toLowerCase();
            if (!normalizedAllowedRoles.includes(currentRole)) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }

            req.user.role = currentRole;
            return next();
        });
    };
};

module.exports = roleMiddleware;