<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ── 탭 ── */
const activeTab = ref('daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 가맹점 필터 ── */
const searchStore = ref('')

/* ── 날짜 기반 시드 함수 ── */
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 } return Math.abs(h) }
const seededRand = (s, min, max) => min + (s % (max - min + 1))
const round100 = (n) => Math.round(n / 100) * 100

const storeNames = [
  { id: 'S001', name: '강남점' },   { id: 'S002', name: '홍대점' },
  { id: 'S003', name: '신촌점' },   { id: 'S004', name: '이태원점' },
  { id: 'S005', name: '잠실점' },   { id: 'S006', name: '명동점' },
  { id: 'S007', name: '건대점' },   { id: 'S008', name: '서울대점' },
  { id: 'S009', name: '합정점' },   { id: 'S010', name: '성수점' },
]

const stores = computed(() => {
  const d = selectedDate.value
  return storeNames.map((s, i) => {
    const base = seed(d + s.id)
    const sales = round100(seededRand(base, 250000, 750000))
    const orderCost = round100(seededRand(base * 2 + i, 80000, 250000))
    const shipping = round100(seededRand(base * 3 + i, 10000, 25000))
    const commission = Math.round(sales * 0.03)
    const refund = i % 3 === 0 ? round100(seededRand(base * 4 + i, 0, 40000)) : 0
    const loss = i % 4 === 0 ? round100(seededRand(base * 5 + i, 0, 25000)) : 0
    const status = i % 2 === 0 ? '대기' : '정산완료'
    return { ...s, sales, orderCost, shipping, commission, refund, loss, status }
  })
})

const filteredStores = computed(() => {
  if (!searchStore.value) return stores.value
  return stores.value.filter(s => s.name.includes(searchStore.value))
})

/* ── 합계 ── */
const totals = computed(() => {
  const list = filteredStores.value
  return {
    sales: list.reduce((s, i) => s + i.sales, 0),
    orderCost: list.reduce((s, i) => s + i.orderCost, 0),
    shipping: list.reduce((s, i) => s + i.shipping, 0),
    commission: list.reduce((s, i) => s + i.commission, 0),
    refund: list.reduce((s, i) => s + i.refund, 0),
    loss: list.reduce((s, i) => s + i.loss, 0),
  }
})
const totalFinal = computed(() =>
  totals.value.sales - (totals.value.orderCost + totals.value.shipping + totals.value.commission + totals.value.loss) + totals.value.refund
)

const getFinal = (s) => s.sales - (s.orderCost + s.shipping + s.commission + s.loss) + s.refund

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
const formatDate = (d) => { const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { const [y,m] = d.split('-'); return `${y}년 ${m}월` }
/* ── 날짜 피커 ── */
const dateRef = ref(null)
const monthRef = ref(null)
const openDatePicker = () => { dateRef.value?.showPicker() }
const openMonthPicker = () => { monthRef.value?.showPicker() }

/* ── 총 매출 모달 ── */
const showSalesModal = ref(false)
const showRefundModal = ref(false)

/* ── 범용 모달 ── */
const detailModal = ref({ show: false, title: '', field: '' })
const openDetail = (title, field) => { detailModal.value = { show: true, title, field } }
const closeDetail = () => { detailModal.value.show = false }

/* ── 상세 이동 ── */
const goToDetail = (storeId) => {
  router.push({ path: `/hq/settlement/detail/${storeId}`, query: { date: selectedDate.value, month: selectedMonth.value, tab: activeTab.value } })
}

const getStatusClass = (status) => ({
  '정산완료': 'status-done',
  '대기': 'status-wait',
  '확정': 'status-confirmed',
}[status] || '')
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
        <button class="action-btn confirm-btn" @click="$router.push('/hq/settlement/confirm')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          정산 확정
        </button>
        <button class="action-btn voucher-btn" @click="$router.push('/hq/settlement/voucher-manage')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          조정 전표 등록
        </button>
        <button class="action-btn log-btn" @click="$router.push('/hq/settlement/logs')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="10"/></svg>
          이력 조회
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
    <div class="search-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" v-model="searchStore" placeholder="가맹점 검색..." class="search-input" />
    </div>

    <!-- 최종 합계 (상단) -->
    <div class="final-card">
      <div class="fc-left">
        <span class="fc-label">전체 가맹점 최종 정산 합계</span>
        <span class="fc-count">{{ filteredStores.length }}개 가맹점</span>
      </div>
      <p class="fc-amount">₩ {{ fmt(totalFinal) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card primary clickable" @click="showSalesModal = true">
        <span class="s-label">총 매출</span>
        <p class="s-value">₩ {{ fmt(totals.sales) }}</p>
      </div>
      <div class="summary-card refund-card clickable" @click="showRefundModal = true">
        <span class="s-label">반품 환급</span>
        <p class="s-value primary-color">₩ {{ fmt(totals.refund) }}</p>
      </div>
      <div class="summary-card clickable" @click="openDetail('가맹점별 발주 대금', 'orderCost')">
        <span class="s-label">발주 대금</span>
        <p class="s-value negative">₩ {{ fmt(totals.orderCost) }}</p>
      </div>
      <div class="summary-card clickable" @click="openDetail('가맹점별 배송비', 'shipping')">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(totals.shipping) }}</p>
      </div>
      <div class="summary-card clickable" @click="openDetail('가맹점별 손실', 'loss')">
        <span class="s-label">손실</span>
        <p class="s-value negative">₩ {{ fmt(totals.loss) }}</p>
      </div>
      <div class="summary-card clickable" @click="openDetail('가맹점별 수수료', 'commission')">
        <span class="s-label">수수료</span>
        <p class="s-value negative">₩ {{ fmt(totals.commission) }}</p>
      </div>
    </section>

    <!-- 가맹점별 정산 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>가맹점별 정산 목록</h3>
        <span class="badge">{{ filteredStores.length }}개</span>
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
            <th class="text-right">최종 정산</th>
            <th class="text-center">상태</th>
            <th class="text-center">상세</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredStores" :key="s.id">
            <td class="store-cell">{{ s.name }}</td>
            <td class="text-right primary-color">₩ {{ fmt(s.sales) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.orderCost) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.shipping) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.commission) }}</td>
            <td class="text-right primary-color">₩ {{ fmt(s.refund) }}</td>
            <td class="text-right negative">₩ {{ fmt(s.loss) }}</td>
            <td class="text-right primary-color final-cell">₩ {{ fmt(getFinal(s)) }}</td>
            <td class="text-center"><span :class="['status-tag', getStatusClass(s.status)]">{{ s.status }}</span></td>
            <td class="text-center"><button class="detail-btn" @click="goToDetail(s.id)">상세</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 총 매출 모달 -->
  <teleport to="body">
    <div v-if="showSalesModal" class="modal-overlay" @click.self="showSalesModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>가맹점별 매출 현황</h3>
          <button class="modal-close" @click="showSalesModal = false">&times;</button>
        </div>
        <table class="modal-table">
          <thead>
            <tr><th>가맹점</th><th class="text-right">매출액</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStores" :key="s.id">
              <td>{{ s.name }}</td>
              <td class="text-right">₩ {{ fmt(s.sales) }}</td>
            </tr>
            <tr class="total-row">
              <td><strong>합계</strong></td>
              <td class="text-right"><strong>₩ {{ fmt(totals.sales) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </teleport>

  <!-- 반품 환급 모달 -->
  <teleport to="body">
    <div v-if="showRefundModal" class="modal-overlay" @click.self="showRefundModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>가맹점별 반품 환급 현황</h3>
          <button class="modal-close" @click="showRefundModal = false">&times;</button>
        </div>
        <table class="modal-table">
          <thead>
            <tr><th>가맹점</th><th class="text-right">반품 환급액</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStores" :key="s.id">
              <td>{{ s.name }}</td>
              <td class="text-right">₩ {{ fmt(s.refund) }}</td>
            </tr>
            <tr class="total-row">
              <td><strong>합계</strong></td>
              <td class="text-right"><strong>₩ {{ fmt(totals.refund) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </teleport>

  <!-- 범용 상세 모달 -->
  <teleport to="body">
    <div v-if="detailModal.show" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ detailModal.title }}</h3>
          <button class="modal-close" @click="closeDetail">&times;</button>
        </div>
        <table class="modal-table">
          <thead>
            <tr><th>가맹점</th><th class="text-right">금액</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStores" :key="s.id">
              <td>{{ s.name }}</td>
              <td class="text-right">₩ {{ fmt(s[detailModal.field]) }}</td>
            </tr>
            <tr class="total-row">
              <td><strong>합계</strong></td>
              <td class="text-right"><strong>₩ {{ fmt(totals[detailModal.field]) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn:hover { transform: translateY(-1px); }
.confirm-btn { background: #10b981; color: white; }
.confirm-btn:hover { background: #059669; }
.voucher-btn { background: var(--primary); color: white; }
.voucher-btn:hover { background: #4f46e5; }
.log-btn { background: #64748b; color: white; }
.log-btn:hover { background: #475569; }

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
.search-bar { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.55rem 1rem; color: var(--text-light); margin-bottom: 1.25rem; max-width: 300px; }
.search-input { border: none; outline: none; font-size: 0.9rem; width: 100%; color: var(--text-dark); }

.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.summary-grid .summary-card:nth-child(1),
.summary-grid .summary-card:nth-child(2) { grid-column: span 2; }
.summary-card { background: white; padding: 1.15rem 1.4rem; border-radius: 14px; border: 1px solid var(--border-color); transition: transform 0.15s, box-shadow 0.15s; }
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.summary-card.clickable { cursor: pointer; }
.summary-card.clickable:hover { border-color: #475569; box-shadow: 0 4px 16px rgba(71,85,105,0.15); }
.summary-card.primary .s-value { color: var(--primary); }
.summary-card.refund-card .s-value { color: var(--primary); }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.s-value { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.negative { color: #ef4444; }
.s-value.positive { color: #10b981; }

.final-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.25rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }
.fc-left { display: flex; align-items: center; gap: 1rem; }
.fc-label { font-size: 1rem; font-weight: 700; }
.fc-count { font-size: 0.8rem; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 999px; }
.fc-amount { font-size: 1.85rem; font-weight: 800; margin: 0; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 0.9rem 1.2rem; background: #f8fafc; color: var(--text-light); font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.store-cell { font-weight: 700; color: var(--text-dark); }
.negative { color: #ef4444 !important; }
.positive { color: #10b981 !important; }
.primary-color { color: var(--primary) !important; }
.final-cell { font-weight: 800; color: var(--primary) !important; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.status-done { background: #d1fae5; color: #065f46; }
.status-wait { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #ede9fe; color: #6366f1; }
.detail-btn { padding: 0.35rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.2s; }
.detail-btn:hover { background: #f1f5f9; border-color: #475569; }

/* ── 모달 ── */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-box { background: white; border-radius: 16px; width: 520px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); line-height: 1; }
.modal-table { width: 100%; border-collapse: collapse; }
.modal-table th { text-align: left; padding: 0.85rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; }
.modal-table td { padding: 0.85rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.modal-table .total-row { background: #f1f5f9; }
.modal-table .total-row td { border-bottom: none; color: var(--primary); }
</style>
