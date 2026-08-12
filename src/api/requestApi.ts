import { baseApi } from './baseApi';
import type { ApiResponse, CouponRequestResponse, CouponRequestCreatePayload, PageResponse } from '@/lib/types';

export const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCouponRequest: builder.mutation<ApiResponse<CouponRequestResponse>, { couponId: string; body: CouponRequestCreatePayload }>({
      query: ({ couponId, body }) => ({ url: `/coupons/${couponId}/requests`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { couponId }) => [{ type: 'Coupon', id: couponId }, { type: 'CouponRequest', id: 'MINE' }],
    }),

    getRequestsForCoupon: builder.query<ApiResponse<PageResponse<CouponRequestResponse>>, { couponId: string; page?: number; size?: number }>({
      query: ({ couponId, ...params }) => {
        const search = new URLSearchParams();
        if (params.page !== undefined) search.set('page', String(params.page));
        if (params.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/coupons/${couponId}/requests${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.data.content.map((r) => ({ type: 'CouponRequest' as const, id: r.id })), { type: 'CouponRequest' as const, id: 'FOR_COUPON' }]
          : [{ type: 'CouponRequest' as const, id: 'FOR_COUPON' }],
    }),

    getMyRequests: builder.query<ApiResponse<PageResponse<CouponRequestResponse>>, { page?: number; size?: number } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set('page', String(params.page));
        if (params?.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/requests/mine${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'CouponRequest', id: 'MINE' }],
    }),

    getReceivedRequests: builder.query<ApiResponse<PageResponse<CouponRequestResponse>>, { page?: number; size?: number } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set('page', String(params.page));
        if (params?.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/requests/received${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'CouponRequest', id: 'RECEIVED' }],
    }),

    acceptCouponRequest: builder.mutation<ApiResponse<CouponRequestResponse>, string>({
      query: (id) => ({ url: `/requests/${id}/accept`, method: 'POST' }),
      invalidatesTags: (result) => [
        { type: 'CouponRequest', id: 'FOR_COUPON' },
        { type: 'CouponRequest', id: 'RECEIVED' },
        ...(result ? [{ type: 'Coupon' as const, id: result.data.couponId }] : []),
      ],
    }),

    rejectCouponRequest: builder.mutation<ApiResponse<CouponRequestResponse>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/requests/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'CouponRequest', id: 'FOR_COUPON' }, { type: 'CouponRequest', id: 'RECEIVED' }],
    }),

    getPendingPayments: builder.query<ApiResponse<PageResponse<CouponRequestResponse>>, { page?: number; size?: number } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set('page', String(params.page));
        if (params?.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/requests/pending-payments${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'CouponRequest', id: 'PENDING_PAYMENTS' }],
    }),

    markRequestPaid: builder.mutation<ApiResponse<CouponRequestResponse>, string>({
      query: (id) => ({ url: `/requests/${id}/mark-paid`, method: 'POST' }),
      invalidatesTags: (result) => [
        { type: 'CouponRequest', id: 'PENDING_PAYMENTS' },
        { type: 'CouponRequest', id: 'MINE' },
        { type: 'CouponRequest', id: 'RECEIVED' },
        ...(result ? [{ type: 'Coupon' as const, id: result.data.couponId }] : []),
      ],
    }),
  }),
});

export const {
  useCreateCouponRequestMutation,
  useGetRequestsForCouponQuery,
  useGetMyRequestsQuery,
  useGetReceivedRequestsQuery,
  useAcceptCouponRequestMutation,
  useRejectCouponRequestMutation,
  useGetPendingPaymentsQuery,
  useMarkRequestPaidMutation,
} = requestApi;
