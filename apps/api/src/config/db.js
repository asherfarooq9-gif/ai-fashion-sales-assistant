import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

let connected = false;
// Cache the in-flight connection so concurrent serverless invocations reuse one connect.
let connectPromise = null;

export async function connectDb(uri = config.MONGODB_URI) {
  if (connected) return mongoose.connection;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    mongoose.connection.on('error', (err) => logger.error({ err }, 'mongo connection error'));
    mongoose.connection.on('disconnected', () => {
      connected = false;
      logger.warn('mongo disconnected');
    });
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    connected = true;
    logger.info({ db: mongoose.connection.name }, 'mongo connected');
    return mongoose.connection;
  })().catch((err) => {
    connectPromise = null;
    throw err;
  });

  return connectPromise;
}

export async function disconnectDb() {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
  connectPromise = null;
}

export function dbState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][
    mongoose.connection.readyState
  ];
}
