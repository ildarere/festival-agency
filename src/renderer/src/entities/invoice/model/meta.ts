import type { CurrencyType, InvoicePurpose, InvoiceStatus } from '@preload/types';

export const INVOICE_PURPOSES: InvoicePurpose[] = [
  'Agency_Fee',
  'Submission_Budget',
  'Package_Strategy',
  'Other'
];

export const INVOICE_PURPOSE_LABELS: Record<InvoicePurpose, string> = {
  Agency_Fee: 'Гонорар агентства',
  Submission_Budget: 'Бюджет на подачи',
  Package_Strategy: 'Пакетная стратегия',
  Other: 'Прочее'
};

export const INVOICE_STATUSES: InvoiceStatus[] = ['Pending', 'Paid', 'Cancelled'];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  Pending: 'Ожидает оплаты',
  Paid: 'Оплачен',
  Cancelled: 'Отменён'
};

export const INVOICE_STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Cancelled: 'bg-slate-100 text-slate-400 border-slate-200'
};

export const INVOICE_CURRENCIES: CurrencyType[] = ['USD', 'EUR', 'GBP', 'RUB'];

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RUB: '₽'
};

export function formatMoney(amount: number, currency: CurrencyType): string {
  return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
}
