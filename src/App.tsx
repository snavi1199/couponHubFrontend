import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from '@/app/store';
import { router } from '@/routes/router';
import { tokenStorage } from '@/lib/tokenStorage';
import { decodeAccessToken } from '@/lib/jwt';
import { hydratedFromToken, profileLoaded, sessionCleared } from '@/features/auth/authSlice';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { useGetCurrentUserQuery } from '@/api/userApi';
import { ToastProvider } from '@/components/ui/toast';
import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { PromptProvider } from '@/components/ui/PromptDialog';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { Role } from '@/lib/types';

/**
 * On load: if tokens exist, immediately decode the JWT to populate a minimal user object
 * (id/email/roles — enough for route guards and the header to render correctly with no
 * flicker), then fetch the real profile from GET /users/me and replace it once it arrives.
 */
function SessionBootstrap() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    // No tokens at all — genuinely logged out
    if (!accessToken && !refreshToken) return;

    if (accessToken) {
      const decoded = decodeAccessToken(accessToken);

      if (decoded) {
        const isExpired = decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          // Token is valid — hydrate immediately from it
          dispatch(hydratedFromToken({
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles as Role[],
          }));
          return;
        }

        // Access token expired — if we have a refresh token, stay authenticated
        // optimistically and let the first API call (useGetCurrentUserQuery below, or
        // any RTK Query call) trigger the silent refresh via baseQueryWithReauth.
        // Do NOT call sessionCleared() here — that would log the user out before the
        // refresh has a chance to run.
        if (refreshToken) {
          dispatch(hydratedFromToken({
            id: decoded.sub,
            email: decoded.email,
            roles: decoded.roles as Role[],
          }));
          return;
        }
      }
    }

    // Access token missing or undecodable, but we have a refresh token —
    // mark authenticated so useGetCurrentUserQuery fires and triggers a refresh.
    if (refreshToken) {
      dispatch(hydratedFromToken({
        id: 'pending',
        email: '',
        roles: [],
      }));
      return;
    }

    // Nothing usable
    dispatch(sessionCleared());
  }, [dispatch]);

  const { data, isSuccess, isError } = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(profileLoaded(data.data));
    }
  }, [isSuccess, data, dispatch]);

  useEffect(() => {
    // baseQueryWithReauth already tried a refresh before surfacing this error, so a
    // failure here means the session is genuinely dead — log the user out cleanly.
    if (isError) {
      dispatch(sessionCleared());
    }
  }, [isError, dispatch]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ToastProvider>
          <ConfirmProvider>
            <PromptProvider>
              <SessionBootstrap />
              <RouterProvider router={router} />
            </PromptProvider>
          </ConfirmProvider>
        </ToastProvider>
      </Provider>
    </ErrorBoundary>
  );
}
