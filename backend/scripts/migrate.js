import fs from 'fs';
import path from 'path';
import { Pool, Client } from 'pg';
import "dotenv/config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = process.env.DB_NAME;
const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

async function ensureDatabaseExists() {
  const client = new Client({ ...DB_CONFIG, database: 'postgres' });
  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`Database "${DB_NAME}" created successfully`);
  }
  await client.end();
}

async function runMigrations() {
  await ensureDatabaseExists();

  const pool = new Pool({ ...DB_CONFIG, database: DB_NAME });
  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO public;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const executedMigrations = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const executedVersions = new Set(executedMigrations.rows.map(row => row.version));

    const migrationsDir = path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Starting database migrations...\n');

    for (const file of files) {
      const version = file.split('_')[0];

      if (executedVersions.has(version)) {
        console.log(`Migration ${version} already executed`);
        continue;
      }

      console.log(`Executing migration ${version}: ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);

      console.log(`Migration ${version} completed\n`);
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