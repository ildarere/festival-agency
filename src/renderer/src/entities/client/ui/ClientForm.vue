<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { BillingStatus, Client, CreateClientDto } from '@preload/types';

const props = defineProps<{
  initial?: Client | null;
  submitLabel: string;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: CreateClientDto];
  cancel: [];
}>();

const BILLING_STATUSES: BillingStatus[] = ['Trial', 'Unpaid', 'Partially Paid', 'Paid'];

interface FormState {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  telegram: string;
  billingStatus: BillingStatus;
  contractNumber: string;
  notes: string;
}

function buildInitialState(client?: Client | null): FormState {
  return {
    fullName: client?.fullName ?? '',
    companyName: client?.companyName ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    telegram: client?.telegram ?? '',
    billingStatus: client?.billingStatus ?? 'Unpaid',
    contractNumber: client?.contractNumber ?? '',
    notes: client?.notes ?? ''
  };
}

const form = reactive<FormState>(buildInitialState(props.initial));

watch(
  () => props.initial,
  (client) => Object.assign(form, buildInitialState(client))
);

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function handleSubmit(): void {
  emit('submit', {
    fullName: form.fullName.trim(),
    companyName: normalizeOptional(form.companyName),
    email: form.email.trim(),
    phone: normalizeOptional(form.phone),
    telegram: normalizeOptional(form.telegram),
    billingStatus: form.billingStatus,
    contractNumber: normalizeOptional(form.contractNumber),
    notes: normalizeOptional(form.notes)
  });
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-2 gap-4">
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">ФИО *</span>
        <input
          v-model="form.fullName"
          required
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Компания</span>
        <input v-model="form.companyName" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Email *</span>
        <input
          v-model="form.email"
          type="email"
          required
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Телефон</span>
        <input v-model="form.phone" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Telegram</span>
        <input v-model="form.telegram" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Статус оплаты</span>
        <select v-model="form.billingStatus" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option v-for="status in BILLING_STATUSES" :key="status" :value="status">{{ status }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="font-medium text-slate-700">Номер договора</span>
        <input
          v-model="form.contractNumber"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
    </div>
    <label class="flex flex-col gap-1 text-sm">
      <span class="font-medium text-slate-700">Заметки</span>
      <textarea
        v-model="form.notes"
        rows="3"
        class="rounded-md border border-slate-300 px-3 py-2 text-sm"
      ></textarea>
    </label>
    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        @click="emit('cancel')"
      >
        Отмена
      </button>
      <button
        type="submit"
        :disabled="isSaving"
        class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>
