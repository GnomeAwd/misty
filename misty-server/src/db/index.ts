import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

// Create SQLite database connection
const sqlite = new Database("./sqlite.db");

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema });

// Export schema for migrations
export { schema };

// Run migrations if they exist
try {
  migrate(db, { migrationsFolder: "./drizzle" });
} catch (error) {
  // Migrations folder might not exist yet, that's okay
  console.log("No migrations to run yet");
}

// Close database connection on process exit
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
