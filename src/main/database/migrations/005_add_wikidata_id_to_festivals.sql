ALTER TABLE festivals ADD COLUMN wikidata_id TEXT;

-- Уникальный индекс по wikidata_id: несколько NULL допускаются (локальные фестивали
-- без привязки к Wikidata), но один и тот же QID нельзя импортировать дважды.
CREATE UNIQUE INDEX IF NOT EXISTS idx_festivals_wikidata_id ON festivals(wikidata_id);
