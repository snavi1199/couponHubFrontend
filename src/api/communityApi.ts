import { baseApi } from './baseApi';
import type { ApiResponse, PageResponse } from '@/lib/types';

export interface ChatMessageResponse {
  id: string;
  authorName: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  text: string;
}

export const communityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunityMessages: builder.query<ApiResponse<PageResponse<ChatMessageResponse>>, { page?: number; size?: number } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set('page', String(params.page));
        if (params?.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/community/messages${qs ? `?${qs}` : ''}`;
      },
      providesTags: [{ type: 'CommunityMessage' as const, id: 'LIST' }],
    }),

    postCommunityMessage: builder.mutation<ApiResponse<ChatMessageResponse>, ChatMessageRequest>({
      query: (body) => ({ url: '/community/messages', method: 'POST', body }),
      // Optimistic update would be ideal here but requires knowing the author details,
      // so we just invalidate and let the list refetch (fast since server is local/nearby).
      invalidatesTags: [{ type: 'CommunityMessage' as const, id: 'LIST' }],
    }),
  }),
});

export const { useGetCommunityMessagesQuery, usePostCommunityMessageMutation } = communityApi;
