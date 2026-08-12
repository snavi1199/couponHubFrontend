import { baseApi } from './baseApi';
import type { ApiResponse, CategoryResponse } from '@/lib/types';

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<CategoryResponse[]>, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<ApiResponse<CategoryResponse>, { name: string; iconUrl?: string; parentId?: string }>({
      query: ({ name, iconUrl, parentId }) => {
        const params = new URLSearchParams({ name });
        if (iconUrl) params.set('iconUrl', iconUrl);
        if (parentId) params.set('parentId', parentId);
        return { url: `/categories?${params.toString()}`, method: 'POST' };
      },
      invalidatesTags: ['Category'],
    }),
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation } = categoryApi;
