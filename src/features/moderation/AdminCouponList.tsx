import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Layers, Edit3, CheckCircle2 } from 'lucide-react';
import {
  useGetAllCouponsForAdminQuery,
  useAdminMarkExpiredMutation,
  useAdminAdjustQuantityMutation,
} from '@/api/couponApi';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { formatCurrency, COUPON_TYPE_LABELS } from '@/lib/format';
import type { CouponStatus, CouponType } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: CouponStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Sold out', value: 'SOLD_OUT' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Pending review', value: 'PENDING_REVIEW' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const STATUS_VARIANT: Record<string, 'brand' | 'stamp' | 'neutral' | 'danger'> = {
  ACTIVE: 'brand', SOLD_OUT: 'neutral', EXPIRED: 'neutral',
  PENDING_REVIEW: 'stamp', REJECTED: 'danger', SUSPENDED: 'danger', DELETED: 'danger',
};

export function AdminCouponList() {
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [editingQty, setEditingQty] = useState<{ id: string; value: number } | null>(null);

  const { data, isLoading, isFetching } = useGetAllCouponsForAdminQuery(
    { keyword, type, status, page, size: 15 },
    { pollingInterval: 30000 }
  );
  const [markExpired, { isLoading: expiring }] = useAdminMarkExpiredMutation();
  const [adjustQty, { isLoading: adjusting }] = useAdminAdjustQuantityMutation();
  const toast = useToast();
  const confirm = useConfirm();

  const coupons = data?.data.content ?? [];

  const handleMarkExpired = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Mark as expired?',
      description: `This will force "${title}" to EXPIRED and notify the seller.`,
      confirmLabel: 'Mark expired',
      danger: true,
    });
    if (!ok) return;
    try {
      await markExpired(id).unwrap();
      toast.show('Coupon marked expired', 'success');
    } catch {
      toast.show('Could not mark expired', 'error');
    }
  };

  const handleAdjustQty = async () => {
    if (!editingQty) return;
    try {
      await adjustQty({ id: editingQty.id, availableQuantity: editingQty.value }).unwrap();
      toast.show('Quantity updated', 'success');
      setEditingQty(null);
    } catch {
      toast.show('Could not update quantity', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search by title…"
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          className="input-field w-52 py-2 text-sm"
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} className="input-field w-auto py-2 text-sm">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(0); }} className="input-field w-auto py-2 text-sm">
          <option value="">All types</option>
          {Object.entries(COUPON_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {isFetching && <span className="flex items-center text-xs text-ink-soft"><Spinner className="h-3 w-3 mr-1" />refreshing…</span>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner className="h-6 w-6 text-brand" /></div>
      ) : coupons.length === 0 ? (
        <EmptyState title="No coupons found" description="Try adjusting the filters." />
      ) : (
        <AnimatePresence initial={false}>
          {coupons.map((c, i) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.03 }}
              className="ticket-card flex flex-wrap items-center gap-4 p-4"
            >
              <div className="flex-1 min-w-0">
                <Link to={`/coupons/${c.id}`} className="font-semibold text-ink hover:underline line-clamp-1">{c.title}</Link>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {c.brand.name} · {COUPON_TYPE_LABELS[c.type]} · {formatCurrency(c.sellingPrice)} · by {c.seller.fullName}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {c.soldQuantity}/{c.availableQuantity} sold · {c.viewCount} views
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANT[c.status] ?? 'neutral'}>{c.status.replace('_', ' ')}</Badge>

                {/* Quantity editor */}
                {editingQty?.id === c.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={editingQty.value}
                      onChange={(e) => setEditingQty({ id: c.id, value: Number(e.target.value) })}
                      className="input-field w-20 py-1 font-mono text-sm"
                    />
                    <button onClick={handleAdjustQty} disabled={adjusting} className="btn-primary py-1 text-xs">
                      <CheckCircle2 size={13} />
                    </button>
                    <button onClick={() => setEditingQty(null)} className="btn-ghost text-xs">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingQty({ id: c.id, value: c.availableQuantity })}
                    className="btn-ghost text-xs"
                    title="Adjust quantity"
                  >
                    <Layers size={13} /> {c.availableQuantity}
                  </button>
                )}

                {c.status !== 'EXPIRED' && c.status !== 'DELETED' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMarkExpired(c.id, c.title)}
                    disabled={expiring}
                    className="btn-secondary py-1 text-xs text-stamp-dark border-stamp-dark/40"
                  >
                    <Timer size={13} /> Expire
                  </motion.button>
                )}

                <Link to={`/coupons/${c.id}/edit`} className="btn-ghost text-xs">
                  <Edit3 size={13} /> Edit
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Pagination */}
      {data && data.data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost text-sm disabled:opacity-40">← Prev</button>
          <span className="font-mono text-sm text-ink-soft">Page {page + 1} of {data.data.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(data.data.totalPages - 1, p + 1))} disabled={page >= data.data.totalPages - 1} className="btn-ghost text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
