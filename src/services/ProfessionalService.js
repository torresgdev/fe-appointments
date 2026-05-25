import api from "../api/api";

export const ProfessionalService = {


    createProfessional(tenantId, payload) {
        return api.post(`/${tenantId}/professionals`)
    },

    listAllProfessionals(tenantId) {
        return api.get(`/${tenantId}/professionals`)
    },

    getProfessionalById(tenantId, professionalId) {
        return api.get(`/${tenantId}/professionals/${professionalId}`)
    },

    updateProfessionalById(tenantId, professionalId) {
        return api.put(`/${tenantId}/professionals/${professionalId}`)
    },

    deleteProfessionalById(tenantId,professionalId) {
        return api.delete(`/${tenantId}/professionals/${professionalId}`)
    }
}