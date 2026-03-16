<template>
  <div class="factory-dashboard">

    <!-- Summary Grid -->
    <section class="summary-grid">
      <div class="summary-card" @click="$router.push('/factory/inbound')">
        <div class="card-icon-box production">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <div class="card-data">
          <span class="label">생산 입고 대기</span>
          <span class="value">{{ pendingInboundCount }}<small>건</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/factory/outbound')">
        <div class="card-icon-box shipping">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="card-data">
          <span class="label">출고 대기 박스</span>
          <span class="value">{{ pendingOutboundCount }}<small>건</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/factory/orders')">
        <div class="card-icon-box orders">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="card-data">
          <span class="label">본사 발주 요청</span>
          <span class="value">{{ pendingOrderCount }}<small>건</small></span>
        </div>
      </div>
      <div class="summary-card log-card" @click="$router.push('/hq/inventory/logs/factory')">
        <div class="card-icon-box logs">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
        </div>
        <div class="card-data">
          <span class="label">오늘의 물류 변동</span>
          <span class="value">{{ todayLogCount }}<small>건</small></span>
        </div>
      </div>
    </section>

    <!-- Main Layout -->
    <div class="dashboard-main-layout">
      <!-- Left Column -->
      <div class="column-left">

        <!-- 바로가기 -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">주요 업무 바로가기</span>
          </div>
          <div class="card-body">
            <div class="quick-nav-grid">
              <div class="nav-item" @click="$router.push('/factory/inbound')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <span>생산 입고</span>
              </div>
              <div class="nav-item" @click="$router.push('/factory/outbound')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <span>제품 출고</span>
              </div>
              <div class="nav-item" @click="$router.push('/factory/orders')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span>발주 접수</span>
              </div>
              <div class="nav-item" @click="$router.push('/hq/inventory/logs/factory')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span>로그 내역</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column-right">
        <!-- 공장 현황 -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">매장 현황</span>
          </div>
          <div class="card-body">
            <div class="admin-wait-box">
              <div class="wait-item">
                <span class="w-label">공장 책임자</span>
                <span class="w-val">{{ authStore.userName }}</span>
              </div>
              <div class="wait-item">
                <span class="w-label">현재 날짜</span>
                <span class="w-val">{{ currentDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const pendingInboundCount = ref(0)
const pendingOutboundCount = ref(0)
const pendingOrderCount = ref(0)
const todayLogCount = ref(0)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return dateStr.split('T')[0]
}

const fetchDashboardData = async () => {
  try {
    console.group('공장 대시보드 데이터 로딩')
    
    // 1. 본사 발주 요청 (Pending)
    const ordersRes = await api.get('factory/orders', { params: { isAll: false } })
    pendingOrderCount.value = ordersRes.data.data?.length || 0
    console.log('1. 발주 요청:', pendingOrderCount.value)

    // 2. 생산 입고 대기
    const inboundRes = await api.get('inbounds/items')
    pendingInboundCount.value = inboundRes.data.data?.length || 0
    console.log('2. 입고 대기:', pendingInboundCount.value)

    // 3. 출고 대기 박스
    const outboundRes = await api.get('outbounds/boxes')
    pendingOutboundCount.value = outboundRes.data.data?.length || 0
    console.log('3. 출고 대기:', pendingOutboundCount.value)

    // 4. 오늘 로그 (선택사항, factoryId 필요)
    try {
      const workplace = await authStore.getMyWorkplaceInfo()
      if (workplace && workplace.id) {
        const today = new Date().toISOString().split('T')[0]
        const logRes = await api.get(`factory/log/${workplace.id}`, {
          params: { startDate: today, endDate: today, size: 1 }
        })
        todayLogCount.value = logRes.data.data.totalElements || 0
      }
    } catch (logErr) {
       console.warn('활동 로그 조회 실패:', logErr)
    }

    console.groupEnd()
  } catch (error) {
    console.error('공장 대시보드 데이터 로드 실패:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.factory-dashboard {
  padding: 0;
  width: 100%;
}

/* Common Styles (Franchise와 통일) */
.management-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.management-header h1 { font-size: 1.5rem; font-weight: 600; color: #0f172a; margin: 0 0 0.5rem 0; }
.management-header .subtitle { color: #64748b; font-size: 1rem; margin: 0; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
}
.summary-card:hover { transform: translateY(-3px); border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-icon-box.production { background: #eff6ff; color: #3b82f6; }
.card-icon-box.shipping   { background: #f0f9ff; color: #0ea5e9; }
.card-icon-box.orders     { background: #fffbeb; color: #f59e0b; }
.card-icon-box.logs       { background: #f8fafc; color: #64748b; }

.card-data .label { display: block; font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 0.25rem; }
.card-data .value { font-size: 1.4rem; font-weight: 800; color: #0f172a; }
.card-data .value small { font-size: 0.8rem; color: #94a3b8; font-weight: 600; margin-left: 2px; }

.dashboard-main-layout { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 1.5rem; 
}
.column-left { grid-column: span 3; display: flex; flex-direction: column; gap: 1.5rem; }
.column-right { grid-column: span 1; display: flex; flex-direction: column; gap: 1.5rem; }

.dashboard-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.card-header { padding: 1rem 1.25rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-shrink: 0; }
.card-title { font-size: 1rem; font-weight: 700; color: #0f172a; }
.header-btn { background: transparent; border: none; font-size: 0.75rem; font-weight: 700; color: #64748b; cursor: pointer; }
.header-btn:hover { color: #3b82f6; }
.card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }

.column-left .dashboard-card:last-child,
.column-right .dashboard-card:last-child {
  flex: 1;
}

.status-list { display: flex; flex-direction: column; gap: 0.75rem; }
.status-item { display: flex; align-items: center; padding: 0.85rem 1rem; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.status-item:hover { background: #ffffff; border-color: #cbd5e1; transform: translateX(4px); }

.status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; margin-right: 1rem; text-align: center; min-width: 70px; }
.status-badge.blue  { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.status-badge.sky   { background: #f0f9ff; color: #075985; border: 1px solid #bae6fd; }
.status-badge.amber { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

.status-text { flex: 1; font-size: 0.9rem; font-weight: 600; color: #334155; }
.status-num { font-size: 1.2rem; font-weight: 800; color: #0f172a; }

.quick-nav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.nav-item:hover { background: #eff6ff; border-color: #bfdbfe; }
.nav-icon { width: 32px; height: 32px; color: #3b82f6; }
.nav-item span { font-size: 0.75rem; font-weight: 700; color: #475569; }

.admin-wait-box { display: flex; flex-direction: column; gap: 0.75rem; }
.wait-item { display: flex; justify-content: space-between; font-size: 0.85rem; }
.w-label { color: #64748b; font-weight: 500; }
.w-val   { color: #0f172a; font-weight: 700; }

.settlement-empty { 
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8; 
  font-size: 0.85rem; 
  padding: 2rem 0;
}

@media (max-width: 1024px) {
  .dashboard-main-layout { grid-template-columns: 1fr; }
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
