import { baseApi } from './baseApi';
import type {
  ApiResponse,
  CouponResponse,
  CouponCreatePayload,
  CouponUpdatePayload,
  CouponSearchParams,
  CouponVoteType,
  PageResponse,
  BulkCouponCreateResponse,
} from '@/lib/types';

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchCoupons: builder.query<ApiResponse<PageResponse<CouponResponse>>, CouponSearchParams>({
      query: (params) => `/coupons${toQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map((c) => ({ type: 'Coupon' as const, id: c.id })),
              { type: 'CouponList' as const, id: 'LIST' },
            ]
          : [{ type: 'CouponList' as const, id: 'LIST' }],
    }),

    getCouponById: builder.query<ApiResponse<CouponResponse>, string>({
      query: (id) => `/coupons/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Coupon', id }],
    }),

    getSellerCoupons: builder.query<ApiResponse<PageResponse<CouponResponse>>, { sellerId: string; page?: number; size?: number }>({
      query: ({ sellerId, ...params }) => `/coupons/seller/${sellerId}${toQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map((c) => ({ type: 'Coupon' as const, id: c.id })),
              { type: 'CouponList' as const, id: 'SELLER' },
            ]
          : [{ type: 'CouponList' as const, id: 'SELLER' }],
    }),

    createCoupon: builder.mutation<ApiResponse<CouponResponse>, CouponCreatePayload>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: [{ type: 'CouponList', id: 'LIST' }, { type: 'CouponList', id: 'SELLER' }],
    }),

    updateCoupon: builder.mutation<ApiResponse<CouponResponse>, { id: string; body: CouponUpdatePayload }>({
      query: ({ id, body }) => ({ url: `/coupons/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Coupon', id },
        { type: 'CouponList', id: 'LIST' },
        { type: 'CouponList', id: 'SELLER' },
      ],
    }),

    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Coupon', id },
        { type: 'CouponList', id: 'LIST' },
        { type: 'CouponList', id: 'SELLER' },
      ],
    }),

    voteCoupon: builder.mutation<void, { id: string; voteType: CouponVoteType }>({
      query: ({ id, voteType }) => ({ url: `/coupons/${id}/vote?voteType=${voteType}`, method: 'POST' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Coupon', id }],
    }),

    copyCouponCode: builder.mutation<void, string>({
      query: (id) => ({ url: `/coupons/${id}/copy`, method: 'POST' }),
    }),

    approveCoupon: builder.mutation<void, string>({
      query: (id) => ({ url: `/coupons/${id}/approve`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Coupon', id }, { type: 'CouponList', id: 'LIST' }],
    }),

    rejectCoupon: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/coupons/${id}/reject?reason=${encodeURIComponent(reason)}`, method: 'POST' }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Coupon', id }, { type: 'CouponList', id: 'LIST' }],
    }),

    markCouponSoldOut: builder.mutation<ApiResponse<CouponResponse>, string>({
      query: (id) => ({ url: `/coupons/${id}/mark-sold-out`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Coupon', id }, { type: 'CouponList', id: 'LIST' }, { type: 'CouponList', id: 'SELLER' },
      ],
    }),

    createCouponsBulk: builder.mutation<ApiResponse<BulkCouponCreateResponse>, CouponCreatePayload[]>({
      query: (body) => ({ url: '/coupons/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: 'CouponList', id: 'LIST' }, { type: 'CouponList', id: 'SELLER' }],
    }),

    getAllCouponsForAdmin: builder.query<ApiResponse<PageResponse<CouponResponse>>, { keyword?: string; type?: string; status?: string; page?: number; size?: number }>({
      query: (params) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') search.set(k, String(v)); });
        const qs = search.toString();
        return `/coupons/admin/all${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'CouponList', id: 'ADMIN' }],
    }),

    adminMarkExpired: builder.mutation<ApiResponse<CouponResponse>, string>({
      query: (id) => ({ url: `/coupons/admin/${id}/mark-expired`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Coupon', id },
        { type: 'CouponList', id: 'ADMIN' },
        { type: 'CouponList', id: 'LIST' },
        { type: 'CouponList', id: 'SELLER' },
      ],
    }),

    adminAdjustQuantity: builder.mutation<ApiResponse<CouponResponse>, { id: string; availableQuantity: number }>({
      query: ({ id, availableQuantity }) => ({ url: `/coupons/admin/${id}/quantity?availableQuantity=${availableQuantity}`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Coupon', id },
        { type: 'CouponList', id: 'ADMIN' },
        { type: 'CouponList', id: 'LIST' },
        { type: 'CouponList', id: 'SELLER' },
      ],
    }),

    relistCoupon: builder.mutation<ApiResponse<CouponResponse>, string>({
      query: (id) => ({ url: `/coupons/${id}/relist`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Coupon', id }, { type: 'CouponList', id: 'LIST' }, { type: 'CouponList', id: 'SELLER' },
      ],
    }),
  }),
});

export const {
  useSearchCouponsQuery,
  useGetCouponByIdQuery,
  useGetSellerCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useVoteCouponMutation,
  useCopyCouponCodeMutation,
  useApproveCouponMutation,
  useRejectCouponMutation,
  useMarkCouponSoldOutMutation,
  useRelistCouponMutation,
  useCreateCouponsBulkMutation,
  useGetAllCouponsForAdminQuery,
  useAdminMarkExpiredMutation,
  useAdminAdjustQuantityMutation,
} = couponApi;

export const usePrefetchCoupons = () => couponApi.usePrefetch('searchCoupons');
