const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const listUsers = async (req, res, next) => {
    try {
        // Admins can see all users, optionally filter by institution
        const where = {};
        if (req.user.institutionId) {
            where.institutionId = req.user.institutionId;
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                institution: { select: { name: true } },
                department: { select: { name: true } },
                isActive: true,
                lastLoginAt: true
            }
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, departmentId } = req.body;
        const institutionId = req.user.institutionId;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role,
                institutionId,
                departmentId
            }
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, departmentId, isActive } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                role,
                departmentId,
                isActive
            }
        });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        next(error);
    }
};

module.exports = { listUsers, createUser, updateUser };
