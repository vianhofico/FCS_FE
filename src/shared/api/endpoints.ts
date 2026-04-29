export const API_PREFIX = "/api/v1";

export const endpoints = {
  health: `${API_PREFIX}/health`,
  iam: `${API_PREFIX}/iam`,
  catalog: `${API_PREFIX}/catalog`,
  product: `${API_PREFIX}/product`,
  consignment: `${API_PREFIX}/consignment`,
  order: `${API_PREFIX}/order`,
  financial: `${API_PREFIX}/financial`,
  notification: `${API_PREFIX}/notification`,
  audit: `${API_PREFIX}/audit`,
} as const;
