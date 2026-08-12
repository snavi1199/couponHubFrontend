import { baseApi } from './baseApi';
import type { ApiResponse, NotificationResponse, PageResponse } from '@/lib/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<PageResponse<NotificationResponse>>, { page?: number; size?: number } | void>({
      query: (params) => {
        const search = new URLSearchParams();
        if (params?.page !== undefined) search.set('page', String(params.page));
        if (params?.size !== undefined) search.set('size', String(params.size));
        const qs = search.toString();
        return `/notifications${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.data.content.map((n) => ({ type: 'Notification' as const, id: n.id })), { type: 'Notification' as const, id: 'LIST' }]
          : [{ type: 'Notification' as const, id: 'LIST' }],
    }),

    getUnreadCount: builder.query<ApiResponse<number>, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),

    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
