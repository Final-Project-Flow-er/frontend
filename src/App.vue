<script setup>
import { ref } from 'vue'
// 상대 경로를 좀 더 명확하게 작성하거나 @/ 를 사용합니다.
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import InventoryView from './views/InventoryView.vue'

const searchQuery = ref('')
</script>

<template>
  <div class="chain-g-app-root">
    <Sidebar />
    <div class="main-container">
      <Header v-model="searchQuery" />
      <main class="content-scroll">
        <InventoryView :searchQuery="searchQuery" />
      </main>
    </div>
  </div>
</template>

<style>
/* 1. 경로 확인: assets 폴더가 src 바로 아래에 있는지 확인하세요 */
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