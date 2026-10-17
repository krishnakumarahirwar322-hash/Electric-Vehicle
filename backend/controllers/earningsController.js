const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/earnings', (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Please login" });
  }

  // Pehle user_id se driver_id nikalein
  const driverLookupQuery = `SELECT id FROM drivers WHERE user_id = ? LIMIT 1`;

  db.query(driverLookupQuery, [userId], (err, drivers) => {
    if (err) {
      console.error("Driver Lookup Error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({ success: false, message: "Driver profile not found for this user" });
    }

    const driverId = drivers[0].id;

    // 1. Total earnings query
    const earningsQuery = `
      SELECT COALESCE(SUM(fare), 0) AS totalEarned
      FROM rides 
      WHERE driver_id = ? AND LOWER(status) = 'completed'
    `;

    db.query(earningsQuery, [driverId], (err1, earningsResult) => {
      if (err1) {
        console.error("Earnings Error:", err1);
        return res.status(500).json({ error: "Database query failed" });
      }

      // 2. Recent rides query
      const ridesQuery = `
        SELECT id, pickup, destination, fare, status 
        FROM rides 
        WHERE driver_id = ? AND LOWER(status) = 'completed'
        ORDER BY id DESC 
        LIMIT 5
      `;

      db.query(ridesQuery, [driverId], (err2, recentRides) => {
        if (err2) {
          console.error("Recent Rides Error:", err2);
          return res.status(500).json({ error: "Database query failed" });
        }

        // 3. Wallet query (agar drivers table me wallet_balance hai)
        const walletQuery = `SELECT wallet_balance FROM drivers WHERE id = ?`;

        db.query(walletQuery, [driverId], (err3, walletResult) => {
          if (err3) {
            console.error("Wallet Error:", err3);
            return res.status(500).json({ error: "Database query failed" });
          }

          const total = earningsResult[0]?.totalEarned || 0;

          res.json({
            success: true,
            totalEarned: total,
            wallet: walletResult[0]?.wallet_balance || 0,
            today: total,
            week: total,
            month: total,
            recentRides: recentRides
          });
        });
      });
    });
  });
});

module.exports = router;