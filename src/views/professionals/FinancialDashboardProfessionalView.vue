<script setup>
import { FinancialService} from '../../services/FinancialService';


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';
import Chart from 'primevue/chart';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';


const appointmentHistory = ref([]);
const totalRevenue = ref(0);
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';
const professionalId = 'ff345eb0-8326-4b43-a62b-17d0f7dff442';

const chartData = ref(null);
const chartOptions = ref(null);

const dates = ref(null);

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

        const response = await FinancialService.getChartData(tenantId, professionalId, startDate, endDate);
        
        chartData.value = {
            labels: response.data.labels,
            datasets: [
                {
                    label: 'Faturamento Total (R$)',
                    data: response.data.datasets,
                    fill: true,
                    borderColor: '#6366F1',
                    tension: 0.4,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)'
                }
            ]
        };
    } catch (error) {
        console.error("Erro ao carregar dados filtrados do gráfico:", error);
    }
};

onMounted(() => {
    loadDailyRevenueByProfessional();
    loadHistoryToday(currentPage.value, rowsPerPage.value);
    loadChartData();
})

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
</template>