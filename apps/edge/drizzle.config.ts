import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/database/schema.ts',
  out: '../../infra/migrations',
  dialect: 'sqlite',
});
