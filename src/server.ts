// eslint-disable-next-line import/no-extraneous-dependencies
import "reflect-metadata";

import app from "./app";

import { createServer } from "http";

import logger from "@utils/logger";

/**
 * Get port from environment and store in Express.
 */

const port = +(process.env.PORT || "3000");

app.set("port", port);

/**
 * Create HTTP server.
 */

const server = createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: Error & { syscall: string; code: string }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      logger.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      logger.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  logger.info({ bind }, `🚀 App listening on http://localhost:${port}`);
}
