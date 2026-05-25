<script setup>
import { FinancialService} from '../../services/FinancialService';


import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';


const appointmentHistory = ref([]);
const totalRevenue = ref(0);
const loading = ref(false);
const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';
const professionalId = 'ff345eb0-8326-4b43-a62b-17d0f7dff442';

const formatCurrency = (value) => {
    if(!value) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

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

const loadHistoryToday = async () => {
    loading.value = true;
    try {
        const response = await FinancialService.historyByProfessionalIdToday(tenantId, professionalId);
        appointmentHistory.value = response.data;
    } catch(error) {
        console.error("Error ao buscar historico:", error)
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadDailyRevenueByProfessional();
    loadHistoryToday();
})

</script>

<template>
    <div class="p-5">
        <div class="grid flex justify-content-between align-items-center mb-5">
            <h1 class="text-3xl font-bold">Gestão de Fluxo</h1>
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
                <DataTable :value="appointmentHistory" :loading="loading" responsiveLayout="scroll" :rows="5" paginator>
                    
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