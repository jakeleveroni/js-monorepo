import logger from "../../utils/logger";
import { saltAndHashPassword } from "../../utils/hash-password";
import pool from "../../utils/db-pool";
import isDev from "../../utils/is-dev";
import type { RequestHandler } from "express";

const registerUser: RequestHandler<
  unknown,
  unknown,
  { username?: string; password?: string }
> = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "missing username and password" });
    return;
  }
  try {
    const { salt, hashed } = await saltAndHashPassword(username, password);
    const client = await pool.connect();

    const rSet = await client.query(
      "INSERT INTO USERS (username, password, salt, role_id) VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'user')) RETURNING id",
      [username, hashed, salt]
    );

    if (rSet.rows.length > 0) {
      res.status(200).json({ message: "registered" });
    } else {
      res.status(500).json({ message: "could not complete registration." });
    }
  } catch (err) {
    logger.error(err, "Failed to register user");
    res.status(500).json({ message: "failed to register user." });
  }
};

function validateUser() {}

// only register this in development dont register as a production route
const getAllUsers: RequestHandler = async (req, res, next) => {
  if (!isDev()) {
    logger.error(
      "[CRITICAL] NON PRODUCTION QUERY HIT IN PRODUCTION ENVIRONMENT"
    );
    throw new Error("This should not happen");
  }

  try {
    const client = await pool.connect();
    const rSet = await client.query("SELECT * FROM users");
    res.status(200).json(rSet.rows);
  } catch (err) {
    logger.error(err, "Failed to register user");
    res.status(500).json({ message: "failed to register user." });
  }
};

export default {
  registerUser,
  validateUser,
  getAllUsers,
};
