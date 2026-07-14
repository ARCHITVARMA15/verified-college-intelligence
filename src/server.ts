import { createApplication } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { database } from './config/database.js';

const app = createApplication();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'Server started');
});

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Received shutdown signal, closing server gracefully');

  server.close(async (err?: Error) => {
    if (err) {
      logger.error({ err }, 'Error while closing server');
    }

    try {
      await database.disconnect();
      logger.info('Graceful shutdown completed');
      process.exit(err ? 1 : 0);
    } catch (shutdownErr) {
      logger.error({ err: shutdownErr }, 'Error during graceful shutdown');
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

void database.connect();
