import { contextBridge, ipcRenderer } from 'electron';
import type { Api } from './types';

const api: Api = {
  clients: {
    list: (filters) => ipcRenderer.invoke('clients:list', filters),
    get: (id) => ipcRenderer.invoke('clients:get', id),
    create: (dto) => ipcRenderer.invoke('clients:create', dto),
    update: (id, dto) => ipcRenderer.invoke('clients:update', id, dto),
    delete: (id) => ipcRenderer.invoke('clients:delete', id)
  },
  documents: {
    list: (clientId) => ipcRenderer.invoke('documents:list', clientId),
    attach: (clientId, docType) => ipcRenderer.invoke('documents:attach', clientId, docType),
    open: (id) => ipcRenderer.invoke('documents:open', id),
    delete: (id) => ipcRenderer.invoke('documents:delete', id)
  },
  films: {
    getByClientId: (clientId) => ipcRenderer.invoke('films:getByClientId', clientId),
    getById: (id) => ipcRenderer.invoke('films:getById', id),
    create: (dto) => ipcRenderer.invoke('films:create', dto),
    update: (id, dto) => ipcRenderer.invoke('films:update', id, dto),
    delete: (id) => ipcRenderer.invoke('films:delete', id),
    openExternalLink: (url) => ipcRenderer.invoke('films:openExternalLink', url)
  },
  festivals: {
    getAll: (filters) => ipcRenderer.invoke('festivals:getAll', filters),
    getById: (id) => ipcRenderer.invoke('festivals:getById', id),
    getByIdWithDetails: (id) => ipcRenderer.invoke('festivals:getByIdWithDetails', id),
    create: (dto) => ipcRenderer.invoke('festivals:create', dto),
    update: (id, data) => ipcRenderer.invoke('festivals:update', id, data),
    addEdition: (festivalId, dto) => ipcRenderer.invoke('festivals:addEdition', festivalId, dto),
    searchWikidata: (query, limit) => ipcRenderer.invoke('festivals:searchWikidata', query, limit),
    importWikidata: (item) => ipcRenderer.invoke('festivals:importWikidata', item),
    openExternal: (url) => ipcRenderer.invoke('festivals:openExternal', url)
  },
  submissions: {
    getByFilmId: (filmId) => ipcRenderer.invoke('submissions:getByFilmId', filmId),
    create: (dto) => ipcRenderer.invoke('submissions:create', dto),
    updateStatus: (id, status) => ipcRenderer.invoke('submissions:updateStatus', id, status),
    updateDetails: (id, dto) => ipcRenderer.invoke('submissions:updateDetails', id, dto),
    delete: (id) => ipcRenderer.invoke('submissions:delete', id),
    getStats: (filmId) => ipcRenderer.invoke('submissions:getStats', filmId)
  },
  invoices: {
    getByClientId: (clientId) => ipcRenderer.invoke('invoices:getByClientId', clientId),
    create: (dto) => ipcRenderer.invoke('invoices:create', dto),
    updateStatus: (id, status, paidDate) =>
      ipcRenderer.invoke('invoices:updateStatus', id, status, paidDate),
    delete: (id) => ipcRenderer.invoke('invoices:delete', id),
    getBalance: (clientId) => ipcRenderer.invoke('invoices:getBalance', clientId)
  },
  calendar: {
    getEvents: (query) => ipcRenderer.invoke('calendar:getEvents', query)
  },
  reports: {
    exportSubmissionsCsv: (filmId) => ipcRenderer.invoke('reports:exportSubmissionsCsv', filmId)
  },
  system: {
    exportBackup: () => ipcRenderer.invoke('system:exportBackup'),
    importBackup: () => ipcRenderer.invoke('system:importBackup')
  }
};

contextBridge.exposeInMainWorld('api', api);
