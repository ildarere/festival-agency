<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Save } from 'lucide-vue-next';
import { useFestivalStore } from '@renderer/entities/festival/model/store';
import type { FestivalDetailed } from '@preload/types';

const props = defineProps<{ festival: FestivalDetailed }>();

const store = useFestivalStore();

const draft = ref(props.festival.notes ?? '');
const savedAt = ref<number | null>(null);

watch(
  () => props.festival.id,
  () => {
    draft.value = props.festival.notes ?? '';
    savedAt.value = null;
  }
);

const isDirty = computed(() => draft.value !== (props.festival.notes ?? ''));

async function save(): Promise<void> {
  await store.updateFestival(props.festival.id, {
    notes: draft.value.trim() === '' ? null : draft.value
  });
  savedAt.value = Date.now();
}
</script>

<template>
  <div class="rounded-lg border border-slate-200 bg-white p-6">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-700">Внутренние заметки агента</h3>
      <span v-if="savedAt && !isDirty" class="text-xs text-emerald-600">Сохранено</span>
    </div>
    <p class="mb-3 text-xs text-slate-400">
      Требования к DCP, специфика жюри, контакты программных директоров, договорённости по премьерам.
    </p>
    <textarea
      v-model="draft"
      rows="14"
      placeholder="Например: DCP только SMPTE, InterOp не принимают. Программный директор — ..., отвечает на письма в течение недели."
      class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
    ></textarea>
    <div class="mt-3 flex justify-end">
      <button
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        :disabled="!isDirty || store.isSaving"
        @click="save"
      >
        <Save :size="16" />
        Сохранить заметки
      </button>
    </div>
  </div>
</template>
