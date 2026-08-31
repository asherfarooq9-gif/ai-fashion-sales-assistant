const URDU_SCRIPT = /[؀-ۿ]/;
const ROMAN_URDU = [
  'kiya', 'kya', 'hai', 'hain', 'nahi', 'nahin', 'chahiye', 'chahie', 'kitne', 'kitna',
  'kaise', 'kaisa', 'mujhe', 'mujhy', 'aap', 'ap', 'kar', 'karo', 'karein', 'dein', 'de',
  'salam', 'assalam', 'shukria', 'shukriya', 'acha', 'theek', 'wala', 'wali', 'raha', 'rahi',
];

/** Best-effort language detection: 'ur' for Urdu script or romanized Urdu, else 'en'. */
export function detectLang(text = '', fallback = 'en') {
  if (!text) return fallback;
  if (URDU_SCRIPT.test(text)) return 'ur';
  const tokens = text.toLowerCase().match(/[a-z]+/g) || [];
  if (!tokens.length) return fallback;
  const hits = tokens.filter((t) => ROMAN_URDU.includes(t)).length;
  return hits >= 2 || hits / tokens.length > 0.25 ? 'ur' : 'en';
}

export default detectLang;
