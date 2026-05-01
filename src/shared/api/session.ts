export type SessionData = {
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  username?: string;
  email?: string;
  roles?: string[];
};

const SESSION_STORAGE_KEY = "fcs.session";

export function getSession(): SessionData | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionData;
    if (!parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: SessionData): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function getRoles(): string[] {
  return getSession()?.roles ?? [];
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
