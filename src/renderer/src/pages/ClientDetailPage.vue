<script setup lang="ts">
import { computed, onMounted, ref, watch, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ExternalLink,
  File as FileIcon,
  FileSignature,
  FileText,
  IdCard,
  Paperclip,
  Receipt,
  Trash2
} from 'lucide-vue-next';
import { useClientStore } from '@renderer/entities/client/model/store';
import ClientForm from '@renderer/entities/client/ui/ClientForm.vue';
import BillingStatusBadge from '@renderer/entities/client/ui/BillingStatusBadge.vue';
import FilmsTab from './ClientDetailPage/tabs/FilmsTab.vue';
import StrategyTab from './ClientDetailPage/tabs/StrategyTab.vue';
import InvoicesTab from './ClientDetailPage/tabs/InvoicesTab.vue';
import type { CreateClientDto, DocumentType } from '@preload/types';

const route = useRoute();
const router = useRouter();
const store = useClientStore();

const clientId = computed<number>(() => Number(route.params.id));

type TabKey = 'info' | 'documents' | 'films' | 'strategy' | 'finance';

interface TabDef {
  key: TabKey;
  label: string;
  disabled: boolean;
}

const TABS: TabDef[] = [
  { key: 'info', label: 'Инфо', disabled: false },
  { key: 'documents', label: 'Документы', disabled: false },
  { key: 'films', label: 'Фильмы', disabled: false },
  { key: 'strategy', label: 'Фестивальная стратегия', disabled: false },
  { key: 'finance', label: 'Финансы', disabled: false }
];

const TAB_KEYS = TABS.map((tab) => tab.key);

function resolveInitialTab(): TabKey {
  const requested = route.query.tab;
  return typeof requested === 'string' && (TAB_KEYS as string[]).includes(requested)
    ? (requested as TabKey)
    : 'info';
}

const activeTab = ref<TabKey>(resolveInitialTab());

const DOC_TYPES: DocumentType[] = ['Contract', 'Invoice', 'Release_Form', 'Passport', 'Other'];

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  Contract: 'Договор',
  Invoice: 'Счёт',
  Release_Form: 'Релиз-форма',
  Passport: 'Паспорт',
  Other: 'Другое'
};

const DOC_TYPE_ICONS: Record<DocumentType, Component> = {
  Contract: FileText,
  Invoice: Receipt,
  Release_Form: FileSignature,
  Passport: IdCard,
  Other: FileIcon
};

const selectedDocType = ref<DocumentType>('Other');
const isAttaching = ref(false);

async function loadClient(): Promise<void> {
  await store.fetchClientById(clientId.value);
}

onMounted(loadClient);
watch(clientId, loadClient);

function goBack(): void {
  router.push('/');
}

async function handleSaveInfo(payload: CreateClientDto): Promise<void> {
  await store.updateClient(clientId.value, payload);
}

async function handleAttachDocument(): Promise<void> {
  isAttaching.value = true;
  try {
    await store.attachDocument(clientId.value, selectedDocType.value);
  } finally {
    isAttaching.value = false;
  }
}

async function handleOpenDocument(id: number): Promise<void> {
  await store.openDocument(id);
}

async function handleDeleteDocument(id: number): Promise<void> {
  if (!confirm('Удалить документ?')) {
    return;
  }
  await store.deleteDocument(id);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-8">
    <div class="mx-auto max-w-4xl">
      <button class="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700" @click="goBack">
        <ArrowLeft :size="16" />
        Назад к списку
      </button>

      <div v-if="store.isLoading && !store.currentClient" class="text-slate-400">Загрузка...</div>

      <template v-else-if="store.currentClient">
        <div class="mb-6 flex items-center gap-3">
          <h1 class="text-2xl font-bold text-slate-800">{{ store.currentClient.fullName }}</h1>
          <BillingStatusBadge :status="store.currentClient.billingStatus" />
        </div>

        <div class="mb-6 flex gap-1 border-b border-slate-200">
          <button
            v-for="tab in TABS"
            :key="tab.key"
            :disabled="tab.disabled"
            class="border-b-2 px-4 py-2 text-sm font-medium transition-colors"
            :class="[
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700',
              tab.disabled ? 'cursor-not-allowed opacity-40 hover:text-slate-500' : ''
            ]"
            @click="!tab.disabled && (activeTab = tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="activeTab === 'info'" class="rounded-lg border border-slate-200 bg-white p-6">
          <ClientForm
            :initial="store.currentClient"
            submit-label="Сохранить"
            :is-saving="store.isSaving"
            @submit="handleSaveInfo"
            @cancel="goBack"
          />
        </div>

        <div v-else-if="activeTab === 'documents'" class="rounded-lg border border-slate-200 bg-white p-6">
          <div class="mb-4 flex items-center gap-3">
            <select v-model="selectedDocType" class="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option v-for="type in DOC_TYPES" :key="type" :value="type">{{ DOC_TYPE_LABELS[type] }}</option>
            </select>
            <button
              class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              :disabled="isAttaching"
              @click="handleAttachDocument"
            >
              <Paperclip :size="16" />
              Прикрепить документ
            </button>
          </div>

          <div v-if="store.documents.length === 0" class="py-8 text-center text-slate-400">
            Документы отсутствуют
          </div>
          <ul v-else class="divide-y divide-slate-100">
            <li v-for="doc in store.documents" :key="doc.id" class="flex items-center justify-between py-3">
              <div class="flex items-center gap-3">
                <component :is="DOC_TYPE_ICONS[doc.docType]" :size="20" class="text-slate-400" />
                <div>
                  <div class="text-sm font-medium text-slate-800">{{ doc.fileName }}</div>
                  <div class="text-xs text-slate-400">
                    {{ DOC_TYPE_LABELS[doc.docType] }} · {{ formatFileSize(doc.fileSizeBytes) }} ·
                    {{ formatDate(doc.createdAt) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  class="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                  @click="handleOpenDocument(doc.id)"
                >
                  <ExternalLink :size="14" />
                  Открыть
                </button>
                <button
                  class="flex items-center gap-1 text-sm text-red-600 hover:underline"
                  @click="handleDeleteDocument(doc.id)"
                >
                  <Trash2 :size="14" />
                  Удалить
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-else-if="activeTab === 'films'">
          <FilmsTab :client-id="clientId" />
        </div>

        <div v-else-if="activeTab === 'strategy'">
          <StrategyTab :client-id="clientId" />
        </div>

        <div v-else-if="activeTab === 'finance'">
          <InvoicesTab :client-id="clientId" />
        </div>

        <div v-else class="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-slate-400">
          Раздел появится в следующих спринтах
        </div>
      </template>
    </div>
  </div>
</template>
