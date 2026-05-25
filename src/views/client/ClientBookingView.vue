<script setup>
import { ref, onMounted, watch } from 'vue';

// Services
import { AppointmentService } from '../../services/AppointmentService';
import { OfferingService } from '../../services/OfferingService';
import { AvailabilityService } from '../../services/AvailabilityService';
import { ProfessionalService } from '../../services/ProfessionalService';
import axios from 'axios'; // Importado para fazer a chamada direta do token se preferir, ou use sua api configurada

// PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';

// --- ESTADOS REATIVOS ---
const step = ref(0);
const offerings = ref([]);
const selectedOffering = ref(null);
const selectedDate = ref(null);
const availableSlots = ref([]);
const loading = ref(false);
const professionals = ref([]);
const selecetdProfessional = ref(null);

const clientName = ref('');
const clientPhone = ref('');

// 🛡️ Novos estados para controle do Token de Verificação
const tokenDigitado = ref('');
const erroToken = ref('');

const tenantId = '38ac98b9-63d5-4aa2-8975-1628fc2c6e07';


// --- FUNÇÕES DE CARREGAMENTO ---

const loadOfferings = async () => {
    try {
        const response = await OfferingService.listAll(tenantId);
        offerings.value = response.data;
    } catch (error) {
        console.error("Erro ao buscar serviços: ", error);
    }
};

const loadProfessionals = async () => {
    try {
        const response = await ProfessionalService.listAllProfessionals(tenantId);
        professionals.value = response.data;
    } catch (error) {
        console.error("Error ao buscar profissionais: ", error)
    }
}

const loadSlots = async (date) => {
    if (!date) return;
    loading.value = true;
    try {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        console.log("Buscando slots para:", formattedDate);
        
        const response = await AvailabilityService.getAvailability(tenantId,
        selecetdProfessional.value.id, 
        formattedDate);
        availableSlots.value = response.data;
        step.value = 4; 
    } catch (error) {
        console.error("Erro ao carregar slots: ", error);
        alert("Erro ao carregar horários disponíveis.");
    } finally {
        loading.value = false;
    }
};

// --- AÇÕES DO USUÁRIO ---

const selectProfessional = (professional) => {
    selecetdProfessional.value = professional;
    console.log("profissional selecionado")
}

const selectService = (service) => {
    selectedOffering.value = service;
    step.value = 3; 
    console.log("Avançando para o passo 2 com serviço:", service.name);
};

const selectSlot = (slot) => {
    if (!slot.available) return;

    const [hours, minutes] = slot.time.split(':');
    const newDate = new Date(selectedDate.value);
    newDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    selectedDate.value = newDate;
    step.value = 5; 
};

const confirmBooking = async () => {
    loading.value = true;
    try {
        const date = selectedDate.value;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formattedISO = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        const payload = {
            clientName: clientName.value, 
            clientPhone: clientPhone.value, 
            professionalId: selecetdProfessional.value.id,
            offeringId: selectedOffering.value.id,
            startTime: formattedISO
        };

        console.log("Enviando agendamento:", payload);

        // 🛡️ Captura o retorno do seu AppointmentResponseDTO ajustado
        const response = await AppointmentService.createAppointment(tenantId, payload);
        const data = response.data;

        // Se cair aqui, significa que o cliente não é verificado. Mudamos para o passo do token!
        if (data.status === 'PENDING_VERIFICATION') {
            console.log("======== TOKEN IMPRESSO NO FRONT (DEBUG):", data.verificationToken, " ========");
            tokenDigitado.value = '';
            erroToken.value = '';
            step.value = 6; // Avança para a nova tela de digitação do código
        } else {
            // Se já for verificado, passa direto
            alert("✅ Agendamento realizado com sucesso!");
            resetForm();
        }

    } catch (error) {
        console.error("Erro ao agendar:", error);
        alert(error.response?.data?.message || "Erro ao salvar agendamento. Verifique o console.");
    } finally {
        loading.value = false;
    }
};

// 🛡️ Nova função para validar o token no PublicAppointmentController
const verifyTokenSubmit = async () => {
    
    if (tokenDigitado.value.length !== 6) {
        erroToken.value = "O código deve ter exatamente 6 dígitos.";
        return;
    
    }

    loading.value = true;
    erroToken.value = '';
    try {
        // Envia o token via RequestParam (?token=XXXXXX) para a rota pública
        await axios.post(`http://localhost:8080/public/appointments/verify?token=${tokenDigitado.value}`);
        
        alert("✅ Agendamento confirmado com sucesso! Seu cadastro agora está verificado.");
        resetForm();
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        // Exibe o erro customizado lançado pelo seu NotFoundExceptionT no Spring
        erroToken.value = error.response?.data?.message || error.response?.data || "Código inválido ou expirado.";
    } finally {
        loading.value = false;
    }
};

// Função auxiliar para limpar o formulário e voltar ao início
const resetForm = () => {
    step.value = 0;
    selectedDate.value = null;
    selectedOffering.value = null;
    tokenDigitado.value = '';
    erroToken.value = '';
};

// --- OBSERVADORES (WATCHERS) ---

watch(selectedDate, async (newDate) => {
    if (newDate && step.value === 3) {
        await loadSlots(newDate);
    }
});

// --- CICLO DE VIDA ---
onMounted(() => {
    loadProfessionals();
    loadOfferings();
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<template>
    <div class="max-w-xl mx-auto p-4">

        <!-- PASSO 0: ESCOLHA DO PROFISSIONAL -->
        <div v-if="step === 0" class="flex flex-column gap-3">
            <h2 class="text-2xl font-bold text-center mb-4">Escolha seu Profissional</h2>
            <Card v-for="p in professionals" :key="p.id"
                class="cursor-pointer hover:surface-100 border-1 border-transparent hover:border-primary"
                @click="selectProfessional(p); step = 1">
                <template #title>
                    <div class="flex align-itens-center gap-3">
                        <Avatar icon="pi pi-user" size="xlarge" shape="circle"/>
                        <span>{{ p.name }}</span>
                    </div>
                </template>
                <template #subtitle>{{ p.bio }}</template>
            </Card>
        </div>


        <!-- PASSO 1: Cadastro do Usuario -->
        <div v-if="step === 1" class="flex flex-column gap-3">
            <h2 class="text-2xl font-semibold text-center">Seus Dados</h2>

            <div class="flex flex-column gap-2">
                <label for="name">Nome</label>
                <InputText id="name" v-model="clientName" placeholder="Digite o seu nome"/>
            </div>

            <div class="flex flex-column gap-2">
                <label for="phone">Telefone</label>
                <InputMask id="phone" v-model="clientPhone" mask="(99) 99999-9999" placeholder="(00) 00000-0000"/>
            </div>

            <Button label="Continuar para Serviços"
                :disabled="!clientName || !clientPhone"
                @click="step = 2"/>
            
            <Button label="Voltar" class="p-button-text" @click="step = 0" />
        </div>


        <!-- PASSO 2: SELEÇÃO DE SERVIÇO -->
        <div v-if="step === 2" class="flex flex-column gap-3">
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
            <Button label="Voltar" class="p-button-text" @click="step = 1" />
        </div>

        <!-- PASSO 3: CALENDÁRIO -->
        <div v-if="step === 3" class="text-center">
            <h2 class="text-2xl font-bold mb-4">Selecione uma Data</h2>
            <DatePicker v-model="selectedDate" inline class="mb-4 shadow-2 border-round" />
            <div class="flex justify-content-center gap-3">
                <Button label="Voltar" icon="pi pi-arrow-left" @click="step = 2" class="p-button-text" />
            </div>
        </div>

        <!-- PASSO 4: HORÁRIOS -->
        <div v-if="step === 4" class="text-center">
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
            <Button label="Voltar para data" icon="pi pi-arrow-left" @click="step = 3" class="p-button-text mt-5" />
        </div>

        <!-- PASSO 5: CONFIRMAÇÃO FINAL -->
        <div v-if="step === 5" class="text-center">
            <i class="pi pi-calendar-check text-primary text-5xl mb-4"></i>
            <h3 class="mb-2">Confirme seu Agendamento</h3>

            <div class="surface-100 p-4 border-round mb-4 text-left">
                <p><strong>Serviço:</strong> {{ selectedOffering?.name }}</p>
                <p><strong>Preço:</strong> {{ formatCurrency(selectedOffering?.price) }}</p>
                <p><strong>Data:</strong> {{ selectedDate?.toLocaleDateString('pt-BR') }}</p>
                <p><strong>Horário:</strong> {{ selectedDate?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>

            <div class="flex gap-2">
                <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-text flex-1" @click="step = 4" />
                <Button label="Confirmar Agendamento" icon="pi pi-check" class="p-button-primary flex-2"
                    :loading="loading" @click="confirmBooking" />
            </div>
        </div>

        <!-- 🛡️ PASSO 6: NOVA TELA DE VERIFICAÇÃO DO TOKEN -->
        <div v-if="step === 6" class="text-center card p-4 surface-card border-round shadow-2">
            <i class="pi pi-shield text-warning-500 text-5xl mb-3 text-amber-500"></i>
            <h2 class="text-2xl font-bold mb-2">Quase lá, {{ clientName }}!</h2>
            <p class="text-600 mb-4 text-sm">
                Como este é seu primeiro agendamento, digite abaixo o código de verificação gerado pelo sistema.
            </p>

            <!-- Input focado e centralizado para os 6 dígitos -->
            <div class="flex flex-column align-items-center gap-3 mb-4">
                <InputText 
                    v-model="tokenDigitado" 
                    maxlength="6" 
                    placeholder="000000" 
                    class="text-center font-bold w-12rem text-3xl"
                    :disabled="loading"
                />
                <small v-if="erroToken" class="p-error block font-semibold text-red-500">{{ erroToken }}</small>
            </div>

            <div class="flex flex-column gap-2">
                <Button 
                    label="Confirmar Código" 
                    icon="pi pi-verified" 
                    class="p-button-success w-full" 
                    :loading="loading" 
                    @click="verifyTokenSubmit"
                />
                <Button 
                    label="Cancelar e Voltar" 
                    class="p-button-text p-button-secondary w-full" 
                    :disabled="loading" 
                    @click="resetForm" 
                />
            </div>
        </div>

    </div>
</template>