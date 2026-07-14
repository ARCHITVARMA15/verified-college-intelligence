import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export class DatabaseConnection {
  private readonly mongoUri: string;
  private connection: typeof mongoose | null = null;

  constructor(mongoUri: string) {
    this.mongoUri = mongoUri;
  }

  async connect(): Promise<typeof mongoose> {
    if (this.connection) {
      return this.connection;
    }

    mongoose.set('strictQuery', true);

    this.connection = await mongoose.connect(this.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info({ uri: this.redactUri(this.mongoUri) }, 'Connected to MongoDB');
    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (!this.connection) {
      return;
    }

    await mongoose.disconnect();
    this.connection = null;
    logger.info('Disconnected from MongoDB');
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
  }

  private redactUri(uri: string): string {
    try {
      const url = new URL(uri);
      if (url.password) {
        url.password = '***';
      }
      return url.toString();
    } catch {
      return '<invalid-uri>';
    }
  }
}

export const database = new DatabaseConnection(env.MONGODB_URI);
