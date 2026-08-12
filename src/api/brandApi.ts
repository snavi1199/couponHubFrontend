import { baseApi } from './baseApi';
import type { ApiResponse, BrandResponse } from '@/lib/types';

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<ApiResponse<BrandResponse[]>, void>({
      query: () => '/brands',
      providesTags: ['Brand'],
    }),
    getFeaturedBrands: builder.query<ApiResponse<BrandResponse[]>, void>({
      query: () => '/brands/featured',
      providesTags: ['Brand'],
    }),
    createBrand: builder.mutation<ApiResponse<BrandResponse>, { name: string; logoUrl?: string; websiteUrl?: string }>({
      query: ({ name, logoUrl, websiteUrl }) => {
        const params = new URLSearchParams({ name });
        if (logoUrl) params.set('logoUrl', logoUrl);
        if (websiteUrl) params.set('websiteUrl', websiteUrl);
        return { url: `/brands?${params.toString()}`, method: 'POST' };
      },
      invalidatesTags: ['Brand'],
    }),
  }),
});

export const { useGetBrandsQuery, useGetFeaturedBrandsQuery, useCreateBrandMutation } = brandApi;
