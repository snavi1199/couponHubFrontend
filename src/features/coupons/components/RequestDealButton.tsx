import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquarePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCreateCouponRequestMutation } from '@/api/requestApi';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/Spinner';
import type { ApiErrorShape } from '@/lib/types';

interface FormValues {
  offeredPrice?: number;
  message?: string;
}

export function RequestDealButton({ couponId, sellingPrice }: { couponId: string; sellingPrice: number }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [createRequest, { isLoading, error }] = useCreateCouponRequestMutation();
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: { offeredPrice: sellingPrice } });
  const toast = useToast();

  const onSubmit = async (values: FormValues) => {
    try {
      await createRequest({ couponId, body: values }).unwrap();
      toast.show('Request sent to the seller', 'success');
      setSent(true);
      setOpen(false);
    } catch {
      toast.show('Could not send request', 'error');
    }
  };

  const apiError = (error as { data?: ApiErrorShape })?.data?.message;

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-brand-light/50 px-4 py-3 text-sm font-medium text-brand-dark">
        Request sent! You'll be notified when the seller responds.
      </motion.div>
    );
  }

  return (
    <div>
      {!open ? (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setOpen(true)} className="btn-primary w-full">
          <MessageSquarePlus size={16} /> Request this deal
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 overflow-hidden rounded-xl border-2 border-dashed border-brand bg-brand-light/30 p-4"
          >
            <div>
              <label className="label-text" htmlFor="offeredPrice">Your offer (₹)</label>
              <input id="offeredPrice" type="number" step="0.01" className="input-field font-mono" {...register('offeredPrice', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="label-text" htmlFor="message">Message to seller (optional)</label>
              <textarea id="message" className="input-field min-h-16" placeholder="Any details the seller should know…" {...register('message')} />
            </div>
            {apiError && <p className="error-text">{apiError}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={isLoading} className="btn-primary flex-1 text-sm">
                {isLoading ? <Spinner className="h-4 w-4" /> : 'Send request'}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
            </div>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}
