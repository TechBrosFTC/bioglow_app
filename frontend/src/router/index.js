import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../stores/auth';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import DataPage from '../views/DataPage.vue';
import Reports from '../views/Reports.vue';
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/login', component: Login, meta: { public: true } }, { path: '/', component: Dashboard }, { path: '/camera', component: DataPage, props: { kind: 'camera' } }, { path: '/varroa', component: DataPage, props: { kind: 'varroa' } }, { path: '/acid', component: DataPage, props: { kind: 'acid' } }, { path: '/alerts', component: DataPage, props: { kind: 'alerts' } }, { path: '/reports', component: Reports }] });
router.beforeEach(async (to) => { const a = useAuth(); if (!a.ready)
    await a.check(); if (!to.meta.public && !a.user)
    return '/login'; if (to.path === '/login' && a.user)
    return '/'; });
export default router;
