import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';
import { useCreateCouponsBulkMutation } from '@/api/couponApi';
import { useGetBrandsQuery } from '@/api/brandApi';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/Spinner';
import { brandIcon } from '@/lib/brandIcons';
import { COUPON_TYPE_LABELS } from '@/lib/format';
import type { CouponCreatePayload, CouponType } from '@/lib/types';

const COUPON_TYPES = Object.keys(COUPON_TYPE_LABELS) as CouponType[];

interface Row {
  id: number;
  title: string;
  brandId: string;
  categoryId: string;
  couponCode: string;
  type: CouponType;
  sellingPrice: number;
  availableQuantity: number;
  description: string;
  expiryDate: string;
}

let rowIdCounter = 0;

function emptyRow(): Row {
  return {
    id: ++rowIdCounter,
    title: '',
    brandId: '',
    categoryId: '',
    couponCode: '',
    type: 'FREE',
    sellingPrice: 0,
    availableQuantity: 999,
    description: '',
    expiryDate: '',
  };
}

export function BulkImportPanel() {
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [bulkCreate, { isLoading, data: result }] = useCreateCouponsBulkMutation();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const toast = useToast();

  const brands = brandsData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const updateRow = (id: number, field: keyof Row, value: string | number) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (id: number) => setRows((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);

  const handleSubmit = async () => {
    const invalid = rows.filter((r) => !r.title.trim() || !r.brandId || !r.categoryId || !r.couponCode.trim());
    if (invalid.length > 0) {
      toast.show(`${invalid.length} row(s) missing required fields (title, brand, category, code)`, 'error');
      return;
    }

    const payload: CouponCreatePayload[] = rows.map((r) => ({
      title: r.title,
      brandId: r.brandId,
      categoryId: r.categoryId,
      couponCode: r.couponCode,
      type: r.type,
      sellingPrice: r.type === 'FREE' ? 0 : r.sellingPrice,
      availableQuantity: r.availableQuantity,
      description: r.description || undefined,
      expiryDate: r.expiryDate || undefined,
    }));

    try {
      const res = await bulkCreate(payload).unwrap();
      toast.show(`${res.data.succeededCount} of ${res.data.totalRequested} coupons created`, res.data.failedCount > 0 ? 'error' : 'success');
      if (res.data.succeededCount > 0) setRows([emptyRow()]);
    } catch {
      toast.show('Bulk import failed', 'error');
    }
  };

  return (
    <div className="ticket-card p-5">
      <p className="mb-1 flex items-center gap-2 font-display text-lg text-ink">
        <UploadCloud size={18} /> Bulk import coupons
      </p>
      <p className="mb-4 text-sm text-ink-soft">
        Fill in the rows below and click Import. Use the <strong>+</strong> button to add more rows. Title, brand, category, and code are required.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-line text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="pb-2 pr-2 font-semibold">Title</th>
              <th className="pb-2 pr-2 font-semibold">Brand</th>
              <th className="pb-2 pr-2 font-semibold">Category</th>
              <th className="pb-2 pr-2 font-semibold">Code</th>
              <th className="pb-2 pr-2 font-semibold">Type</th>
              <th className="pb-2 pr-2 font-semibold">Price ₹</th>
              <th className="pb-2 pr-2 font-semibold">Qty</th>
              <th className="pb-2 pr-2 font-semibold">Expiry</th>
              <th className="pb-2 font-semibold">Desc.</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((row) => (
                <motion.tr
                  key={row.id}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-b border-line/40"
                >
                  <td className="py-1.5 pr-2">
                    <input value={row.title} onChange={(e) => updateRow(row.id, 'title', e.target.value)} placeholder="Flat 20% off" className="input-field py-1.5 text-xs w-40" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <select value={row.brandId} onChange={(e) => updateRow(row.id, 'brandId', e.target.value)} className="input-field py-1.5 text-xs w-32">
                      <option value="">Select…</option>
                      {brands.map((b) => <option key={b.id} value={b.id}>{brandIcon(b.slug)} {b.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <select value={row.categoryId} onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)} className="input-field py-1.5 text-xs w-32">
                      <option value="">Select…</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={row.couponCode} onChange={(e) => updateRow(row.id, 'couponCode', e.target.value)} placeholder="CODE123" className="input-field py-1.5 font-mono text-xs w-28" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <select value={row.type} onChange={(e) => updateRow(row.id, 'type', e.target.value)} className="input-field py-1.5 text-xs w-24">
                      {COUPON_TYPES.map((t) => <option key={t} value={t}>{COUPON_TYPE_LABELS[t]}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" disabled={row.type === 'FREE'} value={row.type === 'FREE' ? 0 : row.sellingPrice} onChange={(e) => updateRow(row.id, 'sellingPrice', Number(e.target.value))} className="input-field py-1.5 font-mono text-xs w-16 disabled:opacity-40" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="number" value={row.availableQuantity} onChange={(e) => updateRow(row.id, 'availableQuantity', Number(e.target.value))} className="input-field py-1.5 font-mono text-xs w-16" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input type="date" value={row.expiryDate} onChange={(e) => updateRow(row.id, 'expiryDate', e.target.value)} className="input-field py-1.5 text-xs w-32" />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input value={row.description} onChange={(e) => updateRow(row.id, 'description', e.target.value)} placeholder="Optional…" className="input-field py-1.5 text-xs w-36" />
                  </td>
                  <td className="py-1.5">
                    <button onClick={() => removeRow(row.id)} className="btn-ghost p-1 text-stamp-dark">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={addRow} className="btn-secondary text-sm">
          <Plus size={14} /> Add row
        </button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isLoading} className="btn-primary text-sm">
          {isLoading ? <Spinner className="h-4 w-4" /> : <UploadCloud size={14} />}
          Import {rows.length} coupon{rows.length > 1 ? 's' : ''}
        </motion.button>
      </div>

      {result && (
        <div className="mt-4 space-y-1.5">
          <p className="text-sm font-semibold text-ink">{result.data.succeededCount} created, {result.data.failedCount} failed</p>
          {result.data.created.map((c) => (
            <p key={c.id} className="flex items-center gap-2 text-sm text-brand-dark"><CheckCircle2 size={14} /> {c.title}</p>
          ))}
          {result.data.failures.map((f) => (
            <p key={f.index} className="flex items-center gap-2 text-sm text-stamp-dark"><XCircle size={14} /> Row {f.index + 1}: {f.reason}</p>
          ))}
        </div>
      )}
    </div>
  );
}
