<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircle2, DownloadCloud, ExternalLink, Loader2, Search } from 'lucide-vue-next';
import { useFestivalStore } from '../model/store';
import type { WikidataFestivalItem } from '@preload/types';

const store = useFestivalStore();

const query = ref('');
const hasSearched = ref(false);
const errorMessage = ref<string | null>(null);
const importingQid = ref<string | null>(null);

async function runSearch(): Promise<void> {
  if (query.value.trim().length < 2) {
    return;
  }
  errorMessage.value = null;
  hasSearched.value = true;
  try {
    await store.searchWikidata(query.value.trim());
  } catch {
    errorMessage.value = 'Не удалось получить данные из Wikidata. Проверьте соединение и повторите.';
  }
}

async function importItem(item: WikidataFestivalItem): Promise<void> {
  importingQid.value = item.qid;
  try {
    await store.importWikidata(item);
  } catch {
    errorMessage.value = `Не удалось импортировать «${item.name}».`;
  } finally {
    importingQid.value = null;
  }
}

async function openWebsite(url: string | null): Promise<void> {
  if (url) {
    await store.openWebsite(url);
  }
}
</script>

<template>
  <div>
    <form class="mb-4 flex gap-2" @submit.prevent="runSearch">
      <div class="relative flex-1">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="query"
          type="text"
          placeholder="Название кинофестиваля (например, Rotterdam, Busan)..."
          class="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm"
        />
      </div>
      <button
        type="submit"
        :disabled="store.isSearchingWikidata || query.trim().length < 2"
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Loader2 v-if="store.isSearchingWikidata" :size="16" class="animate-spin" />
        <Search v-else :size="16" />
        Искать
      </button>
    </form>

    <p class="mb-3 text-xs text-slate-400">
      Поиск выполняется по Wikidata SPARQL (класс «кинофестиваль», Q220505). Импортированные смотры
      появляются в локальной базе EWA.
    </p>

    <div v-if="errorMessage" class="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ errorMessage }}
    </div>

    <div v-if="store.isSearchingWikidata" class="py-12 text-center text-slate-400">
      Запрашиваем Wikidata...
    </div>

    <div
      v-else-if="hasSearched && store.wikidataResults.length === 0"
      class="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
    >
      Ничего не найдено
    </div>

    <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div
        v-for="item in store.wikidataResults"
        :key="item.qid"
        class="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="truncate font-semibold text-slate-800">{{ item.name }}</h3>
            <p class="text-xs text-slate-500">
              <template v-if="item.city">{{ item.city }}, </template>
              {{ item.country ?? 'страна не указана' }}
            </p>
          </div>
          <span class="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-500">
            {{ item.qid }}
          </span>
        </div>

        <div class="mt-auto flex items-center justify-between gap-2 pt-2">
          <button
            v-if="item.websiteUrl"
            class="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            @click="openWebsite(item.websiteUrl)"
          >
            <ExternalLink :size="12" />
            Сайт
          </button>
          <span v-else class="text-xs text-slate-300">без сайта</span>

          <span
            v-if="item.alreadyImported"
            class="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700"
          >
            <CheckCircle2 :size="13" />
            В базе
          </span>
          <button
            v-else
            :disabled="importingQid === item.qid"
            class="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            @click="importItem(item)"
          >
            <Loader2 v-if="importingQid === item.qid" :size="13" class="animate-spin" />
            <DownloadCloud v-else :size="13" />
            Импортировать в EWA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
