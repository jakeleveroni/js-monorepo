import express from "express";
import reqLogger from "pino-http";
import cookieParser from "cookie-parser";
import RegisterHandlers from "./src/middleware/api/register-handlers";
import LoginHandlers from "./src/middleware/api/login-handler";
import errorHandlerMiddleware from "./src/middleware/error-handler-middleware";
import loggingMiddleware from "./src/middleware/logging-middleware";
import authMiddleware from "./src/middleware/auth-middleware";
import logger from "./src/utils/logger";
import isDev from "./src/utils/is-dev";

const port = Number(process.env.SERVER_PORT ?? 3010);
const hostname = process.env.SERVER_HOSTNAME ?? "localhost";

const app = express();

// initial middleware
app.use(express.json());
app.use(reqLogger());
app.use(cookieParser());

// register insecure routes
app.post("/api/register", RegisterHandlers.registerUser);
app.post("/api/login", LoginHandlers.login);

// register secure routes after the auth middleware
app.use("/api/s/*", authMiddleware);

// dont expose this in production without need
if (isDev()) {
  app.get("/api/s/users", RegisterHandlers.getAllUsers);
}

// final middleware
app.use(errorHandlerMiddleware);

// only start listening if running as main process not loaded as a module (tests)
if (import.meta.main) {
  app.listen(port, hostname, () => {
    logger.info(`Listening on ${port}`);
  });
}

export default app;
