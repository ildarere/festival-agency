<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  ClipboardList,
  Copy,
  Film as FilmIcon,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Trash2
} from 'lucide-vue-next';
import { useFilmStore } from '@renderer/entities/film/model/store';
import { calculateFilmReadiness } from '@renderer/entities/film/model/readiness';
import FilmModal from '@renderer/entities/film/ui/FilmModal.vue';
import MaterialsChecklistModal from '@renderer/entities/film/ui/MaterialsChecklistModal.vue';
import type { CreateFilmDto, Film } from '@preload/types';

const props = defineProps<{ clientId: number }>();

const store = useFilmStore();

const isFilmModalOpen = ref(false);
const editingFilm = ref<Film | null>(null);
const checklistFilm = ref<Film | null>(null);
const copiedFilmId = ref<number | null>(null);
const openMenuFilmId = ref<number | null>(null);

function closeMenu(): void {
  openMenuFilmId.value = null;
}

function toggleMenu(filmId: number): void {
  openMenuFilmId.value = openMenuFilmId.value === filmId ? null : filmId;
}

onMounted(() => {
  store.fetchByClientId(props.clientId);
  window.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  window.removeEventListener('click', closeMenu);
});

const PREMIERE_LABELS: Record<Film['premiereStatus'], string> = {
  World: 'Мировая премьера',
  International: 'Межд. премьера',
  National: 'Нац. премьера',
  None: 'Без премьеры'
};

const readinessById = computed(() => {
  const map = new Map<number, ReturnType<typeof calculateFilmReadiness>>();
  for (const film of store.films) {
    map.set(film.id, calculateFilmReadiness(film));
  }
  return map;
});

function readinessColor(score: number): string {
  if (score >= 100) {
    return 'bg-green-500';
  }
  if (score >= 50) {
    return 'bg-amber-500';
  }
  return 'bg-red-500';
}

function openCreateModal(): void {
  editingFilm.value = null;
  isFilmModalOpen.value = true;
}

function openEditModal(film: Film): void {
  editingFilm.value = film;
  isFilmModalOpen.value = true;
}

function closeFilmModal(): void {
  isFilmModalOpen.value = false;
  editingFilm.value = null;
}

async function handleSaveFilm(payload: Omit<CreateFilmDto, 'clientId'>): Promise<void> {
  if (editingFilm.value) {
    await store.updateFilm(editingFilm.value.id, payload);
  } else {
    await store.createFilm({ ...payload, clientId: props.clientId });
  }
  closeFilmModal();
}

async function handleDeleteFilm(id: number): Promise<void> {
  closeMenu();
  if (!confirm('Удалить фильм? Это действие необратимо.')) {
    return;
  }
  await store.deleteFilm(id);
}

async function handleOpenScreener(film: Film): Promise<void> {
  if (!film.screenerUrl) {
    return;
  }
  await store.openExternalLink(film.screenerUrl);
}

async function handleCopyPassword(film: Film): Promise<void> {
  if (!film.screenerPassword) {
    return;
  }
  await navigator.clipboard.writeText(film.screenerPassword);
  copiedFilmId.value = film.id;
  setTimeout(() => {
    if (copiedFilmId.value === film.id) {
      copiedFilmId.value = null;
    }
  }, 1500);
}

function openChecklist(film: Film): void {
  checklistFilm.value = film;
}

function closeChecklist(): void {
  checklistFilm.value = null;
}

async function handleOpenLink(url: string): Promise<void> {
  await store.openExternalLink(url);
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="text-sm text-slate-500">
        Фильмов: <span class="font-semibold text-slate-700">{{ store.films.length }}</span>
      </div>
      <button
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="openCreateModal"
      >
        <Plus :size="16" />
        Добавить фильм
      </button>
    </div>

    <div v-if="store.isLoading" class="py-12 text-center text-slate-400">Загрузка...</div>

    <div
      v-else-if="store.films.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center"
    >
      <FilmIcon :size="32" class="text-slate-300" />
      <p class="text-slate-500">У этого клиента пока нет фильмов</p>
      <button class="text-sm font-medium text-blue-600 hover:underline" @click="openCreateModal">
        Добавить первый проект
      </button>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="film in store.films"
        :key="film.id"
        class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="truncate font-semibold text-slate-800">{{ film.titleOriginal }}</h3>
            <p v-if="film.titleIntl" class="truncate text-sm text-slate-500">{{ film.titleIntl }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <span
              class="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {{ PREMIERE_LABELS[film.premiereStatus] }}
            </span>
            <div class="relative">
              <button
                class="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                @click.stop="toggleMenu(film.id)"
              >
                <MoreVertical :size="18" />
              </button>
              <div
                v-if="openMenuFilmId === film.id"
                class="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-slate-200 bg-white py-1 shadow-lg"
                @click.stop
              >
                <button
                  class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  @click="handleDeleteFilm(film.id)"
                >
                  <Trash2 :size="14" />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>{{ film.year }}</span>
          <span>{{ film.durationMin }} мин</span>
          <span v-if="film.genre">{{ film.genre }}</span>
        </div>

        <div>
          <div class="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Готовность материалов</span>
            <span class="font-medium">{{ readinessById.get(film.id)?.score ?? 0 }}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full transition-all"
              :class="readinessColor(readinessById.get(film.id)?.score ?? 0)"
              :style="{ width: `${readinessById.get(film.id)?.score ?? 0}%` }"
            ></div>
          </div>
        </div>

        <div class="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
          <button
            class="flex items-center gap-1 text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
            :disabled="!film.screenerUrl"
            @click="handleOpenScreener(film)"
          >
            <Play :size="14" />
            Скринер
          </button>
          <button
            class="ml-auto flex items-center gap-1 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
            :disabled="!film.screenerPassword"
            @click="handleCopyPassword(film)"
          >
            <Copy :size="14" />
            {{ copiedFilmId === film.id ? 'Скопировано' : 'Пароль' }}
          </button>
        </div>

        <div class="mt-auto flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
          <button class="flex items-center gap-1 text-slate-600 hover:text-slate-900" @click="openEditModal(film)">
            <Pencil :size="14" />
            Редактировать
          </button>
          <button class="flex items-center gap-1 text-slate-600 hover:text-slate-900" @click="openChecklist(film)">
            <ClipboardList :size="14" />
            Чеклист
          </button>
        </div>
      </div>
    </div>

    <FilmModal
      v-if="isFilmModalOpen"
      :initial="editingFilm"
      :is-saving="store.isSaving"
      @submit="handleSaveFilm"
      @close="closeFilmModal"
    />

    <MaterialsChecklistModal
      v-if="checklistFilm"
      :film="checklistFilm"
      @close="closeChecklist"
      @open-link="handleOpenLink"
    />
  </div>
</template>
