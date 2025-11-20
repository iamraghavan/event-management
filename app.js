const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { globalLimiter } = require('./middleware/rateLimiter');

// Route Imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const approvalRoutes = require('./routes/approvals');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const healthRoutes = require('./routes/health');

function createApp() {
    const app = express();

    // Trust Proxy for Vercel/Load Balancers
    app.set('trust proxy', 1);

    // Middleware
    app.use(require('compression')()); // Enable gzip compression
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(globalLimiter);

    // Root Handler (Fixes buffering on /)
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Event Management System API is running',
            docs: '/api/docs',
            health: '/api/health'
        });
    });

    // Swagger UI
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

    // Routes
    app.use('/api/health', healthRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/events', eventRoutes);
    app.use('/api/v1/approvals', approvalRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/reports', reportRoutes);

    // Central error handler
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(err && err.status ? err.status : 500).json({
            error: err && err.message ? err.message : 'Internal Server Error'
        });
    });

    return app;
}

module.exports = createApp;