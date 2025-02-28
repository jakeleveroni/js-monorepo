import pino from "pino";

const logger = pino({
  redact: {
    paths: ["req.headers"],
  },
});

export default logger;
