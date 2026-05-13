import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Tema moderno do PrimeVue

// Importação dos estilos obrigatórios
import 'primeicons/primeicons.css'; 
import '/node_modules/primeflex/primeflex.css';

const app = createApp(App);

// Configuração do PrimeVue com um tema
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app');