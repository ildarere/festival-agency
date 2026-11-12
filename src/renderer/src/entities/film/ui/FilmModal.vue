<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import type { CreateFilmDto, Film, PremiereStatus } from '@preload/types';

const props = defineProps<{
  initial?: Film | null;
  isSaving: boolean;
}>();

type FilmFormPayload = Omit<CreateFilmDto, 'clientId'>;

const emit = defineEmits<{
  submit: [payload: FilmFormPayload];
  close: [];
}>();

const PREMIERE_STATUSES: PremiereStatus[] = ['World', 'International', 'National', 'None'];
const PREMIERE_LABELS: Record<PremiereStatus, string> = {
  World: 'Мировая премьера',
  International: 'Международная премьера',
  National: 'Национальная премьера',
  None: 'Без премьеры'
};

type ModalTab = 'metadata' | 'materials';
const activeTab = ref<ModalTab>('metadata');

interface FormState {
  titleOriginal: string;
  titleIntl: string;
  director: string;
  producer: string;
  year: string;
  durationMin: string;
  genre: string;
  aspectRatio: string;
  soundFormat: string;
  synopsisShort: string;
  synopsisLong: string;
  premiereStatus: PremiereStatus;
  screenerUrl: string;
  screenerPassword: string;
  subtitlesUrl: string;
  pressKitUrl: string;
  stillsFolderUrl: string;
  trailerUrl: string;
  dialogueListUrl: string;
  dcpCloudUrl: string;
}

function buildInitialState(film?: Film | null): FormState {
  return {
    titleOriginal: film?.titleOriginal ?? '',
    titleIntl: film?.titleIntl ?? '',
    director: film?.director ?? '',
    producer: film?.producer ?? '',
    year: film ? String(film.year) : '',
    durationMin: film ? String(film.durationMin) : '',
    genre: film?.genre ?? '',
    aspectRatio: film?.aspectRatio ?? '',
    soundFormat: film?.soundFormat ?? '',
    synopsisShort: film?.synopsisShort ?? '',
    synopsisLong: film?.synopsisLong ?? '',
    premiereStatus: film?.premiereStatus ?? 'World',
    screenerUrl: film?.screenerUrl ?? '',
    screenerPassword: film?.screenerPassword ?? '',
    subtitlesUrl: film?.subtitlesUrl ?? '',
    pressKitUrl: film?.pressKitUrl ?? '',
    stillsFolderUrl: film?.stillsFolderUrl ?? '',
    trailerUrl: film?.trailerUrl ?? '',
    dialogueListUrl: film?.dialogueListUrl ?? '',
    dcpCloudUrl: film?.dcpCloudUrl ?? ''
  };
}

const form = reactive<FormState>(buildInitialState(props.initial));

watch(
  () => props.initial,
  (film) => {
    Object.assign(form, buildInitialState(film));
    activeTab.value = 'metadata';
  }
);

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function handleSubmit(): void {
  emit('submit', {
    titleOriginal: form.titleOriginal.trim(),
    titleIntl: normalizeOptional(form.titleIntl),
    director: form.director.trim(),
    producer: normalizeOptional(form.producer),
    year: Number(form.year),
    durationMin: Number(form.durationMin),
    genre: normalizeOptional(form.genre),
    aspectRatio: normalizeOptional(form.aspectRatio),
    soundFormat: normalizeOptional(form.soundFormat),
    synopsisShort: normalizeOptional(form.synopsisShort),
    synopsisLong: normalizeOptional(form.synopsisLong),
    premiereStatus: form.premiereStatus,
    screenerUrl: normalizeOptional(form.screenerUrl),
    screenerPassword: normalizeOptional(form.screenerPassword),
    subtitlesUrl: normalizeOptional(form.subtitlesUrl),
    pressKitUrl: normalizeOptional(form.pressKitUrl),
    stillsFolderUrl: normalizeOptional(form.stillsFolderUrl),
    trailerUrl: normalizeOptional(form.trailerUrl),
    dialogueListUrl: normalizeOptional(form.dialogueListUrl),
    dcpCloudUrl: normalizeOptional(form.dcpCloudUrl)
  });
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-200 p-6 pb-4">
        <h2 class="text-lg font-semibold text-slate-800">
          {{ initial ? 'Редактировать фильм' : 'Добавить фильм' }}
        </h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="flex gap-1 border-b border-slate-200 px-6">
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm font-medium"
          :class="
            activeTab === 'metadata'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'metadata'"
        >
          Метаданные
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm font-medium"
          :class="
            activeTab === 'materials'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'materials'"
        >
          Материалы и ссылки
        </button>
      </div>

      <form class="flex flex-1 flex-col overflow-hidden" @submit.prevent="handleSubmit">
        <div class="flex-1 overflow-y-auto p-6">
          <div v-show="activeTab === 'metadata'" class="grid grid-cols-2 gap-4">
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Оригинальное название *</span>
              <input
                v-model="form.titleOriginal"
                required
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Международное название</span>
              <input v-model="form.titleIntl" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Режиссер *</span>
              <input
                v-model="form.director"
                required
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Продюсер</span>
              <input v-model="form.producer" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Год *</span>
              <input
                v-model="form.year"
                type="number"
                required
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Хронометраж (мин) *</span>
              <input
                v-model="form.durationMin"
                type="number"
                required
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Жанр</span>
              <input v-model="form.genre" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Статус премьеры</span>
              <select v-model="form.premiereStatus" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option v-for="status in PREMIERE_STATUSES" :key="status" :value="status">
                  {{ PREMIERE_LABELS[status] }}
                </option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Соотношение сторон</span>
              <input
                v-model="form.aspectRatio"
                placeholder="1.85:1"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Звук</span>
              <input
                v-model="form.soundFormat"
                placeholder="5.1"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Краткий синопсис</span>
              <textarea
                v-model="form.synopsisShort"
                rows="2"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              ></textarea>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Полный синопсис</span>
              <textarea
                v-model="form.synopsisLong"
                rows="4"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              ></textarea>
            </label>
          </div>

          <div v-show="activeTab === 'materials'" class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Ссылка на скринер</span>
              <input
                v-model="form.screenerUrl"
                placeholder="https://vimeo.com/..."
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Пароль от скринера</span>
              <input
                v-model="form.screenerPassword"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Субтитры</span>
              <input v-model="form.subtitlesUrl" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Пресс-кит</span>
              <input v-model="form.pressKitUrl" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Папка с кадрами</span>
              <input
                v-model="form.stillsFolderUrl"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Трейлер</span>
              <input v-model="form.trailerUrl" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">Диалоговые листы</span>
              <input
                v-model="form.dialogueListUrl"
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              <span class="font-medium text-slate-700">DCP (облако)</span>
              <input v-model="form.dcpCloudUrl" class="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
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
            type="submit"
            :disabled="isSaving"
            class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {{ initial ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
