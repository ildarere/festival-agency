import { defineStore } from 'pinia';
import type {
  CreateEditionDto,
  CreateFestivalDto,
  Festival,
  FestivalDetailed,
  FestivalEdition,
  FestivalListFilters,
  FestivalWithEditions,
  UpdateFestivalDto,
  WikidataFestivalItem
} from '@preload/types';

interface FestivalStoreState {
  festivals: Festival[];
  currentFestival: FestivalDetailed | null;
  wikidataResults: WikidataFestivalItem[];
  filters: FestivalListFilters;
  isLoading: boolean;
  isSaving: boolean;
  isSearchingWikidata: boolean;
}

export const useFestivalStore = defineStore('festival', {
  state: (): FestivalStoreState => ({
    festivals: [],
    currentFestival: null,
    wikidataResults: [],
    filters: {},
    isLoading: false,
    isSaving: false,
    isSearchingWikidata: false
  }),
  actions: {
    async fetchAll(): Promise<void> {
      this.isLoading = true;
      try {
        // Передаём простой объект, а не реактивный proxy Pinia:
        // reactive-обёртки не проходят structured clone через IPC ("An object could not be cloned").
        this.festivals = await window.api.festivals.getAll({ ...this.filters });
      } finally {
        this.isLoading = false;
      }
    },

    setSearch(search: string): void {
      this.filters.search = search.trim() === '' ? undefined : search;
    },

    setCountry(country: string | undefined): void {
      this.filters.country = country;
    },

    setAccreditation(accreditation: FestivalListFilters['accreditation']): void {
      this.filters.accreditation = accreditation;
    },

    resetFilters(): void {
      this.filters = {};
    },

    async fetchById(id: number): Promise<FestivalWithEditions | null> {
      return window.api.festivals.getById(id);
    },

    async fetchFestivalDetails(id: number): Promise<FestivalDetailed | null> {
      this.isLoading = true;
      try {
        this.currentFestival = await window.api.festivals.getByIdWithDetails(id);
        return this.currentFestival;
      } finally {
        this.isLoading = false;
      }
    },

    async createFestival(dto: CreateFestivalDto): Promise<Festival> {
      this.isSaving = true;
      try {
        const festival = await window.api.festivals.create({ ...dto });
        this.festivals.push(festival);
        this.festivals.sort((a, b) => a.name.localeCompare(b.name));
        return festival;
      } finally {
        this.isSaving = false;
      }
    },

    async updateFestival(id: number, data: UpdateFestivalDto): Promise<Festival> {
      this.isSaving = true;
      try {
        const updated = await window.api.festivals.update(id, { ...data });
        const index = this.festivals.findIndex((f) => f.id === id);
        if (index !== -1) {
          this.festivals[index] = updated;
        }
        const current = this.currentFestival;
        if (current && current.id === id) {
          this.currentFestival = { ...current, ...updated };
        }
        return updated;
      } finally {
        this.isSaving = false;
      }
    },

    async addEdition(festivalId: number, dto: CreateEditionDto): Promise<FestivalEdition> {
      this.isSaving = true;
      try {
        const edition = await window.api.festivals.addEdition(festivalId, { ...dto });
        const current = this.currentFestival;
        if (current && current.id === festivalId) {
          this.currentFestival = {
            ...current,
            editions: [edition, ...current.editions].sort((a, b) => b.editionYear - a.editionYear)
          };
        }
        return edition;
      } finally {
        this.isSaving = false;
      }
    },

    async searchWikidata(query: string): Promise<void> {
      this.isSearchingWikidata = true;
      try {
        this.wikidataResults = await window.api.festivals.searchWikidata(query);
      } finally {
        this.isSearchingWikidata = false;
      }
    },

    clearWikidataResults(): void {
      this.wikidataResults = [];
    },

    async importWikidata(item: WikidataFestivalItem): Promise<Festival> {
      const festival = await window.api.festivals.importWikidata({ ...item });
      if (!this.festivals.some((f) => f.id === festival.id)) {
        this.festivals.push(festival);
        this.festivals.sort((a, b) => a.name.localeCompare(b.name));
      }
      const result = this.wikidataResults.find((r) => r.qid === item.qid);
      if (result) {
        result.alreadyImported = true;
      }
      return festival;
    },

    async openWebsite(url: string): Promise<void> {
      await window.api.festivals.openExternal(url);
    }
  }
});
