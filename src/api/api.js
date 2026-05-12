import axios from 'axios';
import { Config } from 'primevue';

const api = axios.create({
  baseURL: 'http://localhost:8080/tenants',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response)=> {
    return response;
}, (error) => {
    const status = error.response ? error.response.status : null;

    if (status == 401) {
        console.error("Error de Autenticação: Redirecionando para tela principal...");

    } else if (status == 400) {
        console.error("Recurso não encontrado no servidor.")
    } else if (status == 500) {
        console.error("Error interno no backend, Verifique o console do backend");
    }

    return Promise.reject(error)
})

export default api;