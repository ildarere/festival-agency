<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { CalendarRange, ChevronLeft, ChevronRight, List } from 'lucide-vue-next';
import { useCalendarStore } from '@renderer/entities/calendar/model/store';
import EventDetailCard from '@renderer/entities/calendar/ui/EventDetailCard.vue';
import {
  CALENDAR_EVENT_BADGE_CLASSES,
  CALENDAR_EVENT_DOT_CLASSES,
  CALENDAR_EVENT_LABELS,
  formatHumanDate,
  isoDate
} from '@renderer/entities/calendar/model/meta';
import type { CalendarEvent, CalendarEventType, Client, Film } from '@preload/types';

const LEGEND: Array<{ type: CalendarEventType; label: string }> = (
  Object.keys(CALENDAR_EVENT_LABELS) as CalendarEventType[]
).map((type) => ({ type, label: CALENDAR_EVENT_LABELS[type] }));

const router = useRouter();
const calendarStore = useCalendarStore();

type ViewMode = 'month' | 'agenda';
const viewMode = ref<ViewMode>('month');
const monthAnchor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

const clients = ref<Client[]>([]);
const films = ref<Film[]>([]);
const selectedClientId = ref<number | null>(null);
const selectedFilmId = ref<number | null>(null);
const selectedEvent = ref<CalendarEvent | null>(null);

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

onMounted(async () => {
  clients.value = await window.api.clients.list();
  await calendarStore.setMonth(monthAnchor.value);
});

watch(selectedClientId, async (clientId) => {
  selectedFilmId.value = null;
  films.value = clientId === null ? [] : await window.api.films.getByClientId(clientId);
  await calendarStore.setClientFilter(clientId);
});

watch(selectedFilmId, async (filmId) => {
  await calendarStore.setFilmFilter(filmId);
});

async function switchView(mode: ViewMode): Promise<void> {
  viewMode.value = mode;
  if (mode === 'month') {
    await calendarStore.setMonth(monthAnchor.value);
  } else {
    await calendarStore.setAgenda(30);
  }
}

async function shiftMonth(delta: number): Promise<void> {
  monthAnchor.value = new Date(
    monthAnchor.value.getFullYear(),
    monthAnchor.value.getMonth() + delta,
    1
  );
  await calendarStore.setMonth(monthAnchor.value);
}

const monthTitle = computed(
  () => `${MONTH_NAMES[monthAnchor.value.getMonth()]} ${monthAnchor.value.getFullYear()}`
);

interface DayCell {
  date: string;
  dayNum: number;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const todayIso = isoDate(new Date());

const monthGrid = computed<DayCell[]>(() => {
  const year = monthAnchor.value.getFullYear();
  const month = monthAnchor.value.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const iso = isoDate(date);
    cells.push({
      date: iso,
      dayNum: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: iso === todayIso,
      events: calendarStore.eventsByDate.get(iso) ?? []
    });
  }
  return cells;
});

interface AgendaGroup {
  date: string;
  events: CalendarEvent[];
}

const agendaGroups = computed<AgendaGroup[]>(() => {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of [...calendarStore.events].sort((a, b) => a.date.localeCompare(b.date))) {
    const bucket = groups.get(event.date) ?? [];
    bucket.push(event);
    groups.set(event.date, bucket);
  }
  return [...groups.entries()].map(([date, events]) => ({ date, events }));
});

function goToStrategy(event: CalendarEvent): void {
  router.push({
    path: `/clients/${event.clientId}`,
    query: { tab: 'strategy', film: String(event.filmId) }
  });
}
</script>

<template>
  <div class="min-h-screen p-8">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 class="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <CalendarRange :size="24" class="text-indigo-500" />
          Календарь дедлайнов
        </h1>
        <div class="flex rounded-md border border-slate-300 p-0.5 text-sm">
          <button
            class="flex items-center gap-1.5 rounded px-3 py-1.5 font-medium"
            :class="viewMode === 'month' ? 'bg-slate-800 text-white' : 'text-slate-600'"
            @click="switchView('month')"
          >
            <CalendarRange :size="15" />
            Месячная сетка
          </button>
          <button
            class="flex items-center gap-1.5 rounded px-3 py-1.5 font-medium"
            :class="viewMode === 'agenda' ? 'bg-slate-800 text-white' : 'text-slate-600'"
            @click="switchView('agenda')"
          >
            <List :size="15" />
            Повестка (30 дней)
          </button>
        </div>
      </div>

      <!-- Фильтры + легенда -->
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <select
          v-model.number="selectedClientId"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option :value="null">Все клиенты</option>
          <option v-for="client in clients" :key="client.id" :value="client.id">
            {{ client.fullName }}
          </option>
        </select>
        <select
          v-model.number="selectedFilmId"
          :disabled="selectedClientId === null"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option :value="null">Все фильмы</option>
          <option v-for="film in films" :key="film.id" :value="film.id">
            {{ film.titleOriginal }}
          </option>
        </select>

        <div class="ml-auto flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span v-for="item in LEGEND" :key="item.type" class="flex items-center gap-1.5">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="CALENDAR_EVENT_DOT_CLASSES[item.type]"
            ></span>
            {{ item.label }}
          </span>
        </div>
      </div>

      <!-- Месячная сетка -->
      <div v-if="viewMode === 'month'" class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
          <button class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" @click="shiftMonth(-1)">
            <ChevronLeft :size="18" />
          </button>
          <span class="text-sm font-semibold text-slate-700">{{ monthTitle }}</span>
          <button class="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" @click="shiftMonth(1)">
            <ChevronRight :size="18" />
          </button>
        </div>

        <div class="grid grid-cols-7 gap-px border-b border-slate-100 pb-1 text-center text-xs font-medium text-slate-400">
          <span v-for="day in WEEKDAYS" :key="day">{{ day }}</span>
        </div>

        <div class="grid grid-cols-7 gap-px bg-slate-100">
          <div
            v-for="cell in monthGrid"
            :key="cell.date"
            class="min-h-[92px] bg-white p-1.5"
            :class="cell.inMonth ? '' : 'bg-slate-50/60'"
          >
            <div
              class="mb-1 text-right text-xs"
              :class="[
                cell.inMonth ? 'text-slate-500' : 'text-slate-300',
                cell.isToday ? 'font-bold text-blue-600' : ''
              ]"
            >
              {{ cell.dayNum }}
            </div>
            <button
              v-for="event in cell.events"
              :key="event.id"
              class="mb-1 flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-slate-100"
              @click="selectedEvent = event"
            >
              <span
                class="h-1.5 w-1.5 shrink-0 rounded-full"
                :class="CALENDAR_EVENT_DOT_CLASSES[event.eventType]"
              ></span>
              <span class="truncate text-slate-600">{{ event.festivalName }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Повестка -->
      <div v-else class="rounded-lg border border-slate-200 bg-white">
        <div v-if="calendarStore.isLoading" class="py-12 text-center text-slate-400">Загрузка...</div>
        <div
          v-else-if="agendaGroups.length === 0"
          class="py-16 text-center text-slate-400"
        >
          На ближайшие 30 дней дедлайнов нет
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div v-for="group in agendaGroups" :key="group.date" class="p-4">
            <div class="mb-2 text-sm font-semibold text-slate-700">
              {{ formatHumanDate(group.date) }}
            </div>
            <ul class="space-y-2">
              <li
                v-for="event in group.events"
                :key="event.id"
                class="flex cursor-pointer items-center gap-3 rounded-md border border-slate-100 px-3 py-2 hover:bg-slate-50"
                @click="selectedEvent = event"
              >
                <span
                  class="rounded-full border px-2 py-0.5 text-[11px] font-medium"
                  :class="CALENDAR_EVENT_BADGE_CLASSES[event.eventType]"
                >
                  {{ CALENDAR_EVENT_LABELS[event.eventType] }}
                </span>
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-medium text-slate-800">
                    {{ event.festivalName }} · {{ event.editionYear }}
                  </div>
                  <div class="truncate text-xs text-slate-500">
                    {{ event.filmTitle }} — {{ event.clientName }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <EventDetailCard
      v-if="selectedEvent"
      :event="selectedEvent"
      @close="selectedEvent = null"
      @go-to-strategy="goToStrategy"
    />
  </div>
</template>
