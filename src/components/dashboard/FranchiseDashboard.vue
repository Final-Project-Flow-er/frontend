<template>
  <div class="franchise-dashboard">

    <!-- Summary Grid -->
    <section class="summary-grid">
      <div class="summary-card" @click="$router.push('/store/inventory')">
        <div class="card-icon-box inventory">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        </div>
        <div class="card-data">
          <span class="label">총 보유 재고</span>
          <span class="value">{{ totalStockQty }}<small>개</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/franchise/orders')">
        <div class="card-icon-box order">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        </div>
        <div class="card-data">
          <span class="label">전체 발주 건수</span>
          <span class="value">{{ orderCount }}<small>건</small></span>
        </div>
      </div>
      <div class="summary-card" @click="$router.push('/franchise/returns')">
        <div class="card-icon-box return">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
        </div>
        <div class="card-data">
          <span class="label">전체 반품 건수</span>
          <span class="value">{{ returnCount }}<small>건</small></span>
        </div>
      </div>
      <div class="summary-card alert-card" @click="$router.push('/store/inventory')">
        <div class="card-icon-box alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="card-data">
          <span class="label">재고 경고</span>
          <span class="value" :class="{ 'warn-val': alertCount > 0 }">{{ alertCount }}<small>건</small></span>
        </div>
      </div>
    </section>

    <!-- Main Layout -->
    <div class="dashboard-main-layout">
      <!-- Left Column -->
      <div class="column-left">
        <!-- 발주 현황 -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">발주 현황</span>
            <button class="header-btn" @click="$router.push('/franchise/orders')">더보기</button>
          </div>
          <div class="card-body">
            <div class="status-list">
              <div class="status-item" @click="$router.push('/franchise/orders')">
                <span class="status-badge amber">대기</span>
                <span class="status-text">접수 대기 중인 발주</span>
                <span class="status-num">{{ pendingOrderCount }}</span>
              </div>
              <div class="status-item" @click="$router.push('/franchise/orders')">
                <span class="status-badge blue">배송중</span>
                <span class="status-text">배송 진행 중인 발주</span>
                <span class="status-num">{{ deliveringOrderCount }}</span>
              </div>
              <div class="status-item" @click="$router.push('/franchise/returns')">
                <span class="status-badge rose">반품 대기</span>
                <span class="status-text">처리 대기 중인 반품</span>
                <span class="status-num">{{ pendingReturnCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 바로가기 -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">바로가기</span>
          </div>
          <div class="card-body">
            <div class="quick-nav-grid">
              <div class="nav-item" @click="$router.push('/franchise/orders/create')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <span>발주 신청</span>
              </div>
              <div class="nav-item" @click="$router.push('/franchise/returns/create')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>
                </div>
                <span>반품 신청</span>
              </div>
              <div class="nav-item" @click="$router.push('/store/inventory')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <span>재고 조회</span>
              </div>
              <div class="nav-item" @click="$router.push('/store/settlement')">
                <div class="nav-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span>정산 조회</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="column-right">
        <!-- 관리자 현황 -->
        <div class="dashboard-card">
          <div class="card-header">
            <span class="card-title">매장 현황</span>
          </div>
          <div class="card-body">
            <div class="admin-wait-box">
              <div class="wait-item">
                <span class="w-label">담당자</span>
                <span class="w-val">{{ authStore.userName }}</span>
              </div>
              <div class="wait-item">
                <span class="w-label">현재 날짜</span>
                <span class="w-val">{{ currentDate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 오늘 정산 요약 -->
        <div class="dashboard-card settlement-card">
          <div class="card-header">
            <span class="card-title">이번 달 정산 요약</span>
            <button class="header-btn" @click="$router.push('/store/settlement')">상세보기</button>
          </div>
          <div class="card-body">
            <div v-if="settlementLoading" class="settlement-empty">데이터 로딩 중...</div>
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
                <span class="s-label">반품 차감액</span>
                <span class="s-val warn">-{{ formatCurrency(settlementSummary.returnDeduction) }}원</span>
              </div>
            </div>
            <div v-else class="settlement-empty">이번 달 정산 데이터가 없습니다.</div>
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

const inventoryCount = ref(0)
const totalStockQty = ref(0)
const orderCount = ref(0)
const returnCount = ref(0)
const alertCount = ref(0)
const pendingOrderCount = ref(0)
const deliveringOrderCount = ref(0)
const pendingReturnCount = ref(0)
const settlementSummary = ref(null)
const settlementLoading = ref(false)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  })
})

const thisMonthParam = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('ko-KR')
}

const fetchDashboardData = async () => {
  try {
    console.group('가맹점 대시보드 데이터 로딩 상세')
    const [inventoryRes, ordersRes, returnsRes, alertsRes] = await Promise.all([
      api.get('franchise/inventory'),
      api.get('franchise/orders'),
      api.get('franchise/returns'),
      api.get('franchise/inventory/alerts')
    ])

    console.log('1. 재고:', inventoryRes.data)
    console.log('2. 발주:', ordersRes.data)
    console.log('3. 반품:', returnsRes.data)
    console.log('4. 알림:', alertsRes.data)

    const inventoryData = inventoryRes.data.data || []
    // 종 (종류 수)
    inventoryCount.value = inventoryData.length
    // 개 (총 수량 합계)
    totalStockQty.value = inventoryData.reduce((acc, curr) => acc + (Number(curr.totalQuantity) || 0), 0)
    console.log('계산된 재고 - 종:', inventoryCount.value, '총 수량:', totalStockQty.value)

    const orders = ordersRes.data.data || []
    orderCount.value = orders.length
    console.log(`발주 데이터(${orders.length}건) 필터링 시작...`)
    
    // 대량 데이터 처리를 위한 최적화 filter
    let pCount = 0
    let dCount = 0
    for(const o of orders) {
      const s = String(o.status || '').toUpperCase()
      if (s.includes('대기') || s.includes('PENDING') || s.includes('WAIT')) pCount++
      if (s.includes('배송중') || s.includes('DELIVERING') || s.includes('SHIPPING')) dCount++
    }
    pendingOrderCount.value = pCount
    deliveringOrderCount.value = dCount

    const returns = returnsRes.data.data || []
    returnCount.value = returns.length
    pendingReturnCount.value = returns.filter(r => {
      const s = String(r.status || '').toUpperCase()
      return s.includes('대기') || s.includes('PENDING') || s.includes('WAIT')
    }).length

    const alerts = alertsRes.data.data || {}
    alertCount.value = (alerts.expirationAlerts?.length || 0) + (alerts.safetyStockAlerts?.length || 0)
    console.groupEnd()

  } catch (error) {
    console.error('가맹점 대시보드 데이터 로드 중 치명적 오류:', error)
    if (error.response) {
      console.error('서버 응답:', error.response.status, error.response.data)
    }
  }

  // 정산 별도 fetch
  try {
    settlementLoading.value = true
    const settlementMonth = thisMonthParam.value
    console.log(`5. 정산 요약 요청 (${settlementMonth})...`)
    const stlRes = await api.get('franchise/settlements/monthly/summary', {
      params: { month: settlementMonth }
    })
    console.log('5. 정산 요약 응답:', stlRes.data)
    settlementSummary.value = stlRes.data.data
  } catch (error) {
    console.warn('가맹점 정산 요약 로드 실패:', error)
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
.franchise-dashboard {
  padding: 0;
  width: 100%;
}

/* Management Header (Shared Component Style) */
.management-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.management-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.management-header .subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

/* Summary Grid - Cleaner & Standardized */
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

.summary-card:hover {
  transform: translateY(-3px);
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-box.inventory { background: #eff6ff; color: #3b82f6; }
.card-icon-box.order     { background: #f0fdf4; color: #22c55e; }
.card-icon-box.return    { background: #fefce8; color: #eab308; }
.card-icon-box.alert     { background: #fff1f2; color: #ef4444; }

.card-data .label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.card-data .value {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.card-data .value small {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.card-data .value.warn-val {
  color: #ef4444;
}

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

/* Status List (Modern & Clean) */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.status-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-right: 1rem;
}

.status-badge.amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.status-badge.blue  { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
.status-badge.rose  { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }

.status-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.status-num {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

/* Quick Nav */
.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.nav-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.nav-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.nav-item span {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
}

/* Admin box */
.admin-wait-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wait-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.w-label { color: #64748b; font-weight: 500; }
.w-val   { color: #0f172a; font-weight: 700; }

/* Settlement Card */
.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.settle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.s-label {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 500;
}

.s-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
}

.s-val.primary { color: #2563eb; font-size: 1rem; }
.s-val.warn    { color: #dc2626; }

.settlement-empty,
.settlement-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.85rem;
  padding: 2rem 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-main-layout { grid-template-columns: 1fr; }
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
