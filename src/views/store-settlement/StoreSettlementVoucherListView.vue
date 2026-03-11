<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { franchiseSettlementsApi } from '@/api/franchiseSettlements.js'

const route = useRoute()
const router = useRouter()

/* ── 탭 ── */
const activeTab = ref(route.query.period === 'MONTHLY' || route.query.month ? 'monthly' : 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(route.query.date || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(route.query.month || `${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 필터 ── */
const filterTypes = [
  { key: 'all', label: '전체', value: null },
  { key: 'sales', label: '판매', value: 'SALES' },
  { key: 'order', label: '발주', value: 'ORDER' },
  { key: 'shipping', label: '배송', value: 'DELIVERY' },
  { key: 'commission', label: '수수료', value: 'COMMISSION' },
  { key: 'refund', label: '반품', value: 'REFUND' },
  { key: 'loss', label: '손실', value: 'LOSS' },
  { key: 'adjust', label: '조정', value: 'ADJUSTMENT' },
]

const selectedFilter = ref('all')

/* ── 전표 데이터 ── */
const vouchers = ref([])
const totalCount = ref(0)
const isLoading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)

const fetchVouchers = async () => {
    isLoading.value = true
    try {
        const filterItem = filterTypes.find(f => f.key === selectedFilter.value)
        const params = {
            period: activeTab.value.toUpperCase(),
            type: filterItem?.value,
            page: currentPage.value,
            size: 20
        }
        
        if (activeTab.value === 'daily') {
            params.date = selectedDate.value
        } else {
            params.month = selectedMonth.value
        }
        
        const res = await franchiseSettlementsApi.getVouchers(params)
        vouchers.value = res.content
        totalCount.value = res.totalElements
        totalPages.value = res.totalPages
    } catch (error) {
        console.error('Failed to fetch vouchers:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (route.query.type) {
        const found = filterTypes.find(f => f.value === route.query.type)
        if (found) selectedFilter.value = found.key
    }
    fetchVouchers()
})

watch([selectedDate, selectedMonth, activeTab, selectedFilter, currentPage], fetchVouchers)

/* ── 월별 매출 데이터 (상단 요약/그래프 레이어용) ── */
const showGraph = ref(false)
const trendData = ref([])
const maxSales = computed(() => Math.max(...trendData.value.map(d => d.amount), 1))

const fetchTrendData = async () => {
    try {
        const [year, month] = selectedMonth.value.split('-').map(Number)
        const start = `${selectedMonth.value}-01`
        const lastDay = new Date(year, month, 0).getDate()
        const end = `${selectedMonth.value}-${pad(lastDay)}`
        
        const res = await franchiseSettlementsApi.getMonthlyDailyGraph({
            month: selectedMonth.value,
            start,
            end
        })
        trendData.value = res.data.map(d => ({
            month: d.date.split('-')[2] + '일',
            sales: d.amount
        }))
    } catch (error) {
        console.error('Failed to fetch trend data:', error)
    }
}

watch(showGraph, (val) => {
    if (val && trendData.value.length === 0) {
        fetchTrendData()
    }
})

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n || 0))

const getTypeClass = (type) => ({
  SALES: 'type-sales',
  ORDER: 'type-order',
  DELIVERY: 'type-shipping',
  COMMISSION: 'type-commission',
  REFUND: 'type-refund',
  LOSS: 'type-loss',
  ADJUSTMENT: 'type-adjust',
}[type] || '')

const getTypeName = (type) => {
    const found = filterTypes.find(f => f.value === type)
    return found ? found.label : type
}

/* ── Excel 다운로드 ── */
const downloadExcel = async () => {
    if (activeTab.value !== 'monthly') {
        alert('엑셀 다운로드는 월별 정산에서만 지원됩니다.')
        return
    }
    try {
        const res = await franchiseSettlementsApi.getMonthlyExcel(selectedMonth.value)
        if (res.data) {
            window.open(res.data, '_blank')
        }
    } catch (error) {
        console.error('Failed to download Excel:', error)
    }
}
</script>

<template>
  <div class="content-wrapper" :class="{ 'is-loading': isLoading }">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">전표 상세 목록</h1>
          <p class="page-desc">전표를 유형별로 조회하고 다운로드하세요.</p>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="activeTab === 'monthly'" class="action-btn excel" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          전표 Excel 다운로드
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별 정산</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별 정산</button>
      </div>
      <input v-if="activeTab === 'daily'" type="date" v-model="selectedDate" class="date-input" />
      <input v-else type="month" v-model="selectedMonth" class="date-input" />
    </div>

    <!-- 유형별 필터 -->
    <div class="filter-bar">
      <button
        v-for="ft in filterTypes"
        :key="ft.key"
        :class="['filter-chip', { active: selectedFilter === ft.key }]"
        @click="selectedFilter = ft.key; currentPage = 0"
      >
        {{ ft.label }}
      </button>
    </div>

    <!-- 전표 목록 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>전표 목록</h3>
        <span class="badge">{{ totalCount }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>참조번호</th>
            <th>유형</th>
            <th>내역</th>
            <th class="text-right">수량</th>
            <th class="text-right">금액</th>
            <th>일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vouchers" :key="v.referenceCode">
            <td class="id-cell">{{ v.referenceCode }}</td>
            <td><span :class="['type-tag', getTypeClass(v.voucherType)]">{{ getTypeName(v.voucherType) }}</span></td>
            <td>{{ v.description }}</td>
            <td class="text-right">{{ v.quantity != null ? v.quantity : '−' }}</td>
            <td class="text-right amount-cell" :class="{ refund: v.voucherType === 'REFUND', loss: v.voucherType === 'LOSS' || v.amount < 0 }">
              {{ v.amount < 0 ? '−' : '' }}₩ {{ fmt(v.amount) }}
            </td>
            <td class="time-cell">{{ v.occurredAt }}</td>
          </tr>
          <tr v-if="vouchers.length === 0 && !isLoading">
            <td colspan="6" class="empty-cell">해당 기간에 전표가 없습니다.</td>
          </tr>
        </tbody>
      </table>
      
      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
          <button :disabled="currentPage === 0" @click="currentPage--">이전</button>
          <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages - 1" @click="currentPage++">다음</button>
      </div>
    </div>

    <!-- 월별 그래프 (월별 탭만) -->
    <div v-if="activeTab === 'monthly'" class="graph-section">
      <div class="table-header">
        <h3>월별 매출 추이</h3>
        <button class="graph-toggle" @click="showGraph = !showGraph">
          {{ showGraph ? '그래프 숨기기' : '그래프 조회하기' }}
        </button>
      </div>
      <div v-if="showGraph" class="chart-area">
        <div class="chart-container">
          <div class="chart-y-labels">
            <span>{{ fmt(maxSales) }}</span>
            <span>{{ fmt(Math.round(maxSales * 0.75)) }}</span>
            <span>{{ fmt(Math.round(maxSales * 0.5)) }}</span>
            <span>{{ fmt(Math.round(maxSales * 0.25)) }}</span>
            <span>0</span>
          </div>
          <div class="chart-bars">
            <div
              v-for="(d, idx) in trendData"
              :key="idx"
              class="bar-col"
            >
              <div class="bar-wrapper">
                <div
                  class="bar"
                  :style="{ height: (d.sales / maxSales * 100) + '%' }"
                  :title="'₩ ' + fmt(d.sales)"
                >
                  <span v-if="d.sales > 0" class="bar-label">{{ fmt(d.sales) }}</span>
                </div>
              </div>
              <span class="bar-month">{{ d.month }}</span>
            </div>
            <div v-if="trendData.length === 0" class="empty-chart">데이터가 없습니다.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; transition: opacity 0.3s; }
.is-loading { opacity: 0.6; pointer-events: none; }

/* ── 페이지 헤더 ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }

.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.header-actions { display: flex; gap: 0.75rem; }
.action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 12px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn.pdf { background: #ef4444; color: white; }
.action-btn.pdf:hover { background: #dc2626; transform: translateY(-1px); }
.action-btn.excel { background: #10b981; color: white; }
.action-btn.excel:hover { background: #059669; transform: translateY(-1px); }

/* ── 컨트롤 바 ── */
.control-bar { display: flex; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.65rem 1.5rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-light); transition: all 0.2s; }
.tab-group button.active { background: #475569; color: white; }
.tab-group button:hover:not(.active) { background: #f8fafc; }
.date-input { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; background: white; color: var(--text-dark); cursor: pointer; outline: none; }
.date-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

/* ── 필터 바 ── */
.filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filter-chip { padding: 0.45rem 1rem; border-radius: 999px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-light); transition: all 0.15s; }
.filter-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
.filter-chip:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

/* ── 데이터 테이블 ── */
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.id-cell { color: var(--primary); font-weight: 600; font-size: 0.85rem; }
.time-cell { color: var(--text-light); font-size: 0.8rem; white-space: nowrap; }
.amount-cell { font-weight: 700; }
.amount-cell.refund { color: #10b981; }
.amount-cell.loss { color: #ef4444; }
.empty-cell { text-align: center; color: var(--text-light); padding: 5rem 1.5rem !important; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; padding: 1rem; border-top: 1px solid var(--border-color); }
.pagination button { padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── 유형 태그 ── */
.type-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
.type-sales { background: #ede9fe; color: #6366f1; }
.type-order { background: #fff7ed; color: #f97316; }
.type-shipping { background: #e0f2fe; color: #0ea5e9; }
.type-commission { background: #f3e8ff; color: #8b5cf6; }
.type-refund { background: #d1fae5; color: #059669; }
.type-loss { background: #fee2e2; color: #dc2626; }
.type-adjust { background: #f1f5f9; color: #475569; }

/* ── 그래프 ── */
.graph-section { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.graph-toggle { padding: 0.45rem 1rem; border-radius: 8px; border: 1px solid var(--primary); background: transparent; color: var(--primary); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.graph-toggle:hover { background: var(--primary); color: white; }
.chart-area { padding: 1.5rem; }
.chart-container { display: flex; gap: 0.5rem; height: 280px; }
.chart-y-labels { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; font-size: 0.7rem; color: var(--text-light); min-width: 70px; padding-bottom: 24px; }
.chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 4px; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0 0.5rem; position: relative; overflow-x: auto; }
.bar-col { flex: 0 0 40px; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-wrapper { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar { width: 100%; max-width: 32px; margin: 0 auto; background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%); border-radius: 4px 4px 0 0; min-height: 2px; transition: height 0.5s ease; position: relative; cursor: pointer; }
.bar:hover { opacity: 0.85; }
.bar-label { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; color: var(--text-light); white-space: nowrap; display: none; }
.bar:hover .bar-label { display: block; }
.bar-month { font-size: 0.7rem; color: var(--text-light); margin-top: 6px; white-space: nowrap; transform: rotate(-45deg); transform-origin: top; }
.empty-chart { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #94a3b8; }
</style>
