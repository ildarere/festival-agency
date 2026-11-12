import { defineStore } from 'pinia';
import type {
  CreateSubmissionDto,
  SubmissionStats,
  SubmissionStatus,
  SubmissionWithDetails,
  UpdateSubmissionDto
} from '@preload/types';
import { SUBMISSION_STATUS_ORDER } from './status';

interface SubmissionStoreState {
  filmId: number | null;
  submissions: SubmissionWithDetails[];
  stats: SubmissionStats | null;
  isLoading: boolean;
  isSaving: boolean;
}

export const useSubmissionStore = defineStore('submission', {
  state: (): SubmissionStoreState => ({
    filmId: null,
    submissions: [],
    stats: null,
    isLoading: false,
    isSaving: false
  }),
  getters: {
    /** Воронка: количество подач в каждом статусе, в порядке этапов. */
    funnel(state): Array<{ status: SubmissionStatus; count: number }> {
      return SUBMISSION_STATUS_ORDER.map((status) => ({
        status,
        count: state.submissions.filter((s) => s.status === status).length
      }));
    },
    conversionRate(state): number {
      const submitted = state.stats?.submitted ?? 0;
      const selected = state.stats?.selected ?? 0;
      if (submitted === 0) {
        return 0;
      }
      return Math.round((selected / submitted) * 100);
    }
  },
  actions: {
    async loadForFilm(filmId: number): Promise<void> {
      this.filmId = filmId;
      this.isLoading = true;
      try {
        const [submissions, stats] = await Promise.all([
          window.api.submissions.getByFilmId(filmId),
          window.api.submissions.getStats(filmId)
        ]);
        this.submissions = submissions;
        this.stats = stats;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshStats(): Promise<void> {
      if (this.filmId === null) {
        return;
      }
      this.stats = await window.api.submissions.getStats(this.filmId);
    },

    clear(): void {
      this.filmId = null;
      this.submissions = [];
      this.stats = null;
    },

    async createSubmission(dto: CreateSubmissionDto): Promise<SubmissionWithDetails> {
      this.isSaving = true;
      try {
        const created = await window.api.submissions.create(dto);
        this.submissions.push(created);
        await this.refreshStats();
        return created;
      } finally {
        this.isSaving = false;
      }
    },

    async updateStatus(id: number, status: SubmissionStatus): Promise<void> {
      const updated = await window.api.submissions.updateStatus(id, status);
      this.replaceInList(updated);
      await this.refreshStats();
    },

    async updateDetails(id: number, dto: UpdateSubmissionDto): Promise<void> {
      this.isSaving = true;
      try {
        const updated = await window.api.submissions.updateDetails(id, dto);
        this.replaceInList(updated);
        await this.refreshStats();
      } finally {
        this.isSaving = false;
      }
    },

    async deleteSubmission(id: number): Promise<void> {
      await window.api.submissions.delete(id);
      this.submissions = this.submissions.filter((s) => s.id !== id);
      await this.refreshStats();
    },

    replaceInList(updated: SubmissionWithDetails): void {
      const index = this.submissions.findIndex((s) => s.id === updated.id);
      if (index !== -1) {
        this.submissions[index] = updated;
      }
    }
  }
});
