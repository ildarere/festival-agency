import type Database from 'better-sqlite3';

export type BillingStatus = 'Trial' | 'Unpaid' | 'Partially Paid' | 'Paid';

export interface Client {
  id: number;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  billingStatus: BillingStatus;
  contractNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientInput {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  telegram?: string | null;
  billingStatus?: BillingStatus;
  contractNumber?: string | null;
  notes?: string | null;
}

export type UpdateClientInput = Partial<CreateClientInput>;

export interface ClientListFilters {
  search?: string;
  billingStatus?: BillingStatus;
}

interface ClientRow {
  id: number;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  billing_status: string;
  contract_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ClientRow): Client {
  return {
    id: row.id,
    fullName: row.full_name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    telegram: row.telegram,
    billingStatus: row.billing_status as BillingStatus,
    contractNumber: row.contract_number,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ClientRepository {
  constructor(private readonly db: Database.Database) {}

  list(filters: ClientListFilters = {}): Client[] {
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (filters.search) {
      conditions.push('(full_name LIKE @search OR company_name LIKE @search)');
      params.search = `%${filters.search}%`;
    }
    if (filters.billingStatus) {
      conditions.push('billing_status = @billingStatus');
      params.billingStatus = filters.billingStatus;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db
      .prepare(`SELECT * FROM clients ${where} ORDER BY created_at DESC`)
      .all(params) as ClientRow[];

    return rows.map(mapRow);
  }

  getById(id: number): Client | null {
    const row = this.db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as ClientRow | undefined;
    return row ? mapRow(row) : null;
  }

  create(input: CreateClientInput): Client {
    const result = this.db
      .prepare(
        `INSERT INTO clients (full_name, company_name, email, phone, telegram, billing_status, contract_number, notes, updated_at)
         VALUES (@fullName, @companyName, @email, @phone, @telegram, @billingStatus, @contractNumber, @notes, datetime('now'))`
      )
      .run({
        fullName: input.fullName,
        companyName: input.companyName ?? null,
        email: input.email,
        phone: input.phone ?? null,
        telegram: input.telegram ?? null,
        billingStatus: input.billingStatus ?? 'Unpaid',
        contractNumber: input.contractNumber ?? null,
        notes: input.notes ?? null
      });

    const client = this.getById(Number(result.lastInsertRowid));
    if (!client) {
      throw new Error('Failed to create client');
    }
    return client;
  }

  update(id: number, input: UpdateClientInput): Client {
    const existing = this.getById(id);
    if (!existing) {
      throw new Error(`Client ${id} not found`);
    }

    const merged: Required<Omit<CreateClientInput, 'billingStatus'>> & { billingStatus: BillingStatus } = {
      fullName: input.fullName ?? existing.fullName,
      companyName: input.companyName !== undefined ? input.companyName : existing.companyName,
      email: input.email ?? existing.email,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      telegram: input.telegram !== undefined ? input.telegram : existing.telegram,
      billingStatus: input.billingStatus ?? existing.billingStatus,
      contractNumber:
        input.contractNumber !== undefined ? input.contractNumber : existing.contractNumber,
      notes: input.notes !== undefined ? input.notes : existing.notes
    };

    this.db
      .prepare(
        `UPDATE clients SET full_name = @fullName, company_name = @companyName, email = @email,
         phone = @phone, telegram = @telegram, billing_status = @billingStatus,
         contract_number = @contractNumber, notes = @notes, updated_at = datetime('now')
         WHERE id = @id`
      )
      .run({ ...merged, id });

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Failed to update client');
    }
    return updated;
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  }
}
