import { ipcMain } from 'electron';
import type {
  CreateSubmissionInput,
  SubmissionRepository,
  SubmissionStatus,
  UpdateSubmissionInput
} from '../database/repositories/submission.repo';

export function registerSubmissionHandlers(repo: SubmissionRepository): void {
  ipcMain.handle('submissions:getByFilmId', (_event, filmId: number) => repo.getByFilmId(filmId));

  ipcMain.handle('submissions:create', (_event, dto: CreateSubmissionInput) => repo.create(dto));

  ipcMain.handle('submissions:updateStatus', (_event, id: number, status: SubmissionStatus) =>
    repo.updateStatus(id, status)
  );

  ipcMain.handle('submissions:updateDetails', (_event, id: number, dto: UpdateSubmissionInput) =>
    repo.updateDetails(id, dto)
  );

  ipcMain.handle('submissions:delete', (_event, id: number) => repo.delete(id));

  ipcMain.handle('submissions:getStats', (_event, filmId: number) => repo.getStatsByFilmId(filmId));
}
