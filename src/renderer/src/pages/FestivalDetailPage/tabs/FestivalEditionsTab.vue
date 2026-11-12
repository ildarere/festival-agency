<script setup lang="ts">
import { ref } from 'vue';
import { CalendarClock, Plus } from 'lucide-vue-next';
import { useFestivalStore } from '@renderer/entities/festival/model/store';
import AddEditionModal from '@renderer/entities/festival/ui/AddEditionModal.vue';
import { formatDate, PREMIERE_REQUIREMENT_LABELS } from '@renderer/entities/festival/model/editions';
import type { CreateEditionDto, FestivalDetailed } from '@preload/types';

const props = defineProps<{ festival: FestivalDetailed }>();

const store = useFestivalStore();
const isModalOpen = ref(false);

async function handleAddEdition(payload: CreateEditionDto): Promise<void> {
  await store.addEdition(props.festival.id, payload);
  isModalOpen.value = false;
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="text-sm text-slate-500">
        Сезонов: <span class="font-semibold text-slate-700">{{ props.festival.editions.length }}</span>
      </div>
      <button
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="isModalOpen = true"
      >
        <Plus :size="16" />
        Добавить сезон / год
      </button>
    </div>

    <div
      v-if="props.festival.editions.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center"
    >
      <CalendarClock :size="32" class="text-slate-300" />
      <p class="text-slate-500">Сезоны ещё не заведены</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div
        v-for="edition in props.festival.editions"
        :key="edition.id"
        class="rounded-lg border border-slate-200 bg-white p-4"
      >
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">{{ edition.editionYear }}</h3>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {{ PREMIERE_REQUIREMENT_LABELS[edition.premiereRequirement] }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Даты проведения</dt>
            <dd class="text-slate-700">
              {{ formatDate(edition.startDate) }} — {{ formatDate(edition.endDate) }}
            </dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Early Deadline</dt>
            <dd class="text-slate-700">{{ formatDate(edition.earlyDeadline) }}</dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Regular Deadline</dt>
            <dd class="font-medium text-slate-800">{{ formatDate(edition.regularDeadline) }}</dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Late Deadline</dt>
            <dd class="text-slate-700">{{ formatDate(edition.lateDeadline) }}</dd>
          </div>
          <div class="flex flex-col">
            <dt class="text-xs text-slate-400">Notification Date</dt>
            <dd class="text-slate-700">{{ formatDate(edition.notificationDate) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <AddEditionModal
      v-if="isModalOpen"
      :is-saving="store.isSaving"
      @submit="handleAddEdition"
      @close="isModalOpen = false"
    />
  </div>
</template>
