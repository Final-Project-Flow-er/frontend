<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/* ── 탭 ── */
const activeTab = ref('daily') // 'daily' | 'monthly'

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 필터 ── */
const filterTypes = [
  { key: 'all', label: '전체' },
  { key: 'sales', label: '판매' },
  { key: 'order', label: '발주' },
  { key: 'shipping', label: '배송' },
  { key: 'commission', label: '수수료' },
  { key: 'refund', label: '반품' },
  { key: 'loss', label: '손실' },
  { key: 'adjust', label: '기타' },
]
const selectedFilter = ref('all')

onMounted(() => {
  if (route.query.filter) {
    selectedFilter.value = route.query.filter
  }
})

/* ── 전표 Mock 데이터 ── */
const allVouchers = ref([
  { id: 'SL-20260210-001', type: 'sales', typeName: '판매', product: '오리지널 떡볶이 밀키트', qty: 5, unitPrice: 12900, amount: 64500, date: '2026-02-10 09:30:21' },
  { id: 'SL-20260210-002', type: 'sales', typeName: '판매', product: '마라 떡볶이 밀키트', qty: 3, unitPrice: 14900, amount: 44700, date: '2026-02-10 10:12:05' },
  { id: 'SL-20260210-003', type: 'sales', typeName: '판매', product: '로제 떡볶이 밀키트', qty: 2, unitPrice: 13900, amount: 27800, date: '2026-02-10 11:45:33' },
  { id: 'PO-20260210-001', type: 'order', typeName: '발주', product: '오리지널 떡볶이 밀키트 외 3종', qty: 50, unitPrice: null, amount: 185000, date: '2026-02-10 08:00:00' },
  { id: 'DL-20260210-001', type: 'shipping', typeName: '배송', product: '정기 배송 (02/10)', qty: 1, unitPrice: null, amount: 15000, date: '2026-02-10 08:30:00' },
  { id: 'CM-20260210-001', type: 'commission', typeName: '수수료', product: '정산 수수료 3%', qty: null, unitPrice: null, amount: 17106, date: '2026-02-10 23:59:59' },
  { id: 'RF-20260210-001', type: 'refund', typeName: '반품', product: '오리지널 떡볶이 밀키트 (유통기한 임박)', qty: 1, unitPrice: 12900, amount: 12900, date: '2026-02-10 14:20:10' },
  { id: 'SL-20260210-004', type: 'sales', typeName: '판매', product: '오리지널 떡볶이 (대용량)', qty: 2, unitPrice: 22000, amount: 44000, date: '2026-02-10 13:07:55' },
  { id: 'SL-20260210-005', type: 'sales', typeName: '판매', product: '오리지널 떡볶이 밀키트', qty: 3, unitPrice: 12900, amount: 38700, date: '2026-02-10 15:22:18' },
  { id: 'SL-20260210-006', type: 'sales', typeName: '판매', product: '마라 떡볶이 밀키트', qty: 2, unitPrice: 14900, amount: 29800, date: '2026-02-10 16:50:41' },
  { id: 'LS-20260210-001', type: 'loss', typeName: '손실', product: '로제 떡볶이 밀키트 (유통기한 만료 폐기)', qty: 1, unitPrice: 13900, amount: 13900, date: '2026-02-10 17:00:00' },
  { id: 'AD-20260210-001', type: 'adjust', typeName: '기타', product: '본사 프로모션 보전금', qty: null, unitPrice: null, amount: -15000, date: '2026-02-10 18:00:00' },
])

const filteredVouchers = computed(() => {
  let list = allVouchers.value
  if (selectedFilter.value !== 'all') {
    list = list.filter(v => v.type === selectedFilter.value)
  }
  // 최신순 정렬
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
})

/* ── 월별 그래프 데이터 ── */
const showGraph = ref(false)
const monthlyGraphData = ref([
  { month: '1월', sales: 8500000, orders: 120 },
  { month: '2월', sales: 9200000, orders: 135 },
  { month: '3월', sales: 7800000, orders: 108 },
  { month: '4월', sales: 10500000, orders: 152 },
  { month: '5월', sales: 11200000, orders: 168 },
  { month: '6월', sales: 9800000, orders: 140 },
  { month: '7월', sales: 12100000, orders: 175 },
  { month: '8월', sales: 11800000, orders: 170 },
  { month: '9월', sales: 10200000, orders: 148 },
  { month: '10월', sales: 11404000, orders: 165 },
  { month: '11월', sales: 0, orders: 0 },
  { month: '12월', sales: 0, orders: 0 },
])
const maxSales = computed(() => Math.max(...monthlyGraphData.value.map(d => d.sales), 1))

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n))

const getTypeClass = (type) => ({
  sales: 'type-sales',
  order: 'type-order',
  shipping: 'type-shipping',
  commission: 'type-commission',
  refund: 'type-refund',
  loss: 'type-loss',
  adjust: 'type-adjust',
}[type] || '')

/* ── PDF 다운로드 ── */
const downloadPDF = () => {
  const label = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value
  alert(`정산서 PDF 다운로드: ${label}\n(실제 API 연동 시 구현)`)
}

/* ── Excel 다운로드 ── */
const downloadExcel = () => {
  alert(`전표 내역 Excel 다운로드: ${selectedMonth.value}\n(실제 API 연동 시 구현)`)
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/store/settlement')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 class="page-title">전표 상세 목록</h1>
          <p class="page-desc">전표를 유형별로 조회하고 다운로드하세요.</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn pdf" @click="downloadPDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF 다운로드
        </button>
        <button v-if="activeTab === 'monthly'" class="action-btn excel" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          Excel 다운로드
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별 전표</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별 전표</button>
      </div>
      <div class="date-picker-area">
        <input v-if="activeTab === 'daily'" type="date" v-model="selectedDate" class="date-input" />
        <input v-else type="month" v-model="selectedMonth" class="date-input" />
      </div>
    </div>

    <!-- 유형별 필터 -->
    <div class="filter-bar">
      <button
        v-for="ft in filterTypes"
        :key="ft.key"
        :class="['filter-chip', { active: selectedFilter === ft.key }]"
        @click="selectedFilter = ft.key"
      >
        {{ ft.label }}
      </button>
    </div>

    <!-- 전표 목록 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>전표 목록</h3>
        <span class="badge">{{ filteredVouchers.length }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>전표번호</th>
            <th>유형</th>
            <th>상품/내역</th>
            <th class="text-right">수량</th>
            <th class="text-right">단가</th>
            <th class="text-right">금액</th>
            <th>발생일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filteredVouchers" :key="v.id">
            <td class="id-cell">{{ v.id }}</td>
            <td><span :class="['type-tag', getTypeClass(v.type)]">{{ v.typeName }}</span></td>
            <td>{{ v.product }}</td>
            <td class="text-right">{{ v.qty != null ? v.qty : '−' }}</td>
            <td class="text-right">{{ v.unitPrice != null ? '₩ ' + fmt(v.unitPrice) : '−' }}</td>
            <td class="text-right amount-cell" :class="{ refund: v.type === 'refund', loss: v.type === 'loss' || v.amount < 0 }">
              {{ v.amount < 0 ? '−' : '' }}₩ {{ fmt(v.amount) }}
            </td>
            <td class="time-cell">{{ v.date }}</td>
          </tr>
          <tr v-if="filteredVouchers.length === 0">
            <td colspan="7" class="empty-cell">해당 기간에 전표가 없습니다.</td>
          </tr>
        </tbody>
      </table>
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
              v-for="(d, idx) in monthlyGraphData"
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
          </div>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-dot"></span> 매출 금액</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

/* ── 페이지 헤더 ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.header-actions { display: flex; gap: 0.75rem; }
.action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.2rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn.pdf { background: #ef4444; color: white; }
.action-btn.pdf:hover { background: #dc2626; transform: translateY(-1px); }
.action-btn.excel { background: #10b981; color: white; }
.action-btn.excel:hover { background: #059669; transform: translateY(-1px); }

/* ── 컨트롤 바 ── */
.control-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.65rem 1.5rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-light); transition: all 0.2s; }
.tab-group button.active { background: var(--primary); color: white; }
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
.empty-cell { text-align: center; color: var(--text-light); padding: 3rem 1.5rem !important; }

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
.chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 4px; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0 0.5rem; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
.bar-wrapper { flex: 1; display: flex; align-items: flex-end; width: 100%; }
.bar { width: 100%; max-width: 40px; margin: 0 auto; background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%); border-radius: 4px 4px 0 0; min-height: 2px; transition: height 0.5s ease; position: relative; cursor: pointer; }
.bar:hover { opacity: 0.85; }
.bar-label { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; color: var(--text-light); white-space: nowrap; display: none; }
.bar:hover .bar-label { display: block; }
.bar-month { font-size: 0.75rem; color: var(--text-light); margin-top: 6px; }
.chart-legend { display: flex; justify-content: center; gap: 1.5rem; padding-top: 1rem; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-light); }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; background: linear-gradient(135deg, #6366f1, #8b5cf6); }
</style>
