import api from "../api/api";

// Use EXATAMENTE este nome e certifique-se de usar o "export const"
export const FinancialService = {
    
    dailyRevenue(tenantId) {
        return api.get(`/${tenantId}/financial/today-revenue`);
    },

    history(tenantId) {
        return api.get(`/${tenantId}/financial/history`);
    },

    historyToday(tenantId) {
        return api.get(`/${tenantId}/financial/today-history`)
    }
};