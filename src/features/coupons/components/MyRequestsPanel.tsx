import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock3, BadgeCheck, XCircle, Download, ExternalLink } from 'lucide-react';
import { useGetMyRequestsQuery } from '@/api/requestApi';
import { useGetCouponByIdQuery } from '@/api/couponApi';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, timeAgo } from '@/lib/format';
import type { CouponRequestResponse, RequestStatus } from '@/lib/types';

const STATUS_VARIANT: Record<RequestStatus, 'brand' | 'stamp' | 'neutral' | 'danger'> = {
  PENDING: 'stamp', ACCEPTED: 'stamp', REJECTED: 'danger', COUNTER_OFFERED: 'stamp',
  EXPIRED: 'neutral', CANCELLED: 'neutral', COMPLETED: 'brand',
};
const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Waiting on seller', ACCEPTED: 'Pending payment', REJECTED: 'Rejected',
  COUNTER_OFFERED: 'Countered', EXPIRED: 'Expired', CANCELLED: 'Cancelled', COMPLETED: 'Paid ✓',
};

export function MyRequestsPanel() {
  const { data, isLoading } = useGetMyRequestsQuery({ size: 20 }, { pollingInterval: 15000 });
  const requests = data?.data.content ?? [];

  return (
    <div className="ticket-card p-5">
      <p className="mb-4 font-display text-lg text-ink">My requests</p>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-brand" /></div>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" description="Request a paid deal or ticket from Browse Deals to see it here." />
      ) : (
        <AnimatePresence initial={false}>
          {requests.map((r, i) => <RequestRow key={r.id} request={r} index={i} />)}
        </AnimatePresence>
      )}
    </div>
  );
}

function RequestRow({ request, index }: { request: CouponRequestResponse; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      className="mb-3 rounded-xl border-2 border-line/70 p-4 last:mb-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link to={`/coupons/${request.couponId}`} className="font-semibold text-ink hover:underline">{request.couponTitle}</Link>
          <p className="text-xs text-ink-soft">{timeAgo(request.createdAt)} · sold by {request.seller.fullName}</p>
        </div>
        <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
      </div>

      {request.offeredPrice !== undefined && (
        <p className="mt-2 font-mono text-sm">Price: <strong>{formatCurrency(request.offeredPrice)}</strong></p>
      )}

      {request.status === 'ACCEPTED' && <PaymentPrompt request={request} />}
      {request.status === 'COMPLETED' && <UnlockedDetails couponId={request.couponId} />}
      {request.status === 'REJECTED' && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-stamp-dark"><XCircle size={13} /> The seller declined this request.</p>
      )}
    </motion.div>
  );
}

function PaymentPrompt({ request }: { request: CouponRequestResponse }) {
  if (!request.upiQrCodeDataUri) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-soft">
        <Clock3 size={13} /> Accepted — payment details are being prepared.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl bg-stamp-light/40 p-5">
      <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-stamp-dark">
        <Clock3 size={16} /> Pay to unlock — {formatCurrency(request.offeredPrice)}
      </p>
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src={request.upiQrCodeDataUri}
          alt="UPI payment QR code"
          className="h-56 w-56 max-w-full rounded-xl border-4 border-white bg-white shadow-md"
        />
        <div className="max-w-xs text-sm text-ink-soft">
          <p>Scan with any UPI app (GPay, PhonePe, Paytm…) or tap below on mobile.</p>
          {request.upiPaymentLink && (
            <a href={request.upiPaymentLink} className="btn-secondary mt-3 inline-flex py-2 text-sm">
              <ExternalLink size={14} /> Open in UPI app
            </a>
          )}
          <p className="mt-3 text-xs">
            Payment goes to CouponHub's platform account, not the seller directly. Once verified, your code unlocks here automatically — usually within a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

function UnlockedDetails({ couponId }: { couponId: string }) {
  const { data } = useGetCouponByIdQuery(couponId);
  const coupon = data?.data;
  if (!coupon) return null;

  return (
    <div className="mt-3 rounded-xl bg-brand-light/40 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-dark">
        <BadgeCheck size={14} /> Unlocked
      </p>
      <p className="rounded-lg border-2 border-dashed border-brand bg-white px-3 py-2 font-mono text-sm font-semibold text-brand-dark">
        {coupon.couponCode}
      </p>
      {(coupon.imageUrls ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(coupon.imageUrls ?? []).map((url) => (
            <a key={url} href={url} download target="_blank" rel="noreferrer" className="btn-secondary py-1.5 text-xs">
              <Download size={13} /> Download ticket
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
