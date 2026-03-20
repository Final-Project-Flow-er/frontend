<template>
  <div class="home-view-container">
    <!-- Premium Welcome Section -->
    <div class="welcome-banner-card">
      <div class="banner-inner">
        <div class="banner-text">
          <span class="date-display">{{ currentDate }}</span>
          <h1>안녕하세요, <span class="highlight">{{ authStore.userName }}</span>님</h1>
          <p class="description">{{ subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Role-based Dashboard Components -->
    <HQDashboard v-if="['admin', 'headoffice', 'hq', 'admin'].includes(userRole?.toLowerCase())" />
    <FranchiseDashboard v-else-if="userRole?.toLowerCase() === 'franchise'" />
    <FactoryDashboard v-else-if="userRole?.toLowerCase() === 'factory'" />

    <!-- Fallback / Loading -->
    <div v-else class="loading-container">
      <div class="loader-dot"></div>
      <p>데이터를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import HQDashboard from '@/components/dashboard/HQDashboard.vue'
import FranchiseDashboard from '@/components/dashboard/FranchiseDashboard.vue'
import FactoryDashboard from '@/components/dashboard/FactoryDashboard.vue'

const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short'
  })
})
const subtitle = computed(() => {
  const role = userRole.value?.toLowerCase()
  if (role === 'admin' || role === 'headoffice' || role === 'hq') return '실시간 운영 현황 및 주요 시스템 지표를 관리합니다'
  if (role === 'franchise') return '가맹점 운영 현황 및 주요 지표를 확인합니다'
  if (role === 'factory') return '공장 운영 현황 및 주요 지표를 확인합니다'
  return '시스템 현황을 확인합니다'
})
</script>

<style scoped>
.home-view-container {
  padding: 1.5rem 0;
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-banner-card {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  margin-bottom: 2.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.banner-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-display {
  font-size: 0.85rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  display: block;
}

.banner-text h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.4rem 0;
  letter-spacing: -0.5px;
}

.banner-text h1 .highlight {
  color: #2563eb;
}

.banner-text .description {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.loading-container {
  padding: 10rem 0;
  text-align: center;
}

.loader-dot {
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
