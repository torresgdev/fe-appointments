import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Tema moderno do PrimeVue

// Importação dos estilos obrigatórios
import 'primeicons/primeicons.css'; // Ícones

const app = createApp(App);

// Configuração do PrimeVue com um tema
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app');