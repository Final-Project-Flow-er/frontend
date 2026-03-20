<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { settlementsApi } from '@/api/settlements.js'

const route = useRoute()
const router = useRouter()
const franchiseId = route.params.storeId

/* ── 탭 ── */
const activeTab = ref(route.query.tab === 'monthly' ? 'monthly' : 'daily')

/* ── 날짜 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedDate = ref(route.query.date || `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`)
const selectedMonth = ref(route.query.month || `${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 상태 ── */
const isLoading = ref(false)
const storeName = ref('')
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

/* ── 데이터 페칭 ── */
const fetchData = async () => {
    isLoading.value = true
    
    // Reset
    settlementData.value = {
        totalSaleAmount: 0, orderAmount: 0, deliveryFee: 0,
        commissionFee: 0, refundAmount: 0, lossAmount: 0, finalAmount: 0
    }
    salesItems.value = []
    orderItems.value = []
    
    try {
        if (activeTab.value === 'daily') {
            const [summaryRes, salesRes, ordersRes] = await Promise.all([
                settlementsApi.getDailyFranchiseSummary(franchiseId, selectedDate.value),
                settlementsApi.getDailyFranchiseSalesItems(franchiseId, selectedDate.value, 5),
                settlementsApi.getDailyFranchiseOrderItems(franchiseId, selectedDate.value, 5)
            ])
            if (summaryRes) {
                settlementData.value = {
                    ...summaryRes,
                    totalSaleAmount: summaryRes.saleAmount // Backend matching
                }
                storeName.value = summaryRes.franchiseName || '알 수 없는 매장'
            }
            salesItems.value = salesRes || []
            orderItems.value = ordersRes || []
        } else {
            const [summaryRes, salesRes, ordersRes] = await Promise.all([
                settlementsApi.getMonthlyFranchiseSummary(franchiseId, selectedMonth.value),
                settlementsApi.getMonthlyFranchiseSalesItems(franchiseId, selectedMonth.value, 5),
                settlementsApi.getMonthlyFranchiseOrderItems(franchiseId, selectedMonth.value, 5)
            ])
            if (summaryRes) {
                settlementData.value = {
                    ...summaryRes,
                    totalSaleAmount: summaryRes.saleAmount
                }
                storeName.value = summaryRes.franchiseName || '알 수 없는 매장'
            }
            salesItems.value = salesRes || []
            orderItems.value = ordersRes || []
            
            if (showSalesTrend.value) fetchTrendData()
        }
    } catch (error) {
        console.error('Failed to fetch settlement data:', error)
    } finally {
        isLoading.value = false
    }
}

const fetchTrendData = async () => {
    try {
        const res = await settlementsApi.getMonthlyFranchiseSalesTrend(franchiseId, selectedMonth.value)
        trendData.value = res || []
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
const hoveredDate = ref('')

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
  if (trendEndDate.value && trendEndDate.value < dateStr) trendEndDate.value = ''
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
  if (type === 'end' && trendStartDate.value && dateStr < trendStartDate.value) classes.push('disabled')
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

const trendMax = computed(() => {
  const values = filteredTrendData.value.map(d => d.amount)
  const max = values.length > 0 ? Math.max(...values) : 0
  if (max === 0) return 500000 
  return Math.ceil((max * 1.1) / 100000) * 100000
})

const chartW = 900
const chartH = 220
const paddingX = 55
const paddingY = 25

const trendSvgPoints = computed(() => {
  const data = filteredTrendData.value
  if (data.length === 0) return []
  const stepX = data.length > 1 ? (chartW - paddingX * 2) / (data.length - 1) : 0
  return data.map((d, i) => {
    const x = paddingX + i * stepX
    const y = paddingY + (1 - d.amount / trendMax.value) * (chartH - paddingY * 2)
    return { x, y, ...d }
  })
})

const trendPath = computed(() => {
  const points = trendSvgPoints.value
  if (points.length < 2) return ''
  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]; const next = points[i + 1]
    const cp1x = curr.x + (next.x - curr.x) * 0.3
    const cp2x = next.x - (next.x - curr.x) * 0.3
    d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`
  }
  return d
})

const trendAreaPath = computed(() => {
  const points = trendSvgPoints.value
  if (points.length < 2) return ''
  const baseLine = chartH - paddingY
  return `${trendPath.value} L ${points[points.length-1].x},${baseLine} L ${points[0].x},${baseLine} Z`
})

const trendChartWidth = computed(() => {
  const n = filteredTrendData.value.length
  return Math.max(900, n * 32)
})

const yTicks = computed(() => {
  const max = trendMax.value
  const step = 100000
  const count = Math.ceil(max / step)
  const ticks = []
  for (let i = 0; i <= count; i++) ticks.push(i * step)
  return ticks.reverse()
})

const shouldShowXLabel = (day, index, total) => {
  const d = parseInt(day)
  return d === 1 || d % 5 === 0 || index === total - 1
}

const tooltip = ref({ show: false, x: 0, y: 0, date: '', amount: 0 })
const showTooltip = (e, p) => {
  tooltip.value = { show: true, x: p.x, y: p.y - 10, date: p.fullDate, amount: p.amount }
}
const hideTooltip = () => { tooltip.value.show = false }

const resetTrendRange = () => {
  trendStartDate.value = ''; trendEndDate.value = ''
  showStartCalendar.value = false; showEndCalendar.value = false
}

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n || 0)
const formatDate = (d) => { if(!d) return ''; const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { if(!d) return ''; const [y,m] = d.split('-'); return `${y}년 ${m}월` }

/* ── 네비게이션 ── */
const switchTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

const goToVoucherWithFilter = (filterType) => {
  const query = { type: filterType.toUpperCase(), franchiseId }
  if (activeTab.value === 'daily') {
    query.period = 'DAILY'; query.date = selectedDate.value
  } else {
    query.period = 'MONTHLY'; query.month = selectedMonth.value
  }
  router.push({ path: '/hq/settlement/vouchers', query })
}

/* ── 다운로드 ── */
const downloadPDF = async () => {
    try {
        const res = activeTab.value === 'daily'
            ? await settlementsApi.getDailyFranchiseReceiptPdf(franchiseId, selectedDate.value)
            : await settlementsApi.getMonthlyFranchiseReceiptPdf(franchiseId, selectedMonth.value)
        if (res && res.startsWith('http')) window.open(res, '_blank')
        else if (res) alert(res)
    } catch (error) {
        console.error('Failed to download PDF:', error)
        alert('PDF 다운로드 중 오류가 발생했습니다.')
    }
}

const downloadExcel = () => {
  alert('해당 가맹점 상세 엑셀 기능은 준비 중입니다.')
}
</script>

<template>
  <div class="content-wrapper" :class="{ 'is-loading': isLoading }">
    <!-- 로딩 오버레이 -->
    <div v-if="isLoading" class="loading-overlay">
        <div class="loader"></div>
    </div>

    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/hq/settlement')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 class="page-title">{{ storeName }} 정산 상세</h1>
          <p class="page-desc">가맹점 정산 요약 및 상세 내역을 확인하세요.</p>
        </div>
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
        <button class="action-btn voucher-btn" @click="router.push({ path: '/hq/settlement/confirm', query: { month: selectedMonth } })">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          정산 확정 관리
        </button>
      </div>
    </div>

    <!-- 탭 + 날짜 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="switchTab('daily')">일별 정산</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="switchTab('monthly')">월별 정산</button>
      </div>
      <div class="date-wrapper">
        <span class="date-label">{{ activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth) }}</span>
      </div>
    </div>

    <!-- 최종 정산 금액 -->
    <div class="final-settlement-card">
      <div class="fs-left">
        <span class="fs-label">최종 정산 금액</span>
        <p class="fs-formula">발주 대금 + 수수료 - 배송비 - 손실 - 반품 차감액 + 기타 조정</p>
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
        <p class="s-value negative">₩ {{ fmt(settlement.deliveryFee) }}</p>
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

    <!-- 매출 현황 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>매출 현황 <span v-if="activeTab === 'monthly'" style="font-size: 0.8rem; font-weight: 400; color: #94a3b8; margin-left: 0.5rem;">매출 기준 상위 5개</span></h3>
        <div class="table-header-actions">
          <button v-if="activeTab === 'monthly'" class="trend-toggle-btn" @click="showSalesTrend = !showSalesTrend">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {{ showSalesTrend ? '매출 추이 닫기' : '매출 추이' }}
          </button>
          <button class="view-all-btn" @click="goToVoucherWithFilter('sales')">전체보기</button>
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
            <div class="cal-trigger-wrap">
              <button class="cal-input-btn" @click="showStartCalendar = !showStartCalendar; showEndCalendar = false">
                <span class="btn-label">시작일</span>
                <span class="btn-value">{{ trendStartDate ? trendStartDate.substring(5).replace('-', '월 ') + '일' : '선택' }}</span>
              </button>
            </div>
            <span class="filter-separator">~</span>
            <div class="cal-trigger-wrap">
              <button class="cal-input-btn" @click="showEndCalendar = !showEndCalendar; showStartCalendar = false" :disabled="!trendStartDate">
                <span class="btn-label">종료일</span>
                <span class="btn-value">{{ trendEndDate ? trendEndDate.substring(5).replace('-', '월 ') + '일' : '선택' }}</span>
              </button>
            </div>
            <button v-if="trendStartDate || trendEndDate" class="range-reset-btn" @click="resetTrendRange">전체 보기</button>

            <!-- 달력 Popover -->
            <div v-if="showStartCalendar || showEndCalendar" class="cal-dropdown centered">
              <div class="cal-dropdown-header">
                <span class="cal-month-label">{{ selectedMonth.split('-')[0] }}년 {{ selectedMonth.split('-')[1] }}월</span>
              </div>
              <div class="cal-weekdays">
                <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
              </div>
              <div class="cal-grid">
                <div v-for="(cell, i) in calendarDays" :key="i"
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
            <line v-for="(tick, i) in yTicks" :key="'g'+i" x1="55" :x2="trendChartWidth - 20" :y1="paddingY + (1 - tick / trendMax) * (chartH - paddingY * 2)" :y2="paddingY + (1 - tick / trendMax) * (chartH - paddingY * 2)" stroke="#e2e8f0" stroke-width="1" />
            <text v-for="(tick, i) in yTicks" :key="'yl'+i" x="50" :y="paddingY + 4 + (1 - tick / trendMax) * (chartH - paddingY * 2)" text-anchor="end" fill="#94a3b8" font-size="10">{{ tick >= 10000 ? (tick / 10000) + '만' : fmt(tick) }}</text>
            <path v-if="trendSvgPoints.length > 1" :d="trendAreaPath" fill="url(#trendGrad)" opacity="0.15" />
            <path v-if="trendSvgPoints.length > 1" :d="trendPath" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <g v-for="(p, i) in trendSvgPoints" :key="i">
              <circle :cx="p.x" :cy="p.y" r="3.5" fill="white" stroke="#6366f1" stroke-width="2" class="trend-point" @mouseenter="showTooltip($event, p)" @mouseleave="hideTooltip" />
            </g>
            <text v-for="(p, i) in trendSvgPoints" :key="'xl'+i" v-show="shouldShowXLabel(p.label, i, trendSvgPoints.length)" :x="p.x" y="248" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="500">
              {{ p.label }}일
            </text>
            <g v-if="tooltip.show" :transform="`translate(${tooltip.x}, ${tooltip.y})`">
              <rect x="-50" y="-45" width="100" height="38" rx="6" fill="#1e293b" opacity="0.9" />
              <text y="-30" text-anchor="middle" fill="white" font-size="10" font-weight="600">{{ tooltip.date }}</text>
              <text y="-15" text-anchor="middle" fill="#818cf8" font-size="11" font-weight="700">₩{{ fmt(tooltip.amount) }}</text>
              <path d="M -5 -7 L 0 0 L 5 -7 Z" fill="#1e293b" opacity="0.9" />
            </g>
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
        <button class="view-all-btn" @click="goToVoucherWithFilter('order')">전체보기</button>
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
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ── 페이지 헤더 ── */
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; cursor: pointer; color: #64748b; transition: all 0.2s; }
.back-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0 0 0.25rem; }
.page-desc { color: #64748b; font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.action-btn:hover { transform: translateY(-1px); }
.excel-btn { background: #1e293b; color: white; }
.receipt-btn { background: #ef4444; color: white; }
.voucher-btn { background: #10b981; color: white; }

/* ── 컨트롤 바 ── */
.control-bar { display: flex; align-items: center; margin-bottom: 1.5rem; gap: 0.75rem; flex-wrap: wrap; }
.tab-group { display: flex; background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
.tab-group button { padding: 0.65rem 1.5rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.9rem; color: #64748b; transition: all 0.2s; }
.tab-group button.active { background: #475569; color: white; }
.date-wrapper { display: inline-flex; align-items: center; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.65rem 1.2rem; background: #f8fafc; min-width: 150px; }
.date-label { font-size: 1rem; font-weight: 700; color: #1e293b; }

/* ── 요약 카드 ── */
.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.summary-grid .summary-card:nth-child(1),
.summary-grid .summary-card:nth-child(2) { grid-column: span 2; }
.summary-card { background: white; padding: 1.25rem 1.5rem; border-radius: 14px; border: 1px solid #e2e8f0; transition: transform 0.15s, box-shadow 0.15s; }
.summary-card.clickable { cursor: pointer; }
.summary-card.clickable:hover { border-color: #475569; box-shadow: 0 4px 16px rgba(71,85,105,0.15); transform: translateY(-2px); }
.s-label { font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.35rem; }
.s-value { font-size: 1.5rem; font-weight: 700; margin: 0; color: #1e293b; text-align: right; }
.s-value.negative { color: #ef4444; }
.s-value.primary-color { color: #6366f1; }

.final-settlement-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.5rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }
.fs-label { font-size: 1rem; font-weight: 700; }
.fs-formula { font-size: 0.75rem; opacity: 0.8; margin: 0; }
.fs-amount { font-size: 2rem; font-weight: 800; margin: 0; }

/* ── 데이터 테이블 ── */
.data-table-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.5rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: #64748b; font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
.text-right { text-align: right; }
.rank-cell { color: #94a3b8; font-weight: 700; }
.view-all-btn { padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid #6366f1; background: white; color: #6366f1; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.view-all-btn:hover { background: #6366f1; color: white; }

/* ── 차트 ── */
.trend-chart-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 1.5rem; }
.trend-chart-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
.filter-controls { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; padding: 0.35rem; border-radius: 12px; position: relative; }
.cal-input-btn { display: flex; flex-direction: column; align-items: flex-start; padding: 0.4rem 1rem; border-radius: 9px; border: 1px solid transparent; background: white; cursor: pointer; min-width: 100px; }
.cal-dropdown { position: absolute; top: calc(100% + 10px); width: 260px; background: white; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 15px 35px rgba(0,0,0,0.12); z-index: 50; padding: 1.25rem; }
.cal-dropdown.centered { left: 50%; transform: translateX(-50%); }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.cal-day { height: 32px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; cursor: pointer; border-radius: 8px; }
.cal-day.selected { background: #6366f1; color: white; font-weight: 700; }
.cal-day.in-range { background: #eef2ff; color: #6366f1; }
.trend-chart-body { padding: 1.5rem; }
.trend-chart-scroll { overflow-x: auto; }
.py-8 { padding: 2rem 0; }
.text-center { text-align: center; }
.text-gray-400 { color: #94a3b8; }
</style>
