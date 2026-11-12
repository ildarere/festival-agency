import type { CurrencyType, PaidBy, SubmissionPlatform, SubmissionStatus } from '@preload/types';

export const SUBMISSION_STATUS_ORDER: SubmissionStatus[] = [
  'Shortlist_Planned',
  'Client_Approved',
  'Submitted',
  'In_Review',
  'Selected',
  'Awarded',
  'Rejected',
  'Withdrawn'
];

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  Shortlist_Planned: 'В планах',
  Client_Approved: 'Одобрен клиентом',
  Submitted: 'Подано',
  In_Review: 'На отборе',
  Selected: 'Отобран / Премьера',
  Awarded: 'Победа / Приз',
  Rejected: 'Отказ',
  Withdrawn: 'Отозвано'
};

/** Классы Tailwind для «пилюли»/селектора статуса воронки. */
export const SUBMISSION_STATUS_CLASSES: Record<SubmissionStatus, string> = {
  Shortlist_Planned: 'bg-slate-100 text-slate-700 border-slate-300',
  Client_Approved: 'bg-blue-100 text-blue-700 border-blue-300',
  Submitted: 'bg-violet-100 text-violet-700 border-violet-300',
  In_Review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Selected: 'bg-emerald-100 text-emerald-700 border-emerald-400',
  Awarded: 'bg-amber-100 text-amber-800 border-amber-400',
  Rejected: 'bg-red-100 text-red-800 border-red-400',
  Withdrawn: 'bg-slate-100 text-slate-400 border-slate-200'
};

export const SUBMISSION_PLATFORMS: SubmissionPlatform[] = [
  'FilmFreeway',
  'Shortfilmdepot',
  'Festhome',
  'Direct',
  'Other'
];

export const CURRENCIES: CurrencyType[] = ['USD', 'EUR', 'GBP', 'RUB'];

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RUB: '₽'
};

export const PAID_BY_OPTIONS: PaidBy[] = ['Agent', 'Client'];

export const PAID_BY_LABELS: Record<PaidBy, string> = {
  Agent: 'Агент',
  Client: 'Клиент'
};
