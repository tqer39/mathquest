declare interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(mapper?: (row: Record<string, unknown>) => T): Promise<T | null>;
  run<T = unknown>(): Promise<T>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  raw<T = unknown>(): Promise<T[]>;
}

declare interface KVPutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: unknown;
}

declare module '@cloudflare/workers-types' {
  export interface KVNamespace {
    get(key: string, type?: 'text'): Promise<string | null>;
    get<T = unknown>(key: string, type: 'json'): Promise<T | null>;
    get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
    put(
      key: string,
      value: string | ArrayBuffer | ReadableStream,
      options?: KVPutOptions
    ): Promise<void>;
    delete(key: string): Promise<void>;
  }

  export interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
    dump(): Promise<ArrayBuffer>;
  }
}
