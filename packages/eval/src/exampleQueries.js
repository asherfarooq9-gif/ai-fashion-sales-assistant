/**
 * Spec-derived NL query corpus. Each entry: { text, lang, expectIntent }.
 * Used by intent unit tests and to seed few-shot CannedResponse examples.
 */
export const exampleQueries = [
  // ── Greeting ──────────────────────────────
  { text: 'Hi', lang: 'en', expectIntent: 'greeting' },
  { text: 'Hello', lang: 'en', expectIntent: 'greeting' },
  { text: 'Assalam o Alaikum', lang: 'ur', expectIntent: 'greeting' },
  { text: 'hey there', lang: 'en', expectIntent: 'greeting' },

  // ── Product search: product questions ─────
  { text: 'Show black dresses', lang: 'en', expectIntent: 'product_search' },
  { text: 'Summer collection', lang: 'en', expectIntent: 'product_search' },
  { text: 'Winter collection', lang: 'en', expectIntent: 'product_search' },
  { text: 'Formal dresses', lang: 'en', expectIntent: 'product_search' },
  { text: 'Casual wear', lang: 'en', expectIntent: 'product_search' },
  { text: "Men's shirts", lang: 'en', expectIntent: 'product_search' },
  { text: "Women's handbags", lang: 'en', expectIntent: 'product_search' },
  { text: 'Shoes under Rs 3000', lang: 'en', expectIntent: 'product_search' },
  { text: 'Trending outfits', lang: 'en', expectIntent: 'product_search' },
  { text: 'Best selling products', lang: 'en', expectIntent: 'product_search' },
  { text: 'I need a black dress for Eid', lang: 'en', expectIntent: 'product_search' },
  { text: 'mujhe kali dress chahiye', lang: 'ur', expectIntent: 'product_search' },

  // ── Product search: size-related ─────────
  { text: 'Do you have medium size?', lang: 'en', expectIntent: 'product_search' },
  { text: 'Is XL available?', lang: 'en', expectIntent: 'product_search' },
  { text: 'Which size should I buy?', lang: 'en', expectIntent: 'product_search' },
  { text: 'Show size chart', lang: 'en', expectIntent: 'product_search' },

  // ── Product search: color-related ────────
  { text: 'Available colors?', lang: 'en', expectIntent: 'product_search' },
  { text: 'Do you have black?', lang: 'en', expectIntent: 'product_search' },
  { text: 'Show red dresses', lang: 'en', expectIntent: 'product_search' },
  { text: 'Beige color available?', lang: 'en', expectIntent: 'product_search' },

  // ── Discount inquiry: price / sale ──────
  { text: 'Price?', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'Any discount?', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'Sale available?', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'Cheapest products', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'Products under Rs 2000', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'Products under Rs 5000', lang: 'en', expectIntent: 'discount_inquiry' },
  { text: 'koi sale chal rahi hai?', lang: 'ur', expectIntent: 'discount_inquiry' },

  // ── Delivery inquiry ────────────────────
  { text: 'Delivery charges?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'Same day delivery?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'Delivery to Islamabad?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'Delivery to Lahore?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'How many days?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'How long does delivery take?', lang: 'en', expectIntent: 'delivery_inquiry' },

  // ── Return request: exchange & return ───
  { text: 'Return policy?', lang: 'en', expectIntent: 'return_request' },
  { text: 'Exchange available?', lang: 'en', expectIntent: 'return_request' },
  { text: 'Can I exchange it?', lang: 'en', expectIntent: 'return_request' },
  { text: 'Refund process?', lang: 'en', expectIntent: 'return_request' },

  // ── Complaint ───────────────────────────
  { text: 'Damaged item received', lang: 'en', expectIntent: 'complaint' },
  { text: 'I got the wrong product and I am very angry', lang: 'en', expectIntent: 'complaint' },
  { text: 'my parcel arrived torn, this is unacceptable', lang: 'en', expectIntent: 'complaint' },

  // ── Delivery inquiry: order tracking ────
  { text: 'Track my order', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'Where is my parcel?', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'Order status', lang: 'en', expectIntent: 'delivery_inquiry' },
  { text: 'My tracking ID is TRK9231', lang: 'en', expectIntent: 'delivery_inquiry' },

  // ── Order placement ─────────────────────
  { text: 'How can I place an order?', lang: 'en', expectIntent: 'order_placement' },
  { text: 'I want to order the Black Embroidered Maxi in medium', lang: 'en', expectIntent: 'order_placement' },
  { text: "I'll take 2 of the navy kurta, size L", lang: 'en', expectIntent: 'order_placement' },
  { text: 'Please confirm my order', lang: 'en', expectIntent: 'order_placement' },
  { text: 'yeh wala order kar dein', lang: 'ur', expectIntent: 'order_placement' },

  // ── Availability (product search) ───────
  { text: 'Is this available?', lang: 'en', expectIntent: 'product_search' },
  { text: 'What sizes do you have?', lang: 'en', expectIntent: 'product_search' },
  { text: 'What colors are available?', lang: 'en', expectIntent: 'product_search' },
];

export default exampleQueries;
