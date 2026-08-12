import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCouponByIdQuery, useUpdateCouponMutation } from '@/api/couponApi';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import type { ApiErrorShape, CouponUpdatePayload } from '@/lib/types';

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading: loadingCoupon } = useGetCouponByIdQuery(id!, { skip: !id });
  const [updateCoupon, { isLoading, error }] = useUpdateCouponMutation();
  const { register, handleSubmit, reset } = useForm<CouponUpdatePayload>();

  useEffect(() => {
    if (data) {
      reset({
        title: data.data.title,
        description: data.data.description,
        expiryDate: data.data.expiryDate,
        sellingPrice: data.data.sellingPrice,
        negotiableMinPrice: data.data.negotiableMinPrice,
        availableQuantity: data.data.availableQuantity,
        termsConditions: data.data.termsConditions,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: CouponUpdatePayload) => {
    await updateCoupon({ id: id!, body: values }).unwrap();
    navigate(`/coupons/${id}`);
  };

  const apiError = (error as { data?: ApiErrorShape })?.data?.message;

  if (loadingCoupon) return <div className="flex justify-center py-24"><Spinner className="h-6 w-6 text-brand" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-display text-2xl text-ink">Edit coupon</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="ticket-card space-y-5 p-6 sm:p-8">
        <FormField label="Title" htmlFor="title">
          <input id="title" className="input-field" {...register('title')} />
        </FormField>
        <FormField label="Description" htmlFor="description">
          <textarea id="description" className="input-field min-h-24" {...register('description')} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Selling price (₹)" htmlFor="sellingPrice">
            <input id="sellingPrice" type="number" step="0.01" className="input-field font-mono" {...register('sellingPrice', { valueAsNumber: true })} />
          </FormField>
          <FormField label="Available quantity" htmlFor="availableQuantity">
            <input id="availableQuantity" type="number" className="input-field font-mono" {...register('availableQuantity', { valueAsNumber: true })} />
          </FormField>
        </div>
        <FormField label="Negotiable min. price (₹)" htmlFor="negotiableMinPrice">
          <input id="negotiableMinPrice" type="number" step="0.01" className="input-field font-mono" {...register('negotiableMinPrice', { valueAsNumber: true })} />
        </FormField>
        <FormField label="Expiry date" htmlFor="expiryDate">
          <input id="expiryDate" type="date" className="input-field" {...register('expiryDate')} />
        </FormField>
        <FormField label="Terms & conditions" htmlFor="termsConditions">
          <textarea id="termsConditions" className="input-field min-h-20" {...register('termsConditions')} />
        </FormField>

        {apiError && (
          <div className="rounded-lg bg-stamp-light px-3 py-2 text-sm font-medium text-stamp-dark" role="alert">{apiError}</div>
        )}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? <Spinner className="h-4 w-4" /> : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
