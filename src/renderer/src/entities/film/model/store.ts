import { defineStore } from 'pinia';
import type { CreateFilmDto, Film, UpdateFilmDto } from '@preload/types';

interface FilmStoreState {
  films: Film[];
  currentFilm: Film | null;
  isLoading: boolean;
  isSaving: boolean;
}

export const useFilmStore = defineStore('film', {
  state: (): FilmStoreState => ({
    films: [],
    currentFilm: null,
    isLoading: false,
    isSaving: false
  }),
  actions: {
    async fetchByClientId(clientId: number): Promise<void> {
      this.isLoading = true;
      try {
        this.films = await window.api.films.getByClientId(clientId);
      } finally {
        this.isLoading = false;
      }
    },

    async createFilm(dto: CreateFilmDto): Promise<Film> {
      this.isSaving = true;
      try {
        const film = await window.api.films.create(dto);
        this.films.unshift(film);
        return film;
      } finally {
        this.isSaving = false;
      }
    },

    async updateFilm(id: number, dto: UpdateFilmDto): Promise<Film> {
      this.isSaving = true;
      try {
        const updated = await window.api.films.update(id, dto);
        const index = this.films.findIndex((film) => film.id === id);
        if (index !== -1) {
          this.films[index] = updated;
        }
        if (this.currentFilm?.id === id) {
          this.currentFilm = updated;
        }
        return updated;
      } finally {
        this.isSaving = false;
      }
    },

    async deleteFilm(id: number): Promise<void> {
      await window.api.films.delete(id);
      this.films = this.films.filter((film) => film.id !== id);
      if (this.currentFilm?.id === id) {
        this.currentFilm = null;
      }
    },

    setCurrentFilm(film: Film | null): void {
      this.currentFilm = film;
    },

    async openExternalLink(url: string): Promise<void> {
      await window.api.films.openExternalLink(url);
    }
  }
});
