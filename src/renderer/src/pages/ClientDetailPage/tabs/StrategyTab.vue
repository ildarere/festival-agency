<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  Award,
  CircleDollarSign,
  Clapperboard,
  FileDown,
  Plus,
  Send,
  ThumbsDown,
  Trophy
} from 'lucide-vue-next';
import { useFilmStore } from '@renderer/entities/film/model/store';
import { useSubmissionStore } from '@renderer/entities/submission/model/store';
import AddSubmissionModal from '@renderer/entities/submission/ui/AddSubmissionModal.vue';
import SubmissionDetailsModal from '@renderer/entities/submission/ui/SubmissionDetailsModal.vue';
import {
  CURRENCY_SYMBOLS,
  SUBMISSION_STATUS_CLASSES,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_ORDER
} from '@renderer/entities/submission/model/status';
import { deadlineUrgency, formatDate } from '@renderer/entities/festival/model/editions';
import type {
  CreateSubmissionDto,
  CurrencyType,
  SubmissionStatus,
  SubmissionWithDetails,
  UpdateSubmissionDto
} from '@preload/types';

const props = defineProps<{ clientId: number }>();

const route = useRoute();
const filmStore = useFilmStore();
const submissionStore = useSubmissionStore();

const activeFilmId = ref<number | null>(null);
const isAddModalOpen = ref(false);
const detailsTarget = ref<SubmissionWithDetails | null>(null);
const isExporting = ref(false);
const exportMessage = ref<string | null>(null);

onMounted(async () => {
  if (filmStore.films.length === 0 || filmStore.films.some((f) => f.clientId !== props.clientId)) {
    await filmStore.fetchByClientId(props.clientId);
  }
  const requestedFilm = Number(route.query.film);
  const preselected = filmStore.films.find((f) => f.id === requestedFilm);
  activeFilmId.value = preselected?.id ?? filmStore.films[0]?.id ?? null;
});

watch(activeFilmId, (id) => {
  if (id === null) {
    submissionStore.clear();
    return;
  }
  submissionStore.loadForFilm(id);
});

const stats = computed(() => submissionStore.stats);

const usedEditionIds = computed(() => submissionStore.submissions.map((s) => s.editionId));

const cards = computed(() => [
  {
    label: 'Всего в плане',
    value: stats.value?.total ?? 0,
    icon: Clapperboard,
    tone: 'text-slate-600'
  },
  { label: 'Подано', value: stats.value?.submitted ?? 0, icon: Send, tone: 'text-violet-600' },
  {
    label: 'Отобрано (Selections)',
    value: stats.value?.selected ?? 0,
    icon: Trophy,
    tone: 'text-emerald-600'
  },
  { label: 'Отказы', value: stats.value?.rejected ?? 0, icon: ThumbsDown, tone: 'text-red-600' },
  {
    label: 'Призы',
    value: stats.value?.awarded ?? 0,
    icon: Award,
    tone: 'text-amber-600'
  },
  {
    label: 'Потрачено на сборы',
    value: `$${(stats.value?.totalSpent ?? 0).toFixed(0)}`,
    icon: CircleDollarSign,
    tone: 'text-slate-800'
  }
]);

function feeLabel(fee: number, currency: CurrencyType): string {
  if (!fee) {
    return '—';
  }
  return `${CURRENCY_SYMBOLS[currency]}${fee.toFixed(0)}`;
}

function deadlineClass(deadline: string | null): string {
  switch (deadlineUrgency(deadline)) {
    case 'past':
      return 'text-slate-400 line-through';
    case 'soon':
      return 'text-red-600 font-semibold';
    default:
      return 'text-slate-600';
  }
}

async function handleStatusChange(submission: SubmissionWithDetails, event: Event): Promise<void> {
  const next = (event.target as HTMLSelectElement).value as SubmissionStatus;
  await submissionStore.updateStatus(submission.id, next);
}

async function handleAddSubmission(payload: Omit<CreateSubmissionDto, 'filmId'>): Promise<void> {
  if (activeFilmId.value === null) {
    return;
  }
  await submissionStore.createSubmission({ ...payload, filmId: activeFilmId.value });
  isAddModalOpen.value = false;
}

async function handleSaveDetails(payload: UpdateSubmissionDto): Promise<void> {
  if (!detailsTarget.value) {
    return;
  }
  await submissionStore.updateDetails(detailsTarget.value.id, payload);
  detailsTarget.value = null;
}

async function handleDelete(submission: SubmissionWithDetails): Promise<void> {
  if (!confirm(`Убрать «${submission.festivalName}» из плана?`)) {
    return;
  }
  await submissionStore.deleteSubmission(submission.id);
}

async function handleExportCsv(): Promise<void> {
  if (activeFilmId.value === null) {
    return;
  }
  isExporting.value = true;
  exportMessage.value = null;
  try {
    const result = await window.api.reports.exportSubmissionsCsv(activeFilmId.value);
    if (!result.canceled && result.filePath) {
      exportMessage.value = 'Отчет сохранён.';
    }
  } catch {
    exportMessage.value = 'Не удалось сохранить отчет.';
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <div>
    <div
      v-if="filmStore.films.length === 0"
      class="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
    >
      Сначала добавьте фильм во вкладке «Фильмы»
    </div>

    <template v-else>
      <!-- Верхняя панель -->
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label class="flex items-center gap-2 text-sm">
          <span class="font-medium text-slate-600">Фильм:</span>
          <select
            v-model.number="activeFilmId"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option v-for="film in filmStore.films" :key="film.id" :value="film.id">
              {{ film.titleOriginal }} ({{ film.year }})
            </option>
          </select>
        </label>
        <div class="flex items-center gap-2">
          <button
            class="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            :disabled="activeFilmId === null || isExporting || submissionStore.submissions.length === 0"
            @click="handleExportCsv"
          >
            <FileDown :size="16" />
            Экспорт в CSV
          </button>
          <button
            class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            :disabled="activeFilmId === null"
            @click="isAddModalOpen = true"
          >
            <Plus :size="16" />
            Добавить фестиваль в план
          </button>
        </div>
      </div>
      <p v-if="exportMessage" class="mb-3 text-xs text-slate-500">{{ exportMessage }}</p>

      <!-- Аналитика -->
      <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="card in cards"
          :key="card.label"
          class="rounded-lg border border-slate-200 bg-white p-3"
        >
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <component :is="card.icon" :size="14" :class="card.tone" />
            {{ card.label }}
          </div>
          <div class="mt-1 text-xl font-bold" :class="card.tone">{{ card.value }}</div>
        </div>
      </div>

      <!-- Воронка -->
      <div class="mb-6 flex flex-wrap gap-2">
        <span
          v-for="stage in submissionStore.funnel"
          :key="stage.status"
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
          :class="SUBMISSION_STATUS_CLASSES[stage.status]"
        >
          {{ SUBMISSION_STATUS_LABELS[stage.status] }}
          <span class="rounded-full bg-white/70 px-1.5 font-bold">{{ stage.count }}</span>
        </span>
        <span class="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-white">
          Конверсия: {{ submissionStore.conversionRate }}%
        </span>
      </div>

      <!-- Таблица стратегии -->
      <div v-if="submissionStore.isLoading" class="py-12 text-center text-slate-400">Загрузка...</div>

      <div
        v-else-if="submissionStore.submissions.length === 0"
        class="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        В плане пока нет фестивалей
      </div>

      <div v-else class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Фестиваль &amp; Страна</th>
              <th class="px-4 py-3 font-medium">Сезон</th>
              <th class="px-4 py-3 font-medium">Regular deadline</th>
              <th class="px-4 py-3 font-medium">Платформа &amp; Трек-код</th>
              <th class="px-4 py-3 font-medium">Взнос</th>
              <th class="px-4 py-3 font-medium">Статус воронки</th>
              <th class="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="submission in submissionStore.submissions"
              :key="submission.id"
              class="border-t border-slate-100"
            >
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ submission.festivalName }}</div>
                <div class="text-xs text-slate-500">
                  <template v-if="submission.festivalCity">{{ submission.festivalCity }}, </template>
                  {{ submission.festivalCountry }}
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ submission.editionYear }}</td>
              <td class="px-4 py-3" :class="deadlineClass(submission.editionRegularDeadline)">
                {{ formatDate(submission.editionRegularDeadline) }}
              </td>
              <td class="px-4 py-3">
                <div class="text-slate-700">{{ submission.platform }}</div>
                <div class="text-xs text-slate-400">{{ submission.trackingCode || 'нет кода' }}</div>
              </td>
              <td class="px-4 py-3 text-slate-700">
                {{ feeLabel(submission.submissionFee, submission.feeCurrency) }}
                <span class="block text-xs text-slate-400">
                  {{ submission.paidBy === 'Agent' ? 'агент' : 'клиент' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <select
                  class="rounded-md border px-2 py-1 text-xs font-medium focus:outline-none"
                  :class="SUBMISSION_STATUS_CLASSES[submission.status]"
                  :value="submission.status"
                  @change="handleStatusChange(submission, $event)"
                >
                  <option v-for="status in SUBMISSION_STATUS_ORDER" :key="status" :value="status">
                    {{ SUBMISSION_STATUS_LABELS[status] }}
                  </option>
                </select>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <button
                    class="text-sm text-blue-600 hover:underline"
                    @click="detailsTarget = submission"
                  >
                    Заметки
                  </button>
                  <button
                    class="text-sm text-red-600 hover:underline"
                    @click="handleDelete(submission)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <AddSubmissionModal
      v-if="isAddModalOpen"
      :is-saving="submissionStore.isSaving"
      :used-edition-ids="usedEditionIds"
      @submit="handleAddSubmission"
      @close="isAddModalOpen = false"
    />

    <SubmissionDetailsModal
      v-if="detailsTarget"
      :submission="detailsTarget"
      :is-saving="submissionStore.isSaving"
      @submit="handleSaveDetails"
      @close="detailsTarget = null"
    />
  </div>
</template>
