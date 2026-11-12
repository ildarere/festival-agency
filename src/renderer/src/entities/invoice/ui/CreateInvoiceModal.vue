<script setup lang="ts">
import { computed, reactive } from 'vue';
import { X } from 'lucide-vue-next';
import {
  INVOICE_CURRENCIES,
  INVOICE_PURPOSE_LABELS,
  INVOICE_PURPOSES
} from '../model/meta';
import type { CreateInvoiceDto, CurrencyType, Film, InvoicePurpose } from '@preload/types';

type InvoiceDraft = Omit<CreateInvoiceDto, 'clientId'>;

const props = defineProps<{
  isSaving: boolean;
  films: Film[];
  suggestedNumber: string;
}>();

const emit = defineEmits<{
  submit: [payload: InvoiceDraft];
  close: [];
}>();

const form = reactive({
  invoiceNumber: props.suggestedNumber,
  amount: '',
  currency: 'USD' as CurrencyType,
  purpose: 'Agency_Fee' as InvoicePurpose,
  filmId: null as number | null,
  dueDate: '',
  notes: '',
  markPaid: false
});

const canSubmit = computed(() => {
  const amount = Number.parseFloat(form.amount);
  return form.invoiceNumber.trim() !== '' && Number.isFinite(amount) && amount > 0;
});

function handleSubmit(): void {
  if (!canSubmit.value) {
    return;
  }
  emit('submit', {
    invoiceNumber: form.invoiceNumber.trim(),
    amount: Number.parseFloat(form.amount),
    currency: form.currency,
    purpose: form.purpose,
    filmId: form.filmId,
    status: form.markPaid ? 'Paid' : 'Pending',
    dueDate: form.dueDate.trim() === '' ? null : form.dueDate,
    notes: form.notes.trim() === '' ? null : form.notes.trim()
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <h2 class="text-lg font-semibold text-slate-800">Новый счёт</h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
        <div class="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-6">
          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Номер счёта *</span>
            <input
              v-model="form.invoiceNumber"
              required
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Сумма *</span>
            <input
              v-model="form.amount"
              type="number"
              min="0"
              step="0.01"
              required
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Валюта</span>
            <select
              v-model="form.currency"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="c in INVOICE_CURRENCIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Назначение</span>
            <select
              v-model="form.purpose"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="p in INVOICE_PURPOSES" :key="p" :value="p">
                {{ INVOICE_PURPOSE_LABELS[p] }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Привязка</span>
            <select
              v-model.number="form.filmId"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option :value="null">Общий договор</option>
              <option v-for="film in props.films" :key="film.id" :value="film.id">
                {{ film.titleOriginal }}
              </option>
            </select>
          </label>

          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Срок оплаты</span>
            <input
              v-model="form.dueDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Заметки</span>
            <textarea
              v-model="form.notes"
              rows="2"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            ></textarea>
          </label>

          <label class="col-span-2 flex items-center gap-2 text-sm text-slate-700">
            <input v-model="form.markPaid" type="checkbox" class="rounded border-slate-300" />
            Счёт уже оплачен
          </label>
        </div>

        <div class="flex justify-end gap-2 border-t border-slate-200 p-6 pt-4">
          <button
            type="button"
            class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            @click="emit('close')"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="props.isSaving || !canSubmit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Создать счёт
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
