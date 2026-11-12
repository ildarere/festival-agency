import type { FestivalEdition, PremiereRequirement } from '@preload/types';

export const PREMIERE_REQUIREMENT_LABELS: Record<PremiereRequirement, string> = {
  World: 'Мировая премьера',
  International: 'Международная премьера',
  National: 'Национальная премьера',
  Regional: 'Региональная премьера',
  'No Requirement': 'Без требований к премьере'
};

/**
 * Выбирает наиболее релевантный сезон: ближайший будущий (по любому дедлайну),
 * иначе — самый последний по году.
 */
export function pickRelevantEdition(editions: FestivalEdition[]): FestivalEdition | null {
  if (editions.length === 0) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = editions
    .filter((e) => {
      const anchor = e.regularDeadline ?? e.lateDeadline ?? e.earlyDeadline ?? e.startDate;
      return anchor !== null && anchor >= today;
    })
    .sort((a, b) => {
      const aAnchor = a.regularDeadline ?? a.lateDeadline ?? a.earlyDeadline ?? a.startDate ?? '';
      const bAnchor = b.regularDeadline ?? b.lateDeadline ?? b.earlyDeadline ?? b.startDate ?? '';
      return aAnchor.localeCompare(bAnchor);
    });

  if (upcoming.length > 0) {
    return upcoming[0];
  }

  return [...editions].sort((a, b) => b.editionYear - a.editionYear)[0];
}

export type DeadlineUrgency = 'past' | 'soon' | 'upcoming' | 'none';

export function deadlineUrgency(deadline: string | null): DeadlineUrgency {
  if (!deadline) {
    return 'none';
  }
  const now = Date.now();
  const target = new Date(`${deadline}T23:59:59`).getTime();
  const days = (target - now) / (1000 * 60 * 60 * 24);
  if (days < 0) {
    return 'past';
  }
  if (days <= 21) {
    return 'soon';
  }
  return 'upcoming';
}

export function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('ru-RU');
}
