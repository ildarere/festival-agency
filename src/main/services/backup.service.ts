import { app, dialog, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import Database from 'better-sqlite3';
import { closeDatabase, getDatabase, getDatabasePath } from '../database/connection';

const DB_FILTERS = [{ name: 'База данных EWA', extensions: ['db', 'sqlite'] }];

/** Таблицы, наличие которых считаем признаком валидной базы EWA. */
const REQUIRED_TABLES = [
  'migrations',
  'clients',
  'films',
  'festivals',
  'festival_editions',
  'submissions',
  'client_invoices'
];

export interface BackupResult {
  canceled: boolean;
  filePath: string | null;
}

export interface RestoreResult {
  canceled: boolean;
  restored: boolean;
  error?: string;
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function exportDatabase(window: BrowserWindow | null): Promise<BackupResult> {
  const options = {
    title: 'Резервная копия базы данных EWA',
    defaultPath: `EWA_backup_${timestamp()}.db`,
    filters: DB_FILTERS
  };

  const result = window
    ? await dialog.showSaveDialog(window, options)
    : await dialog.showSaveDialog(options);

  if (result.canceled || !result.filePath) {
    return { canceled: true, filePath: null };
  }

  await getDatabase().backup(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

function isValidEwaDatabase(candidatePath: string): boolean {
  let probe: Database.Database | null = null;
  try {
    probe = new Database(candidatePath, { readonly: true, fileMustExist: true });
    const rows = probe
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as Array<{ name: string }>;
    const tableNames = new Set(rows.map((row) => row.name));
    return REQUIRED_TABLES.every((table) => tableNames.has(table));
  } catch {
    return false;
  } finally {
    probe?.close();
  }
}

export async function importDatabase(window: BrowserWindow | null): Promise<RestoreResult> {
  const options = {
    title: 'Восстановление базы данных EWA из копии',
    properties: ['openFile' as const],
    filters: DB_FILTERS
  };

  const result = window
    ? await dialog.showOpenDialog(window, options)
    : await dialog.showOpenDialog(options);

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, restored: false };
  }

  const candidatePath = result.filePaths[0]!;

  if (!isValidEwaDatabase(candidatePath)) {
    return {
      canceled: false,
      restored: false,
      error: 'Файл не является корректной базой данных EWA.'
    };
  }

  const targetPath = getDatabasePath();
  closeDatabase();

  // Убираем WAL-хвосты старой базы, иначе они «наложатся» на восстановленный файл.
  for (const suffix of ['-wal', '-shm']) {
    const sidecar = `${targetPath}${suffix}`;
    if (existsSync(sidecar)) {
      rmSync(sidecar);
    }
  }

  copyFileSync(candidatePath, targetPath);

  app.relaunch();
  app.exit(0);

  return { canceled: false, restored: true };
}
