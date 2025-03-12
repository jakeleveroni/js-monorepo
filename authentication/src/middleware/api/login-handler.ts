import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../../utils/db-pool";
import logger from "../../utils/logger";
import type { RequestHandler } from "express";
import type { UserRecord } from "../../types/db-types";
import type { JwtTokenContent } from "../../types/token-types";
import type { StringValue } from "ms";

const login: RequestHandler<
  unknown,
  unknown,
  { username?: string; password?: string }
> = async (req, res) => {
  const { username, password } = req.body;
  const client = await pool.connect();

  if (!username || !password) {
    res
      .status(400)
      .json({ message: "missing username or password.", code: ERRS.CGQL_0000 });
    return;
  }
  const rSet = await client.query<Pick<UserRecord, 'username' | 'password' | 'role'>>(
    "SELECT u.username, u.password, r.name as role FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE username = $1",
    [username],
  );

  if (rSet.rows.length != 1) {
    res.status(401).json({ message: "Not authorized", code: ERRS.CGQL_0001 });
    return;
  }

  const user = rSet.rows[0];
  const { password: hashedPassword, role } = user;

  const hashMatch = await bcrypt.compare(password, hashedPassword);
  if (!hashMatch) {
    res.status(401).json({ message: "Not authorized.", code: ERRS.CGQL_0002 });
    return;
  }

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    res.status(500).json({
      message: "Unable to authenticate at this time.",
      code: ERRS.CGQL_0003,
    });
    return;
  }

  const now = Date.now();
  // callback hell because jwt isnt es6 async
  // generate access token
  jwt.sign(
    // TODO fetch roles and encode here
    { username, role } satisfies JwtTokenContent,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE_TIME as StringValue ?? '1h',
      audience: process.env.JWT_AUDIENCE ?? 'manwithnoname',
      issuer: process.env.JWT_ISSUER ?? 'manwithnonametoo',
      jwtid: crypto.randomUUID(),
      subject: username
    },
    function (err, token) {
      if (err) {
        logger.error(err, "Token generation failed");
        res.status(500).json({
          message: "Unable to authenticate at this time.",
          code: ERRS.CGQL_0004,
        });
        client.release();
        return;
      }

      // generate refresh token
      jwt.sign(
        { username },
        process.env.JWT_REFRESH_SECRET!,
        { 
          expiresIn: process.env.JWT_EXPIRE_TIME as StringValue ?? '4h',
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER,
          jwtid: crypto.randomUUID(),
          subject: username
        },
        async function (refreshErr, refreshToken) {
          if (refreshErr) {
            logger.error(refreshErr, "Refresh token generation failed");
            res.status(500).json({
              message: "Unable to authenticate at this time.",
              code: ERRS.CGQL_0005,
            });
            client.release();
            return;
          }

          try {
            // store refresh token
            await client.query(
              "INSERT INTO refresh_tokens (token) VALUES ($1)",
              [refreshToken],
            );
          } catch (err) {
            logger.error(err, "Couldnt insert refresh token");
            res.send(500).json({
              message: "Unable to authenticate at this time.",
              code: ERRS.CGQL_0006,
            });

            client.release();
            return;
          } finally {
            client.release();
          }

          // set tokens into cookie headers
          res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          })
          res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });

          res.status(200).json({ message: "authorized" });
        },
      );
    },
  );
};

const refresh: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
    res.status(500).json({
      message: "Unable to authenticate at this time.",
      code: ERRS.CGQL_0007,
    });
    return;
  }

  if (!refreshToken) {
    res.status(403).json({ message: "Not authorized.", code: ERRS.CGQL_0008 });
    return;
  }

  const client = await pool.connect();
  const rSet = await client.query<{ token: string }>(
    "SELECT token FROM refresh_tokens where token = $1",
    [refreshToken],
  );

  if (rSet.rows.length === 0) {
    client.release();
    res.status(403).json({ message: "Not authorized.", code: ERRS.CGQL_0009 });
    return;
  }

  jwt.verify(
    rSet.rows[0].token,
    process.env.JWT_REFRESH_SECRET,
    async function (error, decoded) {
      if (
        error ||
        !decoded ||
        typeof decoded === "string" ||
        !decoded.username
      ) {
        try {
          await client.query("DELETE FROM refresh_tokens WHERE token = $1", [
            refreshToken,
          ]);
        } catch (err) {
          logger.error(err, "Unable to remove refresh token");
        } finally {
          client.release();
          res.status(error ? 500 : 401).json({
            message: "Unable to authenticate at this time.",
            code: ERRS.CGQL_0010,
          });
          return;
        }
      }

      try {
        const userRSet = await client.query<Pick<UserRecord, 'username' | 'role'>>(`
          SELECT u.username, r.name as role 
            FROM users u 
              LEFT JOIN roles r ON u.role_id = r.id 
            WHERE username = $1
        `, [decoded.username]);
  
        if (userRSet.rowCount !== 1) {
          client.release();
          logger.debug(userRSet, 'Decoded token user lookup failed')
          res.status(400).json({ message: "login failed" })
          return;
        }
        
        // sign new auth token
        jwt.sign(
          userRSet.rows[0],
          process.env.JWT_SECRET!,
          { algorithm: "RS256", expiresIn: "1h" },
          function (error, newToken) {
            if (error || !newToken) {
              logger.error(error, "Unable to generate new access token.");
              client.release();
              res.send(500).json({
                message: "Unable to authenticate at this time.",
                code: ERRS.CGQL_0011,
              });
              return;
            }
  
            // send user new auth token
            res.cookie('auth_token', newToken, {
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            })
            res.status(200).json({ message: "authenticated" });
            return;
          },
        );
      } catch (err) {
        // if refresh fails delete any remaining refresh token associated with failed exchange
        try {
          logger.error(err, 'Failed to refresh')
          await client.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken]);
        } catch (err) {
          logger.error(err, "Unable to remove refresh token");
        } finally {
          client.release();
          res.status(error ? 500 : 401).json({
            message: "Unable to authenticate at this time.",
          });
          return;
        }
      }
    },
  );
};

const logout: RequestHandler = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const authToken = req.cookies.authToken;

  if (!refreshToken || !authToken) {
    res.status(404).json({ message: 'No refresh token' });
    return;
  }

  const client = await pool.connect();
  await client.query(`DELELTE FROM refresh_tokens WHERE token = $1`, [refreshToken]);

  res.clearCookie('auth_token');
  res.clearCookie('refresh_token');
  res.status(200).json({ message: 'logged out' });
}

const ERRS = {
  CGQL_0000: "CGQL-0000",
  CGQL_0001: "CGQL-0001",
  CGQL_0002: "CGQL-0002",
  CGQL_0003: "CGQL-0003",
  CGQL_0004: "CGQL-0004",
  CGQL_0005: "CGQL-0005",
  CGQL_0006: "CGQL-0006",
  CGQL_0007: "CGQL-0007",
  CGQL_0008: "CGQL-0008",
  CGQL_0009: "CGQL-0009",
  CGQL_0010: "CGQL-0009",
  CGQL_0011: "CGQL-0009",
};

export default {
  login,
  logout,
  refresh,
};
