import express from "express";
import reqLogger from "pino-http";
import cookieParser from "cookie-parser";
import RegisterHandlers from "./src/middleware/api/register-handlers";
import LoginHandlers from "./src/middleware/api/login-handler";
import RoleHandlers from "./src/middleware/api/roles-handler";
import errorHandlerMiddleware from "./src/middleware/error-handler-middleware";
import authMiddleware from "./src/middleware/auth-middleware";
import permissionsMiddleware from "./src/middleware/permissions-middleware";
import logger from "./src/utils/logger";
import isDev from "./src/utils/is-dev";
import { replayMitigationMiddleware } from "./src/middleware/replay-mitigation-middleware";

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

// register secure middleware
app.use("/api/s/*", replayMitigationMiddleware);
app.use("/api/s/*", authMiddleware);
app.use("/api/s/*", permissionsMiddleware);

// register secure api routes
app.post("/api/s/logout", LoginHandlers.logout);
app.post("/api/s/roles", RoleHandlers.updateRoles);

// dont expose this in production without need
if (isDev()) {
  app.get("/api/s/users", RegisterHandlers.getAllUsers);
}

// final middleware
app.use("*", (_, res) => {
  // not found json response catch middleware
  res.status(404).json({ message: "not found" });
});
app.use(errorHandlerMiddleware);

// only start listening if running as main process not loaded as a module (tests)
if (import.meta.main) {
  app.listen(port, hostname, () => {
    logger.info(`Listening on ${port}`);
  });
}

export default app;
