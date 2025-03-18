import logger from '../utils/logger';
import pool from '../utils/db-pool';
import type { RequestHandler } from 'express';

const permissionsMiddleware: RequestHandler = async (req, res, next) => {
  const { username } = res.locals;
  if (!username) {
    res.status(401).json({ message: 'missing tokens' });
    return;
  }

  const client = await pool.connect();

  try {
    const rSet = await client.query<{ name: string }>(
      `
            SELECT p.name 
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                JOIN role_permissions rp ON r.id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
            WHERE u.id = $1
        `,
      [username],
    );

    res.locals.permissions = rSet.rows.map((r) => r.name);
    client.release();
    next();
  } catch (err) {
    logger.error({ message: 'Unable to retrieve user roles', err });
    res.status(500).json({ message: 'Unable to retrieve user roles' });
    return;
  }
};

export default permissionsMiddleware;
