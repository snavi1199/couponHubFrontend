// Lightweight emoji/icon fallback per known brand slug, since our seed brands don't have
// hosted logo URLs. Keyed by slug (see backend V2/V3/V4 migrations for the seed list).
// Falls back to a generic shopping-bag glyph for anything not in this map.
export const BRAND_ICONS: Record<string, string> = {
  amazon: '📦',
  flipkart: '🛍️',
  lenskart: '👓',
  bookmyshow: '🎬',
  myntra: '👗',
  ajio: '🧥',
  nykaa: '💄',
  swiggy: '🍔',
  zomato: '🍽️',
  uber: '🚗',
  rapido: '🏍️',
  netflix: '🎞️',
  spotify: '🎧',
  'prime-video': '📺',
  hotstar: '⭐',
  adobe: '🎨',
  steam: '🎮',
  microsoft: '💻',
  apple: '🍎',
  samsung: '📱',
  'pvr-cinemas': '🎬',
  inox: '🎬',
  'bcci-ipl': '🏏',
  'district-by-zomato': '🎟️',
  bigbasket: '🧺',
  blinkit: '⚡',
  zepto: '⚡',
  ola: '🚕',
  makemytrip: '✈️',
  dominos: '🍕',
  croma: '🔌',
  others: '🏷️',
};

export function brandIcon(slug: string): string {
  return BRAND_ICONS[slug] ?? '🏷️';
}
