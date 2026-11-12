import type Database from 'better-sqlite3';
import { ClientRepository } from '../database/client.repo';
import { DocumentRepository } from '../database/document.repo';
import { FilmRepository } from '../database/repositories/film.repo';
import { FestivalRepository } from '../database/repositories/festival.repo';
import { SubmissionRepository } from '../database/repositories/submission.repo';
import { InvoiceRepository } from '../database/repositories/invoice.repo';
import { CalendarRepository } from '../database/repositories/calendar.repo';
import { registerClientHandlers } from './clients.ipc';
import { registerDocumentHandlers } from './documents.ipc';
import { registerFilmHandlers } from './film.ipc';
import { registerFestivalHandlers } from './festival.ipc';
import { registerSubmissionHandlers } from './submission.ipc';
import { registerInvoiceHandlers } from './invoice.ipc';
import { registerCalendarHandlers } from './calendar.ipc';
import { registerSystemHandlers } from './system.ipc';

export function registerIpcHandlers(db: Database.Database): void {
  registerClientHandlers(new ClientRepository(db));
  registerDocumentHandlers(new DocumentRepository(db));
  registerFilmHandlers(new FilmRepository(db));
  registerFestivalHandlers(new FestivalRepository(db));
  registerSubmissionHandlers(new SubmissionRepository(db));
  registerInvoiceHandlers(new InvoiceRepository(db));
  registerCalendarHandlers(new CalendarRepository(db));
  registerSystemHandlers(db);
}
