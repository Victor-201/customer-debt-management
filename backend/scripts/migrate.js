const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const executedMigrations = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const executedVersions = new Set(executedMigrations.rows.map(row => row.version));

    // Get migration files
    const migrationsDir = path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Starting database migrations...\n');

    for (const file of files) {
      const version = file.split('_')[0];

      if (executedVersions.has(version)) {
        console.log(`✓ Migration ${version} already executed`);
        continue;
      }

      console.log(`Executing migration ${version}: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute the entire SQL file as one query
      await client.query(sql);

      // Record migration as executed
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);

      console.log(`✓ Migration ${version} completed\n`);
    }

    console.log('All migrations completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();