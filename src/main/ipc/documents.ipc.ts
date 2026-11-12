import { BrowserWindow, ipcMain } from 'electron';
import type { DocumentRepository, DocumentType } from '../database/document.repo';
import {
  deleteStoredDocument,
  openStoredDocument,
  pickDocumentFile,
  storeClientDocument
} from '../services/fileStorage.service';

export function registerDocumentHandlers(repo: DocumentRepository): void {
  ipcMain.handle('documents:list', (_event, clientId: number) => repo.listByClient(clientId));

  ipcMain.handle('documents:attach', async (event, clientId: number, docType: DocumentType) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return { document: null, canceled: true };
    }

    const picked = await pickDocumentFile(window);
    if (!picked) {
      return { document: null, canceled: true };
    }

    const relativePath = storeClientDocument(clientId, picked.sourcePath, picked.fileName);
    const document = repo.create({
      clientId,
      docType,
      fileName: picked.fileName,
      relativePath,
      fileSizeBytes: picked.fileSizeBytes
    });

    return { document, canceled: false };
  });

  ipcMain.handle('documents:open', async (_event, id: number) => {
    const document = repo.getById(id);
    if (!document) {
      throw new Error(`Document ${id} not found`);
    }
    await openStoredDocument(document.relativePath);
  });

  ipcMain.handle('documents:delete', (_event, id: number) => {
    const document = repo.getById(id);
    if (!document) {
      return;
    }
    deleteStoredDocument(document.relativePath);
    repo.delete(id);
  });
}
