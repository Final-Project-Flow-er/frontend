<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { settlementsApi } from '@/api/settlements.js'
import SettlementTrendChart from '@/components/settlement/SettlementTrendChart.vue'

const router = useRouter()

/* ── 탭 ── */
const activeTab = ref('daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 데이터 상태 ── */
const isLoading = ref(false)
const hqSummary = ref({
  finalAmount: 0,
  orderAmount: 0,
  saleAmount: 0,
  commissionFee: 0,
  deliveryFee: 0,
  refundAmount: 0,
  lossAmount: 0,
  adjustmentAmount: 0
})
const franchiseList = ref([])
const trendDataList = ref([])
const isSearchFocused = ref(false)

const hideDropdown = () => {
  setTimeout(() => { isSearchFocused.value = false }, 200)
}

/* ── 가맹점 필터 ── */
const searchStore = ref('')
const selectStoreFromDropdown = (name) => {
  searchStore.value = name
  isSearchFocused.value = false
}

const fetchData = async () => {
  isLoading.value = true
  try {
    if (activeTab.value === 'daily') {
      const [summaryRes, listRes, trendRes] = await Promise.all([
        settlementsApi.getDailySummary(selectedDate.value),
        settlementsApi.getDailyFranchises({ date: selectedDate.value, size: 100 }),
        settlementsApi.getDailyTrend(getPastDate(selectedDate.value, 7), selectedDate.value)
      ])
      hqSummary.value = summaryRes
      franchiseList.value = listRes.content
      trendDataList.value = trendRes
    } else {
      const [summaryRes, listRes, trendRes] = await Promise.all([
        settlementsApi.getMonthlySummary(selectedMonth.value),
        settlementsApi.getMonthlyFranchises({ month: selectedMonth.value, size: 100 }),
        settlementsApi.getMonthlyTrend(getPastDate(selectedMonth.value + '-01', 30), selectedMonth.value + '-01')
      ])
      hqSummary.value = summaryRes
      franchiseList.value = listRes.content
      trendDataList.value = trendRes
    }
  } catch (error) {
    console.error('Failed to fetch settlement data:', error)
  } finally {
    isLoading.value = false
  }
}

const getPastDate = (refDate, days) => {
  const d = new Date(refDate)
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

onMounted(fetchData)
watch([activeTab, selectedDate, selectedMonth], fetchData)

const filteredStores = computed(() => {
  if (!searchStore.value) return franchiseList.value
  return franchiseList.value.filter(s => s.franchiseName.includes(searchStore.value))
})

/* ── 합계 ── */
const totals = computed(() => ({
  sales: hqSummary.value.saleAmount || 0,
  orderCost: hqSummary.value.orderAmount || 0,
  shipping: hqSummary.value.deliveryFee || 0,
  commission: hqSummary.value.commissionFee || 0,
  refund: hqSummary.value.refundAmount || 0,
  loss: hqSummary.value.lossAmount || 0,
  adjustment: hqSummary.value.adjustmentAmount || 0,
}))
const totalFinal = computed(() => hqSummary.value.finalAmount || 0)

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n || 0)
const formatDate = (d) => { if(!d) return ''; const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { if(!d) return ''; const [y,m] = d.split('-'); return `${y}년 ${m}월` }

/* ── 날짜 피커 ── */
const dateRef = ref(null)
const monthRef = ref(null)
const openDatePicker = () => { dateRef.value?.showPicker() }
const openMonthPicker = () => { monthRef.value?.showPicker() }

/* ── 개별 영수증 PDF 다운로드 ── */
const downloadStorePDF = async (store) => {
  try {
    const res = activeTab.value === 'daily' 
      ? await settlementsApi.getDailyFranchiseReceiptPdf(store.franchiseId, selectedDate.value)
      : await settlementsApi.getMonthlyFranchiseReceiptPdf(store.franchiseId, selectedMonth.value)
    if (res && res.startsWith('http')) window.open(res, '_blank')
    else if (res) alert(res)
  } catch (error) {
    alert('PDF를 가져오는 데 실패했습니다.')
  }
}

/* ── 전체 요약 PDF 다운로드 ── */
const downloadBatchPDF = async () => {
  try {
    const res = activeTab.value === 'daily'
      ? await settlementsApi.getDailyAllSummaryPdf(selectedDate.value)
      : await settlementsApi.getMonthlyAllSummaryPdf(selectedMonth.value)
    if (res && res.startsWith('http')) window.open(res, '_blank')
    else if (res) alert(res)
  } catch (error) {
    alert('요약 PDF를 가져오는 데 실패했습니다.')
  }
}

/* ── 상세 이동 제거 ── */
/* 
const goToSummaryDetail = (type) => {
  router.push({
    path: '/hq/settlement/summary-detail',
    query: { type, date: selectedDate.value, month: selectedMonth.value, tab: activeTab.value }
  })
}

const goToDetail = (storeId) => {
  router.push({ path: `/hq/settlement/detail/${storeId}`, query: { date: selectedDate.value, month: selectedMonth.value, tab: activeTab.value } })
}
*/

const getStatusLabel = (status) => {
  if (activeTab.value === 'daily') return '정산완료'
  const mapping = {
    'DRAFT': '대기',
    'CALCULATED': '대기',
    'CONFIRM_REQUESTED': '승인요청',
    'CONFIRMED': '확정'
  }
  return mapping[status] || status
}

const getStatusClass = (status) => {
  const label = getStatusLabel(status)
  return {
    '정산완료': 'status-done',
    '대기': 'status-wait',
    '승인요청': 'status-wait',
    '확정': 'status-confirmed',
  }[label] || ''
}

/* ── 추이 그래프 데이터 ── */
const trendData = computed(() => {
  if (activeTab.value === 'daily') {
    // 일별 탭: 가맹점별 매출 비교
    return franchiseList.value.map(s => ({
      label: s.franchiseName,
      value: s.totalSaleAmount || 0
    }))
  } else {
    // 월별 탭: 날짜별 추이
    return trendDataList.value.map(item => ({
      label: item.periodLabel || item.label || '',
      value: item.amount || 0
    }))
  }
})

/* ── 엑셀 다운로드 ── */
const downloadExcel = async () => {
  try {
    const res = await settlementsApi.getMonthlyExcel(selectedMonth.value)
    if (res && res.startsWith('http')) window.open(res, '_blank')
    else if (res) alert(res)
  } catch (error) {
    alert('Excel 파일을 가져오는 데 실패했습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">정산 관리</h1>
        <p class="page-desc">전체 가맹점의 정산 현황을 조회하고 관리합니다.</p>
      </div>
      <div class="header-actions">
        <button v-if="activeTab === 'monthly'" class="action-btn excel-btn" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Excel 다운로드
        </button>
        <button class="action-btn confirm-btn" @click="$router.push('/hq/settlement/confirm')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          정산 확정
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 -->
    <div class="control-bar">
      <div class="control-left">
        <div class="tab-group">
          <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별</button>
          <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별</button>
        </div>
        <div v-if="activeTab === 'daily'" class="date-wrapper" @click="openDatePicker">
          <span class="date-label">{{ formatDate(selectedDate) }}</span>
          <svg class="cal-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input ref="dateRef" type="date" v-model="selectedDate" class="date-input-hidden" />
        </div>
        <div v-else class="date-wrapper" @click="openMonthPicker">
          <span class="date-label">{{ formatMonth(selectedMonth) }}</span>
          <svg class="cal-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <input ref="monthRef" type="month" v-model="selectedMonth" class="date-input-hidden" />
        </div>
      </div>
    </div>

    <!-- 가맹점 검색 -->
    <div class="search-container">
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input 
          type="text" 
          v-model="searchStore" 
          placeholder="가맹점 검색..." 
          class="search-input"
          @focus="isSearchFocused = true"
          @blur="hideDropdown"
        />
      </div>
      <!-- 자동완성 드롭다운 -->
      <ul v-if="isSearchFocused && filteredStores.length > 0" class="search-dropdown">
        <li v-for="s in filteredStores" :key="s.franchiseId" @click="selectStoreFromDropdown(s.franchiseName)">
          <span class="drop-name">{{ s.franchiseName }}</span>
          <span class="drop-status">{{ getStatusLabel(s.status) }}</span>
        </li>
      </ul>
    </div>

    <!-- 최종 합계 (상단) -->
    <div class="final-card" v-if="!isLoading">
      <div class="fc-left">
        <span class="fc-label">최종 정산 금액</span>
        <span class="fc-formula">발주 대금 + 수수료 - 배송비 - 반품 차감액 - 본사 부담 손실 + 기타 조정</span>
      </div>
      <p class="fc-amount">₩ {{ fmt(totalFinal) }}</p>
    </div>

    <section class="summary-grid" v-if="!isLoading">
      <div class="summary-card">
        <span class="s-label">발주 매출</span>
        <p class="s-value positive">₩ {{ fmt(totals.orderCost) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">수수료 수익</span>
        <p class="s-value positive">₩ {{ fmt(totals.commission) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(totals.shipping) }}</p>
      </div>
      <div class="summary-card refund-card">
        <span class="s-label">반품 차감액</span>
        <p class="s-value negative">₩ {{ fmt(totals.refund) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">본사 손실</span>
        <p class="s-value negative">₩ {{ fmt(totals.loss) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">기타 조정</span>
        <p class="s-value" :class="totals.adjustment >= 0 ? 'positive' : 'negative'">₩ {{ fmt(totals.adjustment) }}</p>
      </div>
    </section>

    <!-- 가맹점별 정산 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>가맹점별 정산 목록</h3>
        <div class="header-right-group">
          <button class="all-pdf-btn" @click="downloadBatchPDF">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            전체 가맹점 요약 PDF
          </button>
          <span class="badge">{{ filteredStores.length }}개</span>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>가맹점</th>
            <th class="text-right">매출</th>
            <th class="text-right">발주 대금</th>
            <th class="text-right">배송비</th>
            <th class="text-right">수수료</th>
            <th class="text-right">반품 환급</th>
            <th class="text-right">손실</th>
            <th class="text-right">조정</th>
            <th class="text-right">최종 정산</th>
            <th class="text-center">상태</th>
            <th class="text-center">영수증</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
              <td colspan="11" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="filteredStores.length === 0">
              <td colspan="11" class="text-center" style="padding: 2rem;">해당 날짜에 대한 정산 데이터가 없습니다.</td>
          </tr>
          <tr v-for="s in filteredStores" :key="s.franchiseId" v-else>
            <td class="store-cell">{{ s.franchiseName }}</td>
            <td class="text-right primary-color">₩ {{ fmt(s.totalSaleAmount) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.orderAmount) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.deliveryFee) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.commissionFee) }}</td>
            <td class="text-right primary-color">₩ {{ fmt(s.refundAmount) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.lossAmount) }}</td>
            <td class="text-right" :class="s.adjustmentAmount >= 0 ? 'primary-color' : 'negative'">₩ {{ (s.adjustmentAmount >= 0 ? '+' : '') + fmt(s.adjustmentAmount) }}</td>
            <td class="text-right primary-color final-cell">₩ {{ fmt(s.finalAmount) }}</td>
            <td class="text-center"><span :class="['status-tag', getStatusClass(s.status)]">{{ getStatusLabel(s.status) }}</span></td>
            <td class="text-center">
              <button class="row-receipt-btn" @click="downloadStorePDF(s)">PDF</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="trend-section" v-if="!isLoading">
      <div class="section-header">
        <h3>{{ activeTab === 'daily' ? '가맹점별 매출 비교' : '전체 가맹점 정산 추이' }}</h3>
      </div>
      <div class="chart-wrapper">
        <SettlementTrendChart 
          :data="trendData" 
          :height="240" 
          :type="activeTab === 'daily' ? 'bar' : 'line'" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn:hover { transform: translateY(-1px); }
.excel-btn { background: #1e293b; color: white; }
.excel-btn:hover { background: #0f172a; }
.confirm-btn { background: #10b981; color: white; }
.confirm-btn:hover { background: #059669; }

.control-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem; }
.control-left { display: flex; align-items: center; gap: 0.75rem; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.6rem 1.3rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-light); transition: all 0.2s; }
.tab-group button.active { background: #475569; color: white; }
.tab-group button:hover:not(.active) { background: #f8fafc; }
.date-wrapper { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem 1.2rem; background: white; cursor: pointer; min-width: 150px; }
.date-wrapper:hover { border-color: #475569; }
.cal-icon { color: #475569; pointer-events: none; flex-shrink: 0; }
.date-label { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); pointer-events: none; white-space: nowrap; }
.date-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; }
.search-container { position: relative; margin-bottom: 1.25rem; max-width: 300px; z-index: 50; }
.search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.55rem 1rem; color: var(--text-light); }
.search-input { border: none; outline: none; font-size: 0.9rem; width: 100%; color: var(--text-dark); }

.search-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-height: 250px;
  overflow-y: auto;
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}
.search-dropdown li {
  padding: 0.7rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}
.search-dropdown li:hover { background: #f1f5f9; }
.drop-name { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
.drop-status { font-size: 0.75rem; color: var(--text-light); background: #f8fafc; padding: 2px 8px; border-radius: 4px; }

.summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 1rem; }
.summary-grid .summary-card { grid-column: span 2; }
.summary-card { background: white; padding: 1.15rem 1.4rem; border-radius: 14px; border: 1px solid var(--border-color); transition: transform 0.15s, box-shadow 0.15s; }
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.summary-card.clickable { cursor: pointer; }
.summary-card.clickable:hover { border-color: #475569; box-shadow: 0 4px 16px rgba(71,85,105,0.15); }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.s-value { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.negative { color: #ef4444; }
.s-value.positive { color: #6366f1; }

.final-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.25rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }
.fc-left { display: flex; flex-direction: column; gap: 0.3rem; }
.fc-label { font-size: 1rem; font-weight: 700; }
.fc-formula { font-size: 0.8rem; opacity: 0.7; font-weight: 500; }
.fc-amount { font-size: 1.85rem; font-weight: 800; margin: 0; }

.trend-section {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
}
.chart-wrapper {
  height: 240px;
  width: 100%;
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.header-right-group { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.all-pdf-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #ef4444; background: white; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; }
.all-pdf-btn:hover { background: #ef4444; color: white; transform: translateY(-1px); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: #475569; color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 0.9rem 1.2rem; background: #f8fafc; color: var(--text-light); font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.store-cell { font-weight: 700; color: var(--text-dark); }
.negative { color: #ef4444 !important; }
.primary-color { color: #6366f1 !important; }
.final-cell { font-weight: 800; color: #6366f1 !important; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.status-done { background: #d1fae5; color: #065f46; }
.status-wait { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #ede9fe; color: #6366f1; }
.detail-btn { padding: 0.35rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.2s; }
.detail-btn:hover { background: #f1f5f9; border-color: #475569; }
.row-receipt-btn { padding: 0.35rem 0.7rem; border-radius: 8px; border: 1px solid #ef4444; background: white; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; }
.row-receipt-btn:hover { background: #ef4444; color: white; }
</style>
