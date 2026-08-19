const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const app = express();

app.use(cors());
app.use(express.json());


// User routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Server running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});