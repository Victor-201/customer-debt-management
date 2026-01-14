import app from "./app.js";
import config from "./config/env.config.js";
import { connectDatabase, closeDatabase } from "./config/database.js";

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

    const shutdown = async () => {
      console.log("Shutting down...");
      await closeDatabase();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
