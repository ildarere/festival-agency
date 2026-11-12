import { ipcMain } from 'electron';
import type { CalendarRepository } from '../database/repositories/calendar.repo';

export interface CalendarEventsQuery {
  startDate: string;
  endDate: string;
  filmId?: number | null;
  clientId?: number | null;
}

export function registerCalendarHandlers(repo: CalendarRepository): void {
  ipcMain.handle('calendar:getEvents', (_event, query: CalendarEventsQuery) =>
    repo.getEvents(query.startDate, query.endDate, query.filmId, query.clientId)
  );
}
