import type { CalendarEventType } from '@preload/types';

export const CALENDAR_EVENT_LABELS: Record<CalendarEventType, string> = {
  early_deadline: 'Early Deadline',
  regular_deadline: 'Regular Deadline',
  late_deadline: 'Late Deadline',
  notification: 'Оглашение результатов'
};

/** Точка/чип события в сетке. */
export const CALENDAR_EVENT_DOT_CLASSES: Record<CalendarEventType, string> = {
  early_deadline: 'bg-amber-400',
  regular_deadline: 'bg-orange-500',
  late_deadline: 'bg-red-500',
  notification: 'bg-indigo-500'
};

/** Бейдж события в списке/повестке и карточке. */
export const CALENDAR_EVENT_BADGE_CLASSES: Record<CalendarEventType, string> = {
  early_deadline: 'bg-amber-100 text-amber-800 border-amber-300',
  regular_deadline: 'bg-orange-100 text-orange-800 border-orange-300',
  late_deadline: 'bg-red-100 text-red-800 border-red-300',
  notification: 'bg-indigo-100 text-indigo-700 border-indigo-300'
};

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatHumanDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
