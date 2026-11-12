<script setup lang="ts">
import { AlertCircle, CheckCircle2, ExternalLink, X } from 'lucide-vue-next';
import { OPTIONAL_FILM_FIELDS, REQUIRED_FILM_FIELDS } from '../model/readiness';
import type { Film } from '@preload/types';

const props = defineProps<{ film: Film }>();

const emit = defineEmits<{
  close: [];
  openLink: [url: string];
}>();

function fieldValue(key: keyof Film): string | null {
  const value = props.film[key];
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Чеклист материалов</h2>
          <p class="text-sm text-slate-500">{{ film.titleOriginal }}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="mb-6">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Обязательные для старта подач
          </h3>
          <ul class="flex flex-col gap-2">
            <li
              v-for="field in REQUIRED_FILM_FIELDS"
              :key="field.key"
              class="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
            >
              <div class="flex items-center gap-2 text-sm">
                <CheckCircle2 v-if="fieldValue(field.key)" :size="16" class="shrink-0 text-green-500" />
                <AlertCircle v-else :size="16" class="shrink-0 text-red-500" />
                <span :class="fieldValue(field.key) ? 'text-slate-700' : 'text-red-600'">{{ field.label }}</span>
              </div>
              <button
                v-if="field.isLink && fieldValue(field.key)"
                class="flex shrink-0 items-center gap-1 text-xs text-blue-600 hover:underline"
                @click="emit('openLink', fieldValue(field.key)!)"
              >
                <ExternalLink :size="12" />
                Открыть
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Дополнительные материалы
          </h3>
          <ul class="flex flex-col gap-2">
            <li
              v-for="field in OPTIONAL_FILM_FIELDS"
              :key="field.key"
              class="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
            >
              <div class="flex items-center gap-2 text-sm">
                <CheckCircle2 v-if="fieldValue(field.key)" :size="16" class="shrink-0 text-green-500" />
                <AlertCircle v-else :size="16" class="shrink-0 text-amber-400" />
                <span :class="fieldValue(field.key) ? 'text-slate-700' : 'text-slate-400'">{{ field.label }}</span>
              </div>
              <button
                v-if="field.isLink && fieldValue(field.key)"
                class="flex shrink-0 items-center gap-1 text-xs text-blue-600 hover:underline"
                @click="emit('openLink', fieldValue(field.key)!)"
              >
                <ExternalLink :size="12" />
                Открыть
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
