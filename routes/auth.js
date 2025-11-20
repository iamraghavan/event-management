const express = require('express');
const { check } = require('express-validator');
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    verifyToken,
    checkRole(['ADMIN']),
    authLimiter,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        check('institutionId', 'Institution ID is required').not().isEmpty(),
        check('departmentId', 'Department ID is required').not().isEmpty(),
        check('role', 'Invalid Role').optional().isIn(['MANAGEMENT', 'HOD', 'HLC_MEMBER', 'STAFF', 'FACULTY', 'STUDENT', 'ADMIN'])
    ],
    validate,
    register
);

router.post(
    '/login',
    authLimiter,
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    validate,
    login
);

module.exports = router;
