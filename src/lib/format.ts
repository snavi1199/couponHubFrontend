export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return '—';
  // Always show paise (2 decimals) — rounding each amount independently to whole rupees made
  // breakdowns look wrong (e.g. "₹49 − ₹2 fee = ₹47" when the real numbers are 2.45/46.55).
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [[60, 's'], [60, 'm'], [24, 'h'], [30, 'd'], [12, 'mo'], [Infinity, 'y']];
  let value = seconds;
  let label = 's';
  for (const [size, unit] of units) {
    if (value < size) { label = unit; break; }
    value = Math.floor(value / size);
    label = unit;
  }
  return `${value}${label} ago`;
}

export const COUPON_TYPE_LABELS: Record<string, string> = {
  FREE: 'Free', PAID: 'Paid', HALF_PAID: 'Half Paid', NEGOTIABLE: 'Negotiable',
  AUCTION: 'Auction', LIMITED_TIME: 'Limited Time', REFERRAL: 'Referral',
  CASHBACK: 'Cashback', GIFT_CARD: 'Gift Card', VOUCHER: 'Voucher',
  PROMO_CODE: 'Promo Code', MEMBERSHIP: 'Membership', PREMIUM_DEAL: 'Premium Deal',
  EVENT_TICKET: 'Event Ticket',
};

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  MOVIE: '🎬 Movie',
  CRICKET: '🏏 Cricket',
  FOOTBALL: '⚽ Football',
  CONCERT: '🎤 Concert',
  THEATRE: '🎭 Theatre',
  COMEDY_SHOW: '🎙️ Comedy Show',
  OTHER_SPORTS: '🏆 Other Sports',
  OTHER_EVENT: '🎟️ Other Event',
};

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso));
}
