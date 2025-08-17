import { drizzle } from 'drizzle-orm/libsql/sqlite3';
import * as schema from './schema';

export const db = drizzle({ connection: 'file:./sqlite.db', schema: { schema } });