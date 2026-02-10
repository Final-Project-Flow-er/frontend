<template>
  <template v-if="['/login', '/account'].includes($route.path)">
    <router-view />
  </template>

  <div v-else class="chain-g-app-root">
    <Sidebar />
    <div class="main-container">
      <Header v-model="searchQuery" />
      <main class="content-scroll">
        <router-view :search-query="searchQuery" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'

const searchQuery = ref('')
</script>

<style>
@import "./assets/main.css";

.chain-g-app-root {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-main);
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* 커스텀 스크롤바 */
.content-scroll::-webkit-scrollbar { width: 8px; }
.content-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>