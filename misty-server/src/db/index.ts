import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

const sqlite = new Database("./sqlite.db");

export const db = drizzle(sqlite, { schema });

export { schema };

try {
  migrate(db, { migrationsFolder: "./drizzle" });
} catch (error) {
  console.log("No migrations to run yet");
}

process.on("exit", () => {
  sqlite.close();
});

process.on("SIGINT", () => {
  sqlite.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  sqlite.close();
  process.exit(0);
});
