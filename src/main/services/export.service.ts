import { dialog, type BrowserWindow } from 'electron';
import { writeFileSync } from 'node:fs';
import type Database from 'better-sqlite3';
import { FilmRepository } from '../database/repositories/film.repo';
import {
  SubmissionRepository,
  type SubmissionStatus,
  type SubmissionWithDetails
} from '../database/repositories/submission.repo';

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  Shortlist_Planned: 'В планах',
  Client_Approved: 'Одобрен клиентом',
  Submitted: 'Подано',
  In_Review: 'На отборе',
  Selected: 'Отобран / Премьера',
  Awarded: 'Победа / Приз',
  Rejected: 'Отказ',
  Withdrawn: 'Отозвано'
};

/** UTF-8 BOM — заставляет Excel открыть CSV в кодировке UTF-8 и корректно показать кириллицу. */
const UTF8_BOM = '﻿';
const CSV_DELIMITER = ';';
const CSV_HEADERS = [
  'Фестиваль',
  'Страна',
  'Сезон',
  'Дедлайн',
  'Платформа',
  'Трек-код',
  'Взнос',
  'Валюта',
  'Статус воронки',
  'Заметки'
];

export interface ExportResult {
  canceled: boolean;
  filePath: string | null;
}

function escapeCell(value: string | number | null): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (raw.includes('"') || raw.includes(CSV_DELIMITER) || raw.includes('\n') || raw.includes('\r')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function submissionDeadline(submission: SubmissionWithDetails): string {
  return (
    submission.editionRegularDeadline ??
    submission.editionLateDeadline ??
    submission.editionEarlyDeadline ??
    ''
  );
}

function buildCsv(rows: SubmissionWithDetails[]): string {
  const lines: string[] = [CSV_HEADERS.join(CSV_DELIMITER)];

  for (const row of rows) {
    lines.push(
      [
        escapeCell(row.festivalName),
        escapeCell(row.festivalCountry),
        escapeCell(row.editionYear),
        escapeCell(submissionDeadline(row)),
        escapeCell(row.platform),
        escapeCell(row.trackingCode),
        escapeCell(row.submissionFee.toFixed(2)),
        escapeCell(row.feeCurrency),
        escapeCell(STATUS_LABELS[row.status]),
        escapeCell(row.feedbackNotes)
      ].join(CSV_DELIMITER)
    );
  }

  return `${UTF8_BOM}${lines.join('\r\n')}\r\n`;
}

function safeFileStem(value: string): string {
  const cleaned = value.replace(/[\\/:*?"<>|]+/g, '').trim();
  return cleaned.length > 0 ? cleaned : 'film';
}

export async function exportSubmissionsToCsv(
  db: Database.Database,
  filmId: number,
  window: BrowserWindow | null
): Promise<ExportResult> {
  const film = new FilmRepository(db).getById(filmId);
  if (!film) {
    throw new Error(`Film ${filmId} not found`);
  }

  const submissions = new SubmissionRepository(db).getByFilmId(filmId);
  const csv = buildCsv(submissions);

  const saveOptions = {
    title: 'Экспорт фестивального отчета',
    defaultPath: `EWA_${safeFileStem(film.titleOriginal)}_strategy.csv`,
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  };

  const result = window
    ? await dialog.showSaveDialog(window, saveOptions)
    : await dialog.showSaveDialog(saveOptions);

  if (result.canceled || !result.filePath) {
    return { canceled: true, filePath: null };
  }

  writeFileSync(result.filePath, csv, { encoding: 'utf8' });
  return { canceled: false, filePath: result.filePath };
}
