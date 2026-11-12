import type Database from 'better-sqlite3';
import type { CurrencyType } from './submission.repo';

export type InvoicePurpose = 'Agency_Fee' | 'Submission_Budget' | 'Package_Strategy' | 'Other';

export type InvoiceStatus = 'Pending' | 'Paid' | 'Cancelled';

export interface ClientInvoice {
  id: number;
  clientId: number;
  filmId: number | null;
  invoiceNumber: string;
  amount: number;
  currency: CurrencyType;
  purpose: InvoicePurpose;
  status: InvoiceStatus;
  dueDate: string | null;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ClientFinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  submissionDeposit: number;
  submissionSpent: number;
  depositBalance: number;
}

export interface CreateInvoiceInput {
  clientId: number;
  filmId?: number | null;
  invoiceNumber: string;
  amount: number;
  currency?: CurrencyType;
  purpose: InvoicePurpose;
  status?: InvoiceStatus;
  dueDate?: string | null;
  paidDate?: string | null;
  notes?: string | null;
}

interface InvoiceRow {
  id: number;
  client_id: number;
  film_id: number | null;
  invoice_number: string;
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
}

function mapRow(row: InvoiceRow): ClientInvoice {
  return {
    id: row.id,
    clientId: row.client_id,
    filmId: row.film_id,
    invoiceNumber: row.invoice_number,
    amount: row.amount,
    currency: row.currency as CurrencyType,
    purpose: row.purpose as InvoicePurpose,
    status: row.status as InvoiceStatus,
    dueDate: row.due_date,
    paidDate: row.paid_date,
    notes: row.notes,
    createdAt: row.created_at
  };
}

export class InvoiceRepository {
  constructor(private readonly db: Database.Database) {}

  getByClientId(clientId: number): ClientInvoice[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM client_invoices
         WHERE client_id = ?
         ORDER BY COALESCE(due_date, created_at) DESC, id DESC`
      )
      .all(clientId) as InvoiceRow[];
    return rows.map(mapRow);
  }

  getById(id: number): ClientInvoice | null {
    const row = this.db.prepare('SELECT * FROM client_invoices WHERE id = ?').get(id) as
      | InvoiceRow
      | undefined;
    return row ? mapRow(row) : null;
  }

  create(input: CreateInvoiceInput): ClientInvoice {
    const result = this.db
      .prepare(
        `INSERT INTO client_invoices (
          client_id, film_id, invoice_number, amount, currency, purpose, status, due_date, paid_date, notes
        ) VALUES (
          @clientId, @filmId, @invoiceNumber, @amount, @currency, @purpose, @status, @dueDate, @paidDate, @notes
        )`
      )
      .run({
        clientId: input.clientId,
        filmId: input.filmId ?? null,
        invoiceNumber: input.invoiceNumber,
        amount: input.amount,
        currency: input.currency ?? 'USD',
        purpose: input.purpose,
        status: input.status ?? 'Pending',
        dueDate: input.dueDate ?? null,
        paidDate: input.paidDate ?? (input.status === 'Paid' ? new Date().toISOString().slice(0, 10) : null),
        notes: input.notes ?? null
      });

    const invoice = this.getById(Number(result.lastInsertRowid));
    if (!invoice) {
      throw new Error('Failed to create invoice');
    }
    return invoice;
  }

  updateStatus(id: number, status: InvoiceStatus, paidDate?: string | null): ClientInvoice {
    const resolvedPaidDate =
      status === 'Paid' ? (paidDate ?? new Date().toISOString().slice(0, 10)) : null;

    const info = this.db
      .prepare('UPDATE client_invoices SET status = @status, paid_date = @paidDate WHERE id = @id')
      .run({ id, status, paidDate: resolvedPaidDate });
    if (info.changes === 0) {
      throw new Error(`Invoice ${id} not found`);
    }

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Failed to update invoice status');
    }
    return updated;
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM client_invoices WHERE id = ?').run(id);
  }

  getClientBalance(clientId: number): ClientFinancialSummary {
    const invoiceRow = this.db
      .prepare(
        `SELECT
          COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN amount ELSE 0 END), 0) AS total_invoiced,
          COALESCE(SUM(CASE WHEN status = 'Paid' THEN amount ELSE 0 END), 0) AS total_paid,
          COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) AS total_pending,
          COALESCE(SUM(CASE WHEN status = 'Paid' AND purpose = 'Submission_Budget'
            THEN amount ELSE 0 END), 0) AS submission_deposit
        FROM client_invoices
        WHERE client_id = ?`
      )
      .get(clientId) as {
      total_invoiced: number;
      total_paid: number;
      total_pending: number;
      submission_deposit: number;
    };

    const spentRow = this.db
      .prepare(
        `SELECT COALESCE(SUM(s.submission_fee), 0) AS submission_spent
         FROM submissions s
         JOIN films f ON f.id = s.film_id
         WHERE f.client_id = ?
           AND s.paid_by = 'Agent'
           AND s.status NOT IN ('Shortlist_Planned', 'Client_Approved', 'Withdrawn')`
      )
      .get(clientId) as { submission_spent: number };

    const submissionDeposit = invoiceRow.submission_deposit;
    const submissionSpent = spentRow.submission_spent;

    return {
      totalInvoiced: invoiceRow.total_invoiced,
      totalPaid: invoiceRow.total_paid,
      totalPending: invoiceRow.total_pending,
      submissionDeposit,
      submissionSpent,
      depositBalance: submissionDeposit - submissionSpent
    };
  }
}
