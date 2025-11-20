// index.js
const dotenv = require("dotenv");
dotenv.config();

const { startServer } = require("./server");

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

(async function main() {
  let server;
  try {
    console.log("Booting application...");
    server = await startServer(PORT);
    console.log(`Application started (PID: ${process.pid})`);
  } catch (err) {
    console.error("Failed to start application:", err && err.message ? err.message : err);
    process.exit(1);
  }

  // Graceful shutdown — index.js level
  const shutdown = (signal) => {
    console.info(`\n${signal} received — closing HTTP server...`);
    if (!server) {
      process.exit(0);
    }

    server.close((err) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }
      console.info("HTTP server closed.");

      // attempt to close DB pool if available
      try {
        const pool = require("./config/db");
        if (pool && typeof pool.end === "function") {
          pool.end().then(() => {
            console.info("MySQL pool closed.");
            process.exit(0);
          }).catch((e) => {
            console.warn("Error closing MySQL pool:", e);
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      } catch (e) {
        // if closing pool fails, still exit
        console.warn("Error while closing DB pool:", e);
        process.exit(0);
      }
    });

    // Force exit after timeout
    setTimeout(() => {
      console.warn("Forcing shutdown...");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
})();
