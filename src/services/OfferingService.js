import api from "../api/api";

export const OfferingService = {
    listAll(tenantId) {
        return api.get(`/${tenantId}/offerings`)
    }
};