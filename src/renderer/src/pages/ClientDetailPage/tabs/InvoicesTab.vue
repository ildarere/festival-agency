<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Plus, Wallet } from 'lucide-vue-next';
import { useInvoiceStore } from '@renderer/entities/invoice/model/store';
import CreateInvoiceModal from '@renderer/entities/invoice/ui/CreateInvoiceModal.vue';
import {
  INVOICE_PURPOSE_LABELS,
  INVOICE_STATUS_CLASSES,
  INVOICE_STATUS_LABELS,
  formatMoney
} from '@renderer/entities/invoice/model/meta';
import type { CreateInvoiceDto, Film } from '@preload/types';

const props = defineProps<{ clientId: number }>();

const invoiceStore = useInvoiceStore();
const films = ref<Film[]>([]);
const isModalOpen = ref(false);

onMounted(async () => {
  await Promise.all([
    invoiceStore.loadForClient(props.clientId),
    window.api.films.getByClientId(props.clientId).then((list) => {
      films.value = list;
    })
  ]);
});

const summary = computed(() => invoiceStore.summary);

const suggestedNumber = computed(() => {
  const year = new Date().getFullYear();
  const seq = String(invoiceStore.invoices.length + 1).padStart(3, '0');
  return `EWA-${year}-${props.clientId}-${seq}`;
});

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleDateString('ru-RU');
}

async function handleCreate(payload: Omit<CreateInvoiceDto, 'clientId'>): Promise<void> {
  await invoiceStore.createInvoice({ ...payload, clientId: props.clientId });
  isModalOpen.value = false;
}

async function markPaid(id: number): Promise<void> {
  await invoiceStore.setStatus(id, 'Paid');
}

async function cancelInvoice(id: number): Promise<void> {
  await invoiceStore.setStatus(id, 'Cancelled');
}

async function removeInvoice(id: number): Promise<void> {
  if (!confirm('Удалить счёт?')) {
    return;
  }
  await invoiceStore.deleteInvoice(id);
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Wallet :size="16" />
        Счета клиента
      </h2>
      <button
        class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        @click="isModalOpen = true"
      >
        <Plus :size="16" />
        Выставить счёт
      </button>
    </div>

    <!-- Сводка -->
    <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Выставлено</div>
        <div class="mt-1 text-xl font-bold text-slate-800">
          {{ formatMoney(summary?.totalInvoiced ?? 0, 'USD') }}
        </div>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Оплачено</div>
        <div class="mt-1 text-xl font-bold text-emerald-600">
          {{ formatMoney(summary?.totalPaid ?? 0, 'USD') }}
        </div>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-xs text-slate-500">Доступный баланс на подачи</div>
        <div
          class="mt-1 text-xl font-bold"
          :class="(summary?.depositBalance ?? 0) < 0 ? 'text-red-600' : 'text-slate-800'"
        >
          {{ formatMoney(summary?.depositBalance ?? 0, 'USD') }}
        </div>
        <div class="mt-1 text-[11px] text-slate-400">
          депозит {{ formatMoney(summary?.submissionDeposit ?? 0, 'USD') }} − потрачено
          {{ formatMoney(summary?.submissionSpent ?? 0, 'USD') }}
        </div>
      </div>
    </div>

    <div v-if="invoiceStore.isLoading" class="py-12 text-center text-slate-400">Загрузка...</div>

    <div
      v-else-if="invoiceStore.invoices.length === 0"
      class="rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400"
    >
      Счетов пока нет
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-100 text-slate-600">
          <tr>
            <th class="px-4 py-3 font-medium">Номер</th>
            <th class="px-4 py-3 font-medium">Срок оплаты</th>
            <th class="px-4 py-3 font-medium">Назначение</th>
            <th class="px-4 py-3 font-medium">Сумма</th>
            <th class="px-4 py-3 font-medium">Статус</th>
            <th class="px-4 py-3 font-medium">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invoice in invoiceStore.invoices"
            :key="invoice.id"
            class="border-t border-slate-100"
          >
            <td class="px-4 py-3 font-medium text-slate-800">{{ invoice.invoiceNumber }}</td>
            <td class="px-4 py-3 text-slate-600">{{ formatDate(invoice.dueDate) }}</td>
            <td class="px-4 py-3 text-slate-600">{{ INVOICE_PURPOSE_LABELS[invoice.purpose] }}</td>
            <td class="px-4 py-3 font-medium text-slate-800">
              {{ formatMoney(invoice.amount, invoice.currency) }}
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-block rounded-full border px-2.5 py-1 text-xs font-medium"
                :class="INVOICE_STATUS_CLASSES[invoice.status]"
              >
                {{ INVOICE_STATUS_LABELS[invoice.status] }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button
                  v-if="invoice.status === 'Pending'"
                  class="text-sm font-medium text-emerald-600 hover:underline"
                  @click="markPaid(invoice.id)"
                >
                  Оплачен
                </button>
                <button
                  v-if="invoice.status === 'Pending'"
                  class="text-sm text-slate-500 hover:underline"
                  @click="cancelInvoice(invoice.id)"
                >
                  Отменить
                </button>
                <button
                  class="text-sm text-red-600 hover:underline"
                  @click="removeInvoice(invoice.id)"
                >
                  Удалить
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <CreateInvoiceModal
      v-if="isModalOpen"
      :is-saving="invoiceStore.isSaving"
      :films="films"
      :suggested-number="suggestedNumber"
      @submit="handleCreate"
      @close="isModalOpen = false"
    />
  </div>
</template>
