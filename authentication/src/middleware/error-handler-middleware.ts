import type { ErrorRequestHandler } from "express";
import logger from "../utils/logger";

const errorHandlerMiddleware: ErrorRequestHandler = async (
  err,
  req,
  res,
  next,
) => {
  logger.error(err, "Handling failed request");

  if (req.xhr) {
    res.status(500).send({ error: "Something failed!" });
  } else {
    next(err);
  }
};

export default errorHandlerMiddleware;
