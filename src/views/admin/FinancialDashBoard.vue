<script setup>
import {FinancialService} from '../../services/FinancialService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';


const appointmentsHistory = ref([]);
const totalRevenue = ref (0);
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';

const formatCurrency = (value) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatDateTime = (value) => {
  if (!value) return '';
  
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


const loadDailyRevenue = async () => {
    try {
       
        const response = await FinancialService.dailyRevenue(tenantId);
        totalRevenue.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
    }
};

const loadHistoryToday = async () => {
    loading.value = true;
    try {
        
        const response = await FinancialService.historyToday(tenantId);
        appointmentsHistory.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadDailyRevenue();
    loadHistoryToday();
});
</script>

<template>
  <div class="p-5">
    <div class="grid flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">Gestão de Barba & Corte</h1>
    </div>

    <!-- Card de Faturamento -->
    <div class="mb-5">
      <Card style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white;">
        <template #title> Faturamento Diário </template>
        <template #content>
          <span class="text-5xl font-bold">R$ {{ totalRevenue.toFixed(2) }}</span>
        </template>
      </Card>
    </div>

    <!-- Tabela de Histórico -->
    <Card>
      <template #title> Últimas Movimentações </template>
      <template #content>
        <DataTable :value="appointmentsHistory" paginator :rows="5" tableStyle="min-width: 50rem">
          <Column field="transactionDate" header="Data">
            <template #body="slotProps">
              {{ formatDateTime(slotProps.data.transactionDate)}}
            </template>
          </Column>
          <Column field="description" header="Descrição"></Column>
          <Column field="professionalName" header="Profissional">
            <template data="{data}">
              <span class="">{{ data.professionalName }}</span>
            </template>
          </Column>
          <Column field="amount" header="Valor">
            <template #body="slotProps">
              R$ {{ slotProps.data.amount.toFixed(2) }}
            </template>
          </Column>
          <Column field="method" header="Método de Pagamento">
             <template #body="slotProps">
               <span :class="'status-badge ' + slotProps.data.method">{{ slotProps.data.method }}</span>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>