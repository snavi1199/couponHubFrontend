import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star, Clock3, BadgeCheck } from 'lucide-react';
import { useGetRequestsForCouponQuery, useAcceptCouponRequestMutation, useRejectCouponRequestMutation } from '@/api/requestApi';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/toast';
import { usePrompt } from '@/components/ui/PromptDialog';
import { formatCurrency, timeAgo } from '@/lib/format';
import type { RequestStatus } from '@/lib/types';

const STATUS_VARIANT: Record<RequestStatus, 'brand' | 'stamp' | 'neutral' | 'danger'> = {
  PENDING: 'stamp',
  ACCEPTED: 'stamp',
  REJECTED: 'danger',
  COUNTER_OFFERED: 'stamp',
  EXPIRED: 'neutral',
  CANCELLED: 'neutral',
  COMPLETED: 'brand',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Pending payment',
  REJECTED: 'Rejected',
  COUNTER_OFFERED: 'Countered',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Paid ✓',
};

export function RequestPanel({ couponId }: { couponId: string }) {
  const { data, isLoading } = useGetRequestsForCouponQuery({ couponId }, { pollingInterval: 15000 });
  const [accept, { isLoading: accepting }] = useAcceptCouponRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectCouponRequestMutation();
  const toast = useToast();
  const promptFn = usePrompt();

  const handleAccept = async (id: string) => {
    try {
      await accept(id).unwrap();
      toast.show('Accepted — buyer has been sent a payment QR', 'success');
    } catch {
      toast.show('Could not accept request', 'error');
    }
  };

  const handleReject = async (id: string) => {
    const reason = (await promptFn({ title: 'Reject this request', placeholder: 'Reason (optional)…' })) ?? undefined;
    try {
      await reject({ id, reason }).unwrap();
      toast.show('Request rejected', 'success');
    } catch {
      toast.show('Could not reject request', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-brand" /></div>;

  const requests = data?.data.content ?? [];
  if (requests.length === 0) {
    return <p className="text-sm text-ink-soft">No requests yet on this coupon.</p>;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {requests.map((r, i) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border-2 border-line/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 font-semibold text-ink">
                  {r.buyer.fullName}
                  <span className="flex items-center gap-0.5 text-xs font-normal text-ink-soft">
                    <Star size={12} className="fill-stamp text-stamp" /> {r.buyer.averageRating?.toFixed(1) ?? 'New'}
                  </span>
                </p>
                <p className="text-xs text-ink-soft">{timeAgo(r.createdAt)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            </div>

            {r.offeredPrice !== undefined && (
              <p className="mt-2 font-mono text-sm">Offered: <strong>{formatCurrency(r.offeredPrice)}</strong></p>
            )}
            {r.message && <p className="mt-1 text-sm text-ink-soft">"{r.message}"</p>}

            {r.status === 'ACCEPTED' && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
                <Clock3 size={13} /> Waiting for the buyer to pay — the platform verifies payment and unlocks the code, no need to contact them directly.
              </p>
            )}

            {r.status === 'COMPLETED' && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-dark">
                <BadgeCheck size={13} /> Payment verified by the platform. Code is unlocked for the buyer.
              </p>
            )}

            {r.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAccept(r.id)} disabled={accepting} className="btn-primary py-1.5 text-xs">
                  <Check size={13} /> Accept
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReject(r.id)} disabled={rejecting} className="btn-secondary py-1.5 text-xs">
                  <X size={13} /> Reject
                </motion.button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
