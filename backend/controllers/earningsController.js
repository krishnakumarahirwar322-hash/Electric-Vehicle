const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Aapka database connection

// Route path MUST be /earnings because /api/drivers main file se attach hai
router.get('/earnings', (req, res) => {
  // Database testing ke liye default driver_id 7 rakhi hai (jo aapki image me completed status ke sath thi)
  const driverId = req.user?.id || 7;

  // 1. Total earnings query
  const earningsQuery = `
    SELECT COALESCE(SUM(fare), 0) AS totalEarned
    FROM rides 
    WHERE driver_id = ? AND LOWER(status) = 'completed'
  `;

  db.query(earningsQuery, [driverId], (err1, earningsResult) => {
    if (err1) {
      console.error("Database Error:", err1);
      return res.status(500).json({ error: "Database query failed" });
    }

    // 2. Recent rides query (DB columns: pickup, destination)
    const ridesQuery = `
      SELECT id, pickup, destination, fare, status 
      FROM rides 
      WHERE driver_id = ? AND LOWER(status) = 'completed'
      ORDER BY id DESC 
      LIMIT 5
    `;

    db.query(ridesQuery, [driverId], (err2, recentRides) => {
      if (err2) {
        console.error("Database Error:", err2);
        return res.status(500).json({ error: "Database query failed" });
      }

      // 3. Wallet query
      const walletQuery = `SELECT wallet_balance FROM drivers WHERE id = ?`;

      db.query(walletQuery, [driverId], (err3, walletResult) => {
        if (err3) {
          console.error("Database Error:", err3);
          return res.status(500).json({ error: "Database query failed" });
        }

        const total = earningsResult[0]?.totalEarned || 0;

        res.json({
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

module.exports = router;