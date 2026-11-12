import { defineStore } from 'pinia';
import type {
  Client,
  ClientDocument,
  ClientListFilters,
  CreateClientDto,
  DocumentType,
  UpdateClientDto
} from '@preload/types';

interface ClientStoreState {
  clients: Client[];
  currentClient: Client | null;
  documents: ClientDocument[];
  filters: ClientListFilters;
  isLoading: boolean;
  isSaving: boolean;
}

export const useClientStore = defineStore('client', {
  state: (): ClientStoreState => ({
    clients: [],
    currentClient: null,
    documents: [],
    filters: {},
    isLoading: false,
    isSaving: false
  }),
  actions: {
    async fetchClients(): Promise<void> {
      this.isLoading = true;
      try {
        // Передаём простой объект, а не реактивный proxy Pinia:
        // reactive-обёртки не проходят structured clone через IPC ("An object could not be cloned").
        this.clients = await window.api.clients.list({ ...this.filters });
      } finally {
        this.isLoading = false;
      }
    },

    setSearch(search: string): void {
      this.filters.search = search;
    },

    setBillingStatusFilter(status: ClientListFilters['billingStatus']): void {
      this.filters.billingStatus = status;
    },

    async fetchClientById(id: number): Promise<void> {
      this.isLoading = true;
      try {
        this.currentClient = await window.api.clients.get(id);
        await this.fetchDocuments(id);
      } finally {
        this.isLoading = false;
      }
    },

    async createClient(dto: CreateClientDto): Promise<Client> {
      this.isSaving = true;
      try {
        const client = await window.api.clients.create(dto);
        this.clients.unshift(client);
        return client;
      } finally {
        this.isSaving = false;
      }
    },

    async updateClient(id: number, dto: UpdateClientDto): Promise<void> {
      this.isSaving = true;
      try {
        const updated = await window.api.clients.update(id, dto);
        this.currentClient = updated;
        const index = this.clients.findIndex((client) => client.id === id);
        if (index !== -1) {
          this.clients[index] = updated;
        }
      } finally {
        this.isSaving = false;
      }
    },

    async deleteClient(id: number): Promise<void> {
      await window.api.clients.delete(id);
      this.clients = this.clients.filter((client) => client.id !== id);
      if (this.currentClient?.id === id) {
        this.currentClient = null;
      }
    },

    async fetchDocuments(clientId: number): Promise<void> {
      this.documents = await window.api.documents.list(clientId);
    },

    async attachDocument(clientId: number, docType: DocumentType): Promise<void> {
      const result = await window.api.documents.attach(clientId, docType);
      if (result.document) {
        this.documents.unshift(result.document);
      }
    },

    async openDocument(id: number): Promise<void> {
      await window.api.documents.open(id);
    },

    async deleteDocument(id: number): Promise<void> {
      await window.api.documents.delete(id);
      this.documents = this.documents.filter((document) => document.id !== id);
    }
  }
});
