import app from './app.js';
import config from './config/env.config.js';
import * as database from './config/database.js';

async function startServer() {
  try {
    await database.createPool();
    console.log('Database connected successfully');

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await database.closePool();
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await database.closePool();
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
