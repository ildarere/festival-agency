import { ipcMain, shell } from 'electron';
import type { CreateFilmInput, FilmRepository, UpdateFilmInput } from '../database/repositories/film.repo';

function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function registerFilmHandlers(repo: FilmRepository): void {
  ipcMain.handle('films:getByClientId', (_event, clientId: number) => repo.getByClientId(clientId));

  ipcMain.handle('films:getById', (_event, id: number) => repo.getById(id));

  ipcMain.handle('films:create', (_event, dto: CreateFilmInput) => repo.create(dto));

  ipcMain.handle('films:update', (_event, id: number, dto: UpdateFilmInput) => repo.update(id, dto));

  ipcMain.handle('films:delete', (_event, id: number) => repo.delete(id));

  ipcMain.handle('films:openExternalLink', async (_event, url: string) => {
    if (!isValidExternalUrl(url)) {
      throw new Error(`Недопустимая ссылка: ${url}`);
    }
    await shell.openExternal(url);
  });
}
