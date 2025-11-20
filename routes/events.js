const express = require('express');
const { check, query } = require('express-validator');
const { listEvents, getEvent, createNewEvent, updateExistingEvent, deleteExistingEvent } = require('../controllers/eventController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const multer = require('multer');

// Memory storage for small files (limit 5MB per file handled in server.js or here)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

router.get(
    '/', 
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    validate,
    listEvents
);

router.get('/:id', getEvent);

// Protected Routes
router.post(
    '/',
    verifyToken,
    checkRole(['ADMIN', 'FACULTY', 'STAFF', 'HOD', 'HLC_MEMBER', 'MANAGEMENT']),
    upload.array('attachments', 5), // Allow up to 5 files
    [
        check('title', 'Title is required').not().isEmpty().trim().escape(),
        check('description', 'Description must be a string').optional().isString(),
        check('startDate', 'Valid start date is required').isISO8601().toDate(),
        check('endDate', 'Valid end date is required').isISO8601().toDate(),
        check('location', 'Location is required').not().isEmpty().trim().escape()
    ],
    validate,
    createNewEvent
);

router.put(
    '/:id',
    verifyToken,
    checkRole(['ADMIN', 'FACULTY', 'STAFF', 'HOD', 'HLC_MEMBER', 'MANAGEMENT']),
    [
        check('title', 'Title must be a string').optional().not().isEmpty().trim().escape(),
        check('startDate', 'Valid start date is required').optional().isISO8601().toDate(),
        check('endDate', 'Valid end date is required').optional().isISO8601().toDate()
    ],
    validate,
    updateExistingEvent
);

router.delete(
    '/:id',
    verifyToken,
    checkRole(['ADMIN', 'FACULTY', 'STAFF', 'HOD', 'HLC_MEMBER', 'MANAGEMENT']),
    deleteExistingEvent
);

module.exports = router;
