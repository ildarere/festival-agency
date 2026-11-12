import type { AccreditationType, SubmissionPlatform } from '@preload/types';

export const ACCREDITATION_OPTIONS: AccreditationType[] = [
  'FIAPF_A',
  'Oscar_qualifying',
  'BAFTA',
  'ECFA',
  'EFA',
  'None'
];

export const ACCREDITATION_LABELS: Record<AccreditationType, string> = {
  FIAPF_A: 'FIAPF A',
  Oscar_qualifying: 'Oscar-qualifying',
  BAFTA: 'BAFTA',
  ECFA: 'ECFA',
  EFA: 'EFA',
  None: 'Без аккредитации'
};

export const ACCREDITATION_BADGE_CLASSES: Record<AccreditationType, string> = {
  FIAPF_A: 'bg-amber-100 text-amber-800',
  Oscar_qualifying: 'bg-yellow-100 text-yellow-800',
  BAFTA: 'bg-indigo-100 text-indigo-800',
  ECFA: 'bg-teal-100 text-teal-800',
  EFA: 'bg-sky-100 text-sky-800',
  None: 'bg-slate-100 text-slate-500'
};

export const PLATFORM_OPTIONS: SubmissionPlatform[] = [
  'FilmFreeway',
  'Shortfilmdepot',
  'Festhome',
  'Direct',
  'Other'
];
