import { app } from 'electron';
import { join } from 'node:path';
import Database from 'better-sqlite3';

let dbInstance: Database.Database | null = null;

export const DATABASE_FILE_NAME = 'ewa.db';

export function getDatabasePath(): string {
  return join(app.getPath('userData'), DATABASE_FILE_NAME);
}

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Database(getDatabasePath());
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  dbInstance = db;
  return db;
}

export function closeDatabase(): void {
  dbInstance?.close();
  dbInstance = null;
}
