import { pathToFileURL } from 'node:url';
import { connectDb, disconnectDb } from '../config/db.js';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import {
  Product,
  Customer,
  Order,
  CannedResponse,
  AdminUser,
} from '../models/index.js';
import { embedTexts } from '../services/embeddings/embed.js';
import { productSeed } from './products.seed.js';
import { customerSeed } from './customers.seed.js';
import { cannedResponseSeed } from './cannedResponses.seed.js';

const FRESH = process.argv.includes('--fresh');

export async function runSeed() {
  await connectDb();

  if (FRESH) {
    await Promise.all([
      Product.deleteMany({}),
      Customer.deleteMany({}),
      Order.deleteMany({}),
      CannedResponse.deleteMany({}),
      AdminUser.deleteMany({}),
    ]);
    logger.info('cleared existing collections (--fresh)');
  }

  // ── Products (+ embeddings) ──
  await Product.deleteMany({});
  const vectors = await embedTexts(
    productSeed.map((p) => `${p.name}. ${p.description}. ${p.tags.join(' ')}`)
  );
  const products = await Product.insertMany(
    productSeed.map((p, i) => ({ ...p, embedding: vectors[i] }))
  );
  logger.info({ count: products.length }, 'seeded products');
  const byName = new Map(products.map((p) => [p.name, p]));

  // ── Customers (+ their orders) ──
  await Customer.deleteMany({});
  await Order.deleteMany({});
  for (const c of customerSeed) {
    const { orders = [], ...customerData } = c;
    const customer = await Customer.create(customerData);
    for (const o of orders) {
      const product = byName.get(o.productName);
      if (!product) continue;
      const unit = product.discountedPrice ?? product.price;
      const order = await Order.create({
        customerId: customer._id,
        items: [
          { productId: product._id, name: product.name, price: unit, quantity: o.quantity, size: o.size },
        ],
        status: 'delivered',
        paymentStatus: 'paid',
        channel: customer.whatsappId ? 'whatsapp' : 'instagram',
        trackingNumber: Order.genTracking(),
        shippingAddress: customer.address,
      });
      customer.orderHistory.push(order._id);
    }
    await customer.save();
  }
  logger.info({ count: customerSeed.length }, 'seeded customers');

  // ── Canned responses ──
  await CannedResponse.deleteMany({});
  await CannedResponse.insertMany(cannedResponseSeed);
  logger.info({ count: cannedResponseSeed.length }, 'seeded canned responses');

  // ── Admin ──
  await AdminUser.deleteMany({ email: config.ADMIN_EMAIL.toLowerCase() });
  await AdminUser.create({
    email: config.ADMIN_EMAIL.toLowerCase(),
    passwordHash: await AdminUser.hashPassword(config.ADMIN_PASSWORD),
    name: 'Store Admin',
  });
  logger.info({ email: config.ADMIN_EMAIL }, 'seeded admin user');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  runSeed()
    .then(() => disconnectDb())
    .then(() => {
      logger.info('seed complete');
      process.exit(0);
    })
    .catch(async (err) => {
      logger.error({ err }, 'seed failed');
      await disconnectDb().catch(() => {});
      process.exit(1);
    });
}

export default runSeed;
