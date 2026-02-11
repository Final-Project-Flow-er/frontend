<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import SettlementReceiptModal from '@/components/settlement/SettlementReceiptModal.vue'

const router = useRouter()

/* ── 탭 ── */
const activeTab = ref('daily') // 'daily' | 'monthly'

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 날짜 기반 시드 함수 ── */
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 } return Math.abs(h) }
const seededRand = (s, min, max) => min + (s % (max - min + 1))
const round100 = (n) => Math.round(n / 100) * 100

const productNames = ['오리지널 떡볶이 밀키트', '마라 떡볶이 밀키트', '로제 떡볶이 밀키트', '오리지널 떡볶이 (대용량)']

/* ── 일별 데이터 (날짜 반응형) ── */
const dailySalesItems = computed(() => {
  const d = selectedDate.value
  return productNames.map((name, i) => {
    const base = seed(d + name)
    return { productName: name, amount: round100(seededRand(base, 50000, 300000)) }
  })
})

const dailySettlement = computed(() => {
  const d = selectedDate.value
  const base = seed(d)
  const totalSales = dailySalesItems.value.reduce((s, i) => s + i.amount, 0)
  const orderCost = round100(seededRand(base * 2, 100000, 250000))
  const shippingFee = round100(seededRand(base * 3, 10000, 25000))
  const commission = Math.round(totalSales * 0.03)
  const returnRefund = round100(seededRand(base * 4, 0, 30000))
  const loss = round100(seededRand(base * 5, 0, 15000))
  const finalAmount = totalSales - (orderCost + shippingFee + commission + loss) + returnRefund
  return { totalSales, orderCost, shippingFee, commission, returnRefund, loss, finalAmount }
})

/* ── 월별 데이터 (월 반응형) ── */
const monthlySalesItems = computed(() => {
  const m = selectedMonth.value
  return productNames.map((name, i) => {
    const base = seed(m + name)
    return { productName: name, amount: round100(seededRand(base, 1000000, 6000000)) }
  })
})

const monthlySettlement = computed(() => {
  const m = selectedMonth.value
  const base = seed(m)
  const totalSales = monthlySalesItems.value.reduce((s, i) => s + i.amount, 0)
  const orderCost = round100(seededRand(base * 2, 2000000, 5000000))
  const shippingFee = round100(seededRand(base * 3, 200000, 500000))
  const commission = Math.round(totalSales * 0.03)
  const returnRefund = round100(seededRand(base * 4, 100000, 400000))
  const loss = round100(seededRand(base * 5, 0, 100000))
  const finalAmount = totalSales - (orderCost + shippingFee + commission + loss) + returnRefund
  return { totalSales, orderCost, shippingFee, commission, returnRefund, loss, finalAmount }
})

const currentSettlement = computed(() => activeTab.value === 'daily' ? dailySettlement.value : monthlySettlement.value)
const currentSalesItems = computed(() => activeTab.value === 'daily' ? dailySalesItems.value : monthlySalesItems.value)

/* ── 주문 내역 (날짜 반응형) ── */
const unitPrices = [12900, 14900, 13900, 22000]
const hours = ['09:30', '11:15', '13:45', '15:20']
const orderHistory = computed(() => {
  const d = selectedDate.value
  const dFormatted = d.replace(/-/g, '')
  return productNames.map((name, i) => {
    const base = seed(d + 'order' + name)
    const qty = seededRand(base, 2, 25)
    const up = unitPrices[i]
    return {
      id: `ORD-${dFormatted}-${String(i + 1).padStart(3, '0')}`,
      product: name, qty, unitPrice: up, total: qty * up,
      time: `${d} ${hours[i]}`
    }
  })
})

/* ── 모달 ── */
const showSalesModal = ref(false)
const showReceiptModal = ref(false)

const openReceipt = () => {
  showReceiptModal.value = true
}

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
const formatDate = (d) => { const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { const [y,m] = d.split('-'); return `${y}년 ${m}월` }
/* ── 날짜 피커 ── */
const dateRef = ref(null)
const monthRef = ref(null)
const openDatePicker = () => { dateRef.value?.showPicker() }
const openMonthPicker = () => { monthRef.value?.showPicker() }

/* ── 네비게이션 ── */
const goToItemSummary = () => router.push('/store/settlement/items')
const goToVoucherList = () => router.push('/store/settlement/vouchers')

/* ── 엑셀(.xlsx) 다운로드 ── */
const downloadExcel = () => {
  const d = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value
  const data = currentSettlement.value

  // 1. 주문 내역 데이터 준비 (Sheet 1)
  const orderRows = orderHistory.value.map(o => ({
    '주문번호': o.id,
    '상품명': o.product,
    '수량': o.qty,
    '단가': o.unitPrice,
    '합계금액': o.total,
    '발생일시': o.time
  }))

  // 2. 정산 요약 데이터 준비 (Sheet 2)
  const summaryRows = [
    { '항목': '총 매출', '금액': data.totalSales, '비고': '상품 판매 합계' },
    { '항목': '발주 대금', '금액': data.orderCost, '비고': '차감 (-)' },
    { '항목': '배송비', '금액': data.shippingFee, '비고': '차감 (-)' },
    { '항목': '정산 수수료', '금액': data.commission, '비고': '차감 (-)' },
    { '항목': '손실액', '금액': data.loss, '비고': '차감 (-)' },
    { '항목': '반품 환급', '금액': data.returnRefund, '비고': '가산 (+)' },
    { '항목': '최종 정산 금액', '금액': data.finalAmount, '비고': '최종 수령액' }
  ]

  const wb = XLSX.utils.book_new()
  const wsOrders = XLSX.utils.json_to_sheet(orderRows)
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows)

  // 컬럼 너비 설정
  wsOrders['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 15 }, { wch: 20 }]
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }]

  XLSX.utils.book_append_sheet(wb, wsOrders, '주문상세내역')
  XLSX.utils.book_append_sheet(wb, wsSummary, '정산결과요약')

  XLSX.writeFile(wb, `Store_Settlement_${d}.xlsx`)
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 타이틀 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">정산 요약</h1>
        <p class="page-desc">일별 · 월별 정산 현황을 확인하세요.</p>
      </div>
      <div class="header-actions">
        <button class="action-btn excel-btn" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Excel 다운로드
        </button>
        <button class="action-btn receipt-btn" @click="openReceipt">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          영수증 조회 (PDF)
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별 정산</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별 정산</button>
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

    <!-- 최종 정산 금액 (상단) -->
    <div class="final-settlement-card">
      <div class="fs-left">
        <span class="fs-label">최종 정산 금액</span>
        <p class="fs-formula">총 매출 − (발주 대금 + 배송비 + 수수료 + 손실) + 반품 환급</p>
      </div>
      <p class="fs-amount">₩ {{ fmt(currentSettlement.finalAmount) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card primary clickable" @click="showSalesModal = true">
        <span class="s-label">총 매출</span>
        <p class="s-value">₩ {{ fmt(currentSettlement.totalSales) }}</p>
      </div>
      <div class="summary-card refund">
        <span class="s-label">반품 환급</span>
        <p class="s-value primary-color">₩ {{ fmt(currentSettlement.returnRefund) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">발주 대금</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.orderCost) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.shippingFee) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">손실</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.loss) }}</p>
      </div>
      <div class="summary-card">
        <span class="s-label">수수료</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.commission) }}</p>
      </div>
    </section>

    <!-- 월별 청구/마감 안내 (월별 탭만) -->
    <div v-if="activeTab === 'monthly'" class="notice-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>월 대금 청구: 매달 <strong>15일</strong> &nbsp;|&nbsp; 대금/정산 마감: 매달 <strong>20일</strong></span>
    </div>

    <!-- 매출 상세 (상품별) -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>매출 상세 (상품별)</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>상품명</th><th class="text-right">금액</th></tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in currentSalesItems" :key="idx">
            <td>{{ item.productName }}</td>
            <td class="text-right">₩ {{ fmt(item.amount) }}</td>
          </tr>
          <tr class="total-row">
            <td><strong>합계</strong></td>
            <td class="text-right"><strong>₩ {{ fmt(currentSettlement.totalSales) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 주문 내역 (일별 탭만) -->
    <div v-if="activeTab === 'daily'" class="data-table-card">
      <div class="table-header">
        <h3>주문 내역</h3>
        <span class="badge">{{ orderHistory.length }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>주문번호</th><th>상품명</th><th class="text-right">수량</th><th class="text-right">단가</th><th class="text-right">금액</th><th>발생일시</th></tr>
        </thead>
        <tbody>
          <tr v-for="order in orderHistory" :key="order.id">
            <td class="id-cell">{{ order.id }}</td>
            <td>{{ order.product }}</td>
            <td class="text-right">{{ order.qty }}</td>
            <td class="text-right">₩ {{ fmt(order.unitPrice) }}</td>
            <td class="text-right"><strong>₩ {{ fmt(order.total) }}</strong></td>
            <td class="time-cell">{{ order.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 바로가기 버튼 -->
    <div class="shortcut-bar">
      <button class="shortcut-btn" @click="goToItemSummary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        항목별 요약 보기
      </button>
      <button class="shortcut-btn" @click="goToVoucherList">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        전표 상세 보기
      </button>
    </div>
  </div>

  <!-- 영수증 모달 -->
  <SettlementReceiptModal
    :is-open="showReceiptModal"
    :store="{ 
      name: '본인 가맹점', 
      id: 'S001', 
      sales: currentSettlement.totalSales,
      orderCost: currentSettlement.orderCost,
      shipping: currentSettlement.shippingFee,
      commission: currentSettlement.commission,
      loss: currentSettlement.loss,
      refund: currentSettlement.returnRefund
    }"
    :date="activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth)"
    @close="showReceiptModal = false"
  />

  <!-- 주문 내역 모달 -->
  <teleport to="body">
    <div v-if="showSalesModal" class="modal-overlay" @click.self="showSalesModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>주문 내역</h3>
          <button class="modal-close" @click="showSalesModal = false">&times;</button>
        </div>
        <table class="modal-table">
          <thead>
            <tr><th>주문번호</th><th>상품명</th><th class="text-right">수량</th><th class="text-right">단가</th><th class="text-right">금액</th><th>주문일시</th></tr>
          </thead>
          <tbody>
            <tr v-for="order in orderHistory" :key="order.id">
              <td class="id-cell">{{ order.id }}</td>
              <td>{{ order.product }}</td>
              <td class="text-right">{{ order.qty }}</td>
              <td class="text-right">₩ {{ fmt(order.unitPrice) }}</td>
              <td class="text-right"><strong>₩ {{ fmt(order.total) }}</strong></td>
              <td class="time-cell">{{ order.time }}</td>
            </tr>
            <tr class="total-row">
              <td colspan="4"><strong>합계</strong></td>
              <td class="text-right"><strong>₩ {{ fmt(orderHistory.reduce((s, o) => s + o.total, 0)) }}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

/* ── 페이지 헤더 ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn:hover { transform: translateY(-1px); }
.excel-btn { background: #1e293b; color: white; }
.excel-btn:hover { background: #0f172a; }
.receipt-btn { background: var(--primary); color: white; }
.receipt-btn:hover { background: #4f46e5; }

/* ── 컨트롤 바 ── */
.control-bar { display: flex; align-items: center; margin-bottom: 1.5rem; gap: 0.75rem; flex-wrap: wrap; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.65rem 1.5rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-light); transition: all 0.2s; }
.tab-group button.active { background: #475569; color: white; }
.tab-group button:hover:not(.active) { background: #f8fafc; }
.date-wrapper { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.65rem 1.2rem; background: white; cursor: pointer; min-width: 150px; }
.date-wrapper:hover { border-color: #475569; }
.cal-icon { color: #475569; pointer-events: none; flex-shrink: 0; }
.date-label { font-size: 0.9rem; font-weight: 600; color: var(--text-dark); pointer-events: none; white-space: nowrap; }
.date-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; }

/* ── 요약 카드 그리드 ── */
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.summary-grid .summary-card:nth-child(1),
.summary-grid .summary-card:nth-child(2) { grid-column: span 2; }
.summary-card { background: white; padding: 1.25rem 1.5rem; border-radius: 14px; border: 1px solid var(--border-color); transition: transform 0.15s, box-shadow 0.15s; }
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.summary-card.clickable { cursor: pointer; }
.summary-card.clickable:hover { border-color: #475569; box-shadow: 0 4px 16px rgba(71,85,105,0.15); }
.summary-card.primary .s-value { color: var(--primary); }
.summary-card.refund .s-value { color: var(--primary); }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.35rem; }
.s-value { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.negative { color: #ef4444; }
.s-value.positive { color: #10b981; }
.s-value.primary-color { color: var(--primary); }

/* ── 최종 정산 카드 ── */
.final-settlement-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.5rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }
.fs-label { font-size: 1rem; font-weight: 700; display: block; margin-bottom: 0.25rem; }
.fs-formula { font-size: 0.75rem; opacity: 0.8; margin: 0; }
.fs-amount { font-size: 2rem; font-weight: 800; margin: 0; }

/* ── 안내 바 ── */
.notice-bar { display: flex; align-items: center; gap: 0.5rem; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 0.75rem 1.25rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.5rem; }

/* ── 데이터 테이블 ── */
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.total-row { background: #f1f5f9 !important; }
.total-row td { border-bottom: none; }
.text-right { text-align: right; }
.id-cell { color: var(--primary); font-weight: 600; font-size: 0.85rem; }
.time-cell { color: var(--text-light); font-size: 0.85rem; }

/* ── 바로가기 버튼 ── */
.shortcut-bar { display: flex; gap: 1rem; }
.shortcut-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.5rem; background: white; border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.shortcut-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(99,102,241,0.1); }

/* ── 모달 ── */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-box { background: white; border-radius: 16px; width: 860px; max-width: 95vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
.modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); padding: 0 0.25rem; }
.modal-close:hover { color: var(--text-dark); }
.modal-table { width: 100%; border-collapse: collapse; }
.modal-table th { text-align: left; padding: 0.85rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.modal-table td { padding: 0.85rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; white-space: nowrap; }
.modal-table .total-row { background: #f1f5f9; }
.modal-table .total-row td { border-bottom: none; }
</style>
