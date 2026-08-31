import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

let connected = false;

export async function connectDb(uri = config.MONGODB_URI) {
  if (connected) return mongoose.connection;
  mongoose.connection.on('error', (err) => logger.error({ err }, 'mongo connection error'));
  mongoose.connection.on('disconnected', () => {
    connected = false;
    logger.warn('mongo disconnected');
  });
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  connected = true;
  logger.info({ db: mongoose.connection.name }, 'mongo connected');
  return mongoose.connection;
}

export async function disconnectDb() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}

export function dbState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];
}
