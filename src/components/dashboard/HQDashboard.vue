<template>
  <div class="dashboard-content">
    <!-- Top Summary Section -->
    <section class="summary-grid">
      <div class="summary-card" @click="$router.push('/admin/organizations/franchise')">
        <div class="card-icon-box store">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
        </div>
        <div class="card-data">
          <span class="label">가맹점 수</span>
          <span class="value">{{ storeCount }}<small>개</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/admin/organizations/factory')">
        <div class="card-icon-box factory">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"></path><path d="M5 20V8l7 4V8l7 4v8"></path></svg>
        </div>
        <div class="card-data">
          <span class="label">생산 공장 수</span>
          <span class="value">{{ factoryCount }}<small>개</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/admin/logistics')">
        <div class="card-icon-box transport">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <div class="card-data">
          <span class="label">운송 차량 대수</span>
          <span class="value">{{ vehicleCount }}<small>대</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/admin/members')">
        <div class="card-icon-box user">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <div class="card-data">
          <span class="label">활성 사용자 수</span>
          <span class="value">{{ userCount }}<small>명</small></span>
        </div>
      </div>
    </section>

    <div class="dashboard-main-layout">
      <!-- Main Column -->
      <div class="column-left">
        <!-- Real-time Tasks -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">운영 요청 현황</span>
            <button class="header-btn" @click="$router.push('/head-office/orders/reception')">더보기</button>
          </div>
          <div class="card-body">
            <div class="status-list">
              <div class="status-item" @click="$router.push('/head-office/orders/reception')">
                <span class="status-badge amber">발주대기</span>
                <span class="status-text">가맹점 신규 발주 요청</span>
                <span class="status-num">{{ pendingOrderCount }}</span>
              </div>
              <div class="status-item" @click="$router.push('/head-office/returns/reception')">
                <span class="status-badge rose">반품대기</span>
                <span class="status-text">가맹점 상품 반품 접수</span>
                <span class="status-num">{{ pendingReturnCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">바로가기</span>
          </div>
          <div class="card-body">
            <div class="quick-nav-grid">
              <div class="nav-item" @click="$router.push('/registration')">
                <div class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>
                <span>사업장 등록</span>
              </div>
              <div class="nav-item" @click="$router.push('/admin/member-registration')">
                <div class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg></div>
                <span>사용자 생성</span>
              </div>
              <div class="nav-item" @click="$router.push('/hq/products/manage')">
                <div class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8l-9-4-9 4v8l9 4 9-4V8z"></path></svg></div>
                <span>상품 관리</span>
              </div>
              <div class="nav-item" @click="$router.push('/notice/register')">
                <div class="nav-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path></svg></div>
                <span>공지사항 등록</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column-right">
        <!-- 관리자 현황 -->
        <div class="dashboard-card profile-info-card">
          <div class="card-header">
            <span class="card-title">관리자 현황</span>
          </div>
          <div class="card-body">
            <div class="admin-wait-box">
              <div class="wait-item">
                <span class="w-label">로그인 정보</span>
                <span class="w-val">{{ authStore.userName }}</span>
              </div>
              <div class="wait-item">
                <span class="w-label">현재 날짜</span>
                <span class="w-val">{{ currentDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Settlement Summary -->
        <div class="dashboard-card settlement-card">
          <div class="card-header">
            <span class="card-title">오늘의 정산 요약</span>
            <button class="header-btn" @click="$router.push('/hq/settlement')">상세보기</button>
          </div>
          <div class="card-body">
            <div v-if="settlementLoading" class="settlement-loading">데이터 로딩 중...</div>
            <div v-else-if="settlementSummary" class="settlement-list">
              <div class="settle-item">
                <span class="s-label">최종 정산 금액</span>
                <span class="s-val primary">{{ formatCurrency(settlementSummary.finalSettlementAmount) }}원</span>
              </div>
              <div class="settle-item">
                <span class="s-label">발주 매출</span>
                <span class="s-val">{{ formatCurrency(settlementSummary.orderRevenue) }}원</span>
              </div>
              <div class="settle-item">
                <span class="s-label">수수료 수익</span>
                <span class="s-val">{{ formatCurrency(settlementSummary.commissionRevenue) }}원</span>
              </div>
              <div class="settle-item">
                <span class="s-label">반품 차감액</span>
                <span class="s-val warn">-{{ formatCurrency(settlementSummary.returnDeduction) }}원</span>
              </div>
            </div>
            <div v-else class="settlement-empty">오늘 정산 데이터가 없습니다.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api'

const authStore = useAuthStore()

// Data
const storeCount = ref(0)
const factoryCount = ref(0)
const vehicleCount = ref(0)
const userCount = ref(0)
const pendingOrderCount = ref(0)
const pendingReturnCount = ref(0)
const settlementSummary = ref(null)
const settlementLoading = ref(false)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  })
})

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('ko-KR')
}

const todayParam = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const fetchDashboardData = async () => {
  try {
    const [franchiseRes, factoryRes, memberRes, transportRes] = await Promise.all([
      api.get('hq/business-units/FRANCHISE', { params: { size: 1 } }),
      api.get('hq/business-units/FACTORY', { params: { size: 1 } }),
      api.get('hq/users', { params: { size: 1 } }),
      api.get('transport/vendors', { params: { size: 100 } })
    ])

    storeCount.value = franchiseRes.data.data.totalElements || 0
    factoryCount.value = factoryRes.data.data.totalElements || 0
    userCount.value = memberRes.data.data.totalElements || 0
    
    if (transportRes.data.data.content) {
      vehicleCount.value = transportRes.data.data.content.reduce((acc, curr) => acc + (curr.vehicleCount || 0), 0)
    }

    const [pendingOrders, pendingReturns] = await Promise.all([
      api.get('hq/orders/requested', { params: { isPending: true } }),
      api.get('hq/returns', { params: { isAll: false } })
    ])

    pendingOrderCount.value = pendingOrders.data.data?.length || 0
    pendingReturnCount.value = pendingReturns.data.data?.length || 0
    
  } catch (error) {
    console.error('HQ Dashboard fetch failed:', error)
  }

  try {
    settlementLoading.value = true
    const stlRes = await api.get('hq/settlements/daily/summary', { params: { date: todayParam.value } })
    settlementSummary.value = stlRes.data.data
  } catch {
    settlementSummary.value = null
  } finally {
    settlementLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
/* Scoped styles specific to HQ Dashboard cards to avoid leakage */
.dashboard-content { width: 100%; }
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
  height: 100%;
}
.summary-card:hover { transform: translateY(-3px); border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  background: #eff6ff;
}
.card-data .label { display: block; font-size: 0.8rem; font-weight: 600; color: #64748b; margin-bottom: 0.25rem; }
.card-data .value { font-size: 1.4rem; font-weight: 800; color: #0f172a; display: flex; align-items: baseline; gap: 2px; }
.card-data .value small { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }

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

/* Stretch the bottom cards in each column to align their bottom edges */
.column-left .dashboard-card:last-child,
.column-right .dashboard-card:last-child {
  flex: 1;
}

.status-list { display: flex; flex-direction: column; gap: 0.75rem; }
.status-item { display: flex; align-items: center; padding: 0.85rem 1rem; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.status-item:hover { background: #ffffff; border-color: #cbd5e1; transform: translateX(4px); }
.status-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; margin-right: 1rem; }
.status-badge.amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.status-badge.rose { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
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
.w-val { color: #0f172a; font-weight: 700; }

.settlement-list { display: flex; flex-direction: column; gap: 0.6rem; }
.settle-item { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 0.75rem; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; }
.s-label { font-size: 0.82rem; color: #64748b; font-weight: 500; }
.s-val { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.s-val.primary { color: #2563eb; font-size: 1rem; }
.s-val.warn { color: #dc2626; }
.settlement-empty, .settlement-loading { 
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8; 
  font-size: 0.85rem; 
  padding: 2rem 0;
}
</style>
