import { defineStore } from 'pinia';
import type { CalendarEvent } from '@preload/types';
import { isoDate } from './meta';

interface CalendarFilters {
  clientId: number | null;
  filmId: number | null;
}

interface CalendarStoreState {
  events: CalendarEvent[];
  rangeStart: string;
  rangeEnd: string;
  filters: CalendarFilters;
  isLoading: boolean;
}

function monthRange(anchor: Date): { start: string; end: string } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: isoDate(start), end: isoDate(end) };
}

function agendaRange(anchor: Date, days: number): { start: string; end: string } {
  const end = new Date(anchor);
  end.setDate(end.getDate() + days);
  return { start: isoDate(anchor), end: isoDate(end) };
}

export const useCalendarStore = defineStore('calendar', {
  state: (): CalendarStoreState => {
    const now = new Date();
    const { start, end } = monthRange(now);
    return {
      events: [],
      rangeStart: start,
      rangeEnd: end,
      filters: { clientId: null, filmId: null },
      isLoading: false
    };
  },
  getters: {
    eventsByDate(state): Map<string, CalendarEvent[]> {
      const map = new Map<string, CalendarEvent[]>();
      for (const event of state.events) {
        const bucket = map.get(event.date) ?? [];
        bucket.push(event);
        map.set(event.date, bucket);
      }
      return map;
    }
  },
  actions: {
    async fetch(): Promise<void> {
      this.isLoading = true;
      try {
        this.events = await window.api.calendar.getEvents({
          startDate: this.rangeStart,
          endDate: this.rangeEnd,
          filmId: this.filters.filmId,
          clientId: this.filters.clientId
        });
      } finally {
        this.isLoading = false;
      }
    },

    async setMonth(anchor: Date): Promise<void> {
      const { start, end } = monthRange(anchor);
      this.rangeStart = start;
      this.rangeEnd = end;
      await this.fetch();
    },

    async setAgenda(days = 30): Promise<void> {
      const { start, end } = agendaRange(new Date(), days);
      this.rangeStart = start;
      this.rangeEnd = end;
      await this.fetch();
    },

    async setClientFilter(clientId: number | null): Promise<void> {
      this.filters.clientId = clientId;
      if (clientId === null) {
        this.filters.filmId = null;
      }
      await this.fetch();
    },

    async setFilmFilter(filmId: number | null): Promise<void> {
      this.filters.filmId = filmId;
      await this.fetch();
    }
  }
});
