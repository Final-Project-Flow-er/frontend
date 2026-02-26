<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()

/* ── 탭 ── */
const activeTab = ref(route.query.tab === 'monthly' ? 'monthly' : 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 날짜 기반 시드 함수 ── */
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 } return Math.abs(h) }
const seededRand = (s, min, max) => min + (s % (max - min + 1))
const round100 = (n) => Math.round(n / 100) * 100

const salesProducts = [
  { name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 5000 },
  { name: '로제 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 7000 },
  { name: '마라 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 7000 },
  { name: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 13000 },
  { name: '로제 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 17000 },
]

const allProducts = [
  { name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 18000 },
  { name: '로제 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 22000 },
]

/* ── 일별 데이터 (날짜 반응형) ── */
const dailySalesItems = computed(() => {
  const d = selectedDate.value
  return salesProducts.map((p, i) => {
    const base = seed(d + p.name)
    const qty = seededRand(base, 1, 15)
    return { productName: p.name, quantity: qty, unitPrice: p.unitPrice, totalPrice: qty * p.unitPrice }
  })
})

const dailySettlement = computed(() => {
  const d = selectedDate.value
  const base = seed(d)
  const totalSales = dailySalesItems.value.reduce((s, i) => s + i.totalPrice, 0)
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
  const items = allProducts.map((p, i) => {
    const base = seed(m + p.name)
    const qty = seededRand(base, 10, 300)
    return { productName: p.name, quantity: qty, unitPrice: p.unitPrice, totalPrice: qty * p.unitPrice }
  })
  return items.sort((a, b) => b.totalPrice - a.totalPrice)
})
const top5MonthlyItems = computed(() => monthlySalesItems.value.slice(0, 5))

const monthlySettlement = computed(() => {
  const m = selectedMonth.value
  const base = seed(m)
  const totalSales = monthlySalesItems.value.reduce((s, i) => s + i.totalPrice, 0)
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
const unitPrices = [5000, 7000, 7000, 13000, 17000]
const hours = ['09:30', '11:15', '13:45', '15:20', '16:30']
const orderHistory = computed(() => {
  const d = selectedDate.value
  const dFormatted = d.replace(/-/g, '')
  return salesProducts.map((p, i) => {
    const base = seed(d + 'order' + p.name)
    const qty = seededRand(base, 2, 25)
    const up = unitPrices[i]
    return {
      id: `ORD-${dFormatted}-${String(i + 1).padStart(3, '0')}`,
      product: p.name, qty, unitPrice: up, total: qty * up,
      time: `${d} ${hours[i]}`
    }
  })
})

/* ── 월별 발주내역 (24개 제품, 수량순 정렬) ── */
const monthlyOrderHistory = computed(() => {
  const m = selectedMonth.value
  const items = allProducts.map((p) => {
    const base = seed(m + 'order' + p.name)
    const qty = seededRand(base, 5, 200)
    return { product: p.name, qty, unitPrice: p.unitPrice, total: qty * p.unitPrice }
  })
  return items.sort((a, b) => b.qty - a.qty)
})
const top5MonthlyOrders = computed(() => monthlyOrderHistory.value.slice(0, 5))

/* ── 모달 & 토글 ── */
const showSalesModal = ref(false)
const showSalesTrend = ref(false)
const showCalendar = ref(false)

/* ── 매출 추이 (일자별) ── */
const trendStartDate = ref('')
const trendEndDate = ref('')
const pickState = ref('start') // 'start' | 'end'
const hoveredDate = ref('')

// 달력 데이터
const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr })
  }
  return cells
})

const onDayClick = (dateStr) => {
  if (pickState.value === 'start') {
    trendStartDate.value = dateStr
    trendEndDate.value = ''
    pickState.value = 'end'
  } else {
    if (dateStr < trendStartDate.value) {
      trendStartDate.value = dateStr
      trendEndDate.value = ''
      pickState.value = 'end'
    } else {
      trendEndDate.value = dateStr
      pickState.value = 'start'
      showCalendar.value = false
    }
  }
}

const getDayClass = (dateStr) => {
  if (!dateStr) return ''
  const classes = []
  if (dateStr === trendStartDate.value) classes.push('range-start')
  if (dateStr === trendEndDate.value) classes.push('range-end')
  if (trendStartDate.value && trendEndDate.value && dateStr > trendStartDate.value && dateStr < trendEndDate.value) classes.push('in-range')
  if (pickState.value === 'end' && trendStartDate.value && !trendEndDate.value && hoveredDate.value) {
    const hoverEnd = hoveredDate.value >= trendStartDate.value ? hoveredDate.value : ''
    if (hoverEnd && dateStr > trendStartDate.value && dateStr <= hoverEnd) classes.push('hover-range')
  }
  return classes.join(' ')
}

const rangeLabel = computed(() => {
  if (trendStartDate.value && trendEndDate.value) {
    return `${trendStartDate.value.split('-')[2]}일 ~ ${trendEndDate.value.split('-')[2]}일`
  }
  if (trendStartDate.value) return `${trendStartDate.value.split('-')[2]}일 ~ 종료일 선택`
  return '기간을 선택하세요'
})

// 선택된 월의 전체 일자별 매출 생성
const allDailyTrendData = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const base = seed(dateStr + 'dailytrend')
    const amount = seededRand(base, 100000, 2000000)
    days.push({ label: `${d}`, fullDate: dateStr, day: d, amount })
  }
  return days
})

// 기간 필터 적용
const filteredTrendData = computed(() => {
  let data = allDailyTrendData.value
  if (trendStartDate.value && trendEndDate.value) {
    data = data.filter(d => d.fullDate >= trendStartDate.value && d.fullDate <= trendEndDate.value)
  }
  return data
})

// Y축 최대값 (50만원 단위 올림)
const trendMax = computed(() => {
  const max = Math.max(...filteredTrendData.value.map(d => d.amount), 1)
  return Math.ceil(max / 500000) * 500000
})

// SVG 포인트 계산
const trendSvgPoints = computed(() => {
  const data = filteredTrendData.value
  if (data.length === 0) return []
  const w = 900, h = 220, px = 55, py = 25
  const stepX = data.length > 1 ? (w - px * 2) / (data.length - 1) : 0
  return data.map((d, i) => {
    const x = px + i * stepX
    const y = py + (1 - d.amount / trendMax.value) * (h - py * 2)
    return { x, y, ...d }
  })
})
const trendPolyline = computed(() => trendSvgPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const trendChartWidth = computed(() => {
  const n = filteredTrendData.value.length
  return Math.max(900, n * 32)
})

// Y축 눈금 (50만원 단위)
const yTicks = computed(() => {
  const max = trendMax.value
  const step = 500000
  const ticks = []
  for (let v = 0; v <= max; v += step) {
    ticks.push(v)
  }
  return ticks.reverse()
})

// 기간 초기화
const resetTrendRange = () => {
  trendStartDate.value = ''
  trendEndDate.value = ''
  pickState.value = 'start'
  hoveredDate.value = ''
  showCalendar.value = false
}
const pdfTemplateRef = ref(null)

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
const switchTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}
const goToItemSummary = () => router.push('/store/settlement/items')
const goToVoucherList = () => router.push('/store/settlement/vouchers')
const goToVoucherWithFilter = (filterType) => {
  const query = { filter: filterType }
  if (activeTab.value === 'daily') {
    query.date = selectedDate.value
  } else {
    query.month = selectedMonth.value
  }
  router.push({ path: '/store/settlement/vouchers', query })
}

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

/* ── PDF 다운로드 ── */
const downloadPDF = () => {
  const d = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value
  const element = pdfTemplateRef.value
  
  const opt = {
    margin: 10,
    filename: `Settlement_Receipt_${d}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(opt).from(element).save()
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 타이틀 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">정산 관리</h1>
        <p class="page-desc">일별 · 월별 정산 현황을 확인하세요.</p>
      </div>
      <div class="header-actions">

        <button class="action-btn receipt-btn" @click="downloadPDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          정산 영수증 다운로드 (PDF)
        </button>
        <button v-if="activeTab === 'monthly'" class="action-btn voucher-btn" @click="goToVoucherList">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          전표 상세 보기
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="switchTab('daily')">일별 정산</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="switchTab('monthly')">월별 정산</button>
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
      <div class="summary-card primary clickable" @click="goToVoucherWithFilter('sales')">
        <span class="s-label">총 매출</span>
        <p class="s-value">₩ {{ fmt(currentSettlement.totalSales) }}</p>
      </div>
      <div class="summary-card refund clickable" @click="goToVoucherWithFilter('refund')">
        <span class="s-label">반품 환급</span>
        <p class="s-value primary-color">₩ {{ fmt(currentSettlement.returnRefund) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('order')">
        <span class="s-label">발주 대금</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.orderCost) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('shipping')">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.shippingFee) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('loss')">
        <span class="s-label">손실</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.loss) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('commission')">
        <span class="s-label">수수료</span>
        <p class="s-value negative">₩ {{ fmt(currentSettlement.commission) }}</p>
      </div>
    </section>

    <!-- 월별 청구/마감 안내 (월별 탭만) -->
    <div v-if="activeTab === 'monthly'" class="notice-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>월 대금 청구: 매달 <strong>15일</strong> &nbsp;|&nbsp; 대금/정산 마감: 매달 <strong>20일</strong></span>
    </div>

    <!-- 매출 현황 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>매출 현황 <span v-if="activeTab === 'monthly'" style="font-size: 0.8rem; font-weight: 400; color: #94a3b8; margin-left: 0.5rem;">매출 기준 상위 5개</span></h3>
        <div class="table-header-actions">
          <button v-if="activeTab === 'monthly'" class="trend-toggle-btn" @click="showSalesTrend = !showSalesTrend">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {{ showSalesTrend ? '매출 추이 닫기' : '매출 추이' }}
          </button>
          <button v-if="activeTab === 'monthly'" class="view-all-btn" @click="$router.push({ path: '/store/settlement/sales-all', query: { month: selectedMonth, tab: 'monthly' } })">전체보기</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th class="text-right">총 판매수량</th>
            <th class="text-right">판매가</th>
            <th class="text-right">총 매출</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in (activeTab === 'monthly' ? top5MonthlyItems : currentSalesItems)" :key="idx">
            <td>{{ item.productName }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">₩ {{ fmt(item.unitPrice) }}</td>
            <td class="text-right">₩ {{ fmt(item.totalPrice) }}</td>
          </tr>
          <tr class="total-row">
            <td><strong>합계</strong></td>
            <td class="text-right"><strong>{{ currentSalesItems.reduce((s, i) => s + i.quantity, 0) }}</strong></td>
            <td></td>
            <td class="text-right"><strong>₩ {{ fmt(currentSettlement.totalSales) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 매출 추이 차트 -->
    <div v-if="showSalesTrend && activeTab === 'monthly'" class="trend-chart-card">
      <div class="trend-chart-header">
        <h3>📈 일자별 매출 추이</h3>
        <div class="trend-range-info">
          <div class="cal-trigger-wrap">
            <button class="cal-trigger-btn" @click="showCalendar = !showCalendar">
              📅 {{ rangeLabel }}
            </button>
            <!-- 달력 팝업 -->
            <div v-if="showCalendar" class="cal-dropdown">
              <div class="cal-dropdown-header">
                <span class="cal-month-label">{{ selectedMonth.split('-')[0] }}년 {{ selectedMonth.split('-')[1] }}월</span>
                <span class="cal-hint">{{ pickState === 'start' ? '시작일 선택' : '종료일 선택' }}</span>
              </div>
              <div class="cal-weekdays">
                <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
              </div>
              <div class="cal-grid">
                <div
                  v-for="(cell, i) in calendarDays"
                  :key="i"
                  :class="['cal-day', cell ? getDayClass(cell.date) : 'empty']"
                  @click="cell && onDayClick(cell.date)"
                  @mouseenter="cell && (hoveredDate = cell.date)"
                  @mouseleave="hoveredDate = ''"
                >
                  <span v-if="cell">{{ cell.day }}</span>
                </div>
              </div>
            </div>
          </div>
          <button v-if="trendStartDate" class="range-reset-btn" @click="resetTrendRange">초기화</button>
        </div>
      </div>
      <div class="trend-chart-body">
        <div class="trend-chart-scroll">
          <svg :viewBox="`0 0 ${trendChartWidth} 260`" :style="{ width: trendChartWidth + 'px', minWidth: '100%' }" class="trend-svg">
            <!-- 가로 가이드 라인 -->
            <line v-for="(tick, i) in yTicks" :key="'g'+i" x1="55" :x2="trendChartWidth - 20" :y1="25 + i * (170 / (yTicks.length - 1))" :y2="25 + i * (170 / (yTicks.length - 1))" stroke="#e2e8f0" stroke-width="1" />
            <!-- Y축 라벨 (10만원 단위) -->
            <text v-for="(tick, i) in yTicks" :key="'yl'+i" x="50" :y="29 + i * (170 / (yTicks.length - 1))" text-anchor="end" fill="#94a3b8" font-size="10">{{ tick >= 10000 ? (tick / 10000) + '만' : fmt(tick) }}</text>
            <!-- 영역 채우기 -->
            <polygon v-if="trendSvgPoints.length > 1" :points="`55,195 ${trendPolyline} ${trendSvgPoints[trendSvgPoints.length-1].x},195`" fill="url(#trendGrad)" opacity="0.12" />
            <!-- 선 -->
            <polyline v-if="trendSvgPoints.length > 1" :points="trendPolyline" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 포인트 -->
            <g v-for="(p, i) in trendSvgPoints" :key="i">
              <circle :cx="p.x" :cy="p.y" r="4" fill="white" stroke="#6366f1" stroke-width="2" class="trend-point" />
              <text :x="p.x" :y="p.y - 12" text-anchor="middle" fill="#475569" font-size="8.5" font-weight="600" class="trend-value-label">₩{{ fmt(p.amount) }}</text>
            </g>
            <!-- X축 라벨 (일자) -->
            <text v-for="(p, i) in trendSvgPoints" :key="'xl'+i" :x="p.x" y="248" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="500">{{ p.label }}일</text>
            <!-- 그라데이션 -->
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="trend-summary">
          <span>조회 기간: <strong>{{ filteredTrendData.length }}일</strong></span>
          <span>합계: <strong>₩{{ fmt(filteredTrendData.reduce((s, d) => s + d.amount, 0)) }}</strong></span>
          <span>평균: <strong>₩{{ fmt(Math.round(filteredTrendData.reduce((s, d) => s + d.amount, 0) / (filteredTrendData.length || 1))) }}</strong></span>
        </div>
      </div>
    </div>

    <!-- 발주내역 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>발주내역 <span v-if="activeTab === 'monthly'" style="font-size: 0.8rem; font-weight: 400; color: #94a3b8; margin-left: 0.5rem;">수량 기준 상위 5개</span></h3>
        <button v-if="activeTab === 'monthly'" class="view-all-btn" @click="$router.push({ path: '/store/settlement/orders-all', query: { month: selectedMonth, tab: 'monthly' } })">전체보기</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>제품명</th>
            <th class="text-right">총 수량</th>
            <th class="text-right">개당 가격</th>
            <th class="text-right">총 금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(order, idx) in (activeTab === 'monthly' ? top5MonthlyOrders : orderHistory)" :key="idx">
            <td>{{ order.product }}</td>
            <td class="text-right">{{ order.qty }}</td>
            <td class="text-right">₩ {{ fmt(order.unitPrice) }}</td>
            <td class="text-right"><strong>₩ {{ fmt(order.total) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>


  </div>

  <!-- PDF 출력을 위한 숨겨진 영수증 템플릿 -->
  <div style="display: none;">
    <div ref="pdfTemplateRef" class="pdf-receipt-content">
      <div class="receipt-card-pdf">
        <div class="receipt-header">
          <h2>정산 영수증</h2>
          <div class="sub-header">RECEIPT</div>
          <div class="brand">Chain-G 정산 시스템</div>
        </div>
        
        <div class="receipt-info">
          <div class="info-row">
            <span class="label">가맹점 :</span>
            <span class="value">본인 가맹점 (S001)</span>
          </div>
          <div class="info-row">
            <span class="label">정산 기간 :</span>
            <span class="value">{{ activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth) }}</span>
          </div>
          <div class="info-row">
            <span class="label">발행일 :</span>
            <span class="value">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <div class="section">
          <h3>매출 내역</h3>
          <div class="item-row">
            <span>주문 list 합계</span>
            <span class="amount text-red">{{ fmt(currentSettlement.totalSales) }}원</span>
          </div>
          <div class="total-box-pdf">
            <span>총 매출</span>
            <span class="total-amount">{{ fmt(currentSettlement.totalSales) }}</span>
          </div>
        </div>

        <div class="section">
          <h3>차감 내역</h3>
          <div class="item-row">
            <span>발주 대금 (상품list)</span>
            <span class="amount text-red">-{{ fmt(currentSettlement.orderCost) }}원</span>
          </div>
          <div class="item-row">
            <span>배송비</span>
            <span class="amount text-red">-{{ fmt(currentSettlement.shippingFee) }}원</span>
          </div>
          <div class="item-row">
            <span>수수료</span>
            <span class="amount text-red">-{{ fmt(currentSettlement.commission) }}원</span>
          </div>
          <div class="item-row">
            <span>손실</span>
            <span class="amount text-red">-{{ fmt(currentSettlement.loss) }}원</span>
          </div>
        </div>

        <div class="section">
          <h3>환급 내역</h3>
          <div class="item-row">
            <span>반품 환급</span>
            <span class="amount text-green">+{{ fmt(currentSettlement.returnRefund) }}원</span>
          </div>
        </div>

        <div class="section-divider"></div>

        <div class="final-box-pdf">
          <span>최종 정산 금액</span>
          <span class="final-amount">{{ fmt(currentSettlement.finalAmount) }}</span>
        </div>

        <div class="calculation-guide">
          총 매출 - (발주대금+배송비+수수료+손실)+반품 환급
        </div>

        <div class="section-divider"></div>

        <div class="footer-msg">
          <p>본 문서는 공식 정식 영수증입니다.</p>
          <p>세무 신고 및 회계 처리 시 보관하시기 바랍니다.</p>
        </div>
      </div>
    </div>
  </div>


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
.receipt-btn { background: #ef4444; color: white; }
.receipt-btn:hover { background: #dc2626; }
.voucher-btn { background: #10b981; color: white; }
.voucher-btn:hover { background: #059669; }

/* ── PDF 전용 스타일 ── */
.pdf-receipt-content { padding: 40px; background: white; width: 800px; color: black; font-family: sans-serif; }
.receipt-card-pdf { border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; background: white; }
.receipt-header { text-align: center; margin-bottom: 30px; }
.receipt-header h2 { font-size: 24px; font-weight: 800; margin: 0; }
.sub-header { font-size: 14px; color: #94a3b8; font-weight: 600; margin: 5px 0; }
.brand { font-size: 13px; color: #64748b; }
.section-divider { height: 2px; background: #000; margin: 20px 0; }
.receipt-info .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
.receipt-info .label { font-weight: 700; }
.section h3 { font-size: 16px; font-weight: 800; margin-bottom: 15px; }
.item-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
.item-row .amount.text-red { color: #ef4444; }
.item-row .amount.text-green { color: #10b981; }
.total-box-pdf { background: #eff6ff; border-radius: 50px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin: 10px 0 30px; }
.total-box-pdf .total-amount { font-weight: 800; font-size: 20px; }
.final-box-pdf { background: #eff6ff; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.final-box-pdf span:first-child { font-weight: 800; font-size: 18px; }
.final-box-pdf .final-amount { font-weight: 800; font-size: 24px; }
.calculation-guide { background: #e2e8f0; border-radius: 50px; padding: 12px; text-align: center; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 30px; }
.footer-msg { text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; }

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
.rank-cell { color: var(--text-light); font-weight: 700; font-size: 0.85rem; text-align: center; }
.view-all-btn { padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--primary); background: white; color: var(--primary); cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
.view-all-btn:hover { background: var(--primary); color: white; }
.table-header-actions { display: flex; gap: 0.5rem; align-items: center; }
.trend-toggle-btn { display: flex; align-items: center; gap: 0.35rem; padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid #6366f1; background: white; color: #6366f1; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.2s; }
.trend-toggle-btn:hover { background: #6366f1; color: white; }

/* ── 매출 추이 차트 ── */
.trend-chart-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.trend-chart-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.75rem; }
.trend-chart-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.trend-range-info { display: flex; align-items: center; gap: 0.75rem; }
.range-reset-btn { padding: 0.35rem 0.75rem; border-radius: 8px; border: 1px solid #ef4444; background: white; color: #ef4444; cursor: pointer; font-size: 0.78rem; font-weight: 600; transition: all 0.2s; }
.range-reset-btn:hover { background: #ef4444; color: white; }

/* ── 달력 팝업 ── */
.cal-trigger-wrap { position: relative; }
.cal-trigger-btn { padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; color: var(--text-dark); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; white-space: nowrap; }
.cal-trigger-btn:hover { border-color: #6366f1; color: #6366f1; }
.cal-dropdown { position: absolute; top: calc(100% + 6px); right: 0; z-index: 100; background: white; border: 1px solid var(--border-color); border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.12); padding: 1rem; width: 280px; }
.cal-dropdown-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.cal-month-label { font-size: 0.9rem; font-weight: 700; color: var(--text-dark); }
.cal-hint { font-size: 0.75rem; color: #6366f1; font-weight: 600; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.7rem; font-weight: 600; color: var(--text-light); margin-bottom: 0.25rem; }
.cal-weekdays span:first-child { color: #ef4444; }
.cal-weekdays span:last-child { color: #3b82f6; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-day { display: flex; align-items: center; justify-content: center; height: 34px; border-radius: 8px; font-size: 0.82rem; font-weight: 500; cursor: pointer; color: var(--text-dark); transition: all 0.12s; user-select: none; }
.cal-day:hover:not(.empty) { background: #ede9fe; }
.cal-day.empty { cursor: default; }
.cal-day.range-start { background: #6366f1; color: white; border-radius: 8px 0 0 8px; font-weight: 700; }
.cal-day.range-end { background: #6366f1; color: white; border-radius: 0 8px 8px 0; font-weight: 700; }
.cal-day.range-start.range-end { border-radius: 8px; }
.cal-day.in-range { background: #ede9fe; color: #6366f1; border-radius: 0; font-weight: 600; }
.cal-day.hover-range { background: #f5f3ff; border-radius: 0; }

.trend-chart-body { padding: 1.5rem; }
.trend-chart-scroll { overflow-x: auto; padding-bottom: 0.5rem; }
.trend-svg { height: 260px; display: block; }
.trend-point { transition: r 0.15s; }
.trend-point:hover { r: 6; }
.trend-value-label { opacity: 0; transition: opacity 0.15s; }
.trend-point:hover + .trend-value-label, g:hover .trend-value-label { opacity: 1; }
.trend-summary { display: flex; gap: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 1rem; font-size: 0.85rem; color: var(--text-light); flex-wrap: wrap; }

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
