

// lib/db.js
import { Pool } from 'pg';

if (!global.__pgPool) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please set DATABASE_URL in env');
  }
  global.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const pool = global.__pgPool;

export async function query(text, params) {
  return pool.query(text, params);
}
