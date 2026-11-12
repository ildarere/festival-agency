import type Database from 'better-sqlite3';
import type { CurrencyType, SubmissionStatus } from './submission.repo';
import type { WikidataFestivalItem } from '../../services/wikidata.service';

export type AccreditationType =
  | 'FIAPF_A'
  | 'Oscar_qualifying'
  | 'BAFTA'
  | 'ECFA'
  | 'EFA'
  | 'None';

export type SubmissionPlatform =
  | 'FilmFreeway'
  | 'Shortfilmdepot'
  | 'Festhome'
  | 'Direct'
  | 'Other';

export type PremiereRequirement =
  | 'World'
  | 'International'
  | 'National'
  | 'Regional'
  | 'No Requirement';

export interface Festival {
  id: number;
  name: string;
  country: string;
  city: string | null;
  websiteUrl: string | null;
  accreditation: AccreditationType;
  platformDefault: SubmissionPlatform;
  notes: string | null;
  wikidataId: string | null;
  createdAt: string;
}

export interface FestivalEdition {
  id: number;
  festivalId: number;
  editionYear: number;
  startDate: string | null;
  endDate: string | null;
  earlyDeadline: string | null;
  regularDeadline: string | null;
  lateDeadline: string | null;
  notificationDate: string | null;
  premiereRequirement: PremiereRequirement;
}

export interface FestivalWithEditions extends Festival {
  editions: FestivalEdition[];
}

export interface FestivalHistoryEntry {
  submissionId: number;
  filmId: number;
  filmTitle: string;
  clientId: number;
  clientName: string;
  editionYear: number;
  status: SubmissionStatus;
  submissionFee: number;
  feeCurrency: CurrencyType;
  trackingCode: string | null;
  categoryName: string | null;
}

export interface FestivalDetailed extends FestivalWithEditions {
  history: FestivalHistoryEntry[];
}

export interface CreateFestivalInput {
  name: string;
  country: string;
  city?: string | null;
  websiteUrl?: string | null;
  accreditation?: AccreditationType;
  platformDefault?: SubmissionPlatform;
  notes?: string | null;
}

export interface CreateEditionInput {
  editionYear: number;
  startDate?: string | null;
  endDate?: string | null;
  earlyDeadline?: string | null;
  regularDeadline?: string | null;
  lateDeadline?: string | null;
  notificationDate?: string | null;
  premiereRequirement?: PremiereRequirement;
}

export interface UpdateFestivalInput {
  name?: string;
  country?: string;
  city?: string | null;
  websiteUrl?: string | null;
  accreditation?: AccreditationType;
  platformDefault?: SubmissionPlatform;
  notes?: string | null;
}

interface FestivalRow {
  id: number;
  name: string;
  country: string;
  city: string | null;
  website_url: string | null;
  accreditation: string;
  platform_default: string;
  notes: string | null;
  wikidata_id: string | null;
  created_at: string;
}

interface FestivalHistoryRow {
  submission_id: number;
  film_id: number;
  film_title: string;
  client_id: number;
  client_name: string;
  edition_year: number;
  status: string;
  submission_fee: number | null;
  fee_currency: string;
  tracking_code: string | null;
  category_name: string | null;
}

interface FestivalEditionRow {
  id: number;
  festival_id: number;
  edition_year: number;
  start_date: string | null;
  end_date: string | null;
  early_deadline: string | null;
  regular_deadline: string | null;
  late_deadline: string | null;
  notification_date: string | null;
  premiere_requirement: string;
}

function mapFestival(row: FestivalRow): Festival {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    city: row.city,
    websiteUrl: row.website_url,
    accreditation: row.accreditation as AccreditationType,
    platformDefault: row.platform_default as SubmissionPlatform,
    notes: row.notes,
    wikidataId: row.wikidata_id,
    createdAt: row.created_at
  };
}

function mapHistory(row: FestivalHistoryRow): FestivalHistoryEntry {
  return {
    submissionId: row.submission_id,
    filmId: row.film_id,
    filmTitle: row.film_title,
    clientId: row.client_id,
    clientName: row.client_name,
    editionYear: row.edition_year,
    status: row.status as SubmissionStatus,
    submissionFee: row.submission_fee ?? 0,
    feeCurrency: row.fee_currency as CurrencyType,
    trackingCode: row.tracking_code,
    categoryName: row.category_name
  };
}

function mapEdition(row: FestivalEditionRow): FestivalEdition {
  return {
    id: row.id,
    festivalId: row.festival_id,
    editionYear: row.edition_year,
    startDate: row.start_date,
    endDate: row.end_date,
    earlyDeadline: row.early_deadline,
    regularDeadline: row.regular_deadline,
    lateDeadline: row.late_deadline,
    notificationDate: row.notification_date,
    premiereRequirement: row.premiere_requirement as PremiereRequirement
  };
}

export class FestivalRepository {
  constructor(private readonly db: Database.Database) {}

  getAll(search?: string, country?: string, accreditation?: AccreditationType): Festival[] {
    const conditions: string[] = [];
    const params: Record<string, string> = {};

    if (search && search.trim() !== '') {
      conditions.push('(name LIKE @search OR city LIKE @search OR country LIKE @search)');
      params.search = `%${search.trim()}%`;
    }
    if (country && country.trim() !== '') {
      conditions.push('country = @country');
      params.country = country.trim();
    }
    if (accreditation) {
      conditions.push('accreditation = @accreditation');
      params.accreditation = accreditation;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db
      .prepare(`SELECT * FROM festivals ${where} ORDER BY name COLLATE NOCASE ASC`)
      .all(params) as FestivalRow[];

    return rows.map(mapFestival);
  }

  getByIdWithEditions(id: number): FestivalWithEditions | null {
    const row = this.db.prepare('SELECT * FROM festivals WHERE id = ?').get(id) as
      | FestivalRow
      | undefined;
    if (!row) {
      return null;
    }

    const editionRows = this.db
      .prepare(
        'SELECT * FROM festival_editions WHERE festival_id = ? ORDER BY edition_year DESC, id DESC'
      )
      .all(id) as FestivalEditionRow[];

    return { ...mapFestival(row), editions: editionRows.map(mapEdition) };
  }

  create(input: CreateFestivalInput): Festival {
    const result = this.db
      .prepare(
        `INSERT INTO festivals (name, country, city, website_url, accreditation, platform_default, notes)
         VALUES (@name, @country, @city, @websiteUrl, @accreditation, @platformDefault, @notes)`
      )
      .run({
        name: input.name,
        country: input.country,
        city: input.city ?? null,
        websiteUrl: input.websiteUrl ?? null,
        accreditation: input.accreditation ?? 'None',
        platformDefault: input.platformDefault ?? 'FilmFreeway',
        notes: input.notes ?? null
      });

    const festival = this.db
      .prepare('SELECT * FROM festivals WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as FestivalRow | undefined;
    if (!festival) {
      throw new Error('Failed to create festival');
    }
    return mapFestival(festival);
  }

  addEdition(festivalId: number, input: CreateEditionInput): FestivalEdition {
    const festival = this.db.prepare('SELECT id FROM festivals WHERE id = ?').get(festivalId);
    if (!festival) {
      throw new Error(`Festival ${festivalId} not found`);
    }

    const result = this.db
      .prepare(
        `INSERT INTO festival_editions (
          festival_id, edition_year, start_date, end_date,
          early_deadline, regular_deadline, late_deadline, notification_date, premiere_requirement
        ) VALUES (
          @festivalId, @editionYear, @startDate, @endDate,
          @earlyDeadline, @regularDeadline, @lateDeadline, @notificationDate, @premiereRequirement
        )`
      )
      .run({
        festivalId,
        editionYear: input.editionYear,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        earlyDeadline: input.earlyDeadline ?? null,
        regularDeadline: input.regularDeadline ?? null,
        lateDeadline: input.lateDeadline ?? null,
        notificationDate: input.notificationDate ?? null,
        premiereRequirement: input.premiereRequirement ?? 'No Requirement'
      });

    const edition = this.db
      .prepare('SELECT * FROM festival_editions WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as FestivalEditionRow | undefined;
    if (!edition) {
      throw new Error('Failed to create festival edition');
    }
    return mapEdition(edition);
  }

  getExistingWikidataIds(): string[] {
    const rows = this.db
      .prepare('SELECT wikidata_id FROM festivals WHERE wikidata_id IS NOT NULL')
      .all() as Array<{ wikidata_id: string }>;
    return rows.map((row) => row.wikidata_id);
  }

  /** Импорт из Wikidata с защитой от дублей: если QID уже есть — возвращаем существующий фестиваль. */
  importFromWikidata(item: WikidataFestivalItem): Festival {
    const existing = this.db
      .prepare('SELECT * FROM festivals WHERE wikidata_id = ?')
      .get(item.qid) as FestivalRow | undefined;
    if (existing) {
      return mapFestival(existing);
    }

    const result = this.db
      .prepare(
        `INSERT INTO festivals (name, country, city, website_url, accreditation, platform_default, notes, wikidata_id)
         VALUES (@name, @country, @city, @websiteUrl, 'None', 'FilmFreeway', NULL, @wikidataId)`
      )
      .run({
        name: item.name,
        country: item.country ?? 'Не указана',
        city: item.city ?? null,
        websiteUrl: item.websiteUrl ?? null,
        wikidataId: item.qid
      });

    const created = this.db
      .prepare('SELECT * FROM festivals WHERE id = ?')
      .get(Number(result.lastInsertRowid)) as FestivalRow | undefined;
    if (!created) {
      throw new Error('Failed to import festival from Wikidata');
    }
    return mapFestival(created);
  }

  update(id: number, input: UpdateFestivalInput): Festival {
    const existing = this.db.prepare('SELECT * FROM festivals WHERE id = ?').get(id) as
      | FestivalRow
      | undefined;
    if (!existing) {
      throw new Error(`Festival ${id} not found`);
    }
    const current = mapFestival(existing);

    const merged = {
      name: input.name ?? current.name,
      country: input.country ?? current.country,
      city: input.city !== undefined ? input.city : current.city,
      websiteUrl: input.websiteUrl !== undefined ? input.websiteUrl : current.websiteUrl,
      accreditation: input.accreditation ?? current.accreditation,
      platformDefault: input.platformDefault ?? current.platformDefault,
      notes: input.notes !== undefined ? input.notes : current.notes
    };

    this.db
      .prepare(
        `UPDATE festivals SET
          name = @name, country = @country, city = @city, website_url = @websiteUrl,
          accreditation = @accreditation, platform_default = @platformDefault, notes = @notes
         WHERE id = @id`
      )
      .run({ ...merged, id });

    const updated = this.db.prepare('SELECT * FROM festivals WHERE id = ?').get(id) as
      | FestivalRow
      | undefined;
    if (!updated) {
      throw new Error('Failed to update festival');
    }
    return mapFestival(updated);
  }

  getByIdWithDetails(id: number): FestivalDetailed | null {
    const base = this.getByIdWithEditions(id);
    if (!base) {
      return null;
    }

    const historyRows = this.db
      .prepare(
        `SELECT
          s.id AS submission_id,
          s.film_id AS film_id,
          f.title_original AS film_title,
          f.client_id AS client_id,
          c.full_name AS client_name,
          e.edition_year AS edition_year,
          s.status AS status,
          s.submission_fee AS submission_fee,
          s.fee_currency AS fee_currency,
          s.tracking_code AS tracking_code,
          s.category_name AS category_name
        FROM submissions s
        JOIN festival_editions e ON e.id = s.edition_id
        JOIN films f ON f.id = s.film_id
        JOIN clients c ON c.id = f.client_id
        WHERE e.festival_id = ?
        ORDER BY e.edition_year DESC, c.full_name COLLATE NOCASE ASC`
      )
      .all(id) as FestivalHistoryRow[];

    return { ...base, history: historyRows.map(mapHistory) };
  }
}
