import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@/api/baseApi';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Enables refetchOnFocus/refetchOnReconnect (configured in baseApi) by wiring up the browser
// visibilitychange/online listeners RTK Query needs to act on. Without this, a query result sits
// stale until its component unmounts and remounts — e.g. a seller's request list wouldn't notice
// a new buyer request until they navigated away and back.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
