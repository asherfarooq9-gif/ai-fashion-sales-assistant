import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const repoRoot = path.resolve(fileURLToPath(import.meta.url), '../../../../..');
const cacheDir = path.join(repoRoot, '.cache');
const dbPath = path.join(cacheDir, 'mongo-tmp', `db-${process.pid}`);

// C: is out of space on this machine; keep every mongod artifact on the repo drive.
process.env.MONGOMS_DOWNLOAD_DIR ??= path.join(cacheDir, 'mongodb-binaries');

let mongod;

export async function startMemoryDb() {
  fs.mkdirSync(dbPath, { recursive: true });
  mongod = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
  await mongoose.connect(mongod.getUri());
  return mongoose.connection;
}

export async function stopMemoryDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  fs.rmSync(dbPath, { recursive: true, force: true });
}

export async function clearDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}
