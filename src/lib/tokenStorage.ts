// Centralized token persistence. Access token is kept in Redux memory + mirrored here
// for page-reload rehydration; refresh token lives only here (localStorage) since it's
// opaque and only ever sent to /auth/refresh.

const ACCESS_TOKEN_KEY = 'couponhub.accessToken';
const REFRESH_TOKEN_KEY = 'couponhub.refreshToken';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  setAccessToken: (accessToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
