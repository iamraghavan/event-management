const pool = require('./config/db');
const createApp = require('./app');

async function startServer(port = 3000) {
    // Validate DB connection before starting (fail fast)
    try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        console.log('MySQL pool: connection OK');
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

if (require.main === module) {
    startServer().catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
}

module.exports = { startServer };