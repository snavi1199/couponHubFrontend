import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldX, Flag, Wallet, UploadCloud } from 'lucide-react';
import { useSearchCouponsQuery, useApproveCouponMutation, useRejectCouponMutation } from '@/api/couponApi';
import { useGetPendingPaymentsQuery } from '@/api/requestApi';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/toast';
import { usePrompt } from '@/components/ui/PromptDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, COUPON_TYPE_LABELS } from '@/lib/format';
import { PendingPaymentsBoard } from './PendingPaymentsBoard';
import { BulkImportPanel } from './BulkImportPanel';
import { AdminCouponList } from './AdminCouponList';

type Tab = 'payments' | 'flagged' | 'bulk' | 'coupons';

export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>('payments');
  const { data: paymentsData } = useGetPendingPaymentsQuery({ size: 50 }, { pollingInterval: 15000 });
  const pendingCount = paymentsData?.data.totalElements ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 font-display text-2xl text-ink">Admin board</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Verify UPI payments and handle any coupons flagged for review.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('payments')}
          className={`btn-secondary text-sm ${tab === 'payments' ? 'bg-ink text-paper' : ''}`}
        >
          <Wallet size={14} /> Pending payments{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
        <button
          onClick={() => setTab('flagged')}
          className={`btn-secondary text-sm ${tab === 'flagged' ? 'bg-ink text-paper' : ''}`}
        >
          <Flag size={14} /> Flagged coupons
        </button>
        <button
          onClick={() => setTab('bulk')}
          className={`btn-secondary text-sm ${tab === 'bulk' ? 'bg-ink text-paper' : ''}`}
        >
          <UploadCloud size={14} /> Bulk import
        </button>
        <button
          onClick={() => setTab('coupons')}
          className={`btn-secondary text-sm ${tab === 'coupons' ? 'bg-ink text-paper' : ''}`}
        >
          All coupons
        </button>
      </div>

      {tab === 'payments' && <PendingPaymentsBoard />}
      {tab === 'flagged' && <FlaggedCoupons />}
      {tab === 'bulk' && <BulkImportPanel />}
      {tab === 'coupons' && <AdminCouponList />}
    </div>
  );
}

function FlaggedCoupons() {
  const { data, isLoading } = useSearchCouponsQuery({ status: 'PENDING_REVIEW', size: 50 });
  const [approve, { isLoading: approving }] = useApproveCouponMutation();
  const [reject, { isLoading: rejecting }] = useRejectCouponMutation();
  const toast = useToast();
  const promptFn = usePrompt();

  const handleReject = async (id: string) => {
    const reason = await promptFn({ title: 'Reject this coupon', placeholder: 'Reason for rejecting…', confirmLabel: 'Reject', required: true });
    if (!reason) return;
    try {
      await reject({ id, reason }).unwrap();
      toast.show('Coupon rejected', 'success');
    } catch {
      toast.show('Could not reject coupon', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approve(id).unwrap();
      toast.show('Coupon approved', 'success');
    } catch {
      toast.show('Could not approve coupon', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-brand" /></div>;

  if (!data || data.data.content.length === 0) {
    return <EmptyState title="Nothing flagged" description="Coupons publish live automatically — nothing is waiting on manual review right now." />;
  }

  return (
    <div className="space-y-4">
      {data.data.content.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i, 10) * 0.04 }}
          className="ticket-card flex flex-wrap items-center justify-between gap-4 p-5"
        >
          <div>
            <Link to={`/coupons/${c.id}`} className="font-display text-base text-ink hover:underline">{c.title}</Link>
            <p className="mt-1 text-sm text-ink-soft">
              {c.brand.name} · {COUPON_TYPE_LABELS[c.type]} · {formatCurrency(c.sellingPrice)} · by {c.seller.fullName}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleApprove(c.id)} disabled={approving} className="btn-primary text-sm">
              <ShieldCheck size={14} /> Approve
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleReject(c.id)} disabled={rejecting} className="btn-secondary text-sm">
              <ShieldX size={14} /> Reject
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
