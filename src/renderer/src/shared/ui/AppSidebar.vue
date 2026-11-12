<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Calendar, Database, DownloadCloud, Trophy, UploadCloud, Users } from 'lucide-vue-next';

const route = useRoute();

interface NavItem {
  label: string;
  to: string;
  icon: typeof Users;
  matchPrefixes: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Клиенты', to: '/', icon: Users, matchPrefixes: ['/clients'] },
  { label: 'Каталог фестивалей', to: '/festivals', icon: Trophy, matchPrefixes: ['/festivals'] },
  { label: 'Календарь', to: '/calendar', icon: Calendar, matchPrefixes: ['/calendar'] }
];

function isActive(item: NavItem): boolean {
  if (route.path === item.to) {
    return true;
  }
  return item.matchPrefixes.some((prefix) => route.path.startsWith(prefix));
}

const isBusy = ref(false);
const message = ref<string | null>(null);

async function handleBackup(): Promise<void> {
  isBusy.value = true;
  message.value = null;
  try {
    const result = await window.api.system.exportBackup();
    if (!result.canceled && result.filePath) {
      message.value = 'Резервная копия сохранена.';
    }
  } catch {
    message.value = 'Не удалось создать резервную копию.';
  } finally {
    isBusy.value = false;
  }
}

async function handleRestore(): Promise<void> {
  if (!window.confirm('Восстановить базу из копии? Текущие данные будут заменены, приложение перезапустится.')) {
    return;
  }
  isBusy.value = true;
  message.value = null;
  try {
    const result = await window.api.system.importBackup();
    if (result.error) {
      message.value = result.error;
    }
  } catch {
    message.value = 'Не удалось восстановить базу.';
  } finally {
    isBusy.value = false;
  }
}
</script>

<template>
  <aside class="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
    <div class="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
      <span
        class="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white"
      >
        E
      </span>
      <span class="text-lg font-bold tracking-tight text-slate-800">EWA</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1 p-3">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="
          isActive(item)
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        "
      >
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="border-t border-slate-200 p-3">
      <div class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Database :size="14" />
        База данных
      </div>
      <button
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        :disabled="isBusy"
        @click="handleBackup"
      >
        <DownloadCloud :size="16" />
        Резервная копия
      </button>
      <button
        class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        :disabled="isBusy"
        @click="handleRestore"
      >
        <UploadCloud :size="16" />
        Восстановить из копии
      </button>
      <p v-if="message" class="mt-2 px-3 text-xs text-slate-500">{{ message }}</p>
    </div>
  </aside>
</template>
