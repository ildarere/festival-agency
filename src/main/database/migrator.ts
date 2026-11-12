import type Database from 'better-sqlite3';
import migration001InitialClients from './migrations/001_initial_clients.sql?raw';
import migration002CreateFilms from './migrations/002_create_films.sql?raw';
import migration003FestivalsAndSubmissions from './migrations/003_festivals_and_submissions.sql?raw';
import migration004BillingAndCalendar from './migrations/004_billing_and_calendar.sql?raw';
import migration005AddWikidataIdToFestivals from './migrations/005_add_wikidata_id_to_festivals.sql?raw';

interface Migration {
  id: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  { id: '001_initial_clients', sql: migration001InitialClients },
  { id: '002_create_films', sql: migration002CreateFilms },
  { id: '003_festivals_and_submissions', sql: migration003FestivalsAndSubmissions },
  { id: '004_billing_and_calendar', sql: migration004BillingAndCalendar },
  { id: '005_add_wikidata_id_to_festivals', sql: migration005AddWikidataIdToFestivals }
];

export function runMigrations(db: Database.Database): void {
  db.exec(
    `CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );

  const appliedIds = new Set(
    (db.prepare('SELECT id FROM migrations').all() as Array<{ id: string }>).map((row) => row.id)
  );

  const applyMigration = db.transaction((migration: Migration) => {
    db.exec(migration.sql);
    db.prepare('INSERT INTO migrations (id) VALUES (?)').run(migration.id);
  });

  for (const migration of MIGRATIONS) {
    if (!appliedIds.has(migration.id)) {
      applyMigration(migration);
      console.log(`[migrator] applied migration: ${migration.id}`);
    }
  }
}
