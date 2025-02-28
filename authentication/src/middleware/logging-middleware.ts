import type { RequestHandler } from "express";

const loggingMiddleware: RequestHandler = async (req, res, next) => {
  req.log.info("Reqest");
  next();
};

export default loggingMiddleware;
