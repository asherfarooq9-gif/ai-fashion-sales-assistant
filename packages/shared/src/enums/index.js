export const INTENTS = Object.freeze([
  'greeting',
  'product_search',
  'order_placement',
  'delivery_inquiry',
  'complaint',
  'return_request',
  'discount_inquiry',
]);

export const SENTIMENTS = Object.freeze([
  'happy',
  'angry',
  'frustrated',
  'interested_buyer',
  'neutral',
]);

export const CHANNELS = Object.freeze(['instagram', 'whatsapp', 'simulator']);

export const CONVERSATION_STATES = Object.freeze([
  'NEW',
  'GREETED',
  'BROWSING',
  'COLLECTING_ORDER',
  'AWAITING_ADDRESS',
  'AWAITING_CONFIRMATION',
  'ORDER_PLACED',
  'SUPPORT',
]);

export const ORDER_STATUSES = Object.freeze([
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]);

export const PAYMENT_STATUSES = Object.freeze([
  'unpaid',
  'paid',
  'cod_pending',
  'refunded',
]);

export const PRODUCT_CATEGORIES = Object.freeze([
  'dresses',
  'kurtas',
  'shalwar_kameez',
  'lawn_suits',
  'tops',
  'bottoms',
  'outerwear',
  'footwear',
  'accessories',
]);

export const GENDERS = Object.freeze(['women', 'men', 'unisex', 'kids']);

export const LANGUAGES = Object.freeze(['en', 'ur']);

export const CONVERSATION_ACTIONS = Object.freeze([
  'send_menu',
  'recommend',
  'ask_order_details',
  'ask_address',
  'confirm_order',
  'place_order',
  'track_order',
  'handle_complaint',
  'handle_return',
  'show_discounts',
  'freeform',
]);
