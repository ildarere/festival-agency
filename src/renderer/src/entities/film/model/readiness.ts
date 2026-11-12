import type { Film, FilmReadiness } from '@preload/types';

export interface FilmFieldDescriptor {
  key: keyof Film;
  label: string;
  isLink: boolean;
}

const REQUIRED_WEIGHT = 17.5;
const OPTIONAL_WEIGHT = 7.5;

export const REQUIRED_FILM_FIELDS: FilmFieldDescriptor[] = [
  { key: 'screenerUrl', label: 'Скринер', isLink: true },
  { key: 'synopsisShort', label: 'Краткий синопсис', isLink: false },
  { key: 'subtitlesUrl', label: 'Субтитры', isLink: true },
  { key: 'stillsFolderUrl', label: 'Кадры (стиллы)', isLink: true }
];

export const OPTIONAL_FILM_FIELDS: FilmFieldDescriptor[] = [
  { key: 'pressKitUrl', label: 'Пресс-кит', isLink: true },
  { key: 'trailerUrl', label: 'Трейлер', isLink: true },
  { key: 'dialogueListUrl', label: 'Диалоговые листы', isLink: true },
  { key: 'dcpCloudUrl', label: 'DCP (облако)', isLink: true }
];

function isFilled(film: Film, key: keyof Film): boolean {
  const value = film[key];
  return typeof value === 'string' && value.trim().length > 0;
}

export function calculateFilmReadiness(film: Film): FilmReadiness {
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  let score = 0;

  for (const field of REQUIRED_FILM_FIELDS) {
    if (isFilled(film, field.key)) {
      score += REQUIRED_WEIGHT;
    } else {
      missingRequired.push(field.label);
    }
  }

  for (const field of OPTIONAL_FILM_FIELDS) {
    if (isFilled(film, field.key)) {
      score += OPTIONAL_WEIGHT;
    } else {
      missingOptional.push(field.label);
    }
  }

  return {
    score: Math.round(score),
    isReady: missingRequired.length === 0,
    missingRequired,
    missingOptional
  };
}
