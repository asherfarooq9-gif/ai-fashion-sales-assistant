import { Product, CannedResponse, AdminUser } from '../../src/models/index.js';
import { embedTexts } from '../../src/services/embeddings/embed.js';
import { productSeed } from '../../src/seed/products.seed.js';
import { cannedResponseSeed } from '../../src/seed/cannedResponses.seed.js';

export async function seedCatalog() {
  const vectors = await embedTexts(
    productSeed.map((p) => `${p.name}. ${p.description}. ${p.tags.join(' ')}`)
  );
  const products = await Product.insertMany(
    productSeed.map((p, i) => ({ ...p, embedding: vectors[i] }))
  );
  await CannedResponse.insertMany(cannedResponseSeed);
  return products;
}

export async function seedAdmin(email = 'admin@brand.test', password = 'secret123') {
  return AdminUser.create({
    email,
    passwordHash: await AdminUser.hashPassword(password),
    name: 'Test Admin',
  });
}
