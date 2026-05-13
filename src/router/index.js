import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import DashboardView from '@/views/admin/DashboardView.vue';
import FinancialDashBoard from "../views/admin/FinancialDashBoard.vue";
import ClientBookingView from "../views/client/ClientBookingView.vue";

const routes = [
    {
        path: '/',
        redirect: '/booking' // Sempre que cair no '/', ele "empurra" para a agenda
    },
    {
        path: '/admin/agenda',
        name: 'admin-dashboard',
        component: DashboardView
    },
    {
        path: '/admin/historico',
        name: 'admin-history',
        component: FinancialDashBoard
    },
    
    {
        path: '/booking',
        name: 'client-booking',
        component: ClientBookingView
    },
    
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;