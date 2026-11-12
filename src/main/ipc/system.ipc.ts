import { BrowserWindow, ipcMain } from 'electron';
import type Database from 'better-sqlite3';
import { exportDatabase, importDatabase } from '../services/backup.service';
import { exportSubmissionsToCsv } from '../services/export.service';

export function registerSystemHandlers(db: Database.Database): void {
  ipcMain.handle('reports:exportSubmissionsCsv', (event, filmId: number) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return exportSubmissionsToCsv(db, filmId, window);
  });

  ipcMain.handle('system:exportBackup', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return exportDatabase(window);
  });

  ipcMain.handle('system:importBackup', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    return importDatabase(window);
  });
}
