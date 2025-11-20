const express = require('express');
const { check } = require('express-validator');
const { approveEvent, rejectEvent, getMyApprovals } = require('../controllers/approvalController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// Get pending approvals for the logged-in user
router.get(
    '/pending',
    verifyToken,
    checkRole(['HOD', 'HLC_MEMBER', 'MANAGEMENT', 'ADMIN']),
    getMyApprovals
);

// Approve an event
router.post(
    '/:approvalId/approve',
    verifyToken,
    checkRole(['HOD', 'HLC_MEMBER', 'MANAGEMENT', 'ADMIN']),
    [
        check('comments', 'Comments are optional but recommended').optional().isString()
    ],
    validate,
    approveEvent
);

// Reject an event
router.post(
    '/:approvalId/reject',
    verifyToken,
    checkRole(['HOD', 'HLC_MEMBER', 'MANAGEMENT', 'ADMIN']),
    [
        check('comments', 'Comments are required for rejection').not().isEmpty()
    ],
    validate,
    rejectEvent
);

module.exports = router;
