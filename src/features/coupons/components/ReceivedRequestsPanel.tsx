import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock3, BadgeCheck, Star, Inbox, IndianRupee } from 'lucide-react';
import {
  useGetReceivedRequestsQuery,
  useAcceptCouponRequestMutation,
  useRejectCouponRequestMutation,
} from '@/api/requestApi';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/toast';
import { usePrompt } from '@/components/ui/PromptDialog';
import { useAppSelector } from '@/app/hooks';
import { formatCurrency, timeAgo } from '@/lib/format';
import type { CouponRequestResponse, RequestStatus } from '@/lib/types';
import { baseApi } from '@/api/baseApi';

function PayoutAcknowledgeButton({ requestId }: { requestId: string }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  const promptFn = usePrompt();
  const user = useAppSelector((s) => s.auth.user);

  const handleAck = async () => {
    const phone = user?.phone;
    const answer = await promptFn({
      title: 'Confirm payout number',
      description: phone
        ? `We'll send your payout to ${phone} — is this correct? Leave blank to confirm, or enter a different number.`
        : 'Enter the UPI-linked phone number you want to receive the payout on.',
      placeholder: phone ?? '+919876543210',
      confirmLabel: 'Confirm payout',
    });
    if (answer === null) return; // cancelled

    try {
      const action = answer.trim() && answer.trim() !== phone ? 'UPDATE' : 'CONFIRM';
      const params = new URLSearchParams({ action });
      if (action === 'UPDATE') params.set('correctedPhone', answer.trim());
      await fetch(`/api/requests/${requestId}/acknowledge-payout?${params}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` },
      });
      toast.show('Payout request submitted — we\'ll transfer within 1-2 business days', 'success');
      setDone(true);
    } catch {
      toast.show('Could not submit payout request', 'error');
    }
  };

  if (done) {
    return <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-dark"><BadgeCheck size={13} /> Payout request submitted.</p>;
  }

  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAck} className="btn-primary mt-3 text-xs py-1.5">
      <IndianRupee size={13} /> Confirm payout number
    </motion.button>
  );
}

const STATUS_VARIANT: Record<RequestStatus, 'brand' | 'stamp' | 'neutral' | 'danger'> = {
  PENDING: 'stamp', ACCEPTED: 'stamp', REJECTED: 'danger', COUNTER_OFFERED: 'stamp',
  EXPIRED: 'neutral', CANCELLED: 'neutral', COMPLETED: 'brand',
};
const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'New request', ACCEPTED: 'Pending payment', REJECTED: 'Rejected',
  COUNTER_OFFERED: 'Countered', EXPIRED: 'Expired', CANCELLED: 'Cancelled', COMPLETED: 'Paid ✓',
};

export function ReceivedRequestsPanel() {
  const { data, isLoading } = useGetReceivedRequestsQuery({ size: 20 }, { pollingInterval: 15000 });
  const [accept, { isLoading: accepting }] = useAcceptCouponRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectCouponRequestMutation();
  const toast = useToast();
  const promptFn = usePrompt();

  const requests = data?.data.content ?? [];

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

  return (
    <div className="ticket-card p-5">
      <p className="mb-4 flex items-center gap-2 font-display text-lg text-ink">
        <Inbox size={18} /> Requests received
      </p>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner className="h-5 w-5 text-brand" /></div>
      ) : requests.length === 0 ? (
        <EmptyState title="No requests yet" description="Buyer requests on your paid coupons and tickets will show up here." />
      ) : (
        <AnimatePresence initial={false}>
          {requests.map((r, i) => (
            <RequestRow key={r.id} request={r} index={i} onAccept={handleAccept} onReject={handleReject} accepting={accepting} rejecting={rejecting} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function RequestRow({
  request, index, onAccept, onReject, accepting, rejecting,
}: {
  request: CouponRequestResponse;
  index: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  accepting: boolean;
  rejecting: boolean;
}) {
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
          <p className="flex items-center gap-1 text-xs text-ink-soft">
            {request.buyer.fullName}
            <span className="flex items-center gap-0.5"><Star size={11} className="fill-stamp text-stamp" /> {request.buyer.averageRating?.toFixed(1) ?? 'New'}</span>
            · {timeAgo(request.createdAt)}
          </p>
        </div>
        <Badge variant={STATUS_VARIANT[request.status]}>{STATUS_LABEL[request.status]}</Badge>
      </div>

      {request.offeredPrice !== undefined && (
        <p className="mt-2 font-mono text-sm">Offered: <strong>{formatCurrency(request.offeredPrice)}</strong></p>
      )}
      {request.message && <p className="mt-1 text-sm text-ink-soft">"{request.message}"</p>}

      {request.status === 'PENDING' && (
        <div className="mt-3 flex gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAccept(request.id)} disabled={accepting} className="btn-primary py-1.5 text-xs">
            <Check size={13} /> Accept
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => onReject(request.id)} disabled={rejecting} className="btn-secondary py-1.5 text-xs">
            <X size={13} /> Reject
          </motion.button>
        </div>
      )}

      {request.status === 'ACCEPTED' && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
          <Clock3 size={13} /> Waiting for buyer payment — the platform verifies and unlocks it, no action needed from you.
        </p>
      )}

      {request.status === 'COMPLETED' && (
        <PayoutAcknowledgeButton requestId={request.id} />
      )}
    </motion.div>
  );
}
