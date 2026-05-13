import api from "../api/api";

export const AvailabilityService = {

    getAvailability: (tenantId, professionalId, date) => {
        return api.get(`/${tenantId}/availability/professionals/${professionalId}`, {
            params: { date }
        });
    }
};