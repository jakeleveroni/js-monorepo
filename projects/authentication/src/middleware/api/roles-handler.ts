import pool from "../../utils/db-pool";
import logger from "../../utils/logger";
import type { Role } from "../../types/db-types";
import type { RequestHandler } from "express";

const updateRoles: RequestHandler<
  unknown,
  unknown,
  { userId: string; role: Role }
> = async (req, res) => {
  const { userId, role } = req.body;

  if (role !== "admin" && role !== "manager" && role !== "user") {
    logger.error({ message: "Invalid role update request", role });
    res.status(400).json({ message: "Invalid request" });
    return;
  }

  if (!userId || !role) {
    logger.error({
      message: "invalid request missing userId, or role",
      userId,
      role,
    });
    res
      .status(400)
      .json({ message: "Unable to modify user role, invalid request" });
  }

  const client = await pool.connect();
  try {
    const rSet = await client.query(
      "update users set role = $1 where id = $2 returning id, username, role",
      [role, userId]
    );

    if (!rSet || rSet.rowCount === 0) {
      logger.error({
        message: "Update query resulted in 0 rows affected",
        userId,
        role,
      });
      res.status(404).json({ message: "Unable to upate user role." });
    }

    res.status(200).json({ data: rSet.rows[0] });
  } catch (err) {
    logger.error(err, "Role update query failed");
    res.status(400).json({ message: "Unable to upate user role." });
  } finally {
    client.release();
  }
};

export default {
  updateRoles,
};
