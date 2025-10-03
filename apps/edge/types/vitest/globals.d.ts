declare module 'vitest/globals' {
  export const describe: (...args: unknown[]) => void;
  export const it: (...args: unknown[]) => void;
  export const expect: (...args: unknown[]) => unknown;
  export const beforeEach: (...args: unknown[]) => void;
  export const afterEach: (...args: unknown[]) => void;
  export const vi: unknown;
}
