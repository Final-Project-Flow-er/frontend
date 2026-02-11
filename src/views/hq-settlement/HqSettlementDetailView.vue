<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const storeId = route.params.storeId || 'S001'

/* ── 가맹점 이름 매핑 ── */
const storeNames = { S001:'강남점', S002:'홍대점', S003:'신촌점', S004:'이태원점', S005:'잠실점', S006:'명동점', S007:'건대점', S008:'서울대점', S009:'합정점', S010:'성수점' }
const storeName = storeNames[storeId] || storeId

/* ── 탭 ── */
const activeTab = ref(route.query.tab || 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(route.query.date || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(route.query.month || `${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 정산 요약 Mock ── */
const settlement = ref({
  totalSales: 570200, orderCost: 185000, shipping: 15000, commission: 17106, refund: 12900, loss: 0
})
const finalAmount = computed(() =>
  settlement.value.totalSales - (settlement.value.orderCost + settlement.value.shipping + settlement.value.commission + settlement.value.loss) + settlement.value.refund
)

/* ── 전표 목록 Mock ── */
const selectedFilter = ref('all')
const filterTypes = [
  { key: 'all', label: '전체' }, { key: 'sales', label: '판매' }, { key: 'order', label: '발주' },
  { key: 'shipping', label: '배송' }, { key: 'commission', label: '수수료' }, { key: 'refund', label: '반품' },
  { key: 'loss', label: '손실' }, { key: 'adjust', label: '기타' },
]
const vouchers = ref([
  { id: 'SL-001', type: 'sales', typeName: '판매', product: '오리지널 떡볶이 밀키트', qty: 5, unitPrice: 12900, amount: 64500, date: '2026-02-10 09:30' },
  { id: 'SL-002', type: 'sales', typeName: '판매', product: '마라 떡볶이 밀키트', qty: 3, unitPrice: 14900, amount: 44700, date: '2026-02-10 10:12' },
  { id: 'SL-003', type: 'sales', typeName: '판매', product: '로제 떡볶이 밀키트', qty: 2, unitPrice: 13900, amount: 27800, date: '2026-02-10 11:45' },
  { id: 'PO-001', type: 'order', typeName: '발주', product: '정기 발주 (02/10)', qty: 50, unitPrice: null, amount: 185000, date: '2026-02-10 08:00' },
  { id: 'DL-001', type: 'shipping', typeName: '배송', product: '정기 배송', qty: 1, unitPrice: null, amount: 15000, date: '2026-02-10 08:30' },
  { id: 'CM-001', type: 'commission', typeName: '수수료', product: '정산 수수료 3%', qty: null, unitPrice: null, amount: 17106, date: '2026-02-10 23:59' },
  { id: 'RF-001', type: 'refund', typeName: '반품', product: '오리지널 떡볶이 밀키트', qty: 1, unitPrice: 12900, amount: 12900, date: '2026-02-10 14:20' },
])
const filteredVouchers = computed(() => {
  if (selectedFilter.value === 'all') return vouchers.value
  return vouchers.value.filter(v => v.type === selectedFilter.value)
})

/* ── 월별 그래프 ── */
const showGraph = ref(false)
const graphData = ref([
  { month: '1월', sales: 8500000 }, { month: '2월', sales: 9200000 }, { month: '3월', sales: 7800000 },
  { month: '4월', sales: 10500000 }, { month: '5월', sales: 11200000 }, { month: '6월', sales: 9800000 },
  { month: '7월', sales: 12100000 }, { month: '8월', sales: 11800000 }, { month: '9월', sales: 10200000 },
  { month: '10월', sales: 11404000 }, { month: '11월', sales: 0 }, { month: '12월', sales: 0 },
])
const maxSales = computed(() => Math.max(...graphData.value.map(d => d.sales), 1))

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n))
const formatDate = (d) => { const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { const [y,m] = d.split('-'); return `${y}년 ${m}월` }

const dateRef = ref(null)
const monthRef = ref(null)
const openDatePicker = () => { dateRef.value?.showPicker() }
const openMonthPicker = () => { monthRef.value?.showPicker() }

const getTypeClass = (type) => ({
  sales: 'type-sales', order: 'type-order', shipping: 'type-shipping',
  commission: 'type-commission', refund: 'type-refund', loss: 'type-loss', adjust: 'type-adjust',
}[type] || '')

/* ── 다운로드 ── */
const downloadPDF = () => {
  const label = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value
  alert(`${storeName} 정산서 PDF 다운로드: ${label}\n(실제 API 연동 시 구현)`)
}
const downloadExcel = () => {
  alert(`${storeName} 전표 내역 Excel 다운로드: ${selectedMonth.value}\n(실제 API 연동 시 구현)`)
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/hq/settlement')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 class="page-title">{{ storeName }} 정산 상세</h1>
          <p class="page-desc">가맹점 정산 요약 및 전표를 조회합니다.</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn pdf" @click="downloadPDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>
        <button v-if="activeTab === 'monthly'" class="action-btn excel" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          Excel
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별</button>
      </div>
      <div v-if="activeTab === 'daily'" class="date-wrapper" @click="openDatePicker">
        <span class="date-label">{{ formatDate(selectedDate) }}</span>
        <input ref="dateRef" type="date" v-model="selectedDate" class="date-input-hidden" />
      </div>
      <div v-else class="date-wrapper" @click="openMonthPicker">
        <span class="date-label">{{ formatMonth(selectedMonth) }}</span>
        <input ref="monthRef" type="month" v-model="selectedMonth" class="date-input-hidden" />
      </div>
    </div>

    <!-- 정산 요약 -->
    <div class="final-card">
      <span class="fc-label">최종 정산 금액</span>
      <p class="fc-amount">{{ fmt(finalAmount) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card primary"><span class="s-label">총 매출</span><p class="s-value primary-color">{{ fmt(settlement.totalSales) }}</p></div>
      <div class="summary-card refund"><span class="s-label">반품 환급</span><p class="s-value primary-color">{{ fmt(settlement.refund) }}</p></div>
      <div class="summary-card"><span class="s-label">발주 대금</span><p class="s-value neg">{{ fmt(settlement.orderCost) }}</p></div>
      <div class="summary-card"><span class="s-label">배송비</span><p class="s-value neg">{{ fmt(settlement.shipping) }}</p></div>
      <div class="summary-card"><span class="s-label">손실</span><p class="s-value neg">{{ fmt(settlement.loss) }}</p></div>
      <div class="summary-card"><span class="s-label">수수료</span><p class="s-value neg">{{ fmt(settlement.commission) }}</p></div>
    </section>

    <!-- 필터 -->
    <div class="filter-bar">
      <button v-for="ft in filterTypes" :key="ft.key" :class="['filter-chip', { active: selectedFilter === ft.key }]" @click="selectedFilter = ft.key">{{ ft.label }}</button>
    </div>

    <!-- 전표 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>전표 목록</h3>
        <span class="badge">{{ filteredVouchers.length }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>전표번호</th><th>유형</th><th>상품/내역</th><th class="text-right">수량</th><th class="text-right">단가</th><th class="text-right">금액</th><th>일시</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in filteredVouchers" :key="v.id">
            <td class="id-cell">{{ v.id }}</td>
            <td><span :class="['type-tag', getTypeClass(v.type)]">{{ v.typeName }}</span></td>
            <td>{{ v.product }}</td>
            <td class="text-right">{{ v.qty != null ? v.qty : '−' }}</td>
            <td class="text-right">{{ v.unitPrice != null ? fmt(v.unitPrice) : '−' }}</td>
            <td class="text-right fw700">
              {{ fmt(v.amount) }}</td>
            <td class="time-cell">{{ v.date }}</td>
          </tr>
          <tr v-if="filteredVouchers.length === 0"><td colspan="7" class="empty-cell">전표가 없습니다</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 월별 그래프 -->
    <div v-if="activeTab === 'monthly'" class="graph-section">
      <div class="table-header">
        <h3>월별 매출 추이</h3>
        <button class="graph-toggle" @click="showGraph = !showGraph">{{ showGraph ? '숨기기' : '그래프 조회하기' }}</button>
      </div>
      <div v-if="showGraph" class="chart-area">
        <div class="chart-bars">
          <div v-for="(d, idx) in graphData" :key="idx" class="bar-col">
            <div class="bar-wrapper">
              <div class="bar" :style="{ height: (d.sales / maxSales * 100) + '%' }" :title="fmt(d.sales)">
                <span v-if="d.sales > 0" class="bar-label">{{ fmt(d.sales) }}</span>
              </div>
            </div>
            <span class="bar-month">{{ d.month }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn:hover { transform: translateY(-1px); }
.action-btn.pdf { background: #ef4444; color: white; }
.action-btn.pdf:hover { background: #dc2626; }
.action-btn.excel { background: #10b981; color: white; }
.action-btn.excel:hover { background: #059669; }

.control-bar { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.6rem 1.3rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-light); transition: all 0.2s; }
.tab-group button.active { background: var(--primary); color: white; }
.date-wrapper { position: relative; display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.55rem 1.2rem; background: white; cursor: pointer; min-width: 160px; }
.date-wrapper:hover { border-color: var(--primary); }
.date-label { font-size: 1rem; font-weight: 600; color: var(--text-dark); pointer-events: none; white-space: nowrap; }
.date-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; }

.final-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.25rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }

.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.summary-grid .summary-card:nth-child(1),
.summary-grid .summary-card:nth-child(2) { grid-column: span 2; }
.summary-card { background: white; padding: 1.15rem 1.4rem; border-radius: 14px; border: 1px solid var(--border-color); }
.summary-card.primary { }
.summary-card.refund { }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.s-value { font-size: 1.4rem; font-weight: normal; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.neg { color: #ef4444; }
.s-value.primary-color { color: var(--primary) !important; }
.fc-label { font-size: 1rem; font-weight: normal; }
.fc-amount { font-size: 1.85rem; font-weight: normal; margin: 0; }

.filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.filter-chip { padding: 0.4rem 1rem; border-radius: 999px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-light); transition: all 0.15s; }
.filter-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
.filter-chip:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.9rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.id-cell { color: var(--primary); font-weight: 600; font-size: 0.8rem; }
.fw700 { font-weight: normal; }
.time-cell { color: var(--text-light); font-size: 0.8rem; }
.empty-cell { text-align: center; color: var(--text-light); padding: 3rem !important; }
.type-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.type-sales { background: #ede9fe; color: #6366f1; }
.type-order { background: #fff7ed; color: #f97316; }
.type-shipping { background: #e0f2fe; color: #0ea5e9; }
.type-commission { background: #f3e8ff; color: #8b5cf6; }
.type-refund { background: #d1fae5; color: #059669; }
.type-loss { background: #fee2e2; color: #dc2626; }
.type-adjust { background: #f1f5f9; color: #475569; }

.graph-section { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.graph-toggle { padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--primary); background: transparent; color: var(--primary); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.graph-toggle:hover { background: var(--primary); color: white; }
.chart-area { padding: 1.5rem; }
.chart-bars { display: flex; align-items: flex-end; gap: 4px; height: 240px; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0 0.5rem; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-wrapper { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar { width: 100%; max-width: 36px; margin: 0 auto; background: linear-gradient(180deg, #6366f1, #8b5cf6); border-radius: 4px 4px 0 0; min-height: 2px; transition: height 0.5s; position: relative; cursor: pointer; }
.bar:hover { opacity: 0.8; }
.bar-label { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; color: var(--text-light); white-space: nowrap; display: none; }
.bar:hover .bar-label { display: block; }
.bar-month { font-size: 0.7rem; color: var(--text-light); margin-top: 6px; }
</style>
