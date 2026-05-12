import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import DashboardView from '@/views/admin/DashboardView.vue';

const routes = [
    {
        path: '/admin/agenda',
        name: 'admin-dashboard',
        component: DashboardView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;