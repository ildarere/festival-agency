import { app, dialog, shell, type BrowserWindow } from 'electron';
import { copyFileSync, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { basename, join } from 'node:path';

const DOCUMENT_FILTERS = [{ name: 'Документы', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'] }];

export interface PickedFile {
  fileName: string;
  sourcePath: string;
  fileSizeBytes: number;
}

export async function pickDocumentFile(window: BrowserWindow): Promise<PickedFile | null> {
  const result = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: DOCUMENT_FILTERS
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const sourcePath = result.filePaths[0]!;
  const stats = statSync(sourcePath);

  return {
    fileName: basename(sourcePath),
    sourcePath,
    fileSizeBytes: stats.size
  };
}

function getClientDocumentsDir(clientId: number): string {
  return join(app.getPath('userData'), 'documents', String(clientId));
}

export function storeClientDocument(clientId: number, sourcePath: string, fileName: string): string {
  const targetDir = getClientDocumentsDir(clientId);
  mkdirSync(targetDir, { recursive: true });

  const uniqueFileName = `${Date.now()}_${fileName}`;
  const targetPath = join(targetDir, uniqueFileName);
  copyFileSync(sourcePath, targetPath);

  return join('documents', String(clientId), uniqueFileName);
}

export async function openStoredDocument(relativePath: string): Promise<void> {
  const absolutePath = join(app.getPath('userData'), relativePath);
  const errorMessage = await shell.openPath(absolutePath);
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

export function deleteStoredDocument(relativePath: string): void {
  const absolutePath = join(app.getPath('userData'), relativePath);
  if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }
}
