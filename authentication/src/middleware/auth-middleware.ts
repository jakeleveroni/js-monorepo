import jwt, { type Jwt, type Secret, type VerifyCallback, type VerifyErrors } from "jsonwebtoken";
import logger from "../utils/logger";
import type { RequestHandler } from "express";
import pool from "../utils/db-pool";

const authMiddleware: RequestHandler = async (req, res, next) => {
  const token: string | undefined = req.cookies.auth_token;
  const refreshToken: string | undefined = req.cookies.refresh_token;
  if (!token || !refreshToken) {
    res.status(401).json({ message: "Not authorized." });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    logger.error("Misconfigured JWT_SECRET or JWT_REFRESH_SECRET");
    res
      .status(500)
      .json({ message: "Unable to complete the request at this time." });
    return;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err && err.name === 'TokenExpiredError') {
        // handle redresh token introspection & exchange
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, async (err_rt, decoded_rt) => {
          if (err) {
            if (err.name === 'TokenExpiredError') {
              const client = await pool.connect();
              await client.query('DELETE FROM refresh_token WHERE token = $1', [refreshToken]);
              res.clearCookie('auth_token');
              res.clearCookie('refresh_token');
              res.status(401).send({ message: 'not authorized' })
              return;
            }
            throw new Error('Session expired');
          }

          // TODO: handle token refresh here
          next();
        });
      }

      // no problem with the token we can move on
      next();
    });


  } catch (err) {
    logger.error(err, "JWT verification failed");
    res.status(401).json({ message: "Not authorized." });
  }
};

export default authMiddleware;
