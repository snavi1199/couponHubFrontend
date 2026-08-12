import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGetSellerCouponsQuery } from '@/api/couponApi';
import { CouponCard } from './components/CouponCard';
import { ProfileEditor } from './components/ProfileEditor';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { NotificationsPanel } from '@/features/notifications/NotificationsPanel';
import { MyRequestsPanel } from './components/MyRequestsPanel';
import { ReceivedRequestsPanel } from './components/ReceivedRequestsPanel';
import { DashboardSkeleton } from '@/components/ui/PageSkeletons';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [page, setPage] = useState(0);
  const isSeller = user?.roles.some((r) => ['ROLE_SELLER', 'ROLE_PREMIUM_SELLER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));

  const { data, isLoading } = useGetSellerCouponsQuery(
    { sellerId: user?.id ?? '', page, size: 9 },
    { skip: !user }
  );

  if (!user) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h1 className="font-display text-2xl text-ink">Hi, {user.fullName.split(' ')[0]}</h1>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.roles.map((r) => <Badge key={r} variant="neutral">{r.replace('ROLE_', '')}</Badge>)}
          </div>
          <div className="mt-3">
            <ProfileEditor user={user} />
          </div>
        </div>
        {isSeller && (
          <Link to="/coupons/new" className="btn-primary shrink-0"><PlusCircle size={16} /> List a coupon</Link>
        )}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Uploaded" value={user.couponsUploadedCount ?? 0} />
        <StatCard label="Sold" value={user.couponsSoldCount ?? 0} />
        <StatCard label="Purchased" value={user.couponsPurchasedCount ?? 0} />
        <StatCard label="Rating" value={user.averageRating ? user.averageRating.toFixed(1) : '—'} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NotificationsPanel />
        <MyRequestsPanel />
        {isSeller && <ReceivedRequestsPanel />}
      </div>

      <h2 className="mb-4 font-display text-lg text-ink">Your listings</h2>

      {!isSeller ? (
        <EmptyState
          title="You're not a seller yet"
          description="Your account currently has the ROLE_USER role only. Ask an admin to grant ROLE_SELLER to start listing coupons (see API_REFERENCE.md for the SQL if you're running this locally)."
        />
      ) : isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand" /></div>
      ) : data && data.data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.content.map((c, i) => <CouponCard key={c.id} coupon={c} index={i} />)}
          </div>
          <Pagination page={data.data.page} totalPages={data.data.totalPages} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          title="No listings yet"
          description="List your first coupon to start selling or sharing deals."
          action={<Link to="/coupons/new" className="btn-primary">List a coupon</Link>}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ticket-card p-4 text-center">
      <p className="font-mono text-2xl font-bold text-brand-dark">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}
