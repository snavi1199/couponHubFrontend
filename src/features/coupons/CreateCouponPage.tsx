import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { couponCreateSchema, type CouponCreateFormValues } from '@/lib/validators';
import { useCreateCouponMutation } from '@/api/couponApi';
import { useGetCategoriesQuery } from '@/api/categoryApi';
import { BrandPicker } from './components/BrandPicker';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/toast';
import { COUPON_TYPE_LABELS, TICKET_CATEGORY_LABELS, formatCurrency } from '@/lib/format';
import type { ApiErrorShape, CouponType, TicketCategory } from '@/lib/types';

const TYPE_OPTIONS = Object.keys(COUPON_TYPE_LABELS) as CouponType[];
const TICKET_CATEGORY_OPTIONS = Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[];
const PLATFORM_FEE_PERCENT = 5; // mirrors backend app.platform.fee-percentage default; display only

export default function CreateCouponPage() {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CouponCreateFormValues>({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: { type: 'PAID', availableQuantity: 1, sellingPrice: 0 },
  });
  const [createCoupon, { isLoading, error }] = useCreateCouponMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const navigate = useNavigate();
  const toast = useToast();

  const selectedType = watch('type');
  const sellingPrice = watch('sellingPrice') || 0;
  const isTicket = selectedType === 'EVENT_TICKET';
  const isFree = selectedType === 'FREE';
  const feeApplies = !isFree && sellingPrice > 0;
  const feeAmount = feeApplies ? Math.round(sellingPrice * (PLATFORM_FEE_PERCENT / 100) * 100) / 100 : 0;

  // FREE coupons don't carry a price — force it to 0 and clear price-only fields whenever
  // the type switches to FREE, so a stale value from a previous type never gets submitted.
  useEffect(() => {
    if (isFree) {
      setValue('sellingPrice', 0);
      setValue('negotiableMinPrice', undefined);
    }
  }, [isFree, setValue]);

  const onSubmit = async (values: CouponCreateFormValues) => {
    try {
      const result = await createCoupon({
        ...values,
        description: values.description || undefined,
        expiryDate: values.expiryDate || undefined,
        termsConditions: values.termsConditions || undefined,
        venueName: values.venueName || undefined,
        venueCity: values.venueCity || undefined,
        eventDateTime: values.eventDateTime || undefined,
        seatDetails: values.seatDetails || undefined,
      }).unwrap();
      toast.show('Coupon listed — it\'s live in Browse Deals now!', 'success');
      navigate(`/coupons/${result.data.id}`);
    } catch {
      toast.show('Could not create coupon — check the errors below', 'error');
    }
  };

  const apiError = (error as { data?: ApiErrorShape })?.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 font-display text-2xl text-ink">List a coupon</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Your listing goes live in <strong>Browse Deals</strong> immediately after you submit it.
      </p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="ticket-card space-y-5 p-6 sm:p-8"
      >
        <FormField label="Title" htmlFor="title" error={errors.title?.message}>
          <input id="title" className="input-field" placeholder="Flat 20% off on Amazon Electronics, or MI vs CSK — North Stand" {...register('title')} />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Brand" htmlFor="brandId" error={errors.brandId?.message}>
            <input type="hidden" {...register('brandId')} />
            <BrandPicker value={watch('brandId')} onChange={(id) => setValue('brandId', id, { shouldValidate: true })} error={errors.brandId?.message} />
          </FormField>
          <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
            <select id="categoryId" className="input-field" {...register('categoryId')}>
              <option value="">Select category</option>
              {categoriesData?.data.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <textarea id="description" className="input-field min-h-24" {...register('description')} />
        </FormField>

        <FormField label="Coupon / ticket code" htmlFor="couponCode" error={errors.couponCode?.message}>
          <input id="couponCode" className="input-field font-mono" placeholder="SAVE20ELEC or e-ticket/PNR reference" {...register('couponCode')} />
        </FormField>
        <p className="-mt-3 flex items-start gap-1.5 text-xs text-ink-soft">
          <Lightbulb size={13} className="mt-0.5 shrink-0 text-stamp" />
          Please double-check this code before submitting — buyers will click "Redeem Code" to copy it exactly as typed here.
        </p>

        <FormField label="Type" htmlFor="type" error={errors.type?.message}>
          <select id="type" className="input-field" {...register('type')}>
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{COUPON_TYPE_LABELS[t]}</option>)}
          </select>
        </FormField>

        <AnimatePresence>
          {isTicket && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 overflow-hidden rounded-xl border-2 border-dashed border-brand bg-brand-light/30 p-4"
            >
              <p className="text-sm font-semibold text-brand-dark">🎟️ Event ticket details</p>
              <FormField label="Event type" htmlFor="ticketCategory" error={errors.ticketCategory?.message}>
                <select id="ticketCategory" className="input-field" {...register('ticketCategory')}>
                  <option value="">Select event type</option>
                  {TICKET_CATEGORY_OPTIONS.map((t) => <option key={t} value={t}>{TICKET_CATEGORY_LABELS[t]}</option>)}
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Venue name" htmlFor="venueName" error={errors.venueName?.message}>
                  <input id="venueName" className="input-field" placeholder="Wankhede Stadium / PVR Phoenix" {...register('venueName')} />
                </FormField>
                <FormField label="City" htmlFor="venueCity" error={errors.venueCity?.message}>
                  <input id="venueCity" className="input-field" placeholder="Mumbai" {...register('venueCity')} />
                </FormField>
              </div>
              <FormField label="Event date & time" htmlFor="eventDateTime" error={errors.eventDateTime?.message}>
                <input id="eventDateTime" type="datetime-local" className="input-field" {...register('eventDateTime')} />
              </FormField>
              <FormField label="Seat / section details" htmlFor="seatDetails" error={errors.seatDetails?.message}>
                <input id="seatDetails" className="input-field" placeholder="Section A, Row 5, Seats 12-13" {...register('seatDetails')} />
              </FormField>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isFree ? (
            <motion.div
              key="free-note"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-brand-light/40 px-4 py-3 text-sm text-brand-dark"
            >
              🎁 FREE coupons don't need a price — this code will be visible and copyable by anyone, no login required.
            </motion.div>
          ) : (
            <motion.div key="priced-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Original value (₹)" htmlFor="originalValue" error={errors.originalValue?.message}>
                  <input id="originalValue" type="number" step="0.01" className="input-field font-mono" {...register('originalValue')} />
                </FormField>
                <FormField label="Discount %" htmlFor="discountPercentage" error={errors.discountPercentage?.message}>
                  <input id="discountPercentage" type="number" step="0.01" className="input-field font-mono" {...register('discountPercentage')} />
                </FormField>
              </div>

              <FormField label="Selling price (₹)" htmlFor="sellingPrice" error={errors.sellingPrice?.message}>
                <input id="sellingPrice" type="number" step="0.01" className="input-field font-mono" {...register('sellingPrice')} />
              </FormField>

              <AnimatePresence>
                {feeApplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-xl bg-stamp-light/60 p-4 font-mono text-sm"
                  >
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-stamp-dark">Payout preview</p>
                    <div className="flex justify-between"><span>Buyer pays</span><span>{formatCurrency(sellingPrice)}</span></div>
                    <div className="flex justify-between text-stamp-dark"><span>Platform fee ({PLATFORM_FEE_PERCENT}%)</span><span>− {formatCurrency(feeAmount)}</span></div>
                    <div className="mt-1 flex justify-between border-t border-dashed border-stamp-dark/30 pt-1 font-semibold">
                      <span>You receive</span><span>{formatCurrency(sellingPrice - feeAmount)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedType === 'NEGOTIABLE' && (
                <FormField label="Minimum negotiable price (₹)" htmlFor="negotiableMinPrice" error={errors.negotiableMinPrice?.message}>
                  <input id="negotiableMinPrice" type="number" step="0.01" className="input-field font-mono" {...register('negotiableMinPrice')} />
                </FormField>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <FormField label="Available quantity" htmlFor="availableQuantity" error={errors.availableQuantity?.message}>
          <input id="availableQuantity" type="number" className="input-field font-mono" {...register('availableQuantity')} />
        </FormField>

        {!isTicket && (
          <FormField label="Expiry date" htmlFor="expiryDate" error={errors.expiryDate?.message}>
            <input id="expiryDate" type="date" className="input-field" {...register('expiryDate')} />
          </FormField>
        )}

        <FormField label="Terms & conditions" htmlFor="termsConditions" error={errors.termsConditions?.message}>
          <textarea id="termsConditions" className="input-field min-h-20" {...register('termsConditions')} />
        </FormField>

        {apiError && (
          <div className="rounded-lg bg-stamp-light px-3 py-2 text-sm font-medium text-stamp-dark" role="alert">
            {apiError.message}
            {apiError.fieldErrors && (
              <ul className="mt-1 list-disc pl-4">
                {apiError.fieldErrors.map((fe) => <li key={fe.field}>{fe.field}: {fe.message}</li>)}
              </ul>
            )}
          </div>
        )}

        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <Spinner className="h-4 w-4" /> : 'List this coupon'}
        </motion.button>
      </motion.form>
    </div>
  );
}
