<script setup lang="ts">
import { X } from 'lucide-vue-next';
import ClientForm from './ClientForm.vue';
import type { CreateClientDto } from '@preload/types';

defineProps<{ isSaving: boolean }>();

const emit = defineEmits<{
  submit: [payload: CreateClientDto];
  close: [];
}>();
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-800">Добавить клиента</h2>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">
          <X :size="20" />
        </button>
      </div>
      <ClientForm
        submit-label="Создать"
        :is-saving="isSaving"
        @submit="emit('submit', $event)"
        @cancel="emit('close')"
      />
    </div>
  </div>
</template>
