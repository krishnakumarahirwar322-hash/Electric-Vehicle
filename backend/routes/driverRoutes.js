const express = require("express");

const router = express.Router();

const driverController = require("../controllers/driverController");


// ================= CREATE DRIVER =================

router.post(
    "/",
    driverController.createDriver
);


// ================= GET ALL DRIVERS =================

router.get(
    "/",
    driverController.getAllDrivers
);


module.exports = router;