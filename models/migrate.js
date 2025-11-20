const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
    console.log('Starting database migrations...');
    const connection = await pool.getConnection();
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon to get individual statements, filter out empty lines
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            await connection.query(statement);
        }
        console.log('Database migrations completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

module.exports = runMigrations;
