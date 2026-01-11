import { Pool } from 'pg';
import config from './env.config.js';

let pool = null;

async function createPool() {
  if (!pool) {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.username,
      password: String(config.database.password),
      database: config.database.database,
      max: 20, // Maximum number of clients
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(1);
    });
  }

  return pool;
}

async function getConnection() {
  const poolInstance = await createPool();
  return poolInstance.connect();
}

async function execute(query, params = []) {
  const client = await getConnection();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { createPool, getConnection, execute, closePool };
