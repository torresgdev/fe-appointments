<script setup>
import { FinancialService} from '../../services/FinancialService';


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';


const appointmentHistory = ref([]);
const totalRevenue = ref(0);
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';
const professionalId = 'ff345eb0-8326-4b43-a62b-17d0f7dff442';

const chartData = ref(null);
const chartOptions = ref(null);

const formatCurrency = (value) => {
    if(!value) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const totalRecords = ref(0); 
const rowsPerPage = ref(5);   
const currentPage = ref(0);

const formatDateTime = (value) => {
    if(!value) return '';
    return new Date(value).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const loadDailyRevenueByProfessional = async () => {
    try {
        const response  = await FinancialService.todayRevenueById(tenantId,professionalId);
        totalRevenue.value = response.data;
    } catch (error) {
        console.error("Error ao tentar pegar o faturamento:", error)
    }
}

const loadHistoryToday = async (page = 0, size = 5) => {
    loading.value = true;
    try {
        const response = await FinancialService.historyByProfessionalIdToday(tenantId, professionalId, page, size);
        
        if (response.data && response.data.content) {
            appointmentHistory.value = response.data.content; 
            totalRecords.value = response.data.totalElements; 
        } else if (Array.isArray(response.data)) {
            // Caso o back-end tenha respondido uma lista pura por engano
            appointmentHistory.value = response.data;
            totalRecords.value = response.data.length;
        } else {
            appointmentHistory.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        appointmentHistory.value = []; 
    } finally {
        loading.value = false;
    }
};

const onPageChange = (event) => {
    currentPage.value = event.page;      
    rowsPerPage.value = event.rows;       
    loadHistoryToday(event.page, event.rows); 
};

const loadChartData = async () => {
    try {
        const response = await FinancialService.getChartData(tenantId,professionalId);

        chartData.value = {
            labels: response.data.labels,
            datasets: [
                {
                    label: 'Faturamento DIário (R$)',
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
        console.error("Error ao carregar dados do gráfico:",error)
    }
};

onMounted(() => {
    loadDailyRevenueByProfessional();
    loadHistoryToday(currentPage.value, rowsPerPage.value);
    loadChartData();
})

</script>

<template>
    <div class="p-5">
        <div class="grid flex justify-content-between align-items-center mb-5">
            <h1 class="text-3xl font-bold">Gestão de Fluxo</h1>
        </div>

        <div class="card shadow-1 border-round p-4 bg-white mb-4">
    <h3 class="text-900 font-medium mb-3">Evolução do Faturamento (Últimos 7 dias)</h3>
    
    <Chart v-if="chartData" type="line" :data="chartData" :options="chartOptions" class="h-20rem" />
    
    <div v-else class="text-center p-4 text-muted">
        Carregando dados do gráfico...
    </div>
</div>

        <div class="mb-5">
            <Card style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: aliceblue;">
                <template #title>Faturamento Diário</template>
                <template #content>
                    <span class="text-2xl font-semibold">{{ formatCurrency(totalRevenue) }}</span>
                </template>
            </Card>
        </div>

        <Card>
            <template #title>Últimas Movimentações</template>
            <template #content>
                <DataTable 
    :value="appointmentHistory" 
    :loading="loading" 
    :lazy="true" 
    :paginator="true" 
    :rows="rowsPerPage" 
    :totalRecords="totalRecords" 
    @page="onPageChange"
    responsiveLayout="scroll" 
    class="shadow-1 border-round overflow-hidden"
>
    <Column field="transactionDate" header="Data">
        <template #body="slotProps">
            {{ formatDateTime(slotProps.data.transactionDate) }}
        </template>
    </Column>
    <Column field="description" header="Descrição"></Column>
    <Column field="professionalName" header="Profissional"></Column>
    <Column field="amount" header="Valor">
        <template #body="slotProps">
            {{ formatCurrency(slotProps.data.amount) }}
        </template>
    </Column>
    <Column field="method" header="Método de Pagamento">
        <template #body="slotProps">
            <span :class="'status-badge ' + slotProps.data.method.toLowerCase()">
                {{ slotProps.data.method }}
            </span>
        </template>
    </Column>
</DataTable>
            </template>
        </Card>
    </div>
</template>