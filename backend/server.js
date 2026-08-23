const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(cors());
app.use(express.json());


// User routes
app.use("/users", userRoutes);

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Server running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});