import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '@/lib/tokenStorage';
import type { UserResponse, AuthResponse, Role } from '@/lib/types';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
}

const hasStoredSession =
  Boolean(tokenStorage.getAccessToken()) ||
  Boolean(tokenStorage.getRefreshToken());

const initialState: AuthState = {
  user: null,
  isAuthenticated: hasStoredSession,
};

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    sessionEstablished: (
      state,
      action: PayloadAction<AuthResponse>
    ) => {
      tokenStorage.setTokens(
        action.payload.accessToken,
        action.payload.refreshToken
      );

      state.user = action.payload.user;
      state.isAuthenticated = true;
    },

    sessionCleared: (state) => {
      tokenStorage.clear();

      state.user = null;
      state.isAuthenticated = false;
    },

    /**
     * Called during application startup when tokens exist in storage.
     *
     * The JWT provides enough information to render authenticated
     * routes/header immediately while GET /users/me loads the complete
     * profile.
     */
    hydratedFromToken: (
      state,
      action: PayloadAction<{
        id: string;
        email: string;
        roles: Role[];
      }>
    ) => {
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        fullName: action.payload.email
          ? action.payload.email.split('@')[0]
          : '',
        username: action.payload.email
          ? action.payload.email.split('@')[0]
          : '',
        roles: action.payload.roles,

        emailVerified: false,
        phoneVerified: false,
        premium: false,

        averageRating: 0,
        reviewCount: 0,
        followersCount: 0,
        followingCount: 0,

        couponsUploadedCount: 0,
        couponsSoldCount: 0,
        couponsPurchasedCount: 0,

        createdAt: new Date().toISOString(),
      };

      state.isAuthenticated = true;
    },

    /**
     * Replace the temporary JWT-derived user with the real profile.
     */
    profileLoaded: (
      state,
      action: PayloadAction<UserResponse>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const {
  sessionEstablished,
  sessionCleared,
  hydratedFromToken,
  profileLoaded,
} = authSlice.actions;

export default authSlice.reducer;