import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { useGetPendingPaymentsQuery, useMarkRequestPaidMutation } from '@/api/requestApi';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { formatCurrency, timeAgo } from '@/lib/format';

export function PendingPaymentsBoard() {
  const { data, isLoading } = useGetPendingPaymentsQuery({ size: 50 }, { pollingInterval: 15000 });
  const [markPaid, { isLoading: marking }] = useMarkRequestPaidMutation();
  const toast = useToast();
  const confirm = useConfirm();

  const handleMarkPaid = async (id: string) => {
    const ok = await confirm({
      title: 'Confirm payment received?',
      description: "Check the platform's UPI account actually received this payment before marking it paid — this immediately unlocks the code for the buyer.",
      confirmLabel: 'Yes, mark as paid',
    });
    if (!ok) return;
    try {
      await markPaid(id).unwrap();
      toast.show('Payment verified — coupon unlocked for buyer', 'success');
    } catch {
      toast.show('Could not update payment status', 'error');
    }
  };

  const payments = data?.data.content ?? [];

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand" /></div>;

  if (payments.length === 0) {
    return <EmptyState title="No pending payments" description="Requests show up here once a seller accepts them and the buyer is waiting to pay." />;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {payments.map((p, i) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: Math.min(i, 10) * 0.04 }}
            className="ticket-card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div className="flex items-center gap-3">
              {p.upiQrCodeDataUri && (
                <img src={p.upiQrCodeDataUri} alt="Payment QR" className="h-14 w-14 rounded-lg border border-line" />
              )}
              <div>
                <p className="font-display text-base text-ink">{p.couponTitle}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  <strong>{formatCurrency(p.offeredPrice)}</strong> · buyer: {p.buyer.fullName} · seller: {p.seller.fullName} · accepted {timeAgo(p.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="stamp-badge bg-stamp-light text-stamp-dark"><QrCode size={12} /> Pending payment</span>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleMarkPaid(p.id)} disabled={marking} className="btn-primary text-sm">
                <CheckCircle2 size={14} /> Mark as paid
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
