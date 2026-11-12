CREATE TABLE IF NOT EXISTS client_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  film_id INTEGER REFERENCES films(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD'
    CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB')),
  purpose TEXT NOT NULL
    CHECK (purpose IN ('Agency_Fee', 'Submission_Budget', 'Package_Strategy', 'Other')),
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON client_invoices(status);
