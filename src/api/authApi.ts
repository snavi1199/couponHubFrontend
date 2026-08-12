import { baseApi } from './baseApi';
import type { ApiResponse, AuthResponse } from '@/lib/types';

interface RegisterPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginPayload {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
  deviceName?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterPayload>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginPayload>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body: { ...body, deviceName: body.deviceName ?? navigator.userAgent.slice(0, 60) },
      }),
      invalidatesTags: ['CurrentUser'],
    }),
    logout: builder.mutation<void, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    logoutAllDevices: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST' }),
    }),
    sendOtp: builder.mutation<ApiResponse<void>, { email: string }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<ApiResponse<boolean>, { email: string; code: string }>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLogoutAllDevicesMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} = authApi;
