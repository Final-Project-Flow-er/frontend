<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { settlementsApi } from '@/api/settlements.js'
import SettlementReceiptModal from '@/components/settlement/SettlementReceiptModal.vue'

const route = useRoute()
const franchiseId = route.params.storeId

/* ── 탭 ── */
const activeTab = ref(route.query.tab || 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(route.query.date || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(route.query.month || `${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 데이터 상태 ── */
const isLoading = ref(false)
const storeName = ref('')
const summary = ref({
  finalAmount: 0,
  saleAmount: 0,
  refundAmount: 0,
  orderAmount: 0,
  deliveryFee: 0,
  lossAmount: 0,
  commissionFee: 0
})
const vouchers = ref([])
const totalVouchers = ref(0)
const selectedFilter = ref('all')

const fetchData = async () => {
  isLoading.value = true
  try {
    // 1. 요약 정보
    const sumRes = activeTab.value === 'daily'
      ? await settlementsApi.getDailyFranchiseSummary(franchiseId, selectedDate.value)
      : await settlementsApi.getMonthlyFranchiseSummary(franchiseId, selectedMonth.value)
    
    if (sumRes) {
      // storeName은 summary에 없을 수 있으므로, 필요하다면 API에서 필드 확인 필요. 
      // 일단 DTO 구성을 보니 franchiseName 보다는 금액 위주이므로, 목록 API에서 이름을 가져오는 기존 로직 유지하거나 API 확장 필요.
      // DTO를 보니 summary에 franchiseName이 없을 수도 있음. 
      // 하지만 controller에서 listRes를 가져오는 로직도 나쁘지 않으므로, 
      // 일단 '금액' 데이터는 전용 summary API로 정확하게 가져오고 '이름'은 listRes에서 찾는 방식 병합.
      summary.value = sumRes
      
      // 이름만 찾기 위해 listRes 호출 (목록 UI 데이터 재사용)
      const listRes = activeTab.value === 'daily'
        ? await settlementsApi.getDailyFranchises({ date: selectedDate.value, keyword: '', size: 100 })
        : await settlementsApi.getMonthlyFranchises({ month: selectedMonth.value, keyword: '', size: 100 })
      
      const storeInfo = listRes.content.find(s => String(s.franchiseId) === String(franchiseId))
      if (storeInfo) {
        storeName.value = storeInfo.franchiseName
      }
    }

    // 2. 전표 목록
    const voucherRes = await settlementsApi.getVouchers({
      franchiseId,
      period: activeTab.value === 'daily' ? 'DAILY' : 'MONTHLY',
      date: selectedDate.value,
      month: selectedMonth.value,
      type: selectedFilter.value === 'all' ? null : selectedFilter.value.toUpperCase(),
      size: 100
    })
    vouchers.value = voucherRes.content
    totalVouchers.value = voucherRes.totalElements
  } catch (error) {
    console.error('Failed to fetch detailed settlement:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
watch([activeTab, selectedDate, selectedMonth, selectedFilter], fetchData)

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n || 0))
const formatDate = (d) => { if(!d) return ''; const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { if(!d) return ''; const [y,m] = d.split('-'); return `${y}년 ${m}월` }
const formatDateTime = (dt) => { if(!dt) return ''; return dt.replace('T', ' ').substring(0, 16) }

const filterTypes = [
  { key: 'all', label: '전체' }, 
  { key: 'SALES', label: '판매' }, 
  { key: 'ORDER', label: '발주' },
  { key: 'SHIPPING', label: '배송' }, 
  { key: 'COMMISSION', label: '수수료' }, 
  { key: 'REFUND', label: '반품' },
  { key: 'LOSS', label: '손실' }
]

const getTypeLabel = (type) => {
  const map = { SALES:'판매', ORDER:'발주', SHIPPING:'배송', COMMISSION:'수수료', REFUND:'반품', LOSS:'손실', ADJUST:'기타' }
  return map[type] || type
}

const getTypeClass = (type) => ({
  SALES: 'type-sales', ORDER: 'type-order', SHIPPING: 'type-shipping',
  COMMISSION: 'type-commission', REFUND: 'type-refund', LOSS: 'type-loss', ADJUST: 'type-adjust',
}[type] || '')

/* ── 영수증 ── */
const showReceiptModal = ref(false)
const openReceipt = async () => {
    // 단순히 모달을 여는 대신 PDF URL을 바로 열거나 모달에서 선택
    try {
        const res = activeTab.value === 'daily'
            ? await settlementsApi.getDailyFranchiseReceiptPdf(franchiseId, selectedDate.value)
            : await settlementsApi.getMonthlyFranchiseReceiptPdf(franchiseId, selectedMonth.value)
        if (res && res.startsWith('http')) window.open(res, '_blank')
        else if (res) alert(res)
    } catch (err) {
        alert('영수증 PDF를 가져오는 데 실패했습니다.')
    }
}

const downloadExcel = () => {
  alert('해당 가맹점 상세 엑셀 기능은 준비 중입니다.')
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
        <button class="action-btn pdf" @click="openReceipt">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF 영수증
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
      <div v-if="activeTab === 'daily'" class="date-wrapper">
        <span class="date-label">{{ formatDate(selectedDate) }}</span>
      </div>
      <div v-else class="date-wrapper">
        <span class="date-label">{{ formatMonth(selectedMonth) }}</span>
      </div>
    </div>

    <!-- 정산 요약 -->
    <div class="final-card" v-if="!isLoading">
      <span class="fc-label">최종 정산 금액</span>
      <p class="fc-amount">₩ {{ fmt(summary.finalAmount) }}</p>
    </div>

    <section class="summary-grid" v-if="!isLoading">
      <div class="summary-card primary"><span class="s-label">총 매출</span><p class="s-value primary-color">₩ {{ fmt(summary.saleAmount) }}</p></div>
      <div class="summary-card refund"><span class="s-label">반품 환급</span><p class="s-value primary-color">₩ {{ fmt(summary.refundAmount) }}</p></div>
      <div class="summary-card"><span class="s-label">발주 대금</span><p class="s-value neg">₩ {{ fmt(summary.orderAmount) }}</p></div>
      <div class="summary-card"><span class="s-label">배송비</span><p class="s-value neg">₩ {{ fmt(summary.deliveryFee) }}</p></div>
      <div class="summary-card"><span class="s-label">손실</span><p class="s-value neg">₩ {{ fmt(summary.lossAmount) }}</p></div>
      <div class="summary-card"><span class="s-label">수수료</span><p class="s-value neg">₩ {{ fmt(summary.commissionFee) }}</p></div>
    </section>

    <!-- 필터 -->
    <div class="filter-bar">
      <button v-for="ft in filterTypes" :key="ft.key" :class="['filter-chip', { active: selectedFilter === ft.key }]" @click="selectedFilter = ft.key">{{ ft.label }}</button>
    </div>

    <!-- 전표 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>전표 목록</h3>
        <span class="badge">{{ totalVouchers }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>전표번호</th><th>유형</th><th>상품/내역</th><th class="text-right">수량</th><th class="text-right">금액</th><th>일시</th></tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
              <td colspan="6" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="vouchers.length === 0">
              <td colspan="6" class="text-center" style="padding: 2rem;">해당 조건의 전표가 없습니다.</td>
          </tr>
          <tr v-for="v in vouchers" :key="v.referenceCode" v-else>
            <td class="id-cell">{{ v.referenceCode }}</td>
            <td><span :class="['type-tag', getTypeClass(v.type)]">{{ getTypeLabel(v.type) }}</span></td>
            <td>{{ v.description }}</td>
            <td class="text-right">{{ v.quantity != null ? v.quantity : '−' }}</td>
            <td class="text-right fw700" :class="{ 'neg': ['ORDER', 'SHIPPING', 'COMMISSION', 'LOSS'].includes(v.type), 'primary-color': ['SALES', 'REFUND'].includes(v.type) }">
              ₩ {{ fmt(v.amount) }}</td>
            <td class="time-cell">{{ formatDateTime(v.occurredAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
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
.tab-group button.active { background: #475569; color: white; }
.date-wrapper { position: relative; display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.55rem 1.2rem; background: #f8fafc; min-width: 160px; }
.date-label { font-size: 1rem; font-weight: 600; color: var(--text-dark); white-space: nowrap; }

.final-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.25rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }

.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.summary-grid .summary-card:nth-child(1),
.summary-grid .summary-card:nth-child(2) { grid-column: span 2; }
.summary-card { background: white; padding: 1.15rem 1.4rem; border-radius: 14px; border: 1px solid var(--border-color); }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.s-value { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.neg { color: #ef4444; }
.s-value.primary-color { color: #6366f1 !important; }
.fc-label { font-size: 1rem; font-weight: 700; }
.fc-amount { font-size: 1.85rem; font-weight: 800; margin: 0; }

.filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.filter-chip { padding: 0.4rem 1rem; border-radius: 999px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-light); transition: all 0.15s; }
.filter-chip.active { background: #475569; color: white; border-color: #475569; }
.filter-chip:hover:not(.active) { border-color: #475569; color: #475569; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: #475569; color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.9rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.id-cell { color: #6366f1; font-weight: 600; font-size: 0.8rem; }
.fw700 { font-weight: 700; }
.time-cell { color: var(--text-light); font-size: 0.8rem; }
.type-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.type-sales { background: #ede9fe; color: #6366f1; }
.type-order { background: #fff7ed; color: #f97316; }
.type-shipping { background: #e0f2fe; color: #0ea5e9; }
.type-commission { background: #f3e8ff; color: #8b5cf6; }
.type-refund { background: #d1fae5; color: #059669; }
.type-loss { background: #fee2e2; color: #dc2626; }
.type-adjust { background: #f1f5f9; color: #475569; }
</style>
