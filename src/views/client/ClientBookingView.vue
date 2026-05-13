<script setup>
import { ref, onMounted, watch } from 'vue';

// Services
import { AppointmentService } from '../../services/AppointmentService';
import { OfferingService } from '../../services/OfferingService';
import { AvailabilityService } from '../../services/AvailabilityService';

// PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';

// --- ESTADOS REATIVOS ---
const step = ref(1);
const offerings = ref([]);
const selectedOffering = ref(null);
const selectedDate = ref(null);
const availableSlots = ref([]);
const loading = ref(false);

const tenantId = '6cc42dd1-8052-4f73-a33b-079f8948b8fa';
const professionalId = "c9f1a856-4987-47fe-85cd-62d746b160d3";

// --- FUNÇÕES DE CARREGAMENTO (Devem estar na raiz do script) ---

const loadOfferings = async () => {
    try {
        const response = await OfferingService.listAll(tenantId);
        offerings.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar serviços: ", error);
    }
};

const loadSlots = async (date) => {
    if (!date) return;
    loading.value = true;
    try {
        // Formata data para YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        console.log("Buscando slots para:", formattedDate);
        
        const response = await AvailabilityService.getAvailability(tenantId, professionalId, formattedDate);
        availableSlots.value = response.data;
        step.value = 3; // Avança para escolha de horário
    } catch (error) {
        console.error("Erro ao carregar slots: ", error);
        alert("Erro ao carregar horários disponíveis.");
    } finally {
        loading.value = false;
    }
};

// --- AÇÕES DO USUÁRIO ---

const selectService = (service) => {
    selectedOffering.value = service;
    step.value = 2; // Avança para o calendário
    console.log("Avançando para o passo 2 com serviço:", service.name);
};

const selectSlot = (slot) => {
    if (!slot.available) return;

    // Atualiza o objeto Date com a hora escolhida
    const [hours, minutes] = slot.time.split(':');
    const newDate = new Date(selectedDate.value);
    newDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    selectedDate.value = newDate;
    step.value = 4; // Passo de confirmação final
};

const configmBooking = async () => {
    loading.value = true;
    try {
        // O selectedDate já foi atualizado com a hora no selectSlot
        const date = selectedDate.value;
        
        // Ajuste para o formato ISO local (sem o 'Z' de UTC para não mudar a hora no banco)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formattedISO = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        const payload = {
            clientName: "João Silva", // Aqui você poderia ter um input para o nome
            clientPhone: "21999998888", // E um para o telefone
            professionalId: professionalId,
            offeringId: selectedOffering.value.id,
            startTime: formattedISO
        };

        console.log("Enviando agendamento:", payload);

        await AppointmentService.createAppointment(tenantId, payload);
        
        alert("✅ Agendamento realizado com sucesso!");
        
        // Resetar para o passo 1 após o sucesso
        step.value = 1;
        selectedDate.value = null;
        selectedOffering.value = null;

    } catch (error) {
        console.error("Erro ao agendar:", error);
        alert("Erro ao salvar agendamento. Verifique o console.");
    } finally {
        loading.value = false;
    }
};

// --- OBSERVADORES (WATCHERS) ---

// O Watcher agora consegue "ver" a função loadSlots porque ela está definida acima ou na raiz
watch(selectedDate, async (newDate) => {
    if (newDate && step.value === 2) {
        await loadSlots(newDate);
    }
});

// --- CICLO DE VIDA ---
onMounted(() => {
    loadOfferings();
});

// Helper
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<template>
    <div class="max-w-xl mx-auto p-4">
        <h1 class="text-3xl font-bold text-center mb-5">Agende seu Horário</h1>

        <!-- PASSO 1: SELEÇÃO DE SERVIÇO -->
        <div v-if="step === 1" class="flex flex-column gap-3">
            <Card v-for="o in offerings" :key="o.id"
                class="cursor-pointer hover:surface-100 transition-all transition-duration-200 shadow-1 hover:shadow-3 mb-3 border-1 border-transparent hover:border-primary"
                @click="selectService(o)">
                <template #title>
                    <div class="flex justify-content-between align-items-center">
                        <span class="text-xl font-bold text-900">{{ o.name }}</span>
                    </div>
                </template>
                <template #subtitle>
                    <div class="flex justify-content-between align-items-center">
                        <span>{{ formatCurrency(o.price) }}</span>
                        <span v-if="o.durationMinutes">
                            <i class="pi pi-clock mr-2"></i> {{ o.durationMinutes }} min
                        </span>
                    </div>
                </template>
            </Card>
        </div>

        <!-- PASSO 2: CALENDÁRIO -->
        <div v-if="step === 2" class="text-center">
            <h2 class="text-2xl font-bold mb-4">Selecione uma Data</h2>
            <DatePicker v-model="selectedDate" inline class="mb-4 shadow-2 border-round" />
            <div class="flex justify-content-center gap-3">
                <Button label="Voltar" icon="pi pi-arrow-left" @click="step = 1" class="p-button-text" />
            </div>
        </div>

        <!-- PASSO 3: HORÁRIOS -->
        <div v-if="step === 3" class="text-center">
            <h2 class="text-2xl font-bold mb-4">Escolha o Horário</h2>
            <p class="mb-4 text-600">
                Para o dia: <strong>{{ selectedDate.toLocaleDateString('pt-BR') }}</strong>
            </p>
            <div class="grid grid-nogutter gap-3 justify-content-center">
                <div v-for="slot in availableSlots" :key="slot.time" class="col-3">
                    <Button :label="slot.time" :disabled="!slot.available"
                        :class="slot.available ? 'p-button-outlined p-button-primary' : 'p-button-secondary'"
                        class="w-full font-bold" @click="selectSlot(slot)" />
                </div>
            </div>
            <Button label="Voltar para data" icon="pi pi-arrow-left" @click="step = 2" class="p-button-text mt-5" />
        </div>

        <!-- PASSO 4: CONFIRMAÇÃO FINAL (Agora fora da div do passo 3) -->
        <div v-if="step === 4" class="text-center">
            <i class="pi pi-calendar-check text-primary text-5xl mb-4"></i>
            <h3 class="mb-2">Confirme seu Agendamento</h3>

            <div class="surface-100 p-4 border-round mb-4 text-left">
                <p><strong>Serviço:</strong> {{ selectedOffering?.name }}</p>
                <p><strong>Preço:</strong> {{ formatCurrency(selectedOffering?.price) }}</p>
                <p><strong>Data:</strong> {{ selectedDate?.toLocaleDateString('pt-BR') }}</p>
                <p><strong>Horário:</strong> {{ selectedDate?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>

            <div class="flex gap-2">
                <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-text flex-1" @click="step = 3" />
                <Button label="Confirmar Agendamento" icon="pi pi-check" class="p-button-primary flex-2"
                    :loading="loading" @click="configmBooking" />
            </div>
        </div>
    </div>
</template>