const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ================= ROUTES =================

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const rideDispatchRoutes = require("./routes/rideDispatchRoutes");
const driverRoutes = require("./routes/driverRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const chargingStationRoutes = require("./routes/chargingStationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// ================= AUTH MIDDLEWARE =================

const authMiddleware = require("./middleware/authMiddleware");

// ================= ROLE MIDDLEWARE =================
const roleMiddleware = require("./middleware/roleMiddleware");

// ================= API ROUTES =================

app.use("/users", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideDispatchRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/charging-stations", chargingStationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);

// ================= JWT TEST ROUTE =================

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "You can access protected route",
        user: req.user
    });
});

// ================= JWT ROLE TEST ROUTE =================

app.get(
    "/api/user-only",
    authMiddleware,
    roleMiddleware("user"),
    (req, res) => {
        res.json({
            success: true,
            message: "User can access this route",
            user: req.user
        });
    }
);

// ================= TEST / HEALTH ROUTE =================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Electric Vehicle Booking API is running"
    });
});

// ================= FRONTEND STATIC SERVING =================

const distPath = path.join(__dirname, "../frontend/vite-project/dist");

app.use(express.static(distPath));

// Catch-all route to serve React index.html for all non-API paths (SPA refresh support)
app.get("*", (req, res) => {
    if (!req.originalUrl.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"), (err) => {
            if (err) {
                console.error("Error serving index.html:", err);
                res.status(200).send("Frontend is loading or building, please refresh in a moment.");
            }
        });
    } else {
        res.status(404).json({ success: false, message: "API endpoint not found" });
    }
});

module.exports = app;