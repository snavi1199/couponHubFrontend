import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { tokenStorage } from '@/lib/tokenStorage';
import type { UserResponse, AuthResponse, Role } from '@/lib/types';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  // Optimistic: if we have a stored access token, assume authenticated until proven
  // otherwise (a 401 from any query will clear this via the reauth flow / App bootstrap).
  isAuthenticated: Boolean(tokenStorage.getAccessToken()),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionEstablished: (state, action: PayloadAction<AuthResponse>) => {
      tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken);
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    sessionCleared: (state) => {
      tokenStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
    },
    /**
     * Called once on app bootstrap when tokens exist in storage but Redux has no user
     * object yet (e.g. after a page reload). Fills in only what the JWT actually carries
     * (id, email, roles) — Phase 1 has no GET /users/me endpoint to fetch the rest, so
     * profile fields like fullName/avatar/stats stay blank until one is added.
     */
    hydratedFromToken: (state, action: PayloadAction<{ id: string; email: string; roles: Role[] }>) => {
      state.user = {
        id: action.payload.id,
        email: action.payload.email,
        fullName: action.payload.email.split('@')[0],
        username: action.payload.email.split('@')[0],
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
    /** Replaces the (possibly minimal, JWT-derived) user with the real profile from GET /users/me. */
    profileLoaded: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
});

export const { sessionEstablished, sessionCleared, hydratedFromToken, profileLoaded } = authSlice.actions;
export default authSlice.reducer;
