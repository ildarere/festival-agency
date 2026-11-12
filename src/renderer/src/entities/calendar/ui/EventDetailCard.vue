<script setup lang="ts">
import { ArrowRight, X } from 'lucide-vue-next';
import {
  CALENDAR_EVENT_BADGE_CLASSES,
  CALENDAR_EVENT_LABELS,
  formatHumanDate
} from '../model/meta';
import {
  SUBMISSION_STATUS_CLASSES,
  SUBMISSION_STATUS_LABELS
} from '@renderer/entities/submission/model/status';
import type { CalendarEvent } from '@preload/types';

defineProps<{ event: CalendarEvent }>();

const emit = defineEmits<{
  close: [];
  'go-to-strategy': [event: CalendarEvent];
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-lg bg-white shadow-xl">
      <div class="flex items-start justify-between border-b border-slate-200 p-5 pb-4">
        <div>
          <span
            class="inline-block rounded-full border px-2 py-0.5 text-xs font-medium"
            :class="CALENDAR_EVENT_BADGE_CLASSES[event.eventType]"
          >
            {{ CALENDAR_EVENT_LABELS[event.eventType] }}
          </span>
          <h2 class="mt-2 text-lg font-semibold text-slate-800">{{ event.festivalName }}</h2>
          <p class="text-sm text-slate-500">
            <template v-if="event.festivalCity">{{ event.festivalCity }}, </template>
            {{ event.festivalCountry }} · сезон {{ event.editionYear }}
          </p>
        </div>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="space-y-3 p-5 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-500">Дата</span>
          <span class="font-medium text-slate-800">{{ formatHumanDate(event.date) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Фильм</span>
          <span class="font-medium text-slate-800">{{ event.filmTitle }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Клиент</span>
          <span class="font-medium text-slate-800">{{ event.clientName }}</span>
        </div>
        <div v-if="event.categoryName" class="flex justify-between">
          <span class="text-slate-500">Категория</span>
          <span class="font-medium text-slate-800">{{ event.categoryName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Платформа / трек-код</span>
          <span class="font-medium text-slate-800">
            {{ event.platform }}<template v-if="event.trackingCode"> · {{ event.trackingCode }}</template>
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500">Статус заявки</span>
          <span
            class="rounded-full border px-2 py-0.5 text-xs font-medium"
            :class="SUBMISSION_STATUS_CLASSES[event.submissionStatus]"
          >
            {{ SUBMISSION_STATUS_LABELS[event.submissionStatus] }}
          </span>
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-200 p-5 pt-4">
        <button
          class="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          @click="emit('close')"
        >
          Закрыть
        </button>
        <button
          class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="emit('go-to-strategy', event)"
        >
          В стратегию фильма
          <ArrowRight :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
