const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token.' });
    }
};

// Role-Based Access Control (RBAC)
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};

// API Key Validation
const validateApiKey = async (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (!apiKey) {
        // If no API key, proceed if it's a public route or handled by JWT
        // But if this middleware is explicitly used, we expect a key.
        // For mixed usage, we might want to make it optional or check route config.
        // Here we enforce it if the middleware is applied.
        return res.status(401).json({ error: 'API Key missing.' });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM api_keys WHERE key_value = ? AND is_active = TRUE', [apiKey]);
        if (rows.length === 0) {
            return res.status(403).json({ error: 'Invalid API Key.' });
        }
        next();
    } catch (error) {
        console.error('API Key validation error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { verifyToken, checkRole, validateApiKey };
