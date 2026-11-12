import type Database from 'better-sqlite3';
import type { SubmissionPlatform } from './festival.repo';
import type { SubmissionStatus } from './submission.repo';

export type CalendarEventType =
  | 'early_deadline'
  | 'regular_deadline'
  | 'late_deadline'
  | 'notification';

export interface CalendarEvent {
  id: string;
  submissionId: number;
  editionId: number;
  eventType: CalendarEventType;
  date: string;
  festivalName: string;
  festivalCountry: string;
  festivalCity: string | null;
  editionYear: number;
  filmId: number;
  filmTitle: string;
  clientId: number;
  clientName: string;
  platform: SubmissionPlatform;
  submissionStatus: SubmissionStatus;
  trackingCode: string | null;
  categoryName: string | null;
}

interface CalendarEventRow {
  submission_id: number;
  edition_id: number;
  event_type: string;
  event_date: string;
  festival_name: string;
  festival_country: string;
  festival_city: string | null;
  edition_year: number;
  film_id: number;
  film_title: string;
  client_id: number;
  client_name: string;
  platform: string;
  submission_status: string;
  tracking_code: string | null;
  category_name: string | null;
}

function branch(eventType: CalendarEventType, dateColumn: string): string {
  return `
    SELECT
      s.id AS submission_id,
      s.edition_id AS edition_id,
      '${eventType}' AS event_type,
      ${dateColumn} AS event_date,
      fest.name AS festival_name,
      fest.country AS festival_country,
      fest.city AS festival_city,
      e.edition_year AS edition_year,
      s.film_id AS film_id,
      film.title_original AS film_title,
      film.client_id AS client_id,
      cl.full_name AS client_name,
      s.platform AS platform,
      s.status AS submission_status,
      s.tracking_code AS tracking_code,
      s.category_name AS category_name
    FROM submissions s
    JOIN festival_editions e ON e.id = s.edition_id
    JOIN festivals fest ON fest.id = e.festival_id
    JOIN films film ON film.id = s.film_id
    JOIN clients cl ON cl.id = film.client_id
    WHERE ${dateColumn} IS NOT NULL
      AND ${dateColumn} BETWEEN @startDate AND @endDate
      AND (@filmId IS NULL OR s.film_id = @filmId)
      AND (@clientId IS NULL OR film.client_id = @clientId)
  `;
}

function mapRow(row: CalendarEventRow): CalendarEvent {
  return {
    id: `${row.submission_id}-${row.event_type}`,
    submissionId: row.submission_id,
    editionId: row.edition_id,
    eventType: row.event_type as CalendarEventType,
    date: row.event_date,
    festivalName: row.festival_name,
    festivalCountry: row.festival_country,
    festivalCity: row.festival_city,
    editionYear: row.edition_year,
    filmId: row.film_id,
    filmTitle: row.film_title,
    clientId: row.client_id,
    clientName: row.client_name,
    platform: row.platform as SubmissionPlatform,
    submissionStatus: row.submission_status as SubmissionStatus,
    trackingCode: row.tracking_code,
    categoryName: row.category_name
  };
}

export class CalendarRepository {
  constructor(private readonly db: Database.Database) {}

  getEvents(
    startDate: string,
    endDate: string,
    filmId?: number | null,
    clientId?: number | null
  ): CalendarEvent[] {
    const sql = `
      ${branch('early_deadline', 'e.early_deadline')}
      UNION ALL
      ${branch('regular_deadline', 'e.regular_deadline')}
      UNION ALL
      ${branch('late_deadline', 'e.late_deadline')}
      UNION ALL
      ${branch('notification', 'e.notification_date')}
      ORDER BY event_date ASC, festival_name ASC
    `;

    const rows = this.db.prepare(sql).all({
      startDate,
      endDate,
      filmId: filmId ?? null,
      clientId: clientId ?? null
    }) as CalendarEventRow[];

    return rows.map(mapRow);
  }
}
