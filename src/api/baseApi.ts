import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { createApi } from '@reduxjs/toolkit/query/react';

import { tokenStorage } from '@/lib/tokenStorage';

import type {
  AuthResponse,
  ApiResponse,
} from '@/lib/types';

import { sessionCleared } from '@/features/auth/authSlice';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:8080/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders: (headers) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set(
        'Authorization',
        `Bearer ${accessToken}`
      );
    }

    headers.set(
      'Content-Type',
      'application/json'
    );

    return headers;
  },
});

/*
 * Prevent multiple simultaneous API requests from
 * triggering multiple refresh requests.
 */
let refreshPromise: Promise<boolean> | null = null;

const performTokenRefresh = async (
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2]
): Promise<boolean> => {
  const refreshToken =
    tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
      body: {
        refreshToken,
      },
    },
    api,
    extraOptions
  );

  /*
   * Refresh endpoint failed.
   *
   * At this point the session is genuinely invalid.
   */
  if (refreshResult.error) {
    return false;
  }

  if (!refreshResult.data) {
    return false;
  }

  const payload =
    refreshResult.data as ApiResponse<AuthResponse>;

  const newAccessToken =
    payload.data?.accessToken;

  const newRefreshToken =
    payload.data?.refreshToken;

  if (!newAccessToken) {
    return false;
  }

  /*
   * Some backends rotate refresh tokens.
   *
   * If a new refresh token is returned, store it.
   * Otherwise preserve the existing one.
   */
  if (newRefreshToken) {
    tokenStorage.setTokens(
      newAccessToken,
      newRefreshToken
    );
  } else {
    tokenStorage.setAccessToken(
      newAccessToken
    );
  }

  return true;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (
  args,
  api,
  extraOptions
) => {
  /*
   * First attempt using the current access token.
   */
  let result = await rawBaseQuery(
    args,
    api,
    extraOptions
  );

  /*
   * Only authentication failures should trigger
   * the refresh flow.
   */
  const shouldRefresh =
    result.error &&
    (
      result.error.status === 401 ||
      result.error.status === 403
    );

  if (!shouldRefresh) {
    return result;
  }

  /*
   * Do we have a refresh token?
   */
  if (!tokenStorage.getRefreshToken()) {
    api.dispatch(sessionCleared());

    return result;
  }

  /*
   * If another request is already refreshing,
   * wait for that same refresh request.
   */
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh(
      api,
      extraOptions
    ).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed =
    await refreshPromise;

  /*
   * Refresh failed.
   *
   * Now, and only now, clear the session.
   */
  if (!refreshed) {
    api.dispatch(sessionCleared());

    return result;
  }

  /*
   * Refresh succeeded.
   *
   * rawBaseQuery.prepareHeaders() will now pick up
   * the NEW access token from tokenStorage.
   */
  result = await rawBaseQuery(
    args,
    api,
    extraOptions
  );

  /*
   * If the retry is STILL unauthorized, don't retry
   * infinitely. The new token itself is not working.
   */
  if (
    result.error &&
    (
      result.error.status === 401 ||
      result.error.status === 403
    )
  ) {
    api.dispatch(sessionCleared());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    'Coupon',
    'CouponList',
    'Category',
    'Brand',
    'CurrentUser',
    'CouponRequest',
    'Notification',
    'CommunityMessage',
  ],

  keepUnusedDataFor: 300,

  refetchOnFocus: true,
  refetchOnReconnect: true,

  endpoints: () => ({}),
});