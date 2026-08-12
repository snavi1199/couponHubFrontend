import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TicketPercent, Film, Trophy } from 'lucide-react';
import { useSearchCouponsQuery } from '@/api/couponApi';
import { useGetFeaturedBrandsQuery } from '@/api/brandApi';
import { CouponCard } from '@/features/coupons/components/CouponCard';
import { CouponGridSkeleton } from '@/components/ui/CouponCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppSelector } from '@/app/hooks';

export default function HomePage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data: featuredData, isLoading: loadingFeatured } = useSearchCouponsQuery({ onlyFeatured: true, size: 4 });
  const { data: freeData, isLoading: loadingFree } = useSearchCouponsQuery({ onlyFree: true, size: 4 });
  const { data: ticketData, isLoading: loadingTickets } = useSearchCouponsQuery({ type: 'EVENT_TICKET', size: 4 });
  const { data: brandsData } = useGetFeaturedBrandsQuery();

  return (
    <div>
      {/* Hero: giant ticket-stub */}
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="ticket-card flex flex-col items-center gap-6 overflow-hidden p-8 text-center sm:p-12 md:flex-row md:items-center md:justify-between md:text-left"
        >
          <div className="max-w-xl">
            <span className="stamp-badge bg-stamp-light text-stamp-dark">
              <TicketPercent size={14} /> Live marketplace, Phase 1
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
              Every coupon has<br />someone behind it.
            </h1>
            <p className="mt-4 text-base text-ink-soft">
              Buy, sell, and share real discount codes, gift cards, vouchers — and now movie &amp;
              cricket tickets — verified by the people who actually used them.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-end">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/coupons" className="btn-primary">
                  Browse deals <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={isAuthenticated ? '/coupons/new' : '/register'} className="btn-secondary">Start selling</Link>
              </motion.div>
            </div>
          </div>

          <div className="tear-line hidden h-40 rotate-90 md:block" />

          <div className="w-full max-w-xs shrink-0 font-mono text-sm text-ink-soft">
            <div className="flex justify-between border-b border-dashed border-line py-2">
              <span>STATUS</span><span className="text-brand-dark font-semibold">ACTIVE</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-line py-2">
              <span>CATEGORIES</span><span>22</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-line py-2">
              <span>BRANDS</span><span>{brandsData?.data.length ?? '—'}+</span>
            </div>
            <div className="flex justify-between py-2">
              <span>ADMIT</span><span>ONE DEAL-HUNTER</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Event tickets quick-access strip */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TicketShortcut to="/coupons?type=EVENT_TICKET&ticketCategory=MOVIE" icon={<Film size={20} />} label="Movie tickets" />
          <TicketShortcut to="/coupons?type=EVENT_TICKET&ticketCategory=CRICKET" icon={<Trophy size={20} />} label="Cricket tickets" />
          <TicketShortcut to="/coupons?onlyFree=true" icon={<TicketPercent size={20} />} label="Free coupons" />
          <TicketShortcut to="/coupons?onlyFeatured=true" icon={<ArrowRight size={20} />} label="Featured deals" />
        </div>
      </section>

      {/* Featured brands strip */}
      {brandsData && brandsData.data.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Popular brands</span>
            {brandsData.data.slice(0, 8).map((b) => (
              <span key={b.id} className="font-display text-sm text-ink-soft/70">{b.name}</span>
            ))}
          </div>
        </section>
      )}

      <CouponSection
        title="🎟️ Movie & cricket tickets"
        linkTo="/coupons?type=EVENT_TICKET"
        isLoading={loadingTickets}
        coupons={ticketData?.data.content}
        emptyMessage="No event tickets listed yet — be the first to list movie or match tickets."
      />

      <CouponSection
        title="Featured deals"
        linkTo="/coupons?onlyFeatured=true"
        isLoading={loadingFeatured}
        coupons={featuredData?.data.content}
        emptyMessage="No featured coupons yet — check back soon, or list one of your own."
      />

      <CouponSection
        title="Free coupons, community-verified"
        linkTo="/coupons?onlyFree=true"
        isLoading={loadingFree}
        coupons={freeData?.data.content}
        emptyMessage="No free coupons listed yet."
      />
    </div>
  );
}

function TicketShortcut({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
      <Link to={to} className="ticket-card flex flex-col items-center gap-2 px-4 py-5 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          {icon}
        </span>
        <span className="text-sm font-semibold text-ink">{label}</span>
      </Link>
    </motion.div>
  );
}

function CouponSection({
  title, linkTo, isLoading, coupons, emptyMessage,
}: {
  title: string;
  linkTo: string;
  isLoading: boolean;
  coupons?: import('@/lib/types').CouponResponse[];
  emptyMessage: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        <Link to={linkTo} className="text-sm font-semibold text-brand hover:underline">See all</Link>
      </div>

      {isLoading ? (
        <CouponGridSkeleton count={4} />
      ) : coupons && coupons.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coupons.map((c, i) => <CouponCard key={c.id} coupon={c} index={i} />)}
        </div>
      ) : (
        <EmptyState title="Nothing here yet" description={emptyMessage} />
      )}
    </section>
  );
}
