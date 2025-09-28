import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import type { Env } from '../../env';
import * as schema from './schema';

export type Database = DrizzleD1Database<typeof schema>;

export const createDb = (env: Env): Database => drizzle(env.DB, { schema });

export { schema };
