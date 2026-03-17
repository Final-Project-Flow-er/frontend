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

    <!-- 전역 토스트 알림 -->
    <transition name="toast">
      <div v-if="notificationStore.toast.show" class="global-toast">
        <div class="toast-content">
          <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div class="toast-text">
            <p class="toast-title">새로운 알림</p>
            <p class="toast-msg">{{ notificationStore.toast.message }}</p>
          </div>
          <button @click="notificationStore.toast.show = false" class="toast-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import { useAuthStore } from './stores/auth'
import { useNotificationStore } from './stores/notification'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const searchQuery = ref('')

onMounted(async () => {
  if (authStore.isLoggedIn) {
     try {
       await authStore.getMyInfo()
     } catch (e) {
       console.error('Initial user info fetch failed')
     }
  }
})
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

/* 토스트 알림 스타일 */
.global-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
}

.toast-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  max-width: 450px;
  border-left: 4px solid #0f172a;
}

.toast-icon {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  flex-shrink: 0;
}

.toast-text {
  flex: 1;
}

.toast-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.2rem 0;
}

.toast-msg {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.toast-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

/* 트랜지션 애니메이션 */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>