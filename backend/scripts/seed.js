import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import "dotenv/config";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runSeeds() {
  const client = await pool.connect();

  try {
    await client.query(`SET search_path TO public;`);

    console.log('Starting database seeding...\n');

    const seedsDir = path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'seeders');
    const files = fs.readdirSync(seedsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Executing seed file: ${file}`);

      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);

      for (const command of commands) {
        if (command.trim()) {
          await client.query(command);
        }
      }

      console.log(`Seed file ${file} completed\n`);
    }

    console.log('All seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds();
