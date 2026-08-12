import { baseApi } from './baseApi';
import type { ApiResponse, UserResponse } from '@/lib/types';

interface ProfileUpdatePayload {
  fullName?: string;
  location?: string;
  bio?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<ApiResponse<UserResponse>, void>({
      query: () => '/users/me',
      providesTags: ['CurrentUser'],
    }),
    updateCurrentUser: builder.mutation<ApiResponse<UserResponse>, ProfileUpdatePayload>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['CurrentUser'],
    }),
    getUserById: builder.query<ApiResponse<UserResponse>, string>({
      query: (id) => `/users/${id}`,
    }),
  }),
});

export const { useGetCurrentUserQuery, useUpdateCurrentUserMutation, useGetUserByIdQuery } = userApi;
