<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Database, ExternalLink, Globe, Plus, Search, Sparkles, Trophy } from 'lucide-vue-next';
import { useFestivalStore } from '@renderer/entities/festival/model/store';
import AddFestivalModal from '@renderer/entities/festival/ui/AddFestivalModal.vue';
import ExternalFestivalsSearch from '@renderer/entities/festival/ui/ExternalFestivalsSearch.vue';
import {
  ACCREDITATION_BADGE_CLASSES,
  ACCREDITATION_LABELS,
  ACCREDITATION_OPTIONS,
  PLATFORM_OPTIONS
} from '@renderer/entities/festival/model/accreditation';
import {
  deadlineUrgency,
  formatDate,
  pickRelevantEdition
} from '@renderer/entities/festival/model/editions';
import type {
  AccreditationType,
  CreateEditionDto,
  CreateFestivalDto,
  FestivalEdition,
  SubmissionPlatform
} from '@preload/types';

const router = useRouter();
const store = useFestivalStore();

type TabKey = 'local' | 'wikidata';
const activeTab = ref<TabKey>('local');

const isModalOpen = ref(false);
const platformFilter = ref<SubmissionPlatform | ''>('');
const editionsByFestival = ref<Map<number, FestivalEdition[]>>(new Map());

let searchDebounce: ReturnType<typeof setTimeout> | undefined;

async function loadEditions(): Promise<void> {
  const entries = await Promise.all(
    store.festivals.map(async (festival) => {
      const detail = await window.api.festivals.getById(festival.id);
      return [festival.id, detail?.editions ?? []] as const;
    })
  );
  editionsByFestival.value = new Map(entries);
}

async function reload(): Promise<void> {
  await store.fetchAll();
  await loadEditions();
}

onMounted(reload);

function handleSearchInput(event: Event): void {
  store.setSearch((event.target as HTMLInputElement).value);
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(reload, 300);
}

function handleAccreditationChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as AccreditationType | '';
  store.setAccreditation(value === '' ? undefined : value);
  reload();
}

function handlePlatformChange(event: Event): void {
  platformFilter.value = (event.target as HTMLSelectElement).value as SubmissionPlatform | '';
}

const visibleFestivals = computed(() => {
  if (platformFilter.value === '') {
    return store.festivals;
  }
  return store.festivals.filter((f) => f.platformDefault === platformFilter.value);
});

function currentEdition(festivalId: number): FestivalEdition | null {
  return pickRelevantEdition(editionsByFestival.value.get(festivalId) ?? []);
}

function deadlineClass(deadline: string | null): string {
  switch (deadlineUrgency(deadline)) {
    case 'past':
      return 'text-slate-400 line-through';
    case 'soon':
      return 'text-red-600 font-semibold';
    case 'upcoming':
      return 'text-slate-700';
    default:
      return 'text-slate-400';
  }
}

function goToFestival(id: number): void {
  router.push(`/festivals/${id}`);
}

async function handleCreateFestival(payload: {
  festival: CreateFestivalDto;
  edition: CreateEditionDto | null;
}): Promise<void> {
  const festival = await store.createFestival(payload.festival);
  if (payload.edition) {
    await store.addEdition(festival.id, payload.edition);
  }
  isModalOpen.value = false;
  await loadEditions();
}

async function openWebsite(url: string | null): Promise<void> {
  if (!url) {
    return;
  }
  await store.openWebsite(url);
}
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <Trophy :size="24" class="text-amber-500" />
          Каталог фестивалей
        </h1>
        <button
          v-if="activeTab === 'local'"
          class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="isModalOpen = true"
        >
          <Plus :size="18" />
          Добавить фестиваль
        </button>
      </div>

      <div class="mb-5 flex gap-1 border-b border-slate-200">
        <button
          class="flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors"
          :class="
            activeTab === 'local'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'local'"
        >
          <Database :size="16" />
          Локальная база
        </button>
        <button
          class="flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors"
          :class="
            activeTab === 'wikidata'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'wikidata'"
        >
          <Sparkles :size="16" />
          Поиск в Wikidata
        </button>
      </div>

      <template v-if="activeTab === 'local'">
        <div class="mb-4 flex flex-wrap gap-3">
          <div class="relative min-w-[240px] flex-1">
            <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию, городу, стране..."
              class="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm"
              @input="handleSearchInput"
            />
          </div>
          <select
            class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            @change="handleAccreditationChange"
          >
            <option value="">Все аккредитации</option>
            <option v-for="a in ACCREDITATION_OPTIONS" :key="a" :value="a">
              {{ ACCREDITATION_LABELS[a] }}
            </option>
          </select>
          <select
            class="rounded-md border border-slate-300 px-3 py-2 text-sm"
            @change="handlePlatformChange"
          >
            <option value="">Все платформы</option>
            <option v-for="p in PLATFORM_OPTIONS" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>

        <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-600">
              <tr>
                <th class="px-4 py-3 font-medium">Фестиваль</th>
                <th class="px-4 py-3 font-medium">Город / Страна</th>
                <th class="px-4 py-3 font-medium">Аккредитация</th>
                <th class="px-4 py-3 font-medium">Текущий сезон</th>
                <th class="px-4 py-3 font-medium">Regular deadline</th>
                <th class="px-4 py-3 font-medium">Платформа</th>
                <th class="px-4 py-3 font-medium">Сайт</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.isLoading">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">Загрузка...</td>
              </tr>
              <tr v-else-if="visibleFestivals.length === 0">
                <td colspan="7" class="px-4 py-6 text-center text-slate-400">Фестивали не найдены</td>
              </tr>
              <tr
                v-for="festival in visibleFestivals"
                :key="festival.id"
                class="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                @click="goToFestival(festival.id)"
              >
                <td class="px-4 py-3 font-medium text-slate-800">{{ festival.name }}</td>
                <td class="px-4 py-3 text-slate-600">
                  <span v-if="festival.city">{{ festival.city }}, </span>{{ festival.country }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-block rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="ACCREDITATION_BADGE_CLASSES[festival.accreditation]"
                  >
                    {{ ACCREDITATION_LABELS[festival.accreditation] }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  {{ currentEdition(festival.id)?.editionYear ?? '—' }}
                </td>
                <td
                  class="px-4 py-3"
                  :class="deadlineClass(currentEdition(festival.id)?.regularDeadline ?? null)"
                >
                  {{ formatDate(currentEdition(festival.id)?.regularDeadline ?? null) }}
                </td>
                <td class="px-4 py-3 text-slate-600">{{ festival.platformDefault }}</td>
                <td class="px-4 py-3">
                  <button
                    v-if="festival.websiteUrl"
                    class="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    @click.stop="openWebsite(festival.websiteUrl)"
                  >
                    <ExternalLink :size="14" />
                    Открыть
                  </button>
                  <span v-else class="text-slate-300"><Globe :size="14" /></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <ExternalFestivalsSearch v-else />
    </div>

    <AddFestivalModal
      v-if="isModalOpen"
      :is-saving="store.isSaving"
      @submit="handleCreateFestival"
      @close="isModalOpen = false"
    />
  </div>
</template>
