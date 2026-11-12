<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-vue-next';
import { useFestivalStore } from '@renderer/entities/festival/model/store';
import EditFestivalModal from '@renderer/entities/festival/ui/EditFestivalModal.vue';
import FestivalEditionsTab from './FestivalDetailPage/tabs/FestivalEditionsTab.vue';
import FestivalHistoryTab from './FestivalDetailPage/tabs/FestivalHistoryTab.vue';
import FestivalInfoTab from './FestivalDetailPage/tabs/FestivalInfoTab.vue';
import {
  ACCREDITATION_BADGE_CLASSES,
  ACCREDITATION_LABELS
} from '@renderer/entities/festival/model/accreditation';
import type { UpdateFestivalDto } from '@preload/types';

const props = defineProps<{ id: string }>();

const router = useRouter();
const store = useFestivalStore();

const festivalId = computed(() => Number(props.id));

type TabKey = 'editions' | 'history' | 'info';
const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'editions', label: 'Сезоны и дедлайны' },
  { key: 'history', label: 'История подач агентства' },
  { key: 'info', label: 'Заметки агента' }
];
const activeTab = ref<TabKey>('editions');
const isEditOpen = ref(false);

async function load(): Promise<void> {
  await store.fetchFestivalDetails(festivalId.value);
}

onMounted(load);
watch(festivalId, load);

const festival = computed(() => store.currentFestival);

function goBack(): void {
  router.push('/festivals');
}

async function openWebsite(): Promise<void> {
  if (festival.value?.websiteUrl) {
    await store.openWebsite(festival.value.websiteUrl);
  }
}

async function handleSaveEdit(payload: UpdateFestivalDto): Promise<void> {
  await store.updateFestival(festivalId.value, payload);
  isEditOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="mx-auto max-w-5xl">
      <button
        class="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        @click="goBack"
      >
        <ArrowLeft :size="16" />
        Назад к каталогу
      </button>

      <div v-if="store.isLoading && !festival" class="text-slate-400">Загрузка...</div>

      <div
        v-else-if="!festival"
        class="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
      >
        Фестиваль не найден
      </div>

      <template v-else>
        <!-- Шапка -->
        <div class="mb-6 rounded-lg border border-slate-200 bg-white p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-slate-800">{{ festival.name }}</h1>
              <p class="mt-1 text-sm text-slate-500">
                <template v-if="festival.city">{{ festival.city }}, </template>{{ festival.country }}
                <span v-if="festival.wikidataId" class="ml-2 font-mono text-xs text-slate-400">
                  {{ festival.wikidataId }}
                </span>
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="ACCREDITATION_BADGE_CLASSES[festival.accreditation]"
                >
                  {{ ACCREDITATION_LABELS[festival.accreditation] }}
                </span>
                <span
                  class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  Подача: {{ festival.platformDefault }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="festival.websiteUrl"
                class="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                @click="openWebsite"
              >
                <ExternalLink :size="16" />
                Официальный сайт
              </button>
              <button
                class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                @click="isEditOpen = true"
              >
                <Pencil :size="16" />
                Редактировать фестиваль
              </button>
            </div>
          </div>
        </div>

        <!-- Табы -->
        <div class="mb-6 flex gap-1 border-b border-slate-200">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            class="border-b-2 px-4 py-2 text-sm font-medium transition-colors"
            :class="
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <FestivalEditionsTab v-if="activeTab === 'editions'" :festival="festival" />
        <FestivalHistoryTab v-else-if="activeTab === 'history'" :history="festival.history" />
        <FestivalInfoTab v-else :festival="festival" />
      </template>
    </div>

    <EditFestivalModal
      v-if="isEditOpen && festival"
      :festival="festival"
      :is-saving="store.isSaving"
      @submit="handleSaveEdit"
      @close="isEditOpen = false"
    />
  </div>
</template>
