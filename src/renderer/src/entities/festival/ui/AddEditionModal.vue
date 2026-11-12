<script setup lang="ts">
import { computed, reactive } from 'vue';
import { X } from 'lucide-vue-next';
import { PREMIERE_REQUIREMENT_LABELS } from '../model/editions';
import type { CreateEditionDto, PremiereRequirement } from '@preload/types';

const props = defineProps<{ isSaving: boolean }>();

const emit = defineEmits<{
  submit: [payload: CreateEditionDto];
  close: [];
}>();

const PREMIERE_REQUIREMENTS: PremiereRequirement[] = [
  'World',
  'International',
  'National',
  'Regional',
  'No Requirement'
];

const form = reactive({
  editionYear: String(new Date().getFullYear() + 1),
  startDate: '',
  endDate: '',
  earlyDeadline: '',
  regularDeadline: '',
  lateDeadline: '',
  notificationDate: '',
  premiereRequirement: 'No Requirement' as PremiereRequirement
});

const canSubmit = computed(() => /^\d{4}$/.test(form.editionYear.trim()));

function opt(value: string): string | null {
  return value.trim() === '' ? null : value.trim();
}

function handleSubmit(): void {
  if (!canSubmit.value) {
    return;
  }
  emit('submit', {
    editionYear: Number(form.editionYear.trim()),
    startDate: opt(form.startDate),
    endDate: opt(form.endDate),
    earlyDeadline: opt(form.earlyDeadline),
    regularDeadline: opt(form.regularDeadline),
    lateDeadline: opt(form.lateDeadline),
    notificationDate: opt(form.notificationDate),
    premiereRequirement: form.premiereRequirement
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <h2 class="text-lg font-semibold text-slate-800">Добавить сезон / год</h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
        <div class="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-6">
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Год сезона *</span>
            <input
              v-model="form.editionYear"
              type="number"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Требование к премьере</span>
            <select
              v-model="form.premiereRequirement"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="r in PREMIERE_REQUIREMENTS" :key="r" :value="r">
                {{ PREMIERE_REQUIREMENT_LABELS[r] }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Дата начала</span>
            <input
              v-model="form.startDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Дата окончания</span>
            <input
              v-model="form.endDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Early deadline</span>
            <input
              v-model="form.earlyDeadline"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Regular deadline</span>
            <input
              v-model="form.regularDeadline"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Late deadline</span>
            <input
              v-model="form.lateDeadline"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Дата объявления результатов</span>
            <input
              v-model="form.notificationDate"
              type="date"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
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
            Добавить сезон
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
