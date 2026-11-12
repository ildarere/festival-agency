<script setup lang="ts">
import { reactive } from 'vue';
import { X } from 'lucide-vue-next';
import {
  CURRENCIES,
  PAID_BY_LABELS,
  PAID_BY_OPTIONS,
  SUBMISSION_PLATFORMS,
  SUBMISSION_STATUS_LABELS
} from '../model/status';
import type {
  CurrencyType,
  PaidBy,
  SubmissionPlatform,
  SubmissionWithDetails,
  UpdateSubmissionDto
} from '@preload/types';

const props = defineProps<{
  submission: SubmissionWithDetails;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: UpdateSubmissionDto];
  close: [];
}>();

const form = reactive({
  categoryName: props.submission.categoryName ?? '',
  platform: props.submission.platform as SubmissionPlatform,
  trackingCode: props.submission.trackingCode ?? '',
  submissionFee: String(props.submission.submissionFee ?? 0),
  feeCurrency: props.submission.feeCurrency as CurrencyType,
  paidBy: props.submission.paidBy as PaidBy,
  submissionDate: props.submission.submissionDate ?? '',
  notificationDate: props.submission.notificationDate ?? '',
  feedbackNotes: props.submission.feedbackNotes ?? ''
});

function opt(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function handleSubmit(): void {
  const fee = Number.parseFloat(form.submissionFee);
  emit('submit', {
    categoryName: opt(form.categoryName),
    platform: form.platform,
    trackingCode: opt(form.trackingCode),
    submissionFee: Number.isFinite(fee) ? fee : 0,
    feeCurrency: form.feeCurrency,
    paidBy: form.paidBy,
    submissionDate: opt(form.submissionDate),
    notificationDate: opt(form.notificationDate),
    feedbackNotes: opt(form.feedbackNotes)
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-xl flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Детали подачи</h2>
          <p class="text-sm text-slate-500">
            {{ props.submission.festivalName }} · {{ props.submission.editionYear }} ·
            {{ SUBMISSION_STATUS_LABELS[props.submission.status] }}
          </p>
        </div>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
        <div class="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-6">
          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Категория конкурса</span>
            <input
              v-model="form.categoryName"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Платформа</span>
            <select
              v-model="form.platform"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="p in SUBMISSION_PLATFORMS" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Трек-код</span>
            <input
              v-model="form.trackingCode"
              placeholder="FF-XXXXXX"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Взнос</span>
            <input
              v-model="form.submissionFee"
              type="number"
              min="0"
              step="0.01"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Валюта</span>
            <select
              v-model="form.feeCurrency"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Плательщик</span>
            <select
              v-model="form.paidBy"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="p in PAID_BY_OPTIONS" :key="p" :value="p">{{ PAID_BY_LABELS[p] }}</option>
            </select>
          </label>
          <span class="hidden sm:block"></span>

          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Дата подачи</span>
            <input
              v-model="form.submissionDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Дата ответа отборщиков</span>
            <input
              v-model="form.notificationDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Фидбек отборщиков / причина отказа</span>
            <textarea
              v-model="form.feedbackNotes"
              rows="4"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            ></textarea>
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
            :disabled="props.isSaving"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
