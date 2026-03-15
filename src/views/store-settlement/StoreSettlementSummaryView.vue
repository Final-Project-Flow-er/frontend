<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { franchiseSettlementsApi } from '@/api/franchiseSettlements.js'

const route = useRoute()
const router = useRouter()

/* ── 탭 ── */
const activeTab = ref(route.query.tab === 'monthly' ? 'monthly' : 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 실데이터 상태 ── */
const settlementData = ref({
    totalSaleAmount: 0,
    orderAmount: 0,
    deliveryFee: 0,
    commissionFee: 0,
    refundAmount: 0,
    lossAmount: 0,
    finalAmount: 0
})

const salesItems = ref([])
const orderItems = ref([])
const trendData = ref([])

const isLoading = ref(false)

/* ── 데이터 페칭 ── */
const fetchData = async () => {
    isLoading.value = true
    
    // Reset data to avoid stale data display
    settlementData.value = {
        totalSaleAmount: 0,
        orderAmount: 0,
        deliveryFee: 0,
        commissionFee: 0,
        refundAmount: 0,
        lossAmount: 0,
        finalAmount: 0
    }
    salesItems.value = []
    orderItems.value = []
    
    try {
        if (activeTab.value === 'daily') {
            const [summaryRes, salesRes, ordersRes] = await Promise.all([
                franchiseSettlementsApi.getDailySummary(selectedDate.value),
                franchiseSettlementsApi.getDailySalesItems(selectedDate.value, 5),
                franchiseSettlementsApi.getDailyOrderItems(selectedDate.value, 5)
            ])
            settlementData.value = summaryRes
            salesItems.value = salesRes
            orderItems.value = ordersRes
        } else {
            const [summaryRes, salesRes, ordersRes] = await Promise.all([
                franchiseSettlementsApi.getMonthlySummary(selectedMonth.value),
                franchiseSettlementsApi.getMonthlySalesItems(selectedMonth.value, 5),
                franchiseSettlementsApi.getMonthlyOrderItems(selectedMonth.value, 5)
            ])
            settlementData.value = summaryRes
            salesItems.value = salesRes
            orderItems.value = ordersRes
            
            // 월별일 때 그래프 데이터도 가져오기
            if (showSalesTrend.value) {
                fetchTrendData()
            }
        }
    } catch (error) {
        console.error('Failed to fetch settlement data:', error)
    } finally {
        isLoading.value = false
    }
}

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
        trendData.value = res
    } catch (error) {
        console.error('Failed to fetch trend data:', error)
    }
}

onMounted(fetchData)

watch([selectedDate, selectedMonth, activeTab], fetchData)

/* ── 모달 & 토글 ── */
const showSalesTrend = ref(false)
const showStartCalendar = ref(false)
const showEndCalendar = ref(false)

watch(showSalesTrend, (val) => {
    if (val && activeTab.value === 'monthly' && trendData.value.length === 0) {
        fetchTrendData()
    }
})

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

const onStartDayClick = (dateStr) => {
  trendStartDate.value = dateStr
  showStartCalendar.value = false
  // 종료일이 시작일보다 빠르면 초기화
  if (trendEndDate.value && trendEndDate.value < dateStr) {
    trendEndDate.value = ''
  }
}

const onEndDayClick = (dateStr) => {
  if (trendStartDate.value && dateStr < trendStartDate.value) return
  trendEndDate.value = dateStr
  showEndCalendar.value = false
}

const getDayClass = (dateStr, type) => {
  if (!dateStr) return ''
  const classes = []
  if (type === 'start' && dateStr === trendStartDate.value) classes.push('selected')
  if (type === 'end' && dateStr === trendEndDate.value) classes.push('selected')
  
  // 종료일 선택 시 시작일보다 이전 날짜 비활성화
  if (type === 'end' && trendStartDate.value && dateStr < trendStartDate.value) classes.push('disabled')
  
  // 범위 표시 (시작/종료일 모두 있을 때)
  if (trendStartDate.value && trendEndDate.value && dateStr >= trendStartDate.value && dateStr <= trendEndDate.value) {
    classes.push('in-range')
  }
  return classes.join(' ')
}

const chartTitle = computed(() => {
  if (trendStartDate.value && trendEndDate.value) {
    const s = trendStartDate.value.substring(5).replace('-', '월 ') + '일'
    const e = trendEndDate.value.substring(5).replace('-', '월 ') + '일'
    return `📈 ${s} ~ ${e} 매출 추이`
  }
  return '📈 월 전체 매출 추이'
})

// 기간 필터 적용된 그래프 데이터
const filteredTrendData = computed(() => {
  let data = trendData.value.map(d => ({
      label: d.date.split('-')[2],
      fullDate: d.date,
      amount: d.amount
  }))
  if (trendStartDate.value && trendEndDate.value) {
    data = data.filter(d => d.fullDate >= trendStartDate.value && d.fullDate <= trendEndDate.value)
  }
  return data
})

// Y축 최대값 (데이터 최대값 기준으로 자동 계산, 최소 10만원)
const trendMax = computed(() => {
  const values = filteredTrendData.value.map(d => d.amount)
  const max = values.length > 0 ? Math.max(...values) : 0
  if (max === 0) return 1000000 
  // 넉넉하게 20% 정도 여유 공간을 둡니다.
  return Math.ceil((max * 1.2) / 100000) * 100000
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

// Smooth 곡선(Catmull-Rom spline 방식과 유사한 Cubic Bezier 계산)
const trendPath = computed(() => {
  const points = trendSvgPoints.value
  if (points.length < 2) return ''
  
  let d = `M ${points[0].x},${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    
    // 단순 곡률 계수 0.2
    const cp1x = curr.x + (next.x - curr.x) * 0.3
    const cp2x = next.x - (next.x - curr.x) * 0.3
    
    d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`
  }
  return d
})

// 영역 채우기용 Path
const trendAreaPath = computed(() => {
  const points = trendSvgPoints.value
  if (points.length < 2) return ''
  const baseLine = 195 // 가로 축 라인 위치
  return `${trendPath.value} L ${points[points.length-1].x},${baseLine} L ${points[0].x},${baseLine} Z`
})
const trendChartWidth = computed(() => {
  const n = filteredTrendData.value.length
  return Math.max(900, n * 32)
})

// Y축 눈금 (5단계 자동 분할)
const yTicks = computed(() => {
  const max = trendMax.value
  const step = max / 4
  const ticks = []
  for (let i = 0; i <= 4; i++) {
    ticks.push(Math.round(i * step))
  }
  return ticks.reverse()
})

// X축 라벨 표시 여부 (5일 간격 및 마지막 날)
const shouldShowXLabel = (day, index, total) => {
  const d = parseInt(day)
  return d === 1 || d % 5 === 0 || index === total - 1
}

// 툴팁 상태
const tooltip = ref({ show: false, x: 0, y: 0, date: '', amount: 0 })
const showTooltip = (e, p) => {
  tooltip.value = {
    show: true,
    x: p.x,
    y: p.y - 10,
    date: p.fullDate,
    amount: p.amount
  }
}
const hideTooltip = () => { tooltip.value.show = false }

// 기간 초기화
const resetTrendRange = () => {
  trendStartDate.value = ''
  trendEndDate.value = ''
  showStartCalendar.value = false
  showEndCalendar.value = false
  hoveredDate.value = ''
}

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n || 0)
const formatDate = (d) => { if(!d) return ''; const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { if(!d) return ''; const [y,m] = d.split('-'); return `${y}년 ${m}월` }

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

const goToVoucherWithFilter = (filterType) => {
  const query = { type: filterType.toUpperCase() }
  if (activeTab.value === 'daily') {
    query.period = 'DAILY'
    query.date = selectedDate.value
  } else {
    query.period = 'MONTHLY'
    query.month = selectedMonth.value
  }
  router.push({ path: '/store/settlement/vouchers', query })
}

/* ── 다운로드 ── */
const downloadExcel = async () => {
    try {
        const res = await franchiseSettlementsApi.getMonthlyExcel(selectedMonth.value)
        if (res && res.startsWith('http')) {
            window.open(res, '_blank')
        } else if (res) {
            alert(res)
        }
    } catch (error) {
        console.error('Failed to download Excel:', error)
        alert('엑셀 다운로드 중 오류가 발생했습니다.')
    }
}

const downloadPDF = async () => {
    try {
        let res
        if (activeTab.value === 'daily') {
            res = await franchiseSettlementsApi.getDailyReceiptPdf(selectedDate.value)
        } else {
            res = await franchiseSettlementsApi.getMonthlyReceiptPdf(selectedMonth.value)
        }
        if (res && res.startsWith('http')) {
            window.open(res, '_blank')
        } else if (res) {
            alert(res)
        }
    } catch (error) {
        console.error('Failed to download PDF:', error)
        alert('PDF 다운로드 중 오류가 발생했습니다.')
    }
}
</script>

<template>
  <div class="content-wrapper" :class="{ 'is-loading': isLoading }">
    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
    </div>

    <!-- 페이지 타이틀 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">정산 관리</h1>
        <p class="page-desc">일별 · 월별 정산 현황을 확인하세요.</p>
      </div>
      <div class="header-actions">
        <button class="action-btn receipt-btn" @click="downloadPDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          정산 영수증 (PDF)
        </button>
        <button v-if="activeTab === 'monthly'" class="action-btn excel-btn" @click="downloadExcel">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          전표 (Excel)
        </button>
        <button class="action-btn voucher-btn" @click="router.push('/store/settlement/vouchers')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          상세 내역
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
      <p class="fs-amount">₩ {{ fmt(settlementData.finalAmount) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card primary clickable" @click="goToVoucherWithFilter('sales')">
        <span class="s-label">총 매출</span>
        <p class="s-value">₩ {{ fmt(settlementData.totalSaleAmount) }}</p>
      </div>
      <div class="summary-card refund clickable" @click="goToVoucherWithFilter('refund')">
        <span class="s-label">반품 환급</span>
        <p class="s-value primary-color">₩ {{ fmt(settlementData.refundAmount) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('order')">
        <span class="s-label">발주 대금</span>
        <p class="s-value negative">₩ {{ fmt(settlementData.orderAmount) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('shipping')">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(settlementData.deliveryFee) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('loss')">
        <span class="s-label">손실</span>
        <p class="s-value negative">₩ {{ fmt(settlementData.lossAmount) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToVoucherWithFilter('commission')">
        <span class="s-label">수수료</span>
        <p class="s-value negative">₩ {{ fmt(settlementData.commissionFee) }}</p>
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
          <button class="view-all-btn" @click="router.push({ path: '/store/settlement/sales', query: { month: selectedMonth, date: selectedDate, tab: activeTab } })">전체보기</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="activeTab === 'monthly'">순위</th>
            <th>상품명</th>
            <th class="text-right">총 판매수량</th>
            <th class="text-right">단가</th>
            <th class="text-right">총 매출</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in salesItems" :key="item.productName">
            <td v-if="activeTab === 'monthly'" class="rank-cell">{{ item.rank }}</td>
            <td>{{ item.productName }}</td>
            <td class="text-right">{{ item.totalQuantity }}</td>
            <td class="text-right">₩ {{ fmt(item.unitPrice) }}</td>
            <td class="text-right">₩ {{ fmt(item.totalSales) }}</td>
          </tr>
          <tr v-if="salesItems.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-400">내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 매출 추이 차트 -->
    <div v-if="showSalesTrend && activeTab === 'monthly' && trendData.length > 0" class="trend-chart-card">
      <div class="trend-chart-header">
        <h3>{{ chartTitle }}</h3>
        <div class="trend-range-info">
          <div class="filter-controls">
            <!-- 시작일 선택 -->
            <div class="cal-trigger-wrap">
              <button class="cal-input-btn" @click="showStartCalendar = !showStartCalendar; showEndCalendar = false">
                <span class="btn-label">시작일</span>
                <span class="btn-value">{{ trendStartDate ? trendStartDate.substring(5).replace('-', '월 ') + '일' : '선택' }}</span>
              </button>
            </div>

            <span class="filter-separator">~</span>

            <!-- 종료일 선택 -->
            <div class="cal-trigger-wrap">
              <button class="cal-input-btn" @click="showEndCalendar = !showEndCalendar; showStartCalendar = false" :disabled="!trendStartDate">
                <span class="btn-label">종료일</span>
                <span class="btn-value">{{ trendEndDate ? trendEndDate.substring(5).replace('-', '월 ') + '일' : '선택' }}</span>
              </button>
            </div>

            <button v-if="trendStartDate || trendEndDate" class="range-reset-btn" @click="resetTrendRange">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              전체 보기
            </button>

            <!-- 중앙 정렬 달력 Popover -->
            <div v-if="showStartCalendar || showEndCalendar" class="cal-dropdown centered">
              <div class="cal-dropdown-header">
                <span class="cal-month-label">{{ selectedMonth.split('-')[0] }}년 {{ selectedMonth.split('-')[1] }}월</span>
                <span class="cal-hint">{{ showStartCalendar ? '시작일 선택' : '종료일 선택' }}</span>
              </div>
              <div class="cal-weekdays">
                <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
              </div>
              <div class="cal-grid">
                <div
                  v-for="(cell, i) in calendarDays"
                  :key="i"
                  :class="['cal-day', cell ? getDayClass(cell.date, showStartCalendar ? 'start' : 'end') : 'empty']"
                  @click="cell && (showStartCalendar ? onStartDayClick(cell.date) : onEndDayClick(cell.date))"
                >
                  <span v-if="cell">{{ cell.day }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="trend-chart-body">
        <div class="trend-chart-scroll">
          <svg :viewBox="`0 0 ${trendChartWidth} 260`" :style="{ width: trendChartWidth + 'px', minWidth: '100%' }" class="trend-svg">
            <!-- 가로 가입드 라인 -->
            <line v-for="(tick, i) in yTicks" :key="'g'+i" x1="55" :x2="trendChartWidth - 20" :y1="25 + i * (170 / (yTicks.length - 1))" :y2="25 + i * (170 / (yTicks.length - 1))" stroke="#e2e8f0" stroke-width="1" />
            <!-- Y축 라벨 -->
            <text v-for="(tick, i) in yTicks" :key="'yl'+i" x="50" :y="29 + i * (170 / (yTicks.length - 1))" text-anchor="end" fill="#94a3b8" font-size="10">{{ tick >= 10000 ? (tick / 10000) + '만' : fmt(tick) }}</text>
            <!-- 영역 채우기 -->
            <path v-if="trendSvgPoints.length > 1" :d="trendAreaPath" fill="url(#trendGrad)" opacity="0.15" />
            
            <!-- 선 (Smooth Path) -->
            <path v-if="trendSvgPoints.length > 1" :d="trendPath" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- 포인트 -->
            <g v-for="(p, i) in trendSvgPoints" :key="i">
              <circle 
                :cx="p.x" :cy="p.y" r="3.5" 
                fill="white" stroke="#6366f1" stroke-width="2" 
                class="trend-point"
                @mouseenter="showTooltip($event, p)"
                @mouseleave="hideTooltip"
              />
            </g>

            <!-- X축 라벨 (5일 간격 필터링) -->
            <text 
              v-for="(p, i) in trendSvgPoints" 
              :key="'xl'+i" 
              v-show="shouldShowXLabel(p.label, i, trendSvgPoints.length)"
              :x="p.x" y="248" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="500"
            >
              {{ p.label }}일
            </text>

            <!-- 커스텀 툴팁 (SVG 내부) -->
            <g v-if="tooltip.show" :transform="`translate(${tooltip.x}, ${tooltip.y})`">
              <rect x="-50" y="-45" width="100" height="38" rx="6" fill="#1e293b" opacity="0.9" />
              <text y="-30" text-anchor="middle" fill="white" font-size="10" font-weight="600">{{ tooltip.date }}</text>
              <text y="-15" text-anchor="middle" fill="#818cf8" font-size="11" font-weight="700">₩{{ fmt(tooltip.amount) }}</text>
              <path d="M -5 -7 L 0 0 L 5 -7 Z" fill="#1e293b" opacity="0.9" />
            </g>
            <!-- 그라데이션 -->
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>

    <!-- 발주내역 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>발주내역 <span v-if="activeTab === 'monthly'" style="font-size: 0.8rem; font-weight: 400; color: #94a3b8; margin-left: 0.5rem;">총액 기준 상위 5개</span></h3>
        <button class="view-all-btn" @click="router.push({ path: '/store/settlement/orders', query: { month: selectedMonth, date: selectedDate, tab: activeTab } })">전체보기</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="activeTab === 'monthly'">순위</th>
            <th>제품명</th>
            <th class="text-right">총 수량</th>
            <th class="text-right">개당 가격</th>
            <th class="text-right">총 금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderItems" :key="order.productName">
            <td v-if="activeTab === 'monthly'" class="rank-cell">{{ order.rank }}</td>
            <td>{{ order.productName }}</td>
            <td class="text-right">{{ order.totalQuantity }}</td>
            <td class="text-right">₩ {{ fmt(order.unitPrice) }}</td>
            <td class="text-right"><strong>₩ {{ fmt(order.totalAmount) }}</strong></td>
          </tr>
          <tr v-if="orderItems.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-400">내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; position: relative; min-height: 400px; }
.is-loading { opacity: 0.6; pointer-events: none; }

.loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 255, 255, 0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
}
.loader {
    width: 40px; height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

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
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
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

/* ── 달력 커스텀 ── */
.filter-controls { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; padding: 0.35rem; border-radius: 12px; position: relative; }
.filter-separator { color: #94a3b8; font-weight: 700; font-size: 0.9rem; }
.cal-trigger-wrap { position: static; }
.cal-input-btn { display: flex; flex-direction: column; align-items: flex-start; padding: 0.4rem 1rem; border-radius: 9px; border: 1px solid transparent; background: white; cursor: pointer; transition: all 0.2s; min-width: 100px; text-align: left; }
.cal-input-btn:hover:not(:disabled) { border-color: var(--primary); box-shadow: 0 2px 8px rgba(99,102,241,0.1); }
.cal-input-btn:disabled { opacity: 0.6; cursor: not-allowed; background: #f8fafc; }
.btn-label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
.btn-value { font-size: 0.85rem; font-weight: 700; color: #1e293b; }

.cal-dropdown { position: absolute; top: calc(100% + 10px); width: 260px; background: white; border: 1px solid var(--border-color); border-radius: 14px; box-shadow: 0 15px 35px rgba(0,0,0,0.12); z-index: 50; padding: 1.25rem; }
.cal-dropdown.centered { left: 50%; transform: translateX(-50%); }
.cal-dropdown-header { margin-bottom: 0.75rem; text-align: center; }
.cal-hint { display: block; font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-top: 2px; }
.cal-month-label { font-weight: 800; font-size: 0.95rem; color: #1e293b; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.5rem; }
.cal-weekdays span { text-align: center; font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-day { height: 32px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; cursor: pointer; border-radius: 8px; transition: all 0.15s; font-weight: 500; color: #475569; }
.cal-day:hover:not(.empty):not(.disabled):not(.selected) { background: #f1f5f9; color: var(--primary); }
.cal-day.selected { background: var(--primary) !important; color: white !important; font-weight: 700; }
.cal-day.disabled { opacity: 0.25; cursor: not-allowed; }
.cal-day.in-range:not(.selected) { background: #eef2ff; color: var(--primary); }

.trend-chart-body { padding: 1.5rem; }
.trend-chart-scroll { overflow-x: auto; padding-bottom: 1rem; }
.trend-svg { display: block; overflow: visible; }
.trend-point { transition: r 0.2s; cursor: pointer; }
.trend-point:hover { r: 6; }

.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.text-center { text-align: center; }
.text-gray-400 { color: #94a3b8; }
</style>
