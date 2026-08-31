const STRINGS = {
  en: {
    menu: (name) =>
      `Welcome to FashionHub ❤️\n${name ? `Hi ${name}! ` : ''}Thank you for contacting us.\n\nHow may I help you today?\n1. New Arrivals\n2. Women's Collection\n3. Men's Collection\n4. Order Tracking\n5. Delivery Information`,
    noResults: 'I couldn’t find a match for that right now. Could you tell me the colour, budget, or occasion?',
    askOrderDetails: 'Great choice! Which item, size and colour would you like, and how many?',
    askAddress: 'Please share your full delivery address (house/street, area, city).',
    confirmPrompt: (summary, total) =>
      `Here is your order:\n${summary}\nTotal: Rs ${total} (Cash on Delivery)\n\nReply "confirm" to place it.`,
    orderPlaced: (orderId, tracking, total) =>
      `✅ Order confirmed!\nOrder ID: ${orderId}\nTracking: ${tracking}\nTotal: Rs ${total} (COD)\n\nWe’ll dispatch within 24 hours. Thank you for shopping with FashionHub!`,
    delivery:
      'Delivery: Rs 199 nationwide, free over Rs 5,000. Standard 2–4 working days; major cities (Lahore, Karachi, Islamabad) often next-day. Same-day is not available yet.',
    discounts: (lines) => `Here’s what’s on sale right now:\n${lines}`,
    trackFound: (orderId, status, tracking) =>
      `Order ${orderId} is currently "${status}". Tracking number: ${tracking || 'pending'}.`,
    trackNotFound: 'I couldn’t find that order. Please share your Order ID (e.g. AFS-20260830-0001).',
    complaint:
      'I’m really sorry about this. I’ve flagged it to our support team and someone will get back to you shortly. Could you share your Order ID and a photo of the issue?',
    returns:
      'Returns & exchanges are accepted within 7 days of delivery for unworn items with tags. Refunds are processed within 3–5 working days after we receive the item.',
    upsell: (lines) => `Customers who bought this also liked:\n${lines}\nWould you like to add any of these?`,
    seePictures: 'Would you like to see pictures? 📸',
    foundOptions: 'I found these options for you:',
  },
  ur: {
    menu: (name) =>
      `FashionHub میں خوش آمدید ❤️\n${name ? `${name}, ` : ''}رابطہ کرنے کا شکریہ۔\n\nآج میں آپ کی کیا مدد کر سکتا ہوں؟\n1. نئی آمد\n2. خواتین کلیکشن\n3. مردانہ کلیکشن\n4. آرڈر ٹریکنگ\n5. ڈیلیوری کی معلومات`,
    noResults: 'ابھی اس کے مطابق کچھ نہیں ملا۔ رنگ، بجٹ یا موقع بتا دیں؟',
    askOrderDetails: 'بہترین انتخاب! کون سا آئٹم، سائز اور رنگ چاہیے، اور کتنے؟',
    askAddress: 'براہ کرم اپنا مکمل ڈیلیوری پتہ بھیجیں (مکان/گلی، علاقہ، شہر)۔',
    confirmPrompt: (summary, total) =>
      `آپ کا آرڈر:\n${summary}\nکل: روپے ${total} (کیش آن ڈیلیوری)\n\nآرڈر کرنے کے لیے "confirm" لکھیں۔`,
    orderPlaced: (orderId, tracking, total) =>
      `✅ آرڈر کنفرم ہو گیا!\nآرڈر آئی ڈی: ${orderId}\nٹریکنگ: ${tracking}\nکل: روپے ${total} (COD)\n\n24 گھنٹوں میں روانہ کر دیا جائے گا۔ شکریہ!`,
    delivery:
      'ڈیلیوری: پورے ملک میں روپے 199، روپے 5,000 سے زائد پر مفت۔ 2 تا 4 کاروباری دن؛ بڑے شہروں میں اکثر اگلے دن۔ سیم ڈے دستیاب نہیں۔',
    discounts: (lines) => `ابھی سیل پر یہ موجود ہے:\n${lines}`,
    trackFound: (orderId, status, tracking) =>
      `آرڈر ${orderId} کی حالت: "${status}"۔ ٹریکنگ نمبر: ${tracking || 'زیرِ عمل'}۔`,
    trackNotFound: 'یہ آرڈر نہیں ملا۔ براہ کرم اپنی آرڈر آئی ڈی بھیجیں (مثلاً AFS-20260830-0001)۔',
    complaint:
      'اس کے لیے معذرت۔ میں نے سپورٹ ٹیم کو اطلاع دے دی ہے، جلد رابطہ کریں گے۔ اپنی آرڈر آئی ڈی اور مسئلے کی تصویر بھیج دیں؟',
    returns:
      'ڈیلیوری کے 7 دن کے اندر، ٹیگ سمیت غیر استعمال شدہ اشیاء پر ریٹرن/ایکسچینج قبول ہے۔ ریفنڈ 3 تا 5 دن میں۔',
    upsell: (lines) => `اسے خریدنے والوں نے یہ بھی پسند کیا:\n${lines}\nکیا ان میں سے کچھ شامل کریں؟`,
    seePictures: 'کیا تصاویر دیکھنا چاہیں گے؟ 📸',
    foundOptions: 'آپ کے لیے یہ آپشنز مل گئے:',
  },
};

export function t(lang, key, ...args) {
  const table = STRINGS[lang] || STRINGS.en;
  const value = table[key] ?? STRINGS.en[key];
  return typeof value === 'function' ? value(...args) : value;
}

export default t;
