<script setup>
import { onMounted, ref } from 'vue';
import { AppointmentService } from '../../services/AppointmentService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';



const appointments = ref([]);
const loading = ref(false);
const tenantId = '6cc42dd1-8052-4f73-a33b-079f8948b8fa';

const loadAppointments = async () => {
  loading.value = true;
  try {
    const response = await AppointmentService.listByToday(tenantId);
    appointments.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar dados do Java:", error);
  } finally {
    loading.value = false;
  }
}


const completeAppointments = async (id, method) => {
  try {
    await AppointmentService.completeAppointment(tenantId, id, method);
    await loadAppointments();
  } catch (error) {
    console.error("Error ao finalizar:", error)
  }
}

const formatTime = (value) => {
  return new Date(value).toLocaleDateString('pt-BR', {hour: '2-digit', minute: '2-digit'});
};

const getSeverity = (status) => {
  switch(status) {
    case 'COMPLETED' : return 'sucess';
    case 'CONFIRMED' : return 'info';
    default: return 'warning;'
  }
};

onMounted(loadAppointments);
</script>


<template>
 <div class="p-4 bg-gray-50 min-h-screen">
  <div class="flex justfy-content-between mb-4">
    <h1 class="">Painel de Atendimento</h1>
    <Button icon="pi pi-refresh" label="Sincronizar" @click="loadAppointments" :loading="loading" />
  </div>

  <DataTable :value="appointments" :loading="loading" class="shadow-1">

    <Column field="startTime" header="Hora">
      <template #body = "{data}"> {{ formatTime(data.startTime) }}</template>
    </Column>

    <Column field="clientName" header="Cliente"></Column>
    <Column field="offeringName" header="Serviço"></Column>

    <Column field="status" header="Status">
      <template #body="{data}">
        <Tag :value="data.status" :severity="getSeverity(data.status)"/>
      </template>
    </Column>

    <Column header="Ações">
      <template #body="{data}">
        <div v-if="data.status != 'COMPLETED'" class="flex gap-2">
          <Button icon="pi pi-money-bill" label="Dinheiro" class="p-button-succsess p-button-sm" @click="completeAppointments(data.id, 'CASH')" />
          <Button icon="pi pi-qrcode" label="PIX" class="p-button-info p-button-sm" @click="completeAppointments(data.id, 'PIX')" />
        </div>
      </template>
    </Column>

  </DataTable>
 </div>
</template>