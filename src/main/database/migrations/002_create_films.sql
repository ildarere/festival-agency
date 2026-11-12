CREATE TABLE IF NOT EXISTS films (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title_original TEXT NOT NULL,
  title_intl TEXT,
  year INTEGER NOT NULL,
  duration_min INTEGER NOT NULL,
  genre TEXT,
  director TEXT NOT NULL,
  producer TEXT,
  synopsis_short TEXT,
  synopsis_long TEXT,
  premiere_status TEXT NOT NULL DEFAULT 'World'
    CHECK (premiere_status IN ('World', 'International', 'National', 'None')),
  aspect_ratio TEXT,
  sound_format TEXT,
  screener_url TEXT,
  screener_password TEXT,
  subtitles_url TEXT,
  press_kit_url TEXT,
  stills_folder_url TEXT,
  trailer_url TEXT,
  dialogue_list_url TEXT,
  dcp_cloud_url TEXT,
  status TEXT NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Materials_Pending', 'Ready_For_Submissions', 'In_Submissions', 'Completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_films_client ON films(client_id);
CREATE INDEX IF NOT EXISTS idx_films_status ON films(status);
