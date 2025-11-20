const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const pool = require('./config/db');
const runMigrations = require('./models/migrate');
const { globalLimiter } = require('./middleware/rateLimiter');

// Route Imports
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const approvalRoutes = require('./routes/approvals');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const healthRoutes = require('./routes/health');

async function startServer(port = 5000) {
    // Validate DB connection before starting (fail fast)
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        console.log('MySQL pool: connection OK');

        // Run Migrations
        // await runMigrations();
        console.log('Legacy migrations skipped (using Prisma)');
    } catch (err) {
        console.error('MySQL connection failed:', err && err.message ? err.message : err);
        throw err;
    }

    const app = createApp();

    const server = app.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
        console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
    });

    return server;
}

function createApp() {
    const app = express();

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));
    app.use(globalLimiter);

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

if (require.main === module) {
    startServer().catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}

module.exports = { startServer, createApp };