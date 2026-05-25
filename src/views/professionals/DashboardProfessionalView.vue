<script setup>
import { AppointmentService } from '../../services/AppointmentService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

import {ref,onMounted} from 'vue';


const appointments = ref([]);
const appointmentsByDay = ref([])
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';
const professionalId = 'ff345eb0-8326-4b43-a62b-17d0f7dff442';

const loadAppointmentsByDay = async () => {
    loading.value = true;
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await AppointmentService.listAllAppointmentsByProfessionalByDay(tenantId, professionalId, today);
        appointmentsByDay.value = response.data;
    } catch(error) {
        console.error("Erro ao buscar dados do java: ", error)
    } finally {
        loading.value = false;
    }
}

    const loadAllAppointmentsById = async () => {
        loading.value = true;
        try {
            const response = await AppointmentService.listAllAppointments(tenantId, professionalId)
            appointments.value = response.data;
        } catch (error) {
            console.error("Error ao buscar dados do java: ", error);
        } finally {
            loading.value = false;
        }
    }

    const completeAppointment = async (id, method) => {
        try {
            await AppointmentService.completeAppointment(tenantId, id, method)
            await loadAllAppointmentsById();
            await loadAppointmentsByDay();
        } catch (error) {
            console.error("Error ao finalizar:", error)
        }
    }

    const formatTime = (value)  => {
        if(!value) return '';
        return new Date(value).toLocaleDateString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    };

    const getSeverity = (status) => {
        switch(status) {
            case 'COMPLETED' : return 'success';
            case 'CONFIRMED' : return 'info';
            default: return 'warning'
        }
    };

   onMounted(async () => {
    await loadAppointmentsByDay();
    await loadAllAppointmentsById();
   })

</script>

<template>
    <div class="p-4 bg-gray-50 min-h-screen">
        <div class="flex justify-content-between mb-4">
            <h1 class="text-2xl font-bold text-900">Painel de Atendimento</h1> 
            <p class="text-600 text-sm">Visão do profissional</p>
            <Button icon="pi pi-refresh" label="Sincronizar" @click="loadAppointmentsByDay" :loading="loading"/>
        </div>

        <DataTable :value="appointmentsByDay" :loading="loading" class="shadow-2 border-round overflow-hidden" responsiveLayout ="scroll">

            <Column field="startTime" header="Hora">
                <template #body = "{data}">
                    <span class="font-bold text-primary">{{ formatTime(data.startTime) }}</span>
                </template>
            </Column>

            <Column field="clientName" header="Cliente"></Column>
            <Column field="offeringName" header="Serviço"></Column>

            <Column field="professionalName" header="Profissional">
                <template #body = "{data}">
                    <span class="text-600 font-medium">{{ data.professionalName }}</span>
                </template>
            </Column>

            <Column field="status" header="Status">
                <template #body="{data}">
                    <Tag :value="data.status" :severity="getSeverity(data.status)"/>
                </template>
            </Column>

            <Column header="Açoes">
                <template #body ="{data}">
                    <div v-if="data.status != 'COMPLETED'" class = flex gap-2>
                        <Button icon="pi pi-money-bill" label="Dinheiro" class="p-button-success p-button-sm" @click="completeAppointment(data.id, 'CASH')"/>
                        <Button icon="pi pi-qrcode" label="PIX" class="p-button-success p-button-sm" @click="completeAppointment(data.id, 'PIX')"/>
                    </div>
                </template>
            </Column>
        </DataTable>

    </div>
</template>