import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSearchCouponsQuery } from '@/api/couponApi';
import { CouponFilters } from './components/CouponFilters';
import { CouponCard } from './components/CouponCard';
import { CouponListSkeleton } from '@/components/ui/PageSkeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import type { CouponSearchParams, CouponType, TicketCategory } from '@/lib/types';

export default function CouponListPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<CouponSearchParams>({
    page: 0,
    size: 12,
    onlyFree: searchParams.get('onlyFree') === 'true' || undefined,
    onlyFeatured: searchParams.get('onlyFeatured') === 'true' || undefined,
    type: (searchParams.get('type') as CouponType) || undefined,
    ticketCategory: (searchParams.get('ticketCategory') as TicketCategory) || undefined,
    brandId: searchParams.get('brandId') || undefined,
  });

  const { data, isLoading, isFetching, error } = useSearchCouponsQuery(filters);

  if (isLoading) return <CouponListSkeleton count={filters.size ?? 12} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 font-display text-2xl text-ink"
      >
        Browse deals
      </motion.h1>

      <CouponFilters filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {error ? (
          <EmptyState title="Couldn't load coupons" description="The backend may be unreachable — check that it's running on the configured API URL, and that CORS_ORIGINS includes this app's origin." />
        ) : data && data.data.content.length > 0 ? (
          <>
            <p className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
              {data.data.totalElements} deal{data.data.totalElements === 1 ? '' : 's'} found
              {isFetching && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="text-brand"
                >
                  refreshing…
                </motion.span>
              )}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.content.map((c, i) => <CouponCard key={c.id} coupon={c} index={i} />)}
            </div>
            <Pagination
              page={data.data.page}
              totalPages={data.data.totalPages}
              onChange={(page) => setFilters((f) => ({ ...f, page }))}
            />
          </>
        ) : (
          <EmptyState
            title="No coupons match those filters"
            description="Try clearing a filter, or be the first to list a deal in this category."
          />
        )}
      </div>
    </div>
  );
}
