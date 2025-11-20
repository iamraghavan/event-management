const express = require('express');
const { getEventReport } = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Admin, Management, HOD, HLC can view reports
router.get(
    '/events',
    verifyToken,
    checkRole(['ADMIN', 'MANAGEMENT', 'HOD', 'HLC_MEMBER']),
    getEventReport
);

module.exports = router;
