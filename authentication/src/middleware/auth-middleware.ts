import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import type { RequestHandler } from "express";

const authMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Not authorized." });
    return;
  }

  if (!process.env.JWT_SECRET) {
    logger.error("Misconfigured JWT_SECRET");
    res
      .status(500)
      .json({ message: "Unable to complete the request at this time." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      throw new Error("Decoded JWT was falsy");
    }

    res.locals.userToken = decoded;
    next();
  } catch (err) {
    logger.error(err, "JWT verification failed");
    res.status(401).json({ message: "Not authorized." });
  }
};

export default authMiddleware;
