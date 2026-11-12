import type Database from 'better-sqlite3';

export type DocumentType = 'Contract' | 'Invoice' | 'Release_Form' | 'Passport' | 'Other';

export interface ClientDocument {
  id: number;
  clientId: number;
  docType: DocumentType;
  fileName: string;
  relativePath: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface CreateDocumentInput {
  clientId: number;
  docType: DocumentType;
  fileName: string;
  relativePath: string;
  fileSizeBytes: number;
}

interface ClientDocumentRow {
  id: number;
  client_id: number;
  doc_type: string;
  file_name: string;
  relative_path: string;
  file_size_bytes: number;
  created_at: string;
}

function mapRow(row: ClientDocumentRow): ClientDocument {
  return {
    id: row.id,
    clientId: row.client_id,
    docType: row.doc_type as DocumentType,
    fileName: row.file_name,
    relativePath: row.relative_path,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at
  };
}

export class DocumentRepository {
  constructor(private readonly db: Database.Database) {}

  listByClient(clientId: number): ClientDocument[] {
    const rows = this.db
      .prepare('SELECT * FROM client_documents WHERE client_id = ? ORDER BY created_at DESC')
      .all(clientId) as ClientDocumentRow[];
    return rows.map(mapRow);
  }

  getById(id: number): ClientDocument | null {
    const row = this.db.prepare('SELECT * FROM client_documents WHERE id = ?').get(id) as
      | ClientDocumentRow
      | undefined;
    return row ? mapRow(row) : null;
  }

  create(input: CreateDocumentInput): ClientDocument {
    const result = this.db
      .prepare(
        `INSERT INTO client_documents (client_id, doc_type, file_name, relative_path, file_size_bytes)
         VALUES (@clientId, @docType, @fileName, @relativePath, @fileSizeBytes)`
      )
      .run(input);

    const document = this.getById(Number(result.lastInsertRowid));
    if (!document) {
      throw new Error('Failed to create document');
    }
    return document;
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM client_documents WHERE id = ?').run(id);
  }
}
