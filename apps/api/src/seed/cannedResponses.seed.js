export const cannedResponseSeed = [
  // ── FAQ-style deterministic answers ──
  {
    key: 'greeting_en',
    intent: 'greeting',
    language: 'en',
    triggerExamples: ['hi', 'hello', 'hey', 'good morning'],
    responseTemplate:
      "Welcome to FashionHub ❤️ Thank you for contacting us. How may I help you today?\n1. New Arrivals\n2. Women's Collection\n3. Men's Collection\n4. Order Tracking\n5. Delivery Information",
  },
  {
    key: 'greeting_ur',
    intent: 'greeting',
    language: 'ur',
    triggerExamples: ['assalam o alaikum', 'salam', 'assalamualaikum'],
    responseTemplate: 'FashionHub میں خوش آمدید ❤️ رابطہ کرنے کا شکریہ۔ میں آپ کی کیا مدد کر سکتا ہوں؟',
  },
  {
    key: 'delivery_charges_en',
    intent: 'delivery_inquiry',
    language: 'en',
    triggerExamples: ['delivery charges', 'delivery to lahore', 'delivery to islamabad', 'how many days', 'same day delivery', 'how long does delivery take'],
    responseTemplate:
      'Delivery is Rs 199 nationwide (free over Rs 5,000). Standard 2–4 working days; Lahore, Karachi and Islamabad are often next-day. Same-day delivery is not available yet.',
  },
  {
    key: 'return_policy_en',
    intent: 'return_request',
    language: 'en',
    triggerExamples: ['return policy', 'exchange available', 'can i exchange it', 'refund process'],
    responseTemplate:
      'Returns and exchanges are accepted within 7 days of delivery for unworn items with tags. Refunds are processed within 3–5 working days after we receive the item.',
  },
  {
    key: 'order_how_en',
    intent: 'order_placement',
    language: 'en',
    triggerExamples: ['how can i place an order', 'how do i order', 'how to place order'],
    responseTemplate:
      'Placing an order is easy — just tell me the item, size and colour you want, then share your delivery address. I’ll confirm everything before it ships (Cash on Delivery).',
  },
  {
    key: 'discount_en',
    intent: 'discount_inquiry',
    language: 'en',
    triggerExamples: ['any discount', 'sale available', 'cheapest products', 'products under rs 2000', 'products under rs 5000'],
    responseTemplate: 'We have items on sale right now — tell me your budget and I’ll show you the best picks.',
  },
  {
    key: 'damaged_en',
    intent: 'complaint',
    language: 'en',
    triggerExamples: ['damaged item received', 'wrong product', 'broken item'],
    responseTemplate:
      'I’m really sorry about that. Please share your Order ID and a photo of the issue — I’ve flagged this to our support team and they will make it right.',
  },
  {
    key: 'track_en',
    intent: 'delivery_inquiry',
    language: 'en',
    triggerExamples: ['track my order', 'where is my parcel', 'order status', 'my tracking id'],
    responseTemplate: 'Please share your Order ID (e.g. AFS-20260830-0001) and I’ll check the status for you.',
  },

  // ── Few-shot style examples for replyGen ──
  {
    key: 'fewshot_product_en',
    intent: 'product_search',
    language: 'en',
    isFewShot: true,
    triggerExamples: ['I need a black dress for Eid'],
    responseTemplate:
      'I found these options for you:\n• Black Embroidered Maxi — Rs 4,999\n• Black Chiffon Dress — Rs 5,499\nWould you like to see pictures? 📸',
  },
  {
    key: 'fewshot_interested_en',
    intent: 'order_placement',
    language: 'en',
    isFewShot: true,
    triggerExamples: ["I'll take the black maxi in medium"],
    responseTemplate:
      'Excellent choice! One Black Embroidered Maxi (M). Please share your delivery address and I’ll confirm your order.',
  },
  {
    key: 'fewshot_angry_en',
    intent: 'complaint',
    language: 'en',
    isFewShot: true,
    triggerExamples: ['my parcel arrived torn, this is unacceptable'],
    responseTemplate:
      'I’m so sorry — that’s not the experience we want for you. Please send your Order ID and a photo; I’m escalating this to our team now for a replacement or refund.',
  },
  {
    key: 'fewshot_product_ur',
    intent: 'product_search',
    language: 'ur',
    isFewShot: true,
    triggerExamples: ['mujhe kali dress chahiye'],
    responseTemplate:
      'یہ آپشنز مل گئے:\n• Black Embroidered Maxi — Rs 4,999\n• Black Chiffon Dress — Rs 5,499\nکیا تصاویر دیکھنا چاہیں گے؟ 📸',
  },
];

export default cannedResponseSeed;
