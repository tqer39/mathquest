export type Env = {
  KV_FREE_TRIAL: KVNamespace;
  KV_AUTH_SESSION: KVNamespace;
  KV_RATE_LIMIT: KVNamespace;
  KV_IDEMPOTENCY: KVNamespace;
  DB: D1Database;
  DEFAULT_LANG: string;
};
