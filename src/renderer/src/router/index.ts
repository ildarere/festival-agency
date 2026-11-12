import { createRouter, createWebHashHistory } from 'vue-router';
import ClientsPage from '@renderer/pages/ClientsPage.vue';
import ClientDetailPage from '@renderer/pages/ClientDetailPage.vue';
import FestivalsPage from '@renderer/pages/FestivalsPage.vue';
import FestivalDetailPage from '@renderer/pages/FestivalDetailPage.vue';
import CalendarPage from '@renderer/pages/CalendarPage.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'clients', component: ClientsPage },
    { path: '/clients/:id', name: 'client-detail', component: ClientDetailPage, props: true },
    { path: '/festivals', name: 'festivals', component: FestivalsPage },
    { path: '/festivals/:id', name: 'festival-detail', component: FestivalDetailPage, props: true },
    { path: '/calendar', name: 'calendar', component: CalendarPage }
  ]
});

export default router;
