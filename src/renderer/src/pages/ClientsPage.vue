<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Search } from 'lucide-vue-next';
import { useClientStore } from '@renderer/entities/client/model/store';
import ClientModal from '@renderer/entities/client/ui/ClientModal.vue';
import BillingStatusBadge from '@renderer/entities/client/ui/BillingStatusBadge.vue';
import type { BillingStatus, CreateClientDto } from '@preload/types';

const router = useRouter();
const store = useClientStore();
const isModalOpen = ref(false);

const BILLING_STATUSES: BillingStatus[] = ['Trial', 'Unpaid', 'Partially Paid', 'Paid'];

let searchDebounce: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  store.fetchClients();
});

function handleSearchInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;
  store.setSearch(value);
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => store.fetchClients(), 300);
}

function handleStatusFilterChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as BillingStatus | '';
  store.setBillingStatusFilter(value === '' ? undefined : value);
  store.fetchClients();
}

function openClient(id: number): void {
  router.push(`/clients/${id}`);
}

async function handleCreateClient(dto: CreateClientDto): Promise<void> {
  const client = await store.createClient(dto);
  console.log('Created client:', client);
  isModalOpen.value = false;
  router.push(`/clients/${client.id}`);
}

async function handleDeleteClient(id: number): Promise<void> {
  if (!confirm('Удалить клиента? Это действие необратимо.')) {
    return;
  }
  await store.deleteClient(id);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800">Клиенты</h1>
        <button
          class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          @click="isModalOpen = true"
        >
          <Plus :size="18" />
          Добавить клиента
        </button>
      </div>

      <div class="mb-4 flex gap-3">
        <div class="relative flex-1">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени или компании..."
            class="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm"
            @input="handleSearchInput"
          />
        </div>
        <select
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
          @change="handleStatusFilterChange"
        >
          <option value="">Все статусы</option>
          <option v-for="status in BILLING_STATUSES" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>

      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">ФИО</th>
              <th class="px-4 py-3 font-medium">Компания</th>
              <th class="px-4 py-3 font-medium">Контакты</th>
              <th class="px-4 py-3 font-medium">Статус оплаты</th>
              <th class="px-4 py-3 font-medium">Дата создания</th>
              <th class="px-4 py-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.isLoading">
              <td colspan="6" class="px-4 py-6 text-center text-slate-400">Загрузка...</td>
            </tr>
            <tr v-else-if="store.clients.length === 0">
              <td colspan="6" class="px-4 py-6 text-center text-slate-400">Клиенты не найдены</td>
            </tr>
            <tr
              v-for="client in store.clients"
              :key="client.id"
              class="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
              @click="openClient(client.id)"
            >
              <td class="px-4 py-3 font-medium text-slate-800">{{ client.fullName }}</td>
              <td class="px-4 py-3 text-slate-600">{{ client.companyName || '—' }}</td>
              <td class="px-4 py-3 text-slate-600">
                <div>{{ client.email }}</div>
                <div v-if="client.telegram" class="text-xs text-slate-400">{{ client.telegram }}</div>
              </td>
              <td class="px-4 py-3"><BillingStatusBadge :status="client.billingStatus" /></td>
              <td class="px-4 py-3 text-slate-600">{{ formatDate(client.createdAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3" @click.stop>
                  <button class="text-sm text-blue-600 hover:underline" @click="openClient(client.id)">
                    Открыть
                  </button>
                  <button
                    class="text-sm text-red-600 hover:underline"
                    @click="handleDeleteClient(client.id)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ClientModal
      v-if="isModalOpen"
      :is-saving="store.isSaving"
      @submit="handleCreateClient"
      @close="isModalOpen = false"
    />
  </div>
</template>
