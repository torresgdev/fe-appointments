import api from "../api/api";


export const AppointmentService = {
    
    createAppointment(tenantId, payload) {
        return api.post(`/${tenantId}/appointments`, payload);
    },

    listAllAppointments(tenantId, professionalId) {
        return api.get(`/${tenantId}/appointments/${professionalId}`)
    },

    listAllAppointmentsByProfessionalByDay(tenantId,professionalId) {
        return api.get(`/${tenantId}/appointments/filter/${professionalId}`)
    },

    completeAppointment(tenantId, appointmentId, paymentMethod) {
        return api.patch(`/${tenantId}/appointments/${appointmentId}/complete`, null, {
            params: { paymentMethod}
        });
    },

    listByToday(tenantId) {
        return api.get(`/${tenantId}/appointments/today`)
    },
};

