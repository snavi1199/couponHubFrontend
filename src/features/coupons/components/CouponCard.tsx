import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Calendar, PackageX, CheckCircle2 } from 'lucide-react';
import type { CouponResponse } from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime, COUPON_TYPE_LABELS, TICKET_CATEGORY_LABELS } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { useCopyCouponCodeMutation } from '@/api/couponApi';

export const cardEntryVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: Math.min(i, 8) * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Per-coupon "used" state is stored in localStorage so it persists across refreshes.
// Key pattern: couponhub.used:<couponId>
function getUsedKey(id: string) { return `couponhub.used:${id}`; }
function isMarkedUsed(id: string) { return localStorage.getItem(getUsedKey(id)) === '1'; }
function setMarkedUsed(id: string) { localStorage.setItem(getUsedKey(id), '1'); }
function clearMarkedUsed(id: string) { localStorage.removeItem(getUsedKey(id)); }

export function CouponCard({ coupon, index = 0 }: { coupon: CouponResponse; index?: number }) {
  const isFree = coupon.type === 'FREE';
  const isTicket = coupon.type === 'EVENT_TICKET';
  const isSoldOut = coupon.status === 'SOLD_OUT' || coupon.availableQuantity - coupon.soldQuantity <= 0;
  const isExpiredStatus = coupon.status === 'EXPIRED';
  const isDisabled = isSoldOut || isExpiredStatus;

  const [used, setUsed] = useState(() => isFree && isMarkedUsed(coupon.id));
  const [copyCode] = useCopyCouponCodeMutation();

  const discountLabel = isTicket
    ? (coupon.ticketCategory ? TICKET_CATEGORY_LABELS[coupon.ticketCategory] : 'Ticket')
    : coupon.discountPercentage
      ? `${coupon.discountPercentage}% OFF`
      : coupon.flatDiscount
        ? `${formatCurrency(coupon.flatDiscount)} OFF`
        : COUPON_TYPE_LABELS[coupon.type];

  const handleUsedToggle = useCallback((e: React.MouseEvent) => {
    // Stop the event from bubbling to the Link — we don't want to navigate when clicking the checkbox
    e.preventDefault();
    e.stopPropagation();

    if (!used) {
      setMarkedUsed(coupon.id);
      setUsed(true);
      // Call copyCode to decrement available count and notify seller
      copyCode(coupon.id).catch(() => {/* silent — local state already updated */});
    } else {
      clearMarkedUsed(coupon.id);
      setUsed(false);
    }
  }, [used, coupon.id, copyCode]);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardEntryVariants}
      whileHover={isDisabled ? undefined : { y: -6, transition: { duration: 0.2 } }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
    >
      <Link
        to={`/coupons/${coupon.id}`}
        className={`ticket-card group relative flex h-full flex-col overflow-hidden ${isDisabled ? 'opacity-60 grayscale-[40%]' : ''} ${used ? 'opacity-75' : ''}`}
      >
        {isDisabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/10 backdrop-blur-[1px]">
            <span className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-paper shadow-lg">
              <PackageX size={13} /> {isSoldOut ? 'Sold out' : 'Expired'}
            </span>
          </div>
        )}

        {/* "Used" ribbon for free coupons */}
        <AnimatePresence>
          {used && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-paper shadow"
            >
              <CheckCircle2 size={11} /> Used
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start justify-between gap-3 p-4 pb-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-brand">
              {coupon.brand.name}
            </p>
            <h3 className="mt-0.5 line-clamp-2 font-display text-base leading-snug text-ink">
              {coupon.title}
            </h3>
          </div>
          <span className="shrink-0 rounded-full bg-stamp px-3 py-1 font-mono text-xs font-bold text-white">
            {discountLabel}
          </span>
        </div>

        {isTicket ? (
          <div className="flex flex-col gap-1 px-4 pb-3 text-xs text-ink-soft">
            {coupon.venueName && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {coupon.venueName}{coupon.venueCity ? `, ${coupon.venueCity}` : ''}</span>
            )}
            {coupon.eventDateTime && (
              <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateTime(coupon.eventDateTime)}</span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <Badge variant="neutral">{coupon.category.name}</Badge>
            {coupon.verifiedWorking && <Badge variant="brand">✓ Verified working</Badge>}
            {coupon.featured && <Badge variant="stamp">Featured</Badge>}
          </div>
        )}

        <div className="tear-line mx-4" />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-mono">
            {isFree ? (
              <span className="text-lg font-bold text-brand-dark">FREE</span>
            ) : (
              <span className="text-lg font-bold text-ink">{formatCurrency(coupon.sellingPrice)}</span>
            )}
            {coupon.originalValue && !isFree && (
              <span className="ml-2 text-sm text-ink-soft line-through">{formatCurrency(coupon.originalValue)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-soft">
            <Star size={14} className="fill-stamp text-stamp" />
            {coupon.seller.averageRating?.toFixed(1) ?? 'New'}
          </div>
        </div>

        {/* "Mark as used" checkbox — only for FREE coupons, not disabled ones */}
        {isFree && !isDisabled && (
          <div
            onClick={handleUsedToggle}
            className="border-t border-line/60 px-4 py-2.5"
          >
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft select-none">
              <motion.div
                animate={used ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  used ? 'border-brand bg-brand' : 'border-line/70 bg-white'
                }`}
              >
                {used && <CheckCircle2 size={10} className="text-paper" />}
              </motion.div>
              <span className={used ? 'font-semibold text-brand-dark' : ''}>
                {used ? 'You used this coupon ✓' : 'Mark as used — helps others know it works'}
              </span>
            </label>
          </div>
        )}

        {coupon.expiryDate && !isTicket && (
          <div className={`flex items-center gap-1.5 border-t border-line/60 px-4 py-2 text-xs text-ink-soft ${isFree && !isDisabled ? '' : 'mt-auto'}`}>
            <Clock size={12} />
            Expires {formatDate(coupon.expiryDate)}
          </div>
        )}
      </Link>
    </motion.div>
  );
}
