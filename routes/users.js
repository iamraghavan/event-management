const express = require('express');
const { check } = require('express-validator');
const { listUsers, createUser, updateUser } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require ADMIN role
router.use(verifyToken);
router.use(checkRole(['ADMIN']));

router.get('/', listUsers);

router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Valid email is required').isEmail(),
        check('password', 'Password must be at least 6 chars').isLength({ min: 6 }),
        check('role', 'Role is required').isIn(['ADMIN', 'MANAGEMENT', 'HOD', 'HLC_MEMBER', 'FACULTY', 'STAFF', 'STUDENT'])
    ],
    validate,
    createUser
);

router.put(
    '/:id',
    [
        check('role').optional().isIn(['ADMIN', 'MANAGEMENT', 'HOD', 'HLC_MEMBER', 'FACULTY', 'STAFF', 'STUDENT'])
    ],
    validate,
    updateUser
);

module.exports = router;
