<script setup>
// Aqui não precisamos de imports por enquanto, 
// a menos que você queira usar lógica de menu aqui.
</script>

<template>
  <!-- DIV PAI ÚNICA -->
  <div class="app-container">
    
    <!-- Menu de Navegação Superior -->
    <nav class="flex align-items-center gap-4 p-4 bg-gray-900 shadow-2 mb-4">
      <router-link to="/admin/agenda" class="nav-link">
        <i class="pi pi-calendar mr-2"></i> Agenda
      </router-link>
      
      <router-link to="/admin/historico" class="nav-link">
        <i class="pi pi-chart-line mr-2"></i> Financeiro
      </router-link>
    </nav>

    <!-- Onde as páginas (Views) serão injetadas -->
    <main class="p-2">
      <router-view />
    </main>

  </div>
</template>

<style>
/* Estilos Globais */
body {
  margin: 0;
  font-family: var(--font-family);
  background-color: var(--surface-ground);
}

.nav-link {
  text-decoration: none;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Classe automática do Vue Router para o link da página atual */
.router-link-active {
  color: #4ade80 !important; /* Verde */
  background-color: rgba(74, 222, 128, 0.1);
}
</style>