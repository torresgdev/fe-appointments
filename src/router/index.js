import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import DashboardView from '@/views/admin/DashboardView.vue';
import FinancialDashBoard from "../views/admin/FinancialDashBoard.vue";
import ClientBookingView from "../views/client/ClientBookingView.vue";
import DashboardProfessionalView from "../views/professionals/DashboardProfessionalView.vue";
import FinancialDashboardProfessionalView from "../views/professionals/FinancialDashboardProfessionalView.vue";

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

    {
        path: '/professional/agenda',
        name: 'professional-dashboard',
        component: DashboardProfessionalView
    },

    {
        path: '/professional/history',
        name: 'professional-history',
        component: FinancialDashboardProfessionalView
    },

    
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;