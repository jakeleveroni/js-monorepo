import type { Pool } from 'pg';

export async function clearDb(pool: Pool) {
  const client = await pool.connect();
  await client.query('DELETE FROM users');
  await client.query('DELETE FROM refresh_tokens');
}
