import { Pool } from 'pg';
import logger from './logger';

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOSTNAME,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

pool.on('error', (err, client) => {
  logger.error(err, 'Unexpected error on idle client', err);
  client.release();
});

export default pool;
