const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Aapka database connection

// Route path MUST be /earnings because /api/drivers main file se attach hai
router.get('/earnings', async (req, res) => {
  // Database testing ke liye default driver_id 7 rakhi hai (jo aapki image me completed status ke sath thi)
  const driverId = req.user?.id || 7; 

  try {
    // 1. Total earnings query
    const earningsQuery = `
      SELECT COALESCE(SUM(fare), 0) AS totalEarned
      FROM rides 
      WHERE driver_id = ? AND LOWER(status) = 'completed'
    `;

    // 2. Recent rides query (DB columns: pickup, destination)
    const ridesQuery = `
      SELECT id, pickup, destination, fare, status 
      FROM rides 
      WHERE driver_id = ? AND LOWER(status) = 'completed'
      ORDER BY id DESC 
      LIMIT 5
    `;

    // 3. Wallet query
    const walletQuery = `SELECT wallet_balance FROM drivers WHERE id = ?`;

    const [earningsResult] = await db.query(earningsQuery, [driverId]);
    const [recentRides] = await db.query(ridesQuery, [driverId]);
    const [walletResult] = await db.query(walletQuery, [driverId]);

    const total = earningsResult[0]?.totalEarned || 0;

    res.json({
      totalEarned: total,
      wallet: walletResult[0]?.wallet_balance || 0,
      today: total,
      week: total,
      month: total,
      recentRides: recentRides
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});

module.exports = router;