import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { useGetBrandsQuery } from '@/api/brandApi';
import type { CouponSearchParams, CouponType, TicketCategory } from '@/lib/types';
import { COUPON_TYPE_LABELS, TICKET_CATEGORY_LABELS } from '@/lib/format';
import { brandIcon } from '@/lib/brandIcons';

interface Props {
  filters: CouponSearchParams;
  onChange: (next: CouponSearchParams) => void;
}

const TYPE_OPTIONS: CouponType[] = ['FREE', 'PAID', 'HALF_PAID', 'NEGOTIABLE', 'GIFT_CARD', 'VOUCHER', 'CASHBACK', 'EVENT_TICKET'];
const TICKET_CATEGORY_OPTIONS: TicketCategory[] = ['MOVIE', 'CRICKET', 'FOOTBALL', 'CONCERT', 'THEATRE', 'COMEDY_SHOW', 'OTHER_SPORTS', 'OTHER_EVENT'];

export function CouponFilters({ filters, onChange }: Props) {
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const update = (patch: Partial<CouponSearchParams>) => onChange({ ...filters, ...patch, page: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ticket-card flex flex-col gap-3 p-4"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
        <input
          type="search"
          placeholder="Search coupons, brands, movies, matches…"
          className="input-field pl-11 font-mono"
          value={filters.keyword ?? ''}
          onChange={(e) => update({ keyword: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="input-field w-auto py-2 text-sm"
          value={filters.categoryId ?? ''}
          onChange={(e) => update({ categoryId: e.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categoriesData?.data.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          className="input-field w-auto py-2 text-sm"
          value={filters.brandId ?? ''}
          onChange={(e) => update({ brandId: e.target.value || undefined })}
        >
          <option value="">All brands</option>
          {brandsData?.data.map((b) => (
            <option key={b.id} value={b.id}>{brandIcon(b.slug)} {b.name}</option>
          ))}
        </select>

        <select
          className="input-field w-auto py-2 text-sm"
          value={filters.type ?? ''}
          onChange={(e) => update({
            type: (e.target.value || undefined) as CouponType | undefined,
            ticketCategory: e.target.value === 'EVENT_TICKET' ? filters.ticketCategory : undefined,
          })}
        >
          <option value="">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{COUPON_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {filters.type === 'EVENT_TICKET' && (
          <motion.select
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="input-field w-auto py-2 text-sm"
            value={filters.ticketCategory ?? ''}
            onChange={(e) => update({ ticketCategory: (e.target.value || undefined) as TicketCategory | undefined })}
          >
            <option value="">All events</option>
            {TICKET_CATEGORY_OPTIONS.map((t) => (
              <option key={t} value={t}>{TICKET_CATEGORY_LABELS[t]}</option>
            ))}
          </motion.select>
        )}

        <label className="flex items-center gap-2 rounded-full border-2 border-line px-3 py-2 text-sm font-medium text-ink-soft has-[:checked]:border-brand has-[:checked]:bg-brand-light has-[:checked]:text-brand-dark">
          <input
            type="checkbox"
            className="accent-brand"
            checked={filters.onlyFree ?? false}
            onChange={(e) => update({ onlyFree: e.target.checked || undefined })}
          />
          Free only
        </label>

        <label className="flex items-center gap-2 rounded-full border-2 border-line px-3 py-2 text-sm font-medium text-ink-soft has-[:checked]:border-brand has-[:checked]:bg-brand-light has-[:checked]:text-brand-dark">
          <input
            type="checkbox"
            className="accent-brand"
            checked={filters.onlyFeatured ?? false}
            onChange={(e) => update({ onlyFeatured: e.target.checked || undefined })}
          />
          Featured
        </label>
      </div>
    </motion.div>
  );
}
