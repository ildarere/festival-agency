<script setup lang="ts">
import { computed, reactive } from 'vue';
import { X } from 'lucide-vue-next';
import { ACCREDITATION_LABELS, ACCREDITATION_OPTIONS, PLATFORM_OPTIONS } from '../model/accreditation';
import type {
  AccreditationType,
  Festival,
  SubmissionPlatform,
  UpdateFestivalDto
} from '@preload/types';

const props = defineProps<{
  festival: Festival;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: UpdateFestivalDto];
  close: [];
}>();

const form = reactive({
  name: props.festival.name,
  country: props.festival.country,
  city: props.festival.city ?? '',
  websiteUrl: props.festival.websiteUrl ?? '',
  accreditation: props.festival.accreditation as AccreditationType,
  platformDefault: props.festival.platformDefault as SubmissionPlatform,
  notes: props.festival.notes ?? ''
});

const canSubmit = computed(() => form.name.trim() !== '' && form.country.trim() !== '');

function opt(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function handleSubmit(): void {
  if (!canSubmit.value) {
    return;
  }
  emit('submit', {
    name: form.name.trim(),
    country: form.country.trim(),
    city: opt(form.city),
    websiteUrl: opt(form.websiteUrl),
    accreditation: form.accreditation,
    platformDefault: form.platformDefault,
    notes: opt(form.notes)
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <h2 class="text-lg font-semibold text-slate-800">Редактировать фестиваль</h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
        <div class="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-6">
          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Название *</span>
            <input
              v-model="form.name"
              required
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Страна *</span>
            <input
              v-model="form.country"
              required
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Город</span>
            <input v-model="form.city" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>
          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Сайт</span>
            <input
              v-model="form.websiteUrl"
              placeholder="https://..."
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Аккредитация</span>
            <select
              v-model="form.accreditation"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="a in ACCREDITATION_OPTIONS" :key="a" :value="a">
                {{ ACCREDITATION_LABELS[a] }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Платформа по умолчанию</span>
            <select
              v-model="form.platformDefault"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option v-for="p in PLATFORM_OPTIONS" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label class="col-span-2 flex flex-col gap-1 text-sm">
            <span class="font-medium text-slate-700">Заметки</span>
            <textarea
              v-model="form.notes"
              rows="3"
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
            :disabled="props.isSaving || !canSubmit"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Сохранить изменения
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
