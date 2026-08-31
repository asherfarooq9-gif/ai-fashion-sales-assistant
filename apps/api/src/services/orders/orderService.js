import { Product, Customer, Order } from '../../models/index.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * createOrder — resolve product refs, check + decrement stock, compute totals,
 * persist the order, link it to the customer, and bump product salesCount.
 *
 * @param {object} input
 * @param {string} input.customerId
 * @param {Array<{productId:string, quantity?:number, size?:string, color?:string}>} input.items
 * @param {string} [input.channel]
 * @param {object} [input.shippingAddress]
 * @param {string} [input.notes]
 */
export async function createOrder({ customerId, items, channel = 'simulator', shippingAddress, notes }) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw ApiError.notFound('Customer not found');
  if (!items?.length) throw ApiError.badRequest('Order needs at least one item');

  const resolved = [];
  let discountTotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw ApiError.badRequest(`Product ${item.productId} not found`);
    const quantity = item.quantity || 1;
    if (product.stock < quantity) {
      throw ApiError.conflict(`Not enough stock for ${product.name}`, {
        productId: String(product._id),
        available: product.stock,
      });
    }
    const unit = product.discountedPrice;
    discountTotal += (product.price - unit) * quantity;
    resolved.push({
      productId: product._id,
      name: product.name,
      price: unit,
      quantity,
      size: item.size,
      color: item.color,
    });
    product.stock -= quantity;
    product.salesCount += quantity;
    await product.save();
  }

  const order = await Order.create({
    customerId: customer._id,
    items: resolved,
    discountTotal,
    channel,
    shippingAddress: shippingAddress || customer.address,
    notes,
    trackingNumber: Order.genTracking(),
    status: 'confirmed',
  });

  customer.orderHistory.push(order._id);
  await customer.save();

  return order;
}

export default createOrder;
