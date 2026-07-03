export const VAULT_SECRET_KEYS = [
  'PORT',
  'NODE_ENV',
  'REQUEST_BODY_LIMIT',
  'CORS_ORIGINS',
] as const;

export type VaultSecretKey = (typeof VAULT_SECRET_KEYS)[number];
