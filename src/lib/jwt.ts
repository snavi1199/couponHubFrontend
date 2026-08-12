/**
 * Lightweight JWT payload decode (no signature verification — this runs client-side
 * purely to rehydrate UI state after a reload; the backend independently verifies
 * signatures on every request). Used because Phase 1 has no GET /users/me endpoint yet.
 */
export interface DecodedAccessToken {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
}

export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
