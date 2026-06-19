// Thin wrapper over the same localStorage keys used by AuthContext.
// Use AuthContext (useAuth()) in components; these helpers are for non-React contexts (e.g. http interceptors).

const ACCESS_TOKEN_KEY = "fcs_access_token";
const REFRESH_TOKEN_KEY = "fcs_refresh_token";
const USER_PROFILE_KEY = "fcs_user_profile";

export type SessionData = {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
  email?: string;
  roles?: string[];
};

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRoles(): string[] {
  const raw = localStorage.getItem(USER_PROFILE_KEY);
  if (!raw) return [];
  try {
    const profile = JSON.parse(raw) as { roles?: string[] };
    return profile.roles ?? [];
  } catch {
    return [];
  }
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);
}
