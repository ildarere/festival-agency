import { ipcMain } from 'electron';
import type {
  CreateInvoiceInput,
  InvoiceRepository,
  InvoiceStatus
} from '../database/repositories/invoice.repo';

export function registerInvoiceHandlers(repo: InvoiceRepository): void {
  ipcMain.handle('invoices:getByClientId', (_event, clientId: number) =>
    repo.getByClientId(clientId)
  );

  ipcMain.handle('invoices:create', (_event, dto: CreateInvoiceInput) => repo.create(dto));

  ipcMain.handle(
    'invoices:updateStatus',
    (_event, id: number, status: InvoiceStatus, paidDate?: string | null) =>
      repo.updateStatus(id, status, paidDate)
  );

  ipcMain.handle('invoices:delete', (_event, id: number) => repo.delete(id));

  ipcMain.handle('invoices:getBalance', (_event, clientId: number) =>
    repo.getClientBalance(clientId)
  );
}
