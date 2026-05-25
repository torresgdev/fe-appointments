import api from "../api/api";


export const FinancialService = {
    
    dailyRevenue(tenantId) {
        return api.get(`/${tenantId}/financial/today-revenue`);
    },

    history(tenantId) {
        return api.get(`/${tenantId}/financial/history`);
    },

    historyToday(tenantId) {
        return api.get(`/${tenantId}/financial/today-history`)
    },

    historyByProfessionalId(tenantId, professionalId) {
        return api.get(`/${tenantId}/financial/professionals/${professionalId}/history`)
    },

    historyByProfessionalIdToday(tenantId, professionalId) {
        return api.get(`/${tenantId}/financial/professionals/${professionalId}/today-history`)
    },
    
    todayRevenueById(tenantId, professionalId) {
        return api.get(`/${tenantId}/financial/professionals/${professionalId}/today-revenue`)
    }


};