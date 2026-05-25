<script setup>
import {FinancialService} from '../../services/FinancialService';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import { ref, onMounted } from 'vue';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';


const appointmentsHistory = ref([]);
const totalRevenue = ref (0);
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';


const chartData = ref(null);
const chartOptions = ref(null)

const dates = ref(null);

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

const loadChartData = async() => {
   try {
        let startDate = '';
        let endDate = '';

        if (dates.value && dates.value[0] && dates.value[1]) {
        
            const formatLocalDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            startDate = formatLocalDate(dates.value[0]);
            endDate = formatLocalDate(dates.value[1]);
        }

        const response = await FinancialService.getAllChartData(tenantId, startDate, endDate);
    chartData.value = {
      labels: response.data.labels,
      datasets: [
        {
          label: 'Faturamento Diário',
          data: response.data.datasets,
          fill: true,
          borderColor: '#4bc0c0',
          tension: 0.4,
          backgroundColor: 'rgba(75, 192, 192, 0.2)'
        }
      ]
    }

    chartOptions.value = {
            repsonsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#495057' } }
            },
            scale: {
                x: { grid: { color: '#ebedef' }, ticks: { color: '#495057' } },
                y: { grid: { color: '#ebedef' }, ticks: { color: '#495057' } }
            }
        };


   } catch (error) {
    console.error("Error ao criar chart:",error)
   }

}

onMounted(() => {
    loadDailyRevenue();
    loadHistoryToday();
    loadChartData();
});
</script>

<template>

<div class="card shadow-1 border-round p-4 bg-white mb-4">
    <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center mb-4 gap-3">
        <h3 class="text-900 font-medium m-0">Evolução do Faturamento</h3>
        
        <div class="flex align-items-center gap-2">
            <DatePicker 
                v-model="dates" 
                selectionMode="range" 
                :manualInput="false" 
                placeholder="Filtrar por período" 
                dateFormat="dd/mm/yy"
                showIcon
                class="w-full md:w-20rem"
            />
            <Button icon="pi pi-search" label="Filtrar" severity="primary" @click="loadChartData" />
        </div>
    </div>
    
    <Chart v-if="chartData" type="line" :data="chartData" :options="chartOptions" class="h-20rem" />
</div>




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