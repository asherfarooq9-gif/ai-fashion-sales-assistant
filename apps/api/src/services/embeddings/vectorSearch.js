import mongoose from 'mongoose';
import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { Product } from '../../models/index.js';
import { cosine } from '../../utils/cosine.js';

let atlasAvailable = null;

async function detectAtlas() {
  if (config.VECTOR_BACKEND === 'atlas') return true;
  if (config.VECTOR_BACKEND === 'cosine') return false;
  if (atlasAvailable !== null) return atlasAvailable;
  try {
    const indexes = await mongoose.connection.db
      .collection('products')
      .listSearchIndexes()
      .toArray();
    atlasAvailable = indexes.some((i) => i.name === config.ATLAS_VECTOR_INDEX);
  } catch {
    atlasAvailable = false;
  }
  return atlasAvailable;
}

async function atlasSearch(vector, filter, k) {
  return Product.aggregate([
    {
      $vectorSearch: {
        index: config.ATLAS_VECTOR_INDEX,
        path: 'embedding',
        queryVector: vector,
        numCandidates: Math.max(k * 10, 50),
        limit: k,
        filter,
      },
    },
    { $addFields: { similarity: { $meta: 'vectorSearchScore' } } },
    { $project: { embedding: 0 } },
  ]);
}

async function cosineSearch(vector, filter, k) {
  const candidates = await Product.find(filter).select('+embedding').limit(200).lean();
  return candidates
    .map((p) => ({ ...p, similarity: p.embedding ? cosine(vector, p.embedding) : 0 }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k)
    .map(({ embedding: _embedding, ...rest }) => rest);
}

/**
 * searchProducts — vector similarity search over products, filtered by a Mongo filter.
 * Uses Atlas $vectorSearch when the index exists, otherwise in-process cosine.
 */
export async function searchProducts(vector, filter = {}, k = 20) {
  if (!vector) return [];
  const useAtlas = await detectAtlas();
  try {
    return useAtlas
      ? await atlasSearch(vector, filter, k)
      : await cosineSearch(vector, filter, k);
  } catch (err) {
    logger.warn({ err, useAtlas }, 'vector search failed, falling back to cosine');
    return cosineSearch(vector, filter, k);
  }
}

export default searchProducts;
