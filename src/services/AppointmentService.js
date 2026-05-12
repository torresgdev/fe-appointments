import api from "../api/api";


export const AppointmentService = {
    
    createAppointment(tenantId, payload) {
        return api.post(`${baseUrl}/${tenantId}/appointments`, payload);
    },

    listAllAppointments(tenantId, professionalId) {
        return api.get(`${baseUrl}/${tenantId}/appointments/${professionalId}`)
    },

    listAllAppointmentsByProfessionalByDay(tenantId,professionalId) {
        return api.get(`${baseUrl}/${tenantId}/appointments/filter/${professionalId}`)
    },

    completeAppointment(tenantId, appointmentId, paymentMethod) {
        return api.patch(`${baseUrl}/${tenantId}/appointments/${appointmentId}/complete`, null, {
            params: { paymentMethod}
        });
    },

    listAllAppointmentsByToday(tenantId) {
        return api.get(`${baseUrl}/${tenantId}/appointments/today`)
    }


}

