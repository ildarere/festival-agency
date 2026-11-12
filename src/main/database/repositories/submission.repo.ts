import type Database from 'better-sqlite3';
import type { PremiereRequirement, SubmissionPlatform } from './festival.repo';

export type SubmissionStatus =
  | 'Shortlist_Planned'
  | 'Client_Approved'
  | 'Submitted'
  | 'In_Review'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn'
  | 'Awarded';

export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'RUB';

export type PaidBy = 'Agent' | 'Client';

export interface Submission {
  id: number;
  filmId: number;
  editionId: number;
  categoryName: string | null;
  platform: SubmissionPlatform;
  trackingCode: string | null;
  status: SubmissionStatus;
  submissionFee: number;
  feeCurrency: CurrencyType;
  paidBy: PaidBy;
  submissionDate: string | null;
  notificationDate: string | null;
  feedbackNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionWithDetails extends Submission {
  festivalId: number;
  festivalName: string;
  festivalCountry: string;
  festivalCity: string | null;
  festivalWebsiteUrl: string | null;
  editionYear: number;
  editionEarlyDeadline: string | null;
  editionRegularDeadline: string | null;
  editionLateDeadline: string | null;
  editionNotificationDate: string | null;
  editionPremiereRequirement: PremiereRequirement;
}

export interface SubmissionStats {
  total: number;
  submitted: number;
  inReview: number;
  selected: number;
  rejected: number;
  awarded: number;
  totalSpent: number;
}

export interface CreateSubmissionInput {
  filmId: number;
  editionId: number;
  categoryName?: string | null;
  platform?: SubmissionPlatform;
  trackingCode?: string | null;
  status?: SubmissionStatus;
  submissionFee?: number;
  feeCurrency?: CurrencyType;
  paidBy?: PaidBy;
  submissionDate?: string | null;
  notificationDate?: string | null;
  feedbackNotes?: string | null;
}

export interface UpdateSubmissionInput {
  categoryName?: string | null;
  platform?: SubmissionPlatform;
  trackingCode?: string | null;
  submissionFee?: number;
  feeCurrency?: CurrencyType;
  paidBy?: PaidBy;
  submissionDate?: string | null;
  notificationDate?: string | null;
  feedbackNotes?: string | null;
}

interface SubmissionRow {
  id: number;
  film_id: number;
  edition_id: number;
  category_name: string | null;
  platform: string;
  tracking_code: string | null;
  status: string;
  submission_fee: number | null;
  fee_currency: string;
  paid_by: string;
  submission_date: string | null;
  notification_date: string | null;
  feedback_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SubmissionDetailRow extends SubmissionRow {
  festival_id: number;
  festival_name: string;
  festival_country: string;
  festival_city: string | null;
  festival_website_url: string | null;
  edition_year: number;
  edition_early_deadline: string | null;
  edition_regular_deadline: string | null;
  edition_late_deadline: string | null;
  edition_notification_date: string | null;
  edition_premiere_requirement: string;
}

function mapRow(row: SubmissionRow): Submission {
  return {
    id: row.id,
    filmId: row.film_id,
    editionId: row.edition_id,
    categoryName: row.category_name,
    platform: row.platform as SubmissionPlatform,
    trackingCode: row.tracking_code,
    status: row.status as SubmissionStatus,
    submissionFee: row.submission_fee ?? 0,
    feeCurrency: row.fee_currency as CurrencyType,
    paidBy: row.paid_by as PaidBy,
    submissionDate: row.submission_date,
    notificationDate: row.notification_date,
    feedbackNotes: row.feedback_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDetailRow(row: SubmissionDetailRow): SubmissionWithDetails {
  return {
    ...mapRow(row),
    festivalId: row.festival_id,
    festivalName: row.festival_name,
    festivalCountry: row.festival_country,
    festivalCity: row.festival_city,
    festivalWebsiteUrl: row.festival_website_url,
    editionYear: row.edition_year,
    editionEarlyDeadline: row.edition_early_deadline,
    editionRegularDeadline: row.edition_regular_deadline,
    editionLateDeadline: row.edition_late_deadline,
    editionNotificationDate: row.edition_notification_date,
    editionPremiereRequirement: row.edition_premiere_requirement as PremiereRequirement
  };
}

const DETAIL_SELECT = `
  SELECT
    s.*,
    f.id AS festival_id,
    f.name AS festival_name,
    f.country AS festival_country,
    f.city AS festival_city,
    f.website_url AS festival_website_url,
    e.edition_year AS edition_year,
    e.early_deadline AS edition_early_deadline,
    e.regular_deadline AS edition_regular_deadline,
    e.late_deadline AS edition_late_deadline,
    e.notification_date AS edition_notification_date,
    e.premiere_requirement AS edition_premiere_requirement
  FROM submissions s
  JOIN festival_editions e ON e.id = s.edition_id
  JOIN festivals f ON f.id = e.festival_id
`;

export class SubmissionRepository {
  constructor(private readonly db: Database.Database) {}

  getByFilmId(filmId: number): SubmissionWithDetails[] {
    const rows = this.db
      .prepare(
        `${DETAIL_SELECT}
         WHERE s.film_id = ?
         ORDER BY
           COALESCE(e.regular_deadline, e.late_deadline, e.early_deadline) ASC,
           s.created_at DESC`
      )
      .all(filmId) as SubmissionDetailRow[];
    return rows.map(mapDetailRow);
  }

  getById(id: number): SubmissionWithDetails | null {
    const row = this.db.prepare(`${DETAIL_SELECT} WHERE s.id = ?`).get(id) as
      | SubmissionDetailRow
      | undefined;
    return row ? mapDetailRow(row) : null;
  }

  create(input: CreateSubmissionInput): SubmissionWithDetails {
    const result = this.db
      .prepare(
        `INSERT INTO submissions (
          film_id, edition_id, category_name, platform, tracking_code, status,
          submission_fee, fee_currency, paid_by, submission_date, notification_date, feedback_notes
        ) VALUES (
          @filmId, @editionId, @categoryName, @platform, @trackingCode, @status,
          @submissionFee, @feeCurrency, @paidBy, @submissionDate, @notificationDate, @feedbackNotes
        )`
      )
      .run({
        filmId: input.filmId,
        editionId: input.editionId,
        categoryName: input.categoryName ?? null,
        platform: input.platform ?? 'FilmFreeway',
        trackingCode: input.trackingCode ?? null,
        status: input.status ?? 'Shortlist_Planned',
        submissionFee: input.submissionFee ?? 0,
        feeCurrency: input.feeCurrency ?? 'USD',
        paidBy: input.paidBy ?? 'Agent',
        submissionDate: input.submissionDate ?? null,
        notificationDate: input.notificationDate ?? null,
        feedbackNotes: input.feedbackNotes ?? null
      });

    const created = this.getById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error('Failed to create submission');
    }
    return created;
  }

  updateStatus(id: number, status: SubmissionStatus): SubmissionWithDetails {
    const info = this.db
      .prepare(`UPDATE submissions SET status = @status, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
      .run({ id, status });
    if (info.changes === 0) {
      throw new Error(`Submission ${id} not found`);
    }
    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Failed to update submission status');
    }
    return updated;
  }

  updateDetails(id: number, input: UpdateSubmissionInput): SubmissionWithDetails {
    const existing = this.db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) as
      | SubmissionRow
      | undefined;
    if (!existing) {
      throw new Error(`Submission ${id} not found`);
    }
    const current = mapRow(existing);

    const merged = {
      categoryName:
        input.categoryName !== undefined ? input.categoryName : current.categoryName,
      platform: input.platform ?? current.platform,
      trackingCode:
        input.trackingCode !== undefined ? input.trackingCode : current.trackingCode,
      submissionFee: input.submissionFee ?? current.submissionFee,
      feeCurrency: input.feeCurrency ?? current.feeCurrency,
      paidBy: input.paidBy ?? current.paidBy,
      submissionDate:
        input.submissionDate !== undefined ? input.submissionDate : current.submissionDate,
      notificationDate:
        input.notificationDate !== undefined ? input.notificationDate : current.notificationDate,
      feedbackNotes:
        input.feedbackNotes !== undefined ? input.feedbackNotes : current.feedbackNotes
    };

    this.db
      .prepare(
        `UPDATE submissions SET
          category_name = @categoryName,
          platform = @platform,
          tracking_code = @trackingCode,
          submission_fee = @submissionFee,
          fee_currency = @feeCurrency,
          paid_by = @paidBy,
          submission_date = @submissionDate,
          notification_date = @notificationDate,
          feedback_notes = @feedbackNotes,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      )
      .run({ ...merged, id });

    const updated = this.getById(id);
    if (!updated) {
      throw new Error('Failed to update submission');
    }
    return updated;
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
  }

  getStatsByFilmId(filmId: number): SubmissionStats {
    const row = this.db
      .prepare(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status IN ('Submitted', 'In_Review', 'Selected', 'Rejected', 'Awarded')
            THEN 1 ELSE 0 END) AS submitted,
          SUM(CASE WHEN status = 'In_Review' THEN 1 ELSE 0 END) AS in_review,
          SUM(CASE WHEN status IN ('Selected', 'Awarded') THEN 1 ELSE 0 END) AS selected,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
          SUM(CASE WHEN status = 'Awarded' THEN 1 ELSE 0 END) AS awarded,
          COALESCE(SUM(CASE WHEN paid_by = 'Agent'
            AND status NOT IN ('Shortlist_Planned', 'Client_Approved', 'Withdrawn')
            THEN submission_fee ELSE 0 END), 0) AS total_spent
        FROM submissions
        WHERE film_id = ?`
      )
      .get(filmId) as {
      total: number;
      submitted: number | null;
      in_review: number | null;
      selected: number | null;
      rejected: number | null;
      awarded: number | null;
      total_spent: number | null;
    };

    return {
      total: row.total ?? 0,
      submitted: row.submitted ?? 0,
      inReview: row.in_review ?? 0,
      selected: row.selected ?? 0,
      rejected: row.rejected ?? 0,
      awarded: row.awarded ?? 0,
      totalSpent: row.total_spent ?? 0
    };
  }
}
