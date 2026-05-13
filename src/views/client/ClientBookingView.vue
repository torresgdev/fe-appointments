<script setup>

import {AppointmentService} from '../../services/AppointmentService';
import {OfferingService} from '../../services/OfferingService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';

const step = ref(1);
const offerings = ref([]);
const selectedOffering = ref(null);
const selectedDate = ref(null);
const loading = ref(false);
const tenantId = '6cc42dd1-8052-4f73-a33b-079f8948b8fa';

const selectService = (service) => {
    selectedOffering.value = service; // Atribui o valor
    step.value = 2;                  // Muda o passo
    console.log("Serviço selecionado:", selectedOffering.value.name);
};

const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};


const loadOfferings = async() => {

    try {
        const response = await OfferingService.listAll(tenantId);
        offerings.value = response.data;
    } catch (error) {
        console.error("Error ao buscar serviços: ",error)
    }
}



onMounted(()=> {
    loadOfferings();
}) 


const configmBooking = async () => {
    loading.value = true;
    try {
        const date = new Date(selectedDate.value)

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = "00";

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        const payload = {
            clientName: "TesteTeste",
            clientPhone: "2144647798",
            professionalId: "c9f1a856-4987-47fe-85cd-62d746b160d3",
            offeringId: selectedOffering.value.id,
            startTime: formattedDate
        };

        console.log("Payload enviado: ",payload)

        await AppointmentService.createAppointment(tenantId, payload);

    } catch (error) {
        console.error("Erro completo:", error);
        alert("Erro ao agendar: " + (error.response?.data?.message || error.message));
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-xl mx-auto">
        <h1 class="text-3xl font-bold text-center mb-5">Agende seu Horario</h1>

        <div v-if="step === 1" class="flex flex-column gap-3">
            <Card
            v-for="o in offerings"
            :key="o.id"
            class="cursor-pointer hover:surface-400 transition-all transition-duration-200 shadow-1 hover:shadow-3 mb-3 border-1 border-transparent hover:border-primary" 
            @click="selectService(o)">

            <template #title>
                <div class="flex justify-between align-items-center">
                    <span class="text-xl font-bold text-900">{{ o.name }}</span>
                    <i class="pi text-gray-400"></i>
                </div>
                
            </template>

            <template #subtitle>
                <div class="flex justify-content-between align-items-center">
                    <span class="gap-4">R$ {{ o.price.toFixed(2) }}</span>
                    <span v-if="o.durationMinutes">
                        <i class="pi pi-clock mr-2 "></i> {{ o.durationMinutes }} min
                    </span>
                </div>
            </template>
            </Card>
        </div>
    </div>



</template>