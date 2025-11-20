const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const emailService = require('../services/emailService');

const register = async (req, res, next) => {
    try {
        const { email, password, name, institutionId, departmentId, role } = req.body;

        // 1. Verify Institution
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId }
        });
        if (!institution) {
            return res.status(400).json({ error: 'Invalid Institution ID' });
        }

        // 2. Verify Department
        const department = await prisma.department.findUnique({
            where: { id: departmentId }
        });
        if (!department) {
            return res.status(400).json({ error: 'Invalid Department ID' });
        }

        // Ensure Department belongs to Institution
        if (department.institutionId !== institutionId) {
            return res.status(400).json({ error: 'Department does not belong to the specified Institution' });
        }

        // 3. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Create User
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                role: role || 'STAFF', // Default to STAFF
                institutionId,
                departmentId
            }
        });

        // 6. Send Welcome Email
        await emailService.sendWelcomeEmail(
            email,
            name,
            email,
            password, // Send plain text password
            institution.name,
            department.name
        );

        res.status(201).json({ message: 'User registered successfully and email sent', userId: user.id });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate Token with Tenant Context
        const payload = {
            id: user.id,
            role: user.role,
            institutionId: user.institutionId,
            departmentId: user.departmentId
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                institutionId: user.institutionId,
                departmentId: user.departmentId
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
