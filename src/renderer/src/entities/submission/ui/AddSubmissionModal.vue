<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Check, Search, X } from 'lucide-vue-next';
import { useFestivalStore } from '@renderer/entities/festival/model/store';
import {
  ACCREDITATION_BADGE_CLASSES,
  ACCREDITATION_LABELS
} from '@renderer/entities/festival/model/accreditation';
import {
  formatDate,
  PREMIERE_REQUIREMENT_LABELS
} from '@renderer/entities/festival/model/editions';
import { CURRENCIES, PAID_BY_LABELS, PAID_BY_OPTIONS, SUBMISSION_PLATFORMS } from '../model/status';
import type {
  CreateSubmissionDto,
  CurrencyType,
  FestivalEdition,
  PaidBy,
  SubmissionPlatform
} from '@preload/types';

type SubmissionDraft = Omit<CreateSubmissionDto, 'filmId'>;

const props = defineProps<{
  isSaving: boolean;
  /** id сезонов, на которые фильм уже подан — их выбирать нельзя. */
  usedEditionIds: number[];
}>();

const emit = defineEmits<{
  submit: [payload: SubmissionDraft];
  close: [];
}>();

const festivalStore = useFestivalStore();

const search = ref('');
const selectedFestivalId = ref<number | null>(null);
const editions = ref<FestivalEdition[]>([]);
const selectedEditionId = ref<number | null>(null);
const isLoadingEditions = ref(false);

const categoryName = ref('');
const platform = ref<SubmissionPlatform>('FilmFreeway');
const submissionFee = ref('0');
const feeCurrency = ref<CurrencyType>('USD');
const paidBy = ref<PaidBy>('Agent');

onMounted(() => {
  if (festivalStore.festivals.length === 0) {
    festivalStore.fetchAll();
  }
});

const filteredFestivals = computed(() => {
  const query = search.value.trim().toLowerCase();
  const list = festivalStore.festivals;
  if (query === '') {
    return list.slice(0, 30);
  }
  return list
    .filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.country.toLowerCase().includes(query) ||
        (f.city ?? '').toLowerCase().includes(query)
    )
    .slice(0, 30);
});

const selectedFestival = computed(
  () => festivalStore.festivals.find((f) => f.id === selectedFestivalId.value) ?? null
);

const usedSet = computed(() => new Set(props.usedEditionIds));

const canSubmit = computed(
  () => selectedEditionId.value !== null && !usedSet.value.has(selectedEditionId.value)
);

async function selectFestival(id: number): Promise<void> {
  selectedFestivalId.value = id;
  selectedEditionId.value = null;
  isLoadingEditions.value = true;
  try {
    const detail = await festivalStore.fetchById(id);
    editions.value = detail?.editions ?? [];
    if (detail) {
      platform.value = detail.platformDefault;
    }
    const firstFree = editions.value.find((e) => !usedSet.value.has(e.id));
    selectedEditionId.value = firstFree?.id ?? editions.value[0]?.id ?? null;
  } finally {
    isLoadingEditions.value = false;
  }
}

const selectedEdition = computed(
  () => editions.value.find((e) => e.id === selectedEditionId.value) ?? null
);

watch(selectedFestival, (festival) => {
  if (festival) {
    platform.value = festival.platformDefault;
  }
});

function handleSubmit(): void {
  if (!canSubmit.value || selectedEditionId.value === null) {
    return;
  }
  const fee = Number.parseFloat(submissionFee.value);
  emit('submit', {
    editionId: selectedEditionId.value,
    categoryName: categoryName.value.trim() === '' ? null : categoryName.value.trim(),
    platform: platform.value,
    submissionFee: Number.isFinite(fee) ? fee : 0,
    feeCurrency: feeCurrency.value,
    paidBy: paidBy.value,
    status: 'Shortlist_Planned'
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <h2 class="text-lg font-semibold text-slate-800">Добавить фестиваль в план</h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="grid flex-1 grid-cols-2 gap-0 overflow-hidden">
        <!-- Каталог -->
        <div class="flex flex-col overflow-hidden border-r border-slate-200">
          <div class="p-4">
            <div class="relative">
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Поиск фестиваля..."
                class="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <ul class="flex-1 overflow-y-auto px-2 pb-2">
            <li v-for="festival in filteredFestivals" :key="festival.id">
              <button
                class="flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50"
                :class="selectedFestivalId === festival.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''"
                @click="selectFestival(festival.id)"
              >
                <span class="font-medium text-slate-800">{{ festival.name }}</span>
                <span class="text-xs text-slate-500">
                  <template v-if="festival.city">{{ festival.city }}, </template>{{ festival.country }}
                </span>
              </button>
            </li>
            <li
              v-if="filteredFestivals.length === 0"
              class="px-3 py-6 text-center text-sm text-slate-400"
            >
              Ничего не найдено
            </li>
          </ul>
        </div>

        <!-- Детали подачи -->
        <div class="flex flex-col overflow-y-auto p-5">
          <div v-if="!selectedFestival" class="m-auto text-center text-sm text-slate-400">
            Выберите фестиваль из каталога слева
          </div>

          <div v-else class="space-y-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-slate-800">{{ selectedFestival.name }}</h3>
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="ACCREDITATION_BADGE_CLASSES[selectedFestival.accreditation]"
                >
                  {{ ACCREDITATION_LABELS[selectedFestival.accreditation] }}
                </span>
              </div>
              <p v-if="selectedFestival.websiteUrl" class="truncate text-xs text-slate-400">
                {{ selectedFestival.websiteUrl }}
              </p>
            </div>

            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Сезон *</span>
              <select
                v-model.number="selectedEditionId"
                :disabled="isLoadingEditions || editions.length === 0"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              >
                <option v-if="editions.length === 0" :value="null">Нет доступных сезонов</option>
                <option
                  v-for="edition in editions"
                  :key="edition.id"
                  :value="edition.id"
                  :disabled="usedSet.has(edition.id)"
                >
                  {{ edition.editionYear }}
                  <template v-if="usedSet.has(edition.id)"> — уже подан</template>
                </option>
              </select>
            </label>

            <div
              v-if="selectedEdition"
              class="space-y-1 rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600"
            >
              <div class="flex justify-between">
                <span>Early deadline</span>
                <span>{{ formatDate(selectedEdition.earlyDeadline) }}</span>
              </div>
              <div class="flex justify-between font-medium text-slate-800">
                <span>Regular deadline</span>
                <span>{{ formatDate(selectedEdition.regularDeadline) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Late deadline</span>
                <span>{{ formatDate(selectedEdition.lateDeadline) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Объявление</span>
                <span>{{ formatDate(selectedEdition.notificationDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Премьера</span>
                <span>{{ PREMIERE_REQUIREMENT_LABELS[selectedEdition.premiereRequirement] }}</span>
              </div>
            </div>

            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Категория конкурса</span>
              <input
                v-model="categoryName"
                placeholder="International Competition"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Платформа подачи</span>
              <select
                v-model="platform"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option v-for="p in SUBMISSION_PLATFORMS" :key="p" :value="p">{{ p }}</option>
              </select>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-slate-700">Взнос</span>
                <input
                  v-model="submissionFee"
                  type="number"
                  min="0"
                  step="0.01"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-slate-700">Валюта</span>
                <select
                  v-model="feeCurrency"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
                </select>
              </label>
            </div>

            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Плательщик</span>
              <select v-model="paidBy" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option v-for="p in PAID_BY_OPTIONS" :key="p" :value="p">{{ PAID_BY_LABELS[p] }}</option>
              </select>
            </label>
          </div>
        </div>
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
          type="button"
          :disabled="props.isSaving || !canSubmit"
          class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          @click="handleSubmit"
        >
          <Check :size="16" />
          Добавить в план
        </button>
      </div>
    </div>
  </div>
</template>
