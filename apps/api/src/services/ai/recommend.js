import { Product } from '../../models/index.js';
import { embedOne } from '../embeddings/embed.js';
import { searchProducts } from '../embeddings/vectorSearch.js';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * recommendProducts — blend semantic similarity, trending signal, customer
 * preference match and rating into a ranked shortlist.
 *
 * @param {object} args
 * @param {object} [args.customer]  Customer doc (for preferences / history)
 * @param {object} [args.entities]  { gender, category, color, budget }
 * @param {string} [args.queryText] Free-text query for semantic search
 * @param {number} [args.limit]
 */
export async function recommendProducts({ customer, entities = {}, queryText = '', limit = 3 }) {
  const prefs = customer?.preferences || {};
  const filter = Product.buildFilter({
    gender: entities.gender || prefs.gender,
    category: entities.category,
    maxPrice: entities.budget || prefs.budget,
    colors: [entities.color, prefs.favoriteColor],
  });

  let candidates;
  let maxSales = 1;

  if (queryText) {
    const vec = await embedOne(queryText);
    candidates = await searchProducts(vec, filter, Math.max(limit * 6, 12));
    if (!candidates.length) {
      candidates = await Product.find(filter).sort({ salesCount: -1 }).limit(limit * 4).lean();
    }
  } else {
    candidates = await Product.find(filter).sort({ salesCount: -1 }).limit(limit * 4).lean();
  }

  if (!candidates.length) {
    // Relax to gender-only, then to trending overall.
    const relaxed = Product.buildFilter({ gender: entities.gender || prefs.gender });
    candidates = await Product.find(relaxed).sort({ salesCount: -1 }).limit(limit * 4).lean();
  }

  maxSales = Math.max(1, ...candidates.map((c) => c.salesCount || 0));
  const boughtCategories = new Set(prefs.categories || []);

  const scored = candidates.map((p) => {
    const similarity = clamp01(p.similarity ?? 0.4);
    const trending = clamp01((p.salesCount || 0) / maxSales);
    const preferenceMatch =
      (prefs.favoriteColor && p.colors?.includes(String(prefs.favoriteColor).toLowerCase()) ? 0.5 : 0) +
      (boughtCategories.has(p.category) ? 0.5 : 0);
    const ratingNorm = clamp01((p.rating || 0) / 5);
    const score =
      0.55 * similarity + 0.2 * trending + 0.15 * clamp01(preferenceMatch) + 0.1 * ratingNorm;
    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

export default recommendProducts;
