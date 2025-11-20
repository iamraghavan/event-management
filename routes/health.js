// routes/health.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    let dbOk = false;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch (err) {
      console.error('Health Check DB Error:', err);
      dbOk = false;
    }

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbOk ? "connected" : "error",
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
