import { ipcMain } from 'electron';
import type {
  ClientListFilters,
  ClientRepository,
  CreateClientInput,
  UpdateClientInput
} from '../database/client.repo';

export function registerClientHandlers(repo: ClientRepository): void {
  ipcMain.handle('clients:list', (_event, filters?: ClientListFilters) => repo.list(filters ?? {}));

  ipcMain.handle('clients:get', (_event, id: number) => repo.getById(id));

  ipcMain.handle('clients:create', (_event, dto: CreateClientInput) => repo.create(dto));

  ipcMain.handle('clients:update', (_event, id: number, dto: UpdateClientInput) => repo.update(id, dto));

  ipcMain.handle('clients:delete', (_event, id: number) => repo.delete(id));
}
