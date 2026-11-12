CREATE TABLE IF NOT EXISTS festivals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  website_url TEXT,
  accreditation TEXT NOT NULL DEFAULT 'None'
    CHECK (accreditation IN ('FIAPF_A', 'Oscar_qualifying', 'BAFTA', 'ECFA', 'EFA', 'None')),
  platform_default TEXT NOT NULL DEFAULT 'FilmFreeway'
    CHECK (platform_default IN ('FilmFreeway', 'Shortfilmdepot', 'Festhome', 'Direct', 'Other')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS festival_editions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
  edition_year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  early_deadline DATE,
  regular_deadline DATE,
  late_deadline DATE,
  notification_date DATE,
  premiere_requirement TEXT NOT NULL DEFAULT 'No Requirement'
    CHECK (premiere_requirement IN ('World', 'International', 'National', 'Regional', 'No Requirement'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id INTEGER NOT NULL REFERENCES films(id) ON DELETE CASCADE,
  edition_id INTEGER NOT NULL REFERENCES festival_editions(id) ON DELETE RESTRICT,
  category_name TEXT,
  platform TEXT NOT NULL DEFAULT 'FilmFreeway'
    CHECK (platform IN ('FilmFreeway', 'Shortfilmdepot', 'Festhome', 'Direct', 'Other')),
  tracking_code TEXT,
  status TEXT NOT NULL DEFAULT 'Shortlist_Planned'
    CHECK (status IN (
      'Shortlist_Planned', 'Client_Approved', 'Submitted', 'In_Review',
      'Selected', 'Rejected', 'Withdrawn', 'Awarded'
    )),
  submission_fee REAL DEFAULT 0.0,
  fee_currency TEXT NOT NULL DEFAULT 'USD'
    CHECK (fee_currency IN ('USD', 'EUR', 'GBP', 'RUB')),
  paid_by TEXT NOT NULL DEFAULT 'Agent'
    CHECK (paid_by IN ('Agent', 'Client')),
  submission_date DATE,
  notification_date DATE,
  feedback_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_editions_dates
  ON festival_editions(regular_deadline, notification_date);
CREATE INDEX IF NOT EXISTS idx_submissions_film ON submissions(film_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_film_edition
  ON submissions(film_id, edition_id);
