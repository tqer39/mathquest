import type { KVNamespace, D1Database } from '@cloudflare/workers-types';

export type Env = {
  KV_FREE_TRIAL: KVNamespace;
  KV_AUTH_SESSION: KVNamespace;
  KV_RATE_LIMIT: KVNamespace;
  KV_IDEMPOTENCY: KVNamespace;
  DB: D1Database;
  DEFAULT_LANG: string;
  USE_MOCK_USER?: string;
  AUTH_BASE_URL?: string;
  AUTH_EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
};
