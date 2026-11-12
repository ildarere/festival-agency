import { defineStore } from 'pinia';
import type {
  ClientFinancialSummary,
  ClientInvoice,
  CreateInvoiceDto,
  InvoiceStatus
} from '@preload/types';

interface InvoiceStoreState {
  clientId: number | null;
  invoices: ClientInvoice[];
  summary: ClientFinancialSummary | null;
  isLoading: boolean;
  isSaving: boolean;
}

export const useInvoiceStore = defineStore('invoice', {
  state: (): InvoiceStoreState => ({
    clientId: null,
    invoices: [],
    summary: null,
    isLoading: false,
    isSaving: false
  }),
  actions: {
    async loadForClient(clientId: number): Promise<void> {
      this.clientId = clientId;
      this.isLoading = true;
      try {
        const [invoices, summary] = await Promise.all([
          window.api.invoices.getByClientId(clientId),
          window.api.invoices.getBalance(clientId)
        ]);
        this.invoices = invoices;
        this.summary = summary;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshSummary(): Promise<void> {
      if (this.clientId === null) {
        return;
      }
      this.summary = await window.api.invoices.getBalance(this.clientId);
    },

    async createInvoice(dto: CreateInvoiceDto): Promise<ClientInvoice> {
      this.isSaving = true;
      try {
        const invoice = await window.api.invoices.create(dto);
        this.invoices.unshift(invoice);
        await this.refreshSummary();
        return invoice;
      } finally {
        this.isSaving = false;
      }
    },

    async setStatus(id: number, status: InvoiceStatus): Promise<void> {
      const updated = await window.api.invoices.updateStatus(id, status);
      const index = this.invoices.findIndex((invoice) => invoice.id === id);
      if (index !== -1) {
        this.invoices[index] = updated;
      }
      await this.refreshSummary();
    },

    async deleteInvoice(id: number): Promise<void> {
      await window.api.invoices.delete(id);
      this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
      await this.refreshSummary();
    },

    clear(): void {
      this.clientId = null;
      this.invoices = [];
      this.summary = null;
    }
  }
});
