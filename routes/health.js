// routes/health.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = req.app.locals.db;
    let dbOk = false;

    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      dbOk = true;
    } catch (err) {
      dbOk = false;
    }

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "error",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
