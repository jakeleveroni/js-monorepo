import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import pool from '../utils/db-pool';
import logger from '../utils/logger';

const authMiddleware: RequestHandler = async (req, res, next) => {
  const token: string | undefined = req.cookies.auth_token;
  const refreshToken: string | undefined = req.cookies.refresh_token;

  if (!token || !refreshToken) {
    res.status(401).json({ message: 'Not authorized.' });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    logger.error('Misconfigured JWT_SECRET or JWT_REFRESH_SECRET');
    res.status(500).json({ message: 'Unable to complete the request at this time.' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err && err.name === 'TokenExpiredError') {
      // if auth token is expired we need to check the refresh token
      // biome-ignore lint/style/noNonNullAssertion: already handled in outter scope
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, async (rtErr, rtDecoded) => {
        if (rtErr) {
          // clear user session if refresh token is invalid as well
          const client = await pool.connect();
          await client.query('DELETE FROM refresh_token WHERE token = $1', [refreshToken]);

          res.clearCookie('auth_token');
          res.clearCookie('refresh_token');

          client.release();
          logger.error(rtErr, 'Unable to validate refresh_token');
          return next(new Error(JSON.stringify(rtErr)));
        }

        // refresh token is valid
        // TODO: handle token refresh here
        next();
        return;
      });
    } else if (err) {
      logger.error(err, 'Unable to validate auth_token');
      return next(new Error(JSON.stringify(err)));
    }

    // auth token is valid
    res.locals.username = (decoded as JwtPayload).username;
    next();
  });
};

export default authMiddleware;
