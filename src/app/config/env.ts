function requiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl && typeof configuredUrl === "string") {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }

  return requiredEnv("VITE_API_BASE_URL");
}

function getWsBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_WS_BASE_URL;

  if (configuredUrl && typeof configuredUrl === "string") {
    return configuredUrl;
  }

  if (import.meta.env.DEV) {
    return "ws://localhost:8080/ws";
  }

  return requiredEnv("VITE_WS_BASE_URL");
}

const apiBaseUrl = getApiBaseUrl();

export const env = {
  apiBaseUrl,
  wsBaseUrl: getWsBaseUrl(),
  googleOAuthUrl: `${apiBaseUrl}/oauth2/authorization/google`,
} as const;
