<script setup lang="ts">
import { useRouter } from 'vue-router';
import { History } from 'lucide-vue-next';
import {
  SUBMISSION_STATUS_CLASSES,
  SUBMISSION_STATUS_LABELS,
  CURRENCY_SYMBOLS
} from '@renderer/entities/submission/model/status';
import type { FestivalHistoryEntry } from '@preload/types';

const props = defineProps<{ history: FestivalHistoryEntry[] }>();

const router = useRouter();

function feeLabel(entry: FestivalHistoryEntry): string {
  if (!entry.submissionFee) {
    return '—';
  }
  return `${CURRENCY_SYMBOLS[entry.feeCurrency]}${entry.submissionFee.toFixed(0)}`;
}

function goToFilmStrategy(entry: FestivalHistoryEntry): void {
  router.push({
    path: `/clients/${entry.clientId}`,
    query: { tab: 'strategy', film: String(entry.filmId) }
  });
}
</script>

<template>
  <div>
    <div
      v-if="props.history.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center"
    >
      <History :size="32" class="text-slate-300" />
      <p class="text-slate-500">Агентство ещё не подавало фильмы на этот фестиваль</p>
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">Фильм</th>
            <th class="px-4 py-3 font-medium">Клиент</th>
            <th class="px-4 py-3 font-medium">Сезон / Год</th>
            <th class="px-4 py-3 font-medium">Статус</th>
            <th class="px-4 py-3 font-medium">Взнос</th>
            <th class="px-4 py-3 font-medium">Трек-код</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in props.history"
            :key="entry.submissionId"
            class="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
            @click="goToFilmStrategy(entry)"
          >
            <td class="px-4 py-3 font-medium text-slate-800">{{ entry.filmTitle }}</td>
            <td class="px-4 py-3 text-slate-600">{{ entry.clientName }}</td>
            <td class="px-4 py-3 text-slate-600">{{ entry.editionYear }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="SUBMISSION_STATUS_CLASSES[entry.status]"
              >
                {{ SUBMISSION_STATUS_LABELS[entry.status] }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-700">{{ feeLabel(entry) }}</td>
            <td class="px-4 py-3 text-slate-500">{{ entry.trackingCode || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
