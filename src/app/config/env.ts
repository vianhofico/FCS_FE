function requiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export const env = {
  apiBaseUrl: requiredEnv("VITE_API_BASE_URL"),
} as const;
