import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import pool from "../../utils/db-pool";
import logger from "../../utils/logger";
import type { RequestHandler } from "express";
import type { UserRecord } from "../../types/db-types";

const login: RequestHandler<
  unknown,
  unknown,
  { username?: string; password?: string }
> = async (req, res, next) => {
  const { username, password } = req.body;
  const client = await pool.connect();

  if (!username || !password) {
    res
      .status(400)
      .json({ message: "missing username or password.", code: ERRS.CGQL_0000 });
    return;
  }
  const rSet = await client.query<UserRecord>(
    "SELECT * FROM users WHERE username = $1",
    [username],
  );

  if (rSet.rows.length != 1) {
    res.status(401).json({ message: "Not authorized", code: ERRS.CGQL_0001 });
    return;
  }

  const user = rSet.rows[0];
  const { password: hashedPassword, salt } = user;

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

  // callback hell because jwt isnt es6 async
  // generate access token
  jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { algorithm: "RS256", expiresIn: "1h" },
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
        { algorithm: "RS256", expiresIn: "4h" },
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

          // set refresh token as cookie header
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          // set token in response body
          res.status(200).json({ message: "Authorized", data: token });
        },
      );
    },
  );
};

const refresh: RequestHandler = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const client = await pool.connect();

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

  const rSet = await client.query<{ token: string }>(
    "SELECT token FROM refresh_tokens where token = $1",
    [refreshToken],
  );

  if (rSet.rows.length === 0) {
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
        }
        res.status(error ? 500 : 401).json({
          message: "Unable to authenticate at this time.",
          code: ERRS.CGQL_0010,
        });
        return;
      }

      jwt.sign(
        { username: decoded.username },
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

          res.status(200).json({ message: "Authenticated", data: newToken });
        },
      );
    },
  );
};

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
  refresh,
};
