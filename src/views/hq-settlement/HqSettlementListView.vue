<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import html2pdf from 'html2pdf.js'

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
  totals.value.orderCost + totals.value.commission + totals.value.shipping - totals.value.refund - totals.value.loss
)

const getFinal = (s) => s.orderCost + s.commission + s.shipping - s.refund - s.loss

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
const formatDate = (d) => { const [y,m,dd] = d.split('-'); return `${y}년 ${m}월 ${dd}일` }
const formatMonth = (d) => { const [y,m] = d.split('-'); return `${y}년 ${m}월` }
/* ── 날짜 피커 ── */
const dateRef = ref(null)
const monthRef = ref(null)
const openDatePicker = () => { dateRef.value?.showPicker() }
const openMonthPicker = () => { monthRef.value?.showPicker() }

/* ── 개별 영수증 PDF 다운로드 ── */
const individualReceiptRef = ref(null)
const selectedReceiptStore = ref(null)
const downloadStorePDF = (store) => {
  selectedReceiptStore.value = store
  // 템플릿 데이터가 반영될 시간을 주기 위해 nextTick이나 setTimeout 사용
  setTimeout(() => {
    const element = document.querySelector('.hq-individual-pdf-wrap')
    const opt = {
      margin: 10,
      filename: `Receipt_${store.name}_${selectedDate.value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    html2pdf().set(opt).from(element).save()
  }, 100)
}

/* ── 전체 영수증 PDF 다운로드 ── */
const batchReceiptRef = ref(null)
const downloadBatchPDF = () => {
  const element = document.querySelector('.hq-batch-pdf-wrap')
  const opt = {
    margin: 10,
    filename: `Settlement_Batch_Summary_${selectedDate.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  html2pdf().set(opt).from(element).save()
}

/* ── 상세 이동 ── */
const goToSummaryDetail = (type) => {
  router.push({
    path: '/hq/settlement/summary-detail',
    query: {
      type,
      date: selectedDate.value,
      month: selectedMonth.value,
      tab: activeTab.value
    }
  })
}

const goToDetail = (storeId) => {
  router.push({ path: `/hq/settlement/detail/${storeId}`, query: { date: selectedDate.value, month: selectedMonth.value, tab: activeTab.value } })
}

const getStatusClass = (status) => ({
  '정산완료': 'status-done',
  '대기': 'status-wait',
  '확정': 'status-confirmed',
 }[status] || '')

import SettlementTrendChart from '@/components/settlement/SettlementTrendChart.vue'

/* ── 추이 그래프 데이터 ── */
const trendStartDate = ref(selectedDate.value)
const trendEndDate = ref(selectedDate.value)

const trendStartRef = ref(null)
const trendEndRef = ref(null)
const openTrendStart = () => trendStartRef.value?.showPicker()
const openTrendEnd = () => trendEndRef.value?.showPicker()

const trendData = computed(() => {
  const data = []
  if (!trendStartDate.value || !trendEndDate.value) return []
  
  const start = new Date(trendStartDate.value)
  const end = new Date(trendEndDate.value)
  if (start > end) return []
  
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
  // 데이터가 너무 많으면 간격을 둠 (최대 20개 포인트 정도)
  const step = diffDays > 20 ? Math.ceil(diffDays / 20) : 1
  
  for (let i = 0; i < diffDays; i += step) {
    const curr = new Date(start)
    curr.setDate(curr.getDate() + i)
    const label = `${curr.getMonth() + 1}/${curr.getDate()}`
    const seedKey = `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`
    const s = seed(seedKey + 'trend')
    const val = round100(seededRand(s, 3000000, 8000000))
    data.push({ label, value: val })
  }
  return data
})

import * as XLSX from 'xlsx'

/* ── 엑셀(.xlsx) 다운로드 ── */
const downloadExcel = () => {
  const d = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value
  
  // 1. 전표 데이터 준비 (Flat Table style for Filtering)
  const voucherData = []
  const types = [
    { id: 'sales', label: '판매', side: 'debit' },
    { id: 'refund', label: '반품', side: 'debit' },
    { id: 'orderCost', label: '발주', side: 'credit' },
    { id: 'shipping', label: '배송', side: 'credit' },
    { id: 'loss', label: '손실', side: 'credit' },
    { id: 'commission', label: '수수료', side: 'credit' }
  ]

  stores.value.forEach(store => {
    types.forEach(type => {
      const amount = store[type.id]
      if (amount === 0) return

      const base = seed(d + store.id + type.id)
      const count = seededRand(base, 2, 4)
      let storeCatAmount = 0

      for (let j = 0; j < count; j++) {
        const isLast = j === count - 1
        const partAmount = isLast ? (amount - storeCatAmount) : round100(seededRand(base + j, amount / count / 0.8, amount / count))
        storeCatAmount += partAmount

        const hour = 10 + j
        const minute = seededRand(base + j, 0, 59)
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2,'0')}`
        const voucherId = `${type.id.substring(0,2).toUpperCase()}-${store.id}-${d.replace(/-/g,'')}-${j+1}`
        const desc = getDetailedDesc(type.id, j, store.id)

        voucherData.push({
          '구분': type.label,
          '가맹점명': store.name,
          '전표번호': voucherId,
          '일시': `${d} ${time}`,
          '내역상세': desc,
          '차변(입금/매출)': type.side === 'debit' ? partAmount : 0,
          '대변(출금/비용)': type.side === 'credit' ? partAmount : 0,
        })
      }
    })
  })

  // [정렬] 사용자가 원하시는 대로 '판매' 등이 먼저 보이게 구분순으로 정렬
  const sortOrder = { '판매':1, '반품':2, '발주':3, '배송':4, '손실':5, '수수료':6 }
  voucherData.sort((a, b) => sortOrder[a['구분']] - sortOrder[b['구분']])

  // 2. 요약 데이터 준비
  const summaryData = [
    { '항목': '총 매출 합계', '금액': totals.value.sales, '비고': '전체 가맹점 판매 합산' },
    { '항목': '총 차감 합계', '금액': (totals.value.orderCost + totals.value.shipping + totals.value.commission + totals.value.loss), '비고': '발주/배송/수수료/손실 합산' },
    { '항목': '총 환급 합계', '금액': totals.value.refund, '비고': '반품 환급 합산' },
    { '항목': '최종 정산 금액', '금액': totalFinal.value, '비고': '매출 - 차감 + 환급' }
  ]

  // 3. 워크북 생성
  const wb = XLSX.utils.book_new()
  
  // 시트 1: 상세 전표 내역
  const wsVouchers = XLSX.utils.json_to_sheet(voucherData)
  
  // [필터 적용] 헤더 행에 오토필터 추가
  const range = XLSX.utils.decode_range(wsVouchers['!ref'])
  wsVouchers['!autofilter'] = { ref: XLSX.utils.encode_range({ s: {c:0, r:0}, e: {c:6, r:range.e.r} }) }
  
  // 컬럼 너비 설정
  wsVouchers['!cols'] = [
    { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 45 }, { wch: 15 }, { wch: 15 }
  ]

  // 시트 2: 정산 요약
  const wsSummary = XLSX.utils.json_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 30 }]

  XLSX.utils.book_append_sheet(wb, wsVouchers, '상세전표내역')
  XLSX.utils.book_append_sheet(wb, wsSummary, '정산요약')

  // 4. 파일 쓰기 및 다운로드
  XLSX.writeFile(wb, `Settlement_Master_${d}.xlsx`)
}

const getDetailedDesc = (field, idx, storeId) => {
  const baseId = idx + 1
  const recipes = ['오리지널 떡볶이', '마라 떡볶이', '로제 떡볶이']
  const levels = ['순한맛', '기본맛', '매운맛']
  
  if (field === 'sales') {
    return `판매 완료 | 상품 ${baseId} × ${10+idx} @ ${fmt(12000+idx*1000)}원 | 주문번호: OD${storeId}${20260211000+idx}`
  }
  if (field === 'refund') {
    return `반품 환급 | ${recipes[idx % 3]} ${levels[idx % 3]} 파손 건 | 반품코드: RE${storeId}${100+idx}`
  }
  if (field === 'orderCost') {
    return `본사 출고 확정 | 발주 대금 결제 | 발주번호: HEAD20260210${String(baseId).padStart(3,'0')}`
  }
  if (field === 'shipping') {
    return `배송 완료 | 기본/할증료 합산 | 배송코드: SH${storeId}${500+idx}`
  }
  if (field === 'loss') {
    return `폐기/손실 처리 | 유효기간 경과 외 | 전표: LS${storeId}${idx}`
  }
  if (field === 'commission') {
    return `정산 수수료 3% 외 | 플랫폼 및 결제 수수료 | 대상액: ${fmt(500000+idx*50000)}`
  }
  return '기타 내역'
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
        <span class="fc-label">최종 정산 금액</span>
        <span class="fc-formula">발주 대금 + 수수료 + 배송비 - 반품 차감액 - 본사 부담 손실</span>
      </div>
      <p class="fc-amount">₩ {{ fmt(totalFinal) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card clickable" @click="goToSummaryDetail('orderCost')">
        <span class="s-label">발주 매출</span>
        <p class="s-value positive">₩ {{ fmt(totals.orderCost) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('commission')">
        <span class="s-label">수수료 수익</span>
        <p class="s-value positive">₩ {{ fmt(totals.commission) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('shipping')">
        <span class="s-label">배송 수익</span>
        <p class="s-value positive">₩ {{ fmt(totals.shipping) }}</p>
      </div>
      <div class="summary-card refund-card clickable" @click="goToSummaryDetail('refund')">
        <span class="s-label">반품 차감액</span>
        <p class="s-value negative">₩ {{ fmt(totals.refund) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('loss')">
        <span class="s-label">본사 손실</span>
        <p class="s-value negative">₩ {{ fmt(totals.loss) }}</p>
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
            <th class="text-right">최종 정산</th>
            <th class="text-center">상태</th>
            <th class="text-center">영수증</th>
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
            <td class="text-center">
              <button class="row-receipt-btn" @click="downloadStorePDF(s)">PDF</button>
            </td>
            <td class="text-center">
              <button class="detail-btn" @click="goToDetail(s.id)">상세</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 추이 그래프 (선 그래프) -->
    <div class="trend-section">
      <div class="section-header">
        <h3>전체 가맹점 정산 추이</h3>
        <div class="trend-range-box">
          <div class="date-pick-wrap" @click="openTrendStart">
            <span>{{ trendStartDate.replace(/-/g, '. ') }}.</span>
            <input ref="trendStartRef" type="date" v-model="trendStartDate" class="date-input-hidden" />
          </div>
          <span class="range-sep">~</span>
          <div class="date-pick-wrap" @click="openTrendEnd">
            <span>{{ trendEndDate.replace(/-/g, '. ') }}.</span>
            <svg class="cal-icon-sm" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input ref="trendEndRef" type="date" v-model="trendEndDate" class="date-input-hidden" />
          </div>
        </div>
      </div>
      <div class="chart-wrapper">
        <SettlementTrendChart :data="trendData" :height="240" />
      </div>
    </div>
  </div>

  <!-- PDF: 개별 가맹점 영수증 -->
  <div style="position:absolute;left:-9999px;top:0;">
    <div class="hq-individual-pdf-wrap" v-if="selectedReceiptStore" style="width:800px;background:white;font-family:sans-serif;color:#000;">
      <div style="width:560px;border:1px solid #e2e8f0;padding:50px;background:white;margin:40px auto;">
        <div style="text-align:center;margin-bottom:5px;position:relative;">
          <div style="position:absolute;top:0;right:0;font-size:11px;color:#94a3b8;font-weight:600;font-family:monospace;">RC-{{ selectedReceiptStore.id }}-{{ selectedDate.replace(/-/g, '') }}-001</div>
          <h2 style="font-size:24px;font-weight:800;margin:0;">정산 영수증</h2>
          <div style="font-size:14px;color:#94a3b8;font-weight:600;margin:5px 0;">RECEIPT</div>
          <div style="font-size:13px;color:#64748b;">Chain-G 정산 시스템</div>
        </div>
        <table style="width:100%;margin-bottom:20px;font-size:14px;border-collapse:collapse;">
          <tbody>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#334155;width:120px;">가맹점 :</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;">{{ selectedReceiptStore.name }} ({{ selectedReceiptStore.id }})</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#334155;width:120px;">정산 기간 :</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;">{{ activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth) }}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-weight:700;color:#334155;width:120px;">발행일 :</td>
              <td style="padding:8px 0;font-weight:600;text-align:right;">{{ new Date().toLocaleString('ko-KR') }}</td>
            </tr>
          </tbody>
        </table>
        <div style="border-top:1px dashed #000;margin:20px 0;"></div>
        <div style="margin-bottom:20px;padding-right:10px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">매출 내역</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 매출</span><span style="color:#3b82f6;">₩{{ fmt(selectedReceiptStore.sales) }}</span></div>
        </div>
        <div style="margin-bottom:20px;padding-right:10px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">차감 내역</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>발주 대금</span><span style="color:#ef4444;">-₩{{ fmt(selectedReceiptStore.orderCost) }}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>배송비</span><span style="color:#ef4444;">-₩{{ fmt(selectedReceiptStore.shipping) }}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>수수료</span><span style="color:#ef4444;">-₩{{ fmt(selectedReceiptStore.commission) }}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>손실</span><span style="color:#ef4444;">-₩{{ fmt(selectedReceiptStore.loss) }}</span></div>
        </div>
        <div style="margin-bottom:20px;padding-right:10px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">환급 내역</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>반품 환급</span><span style="color:#3b82f6;">+₩{{ fmt(selectedReceiptStore.refund) }}</span></div>
        </div>
        <div style="border-top:1px dashed #000;margin:20px 0;"></div>
        <div style="padding:20px 0;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-weight:800;font-size:18px;letter-spacing:1px;">최종 정산 금액</span>
          <span style="font-weight:800;font-size:24px;letter-spacing:0.5px;">₩{{ fmt(getFinal(selectedReceiptStore)) }}</span>
        </div>
        <div style="padding:10px 0;text-align:center;font-size:12px;color:#475569;font-weight:600;letter-spacing:1.5px;margin-bottom:30px;">총 매출 - (발주대금+배송비+수수료+손실)+반품 환급</div>

        <div style="text-align:center;font-size:12px;color:#64748b;"><p>본 문서는 공식 정산 영수증입니다.</p><p>세무 신고 및 회계 처리 시 보관하시기 바랍니다.</p></div>
      </div>
    </div>
  </div>

  <!-- PDF: 전체 가맹점 정산 요약 영수증 -->
  <div style="position:absolute;left:-9999px;top:0;">
    <div class="hq-batch-pdf-wrap" style="width:800px;padding:40px;background:white;font-family:sans-serif;color:#000;">
      <div style="border:2px solid #334155;border-radius:20px;padding:40px;background:#f8fafc;">
        <!-- 헤더 -->
        <div style="text-align:center;margin-bottom:30px;">
          <h2 style="font-size:24px;font-weight:800;margin:0;">전체 가맹점 정산 요약 영수증</h2>
          <div style="font-size:14px;color:#94a3b8;font-weight:600;margin:5px 0;">TOTAL SUMMARY RECEIPT</div>
          <div style="font-size:13px;color:#64748b;">Chain-G 정산 시스템</div>
        </div>

        <!-- 기본 정보 -->
        <div style="margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;"><span style="font-weight:700;">대상 :</span><span style="font-weight:600;">전체 가맹점 ({{ filteredStores.length }}개 지점)</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;"><span style="font-weight:700;">정산 기간 :</span><span style="font-weight:600;">{{ activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth) }}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;"><span style="font-weight:700;">발행일 :</span><span style="font-weight:600;">{{ new Date().toLocaleString('ko-KR') }}</span></div>
        </div>

        <div style="height:2px;background:#000;margin:20px 0;"></div>

        <!-- 전체 합산 -->
        <div style="margin-bottom:20px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">전체 매출 합계</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 주문 매출</span><span style="color:#ef4444;">{{ fmt(totals.sales) }}원</span></div>
          <div style="background:#eff6ff;border-radius:50px;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;margin:10px 0 30px;">
            <span style="font-weight:800;font-size:16px;">전체 매출</span>
            <span style="font-weight:800;font-size:20px;">{{ fmt(totals.sales) }}</span>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">전체 차감 합계</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 발주 대금</span><span style="color:#ef4444;">-{{ fmt(totals.orderCost) }}원</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 배송비</span><span style="color:#ef4444;">-{{ fmt(totals.shipping) }}원</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 수수료</span><span style="color:#ef4444;">-{{ fmt(totals.commission) }}원</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 손실</span><span style="color:#ef4444;">-{{ fmt(totals.loss) }}원</span></div>
        </div>

        <div style="margin-bottom:20px;">
          <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">전체 환급 합계</h3>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px;font-weight:600;"><span>총 반품 환급</span><span style="color:#10b981;">+{{ fmt(totals.refund) }}원</span></div>
        </div>

        <div style="height:2px;background:#000;margin:20px 0;"></div>

        <!-- 최종 정산 -->
        <div style="background:#334155;border-radius:16px;padding:20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
          <span style="font-weight:800;font-size:18px;color:white;">전체 최종 정산 합계</span>
          <span style="font-weight:800;font-size:24px;color:white;">{{ fmt(totalFinal) }}</span>
        </div>
        <div style="background:#e2e8f0;border-radius:50px;padding:12px;text-align:center;font-size:12px;color:#475569;font-weight:600;margin-bottom:30px;">발주대금 + 수수료 + 배송비 - 반품차감액 - 본사부담손실</div>

        <div style="height:2px;background:#000;margin:20px 0;"></div>

        <!-- 가맹점별 상세 테이블 -->
        <h3 style="font-size:16px;font-weight:800;margin-bottom:15px;">가맹점별 정산 내역</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:30px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="padding:10px 12px;text-align:left;font-weight:700;border-bottom:2px solid #cbd5e1;">가맹점</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">매출</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">발주</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">배송비</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">수수료</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">환급</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">손실</th>
              <th style="padding:10px 12px;text-align:right;font-weight:700;border-bottom:2px solid #cbd5e1;">최종 정산</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStores" :key="'pdf-'+s.id" style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px 12px;font-weight:700;">{{ s.name }}</td>
              <td style="padding:8px 12px;text-align:right;color:#6366f1;">{{ fmt(s.sales) }}</td>
              <td style="padding:8px 12px;text-align:right;color:#ef4444;">{{ fmt(s.orderCost) }}</td>
              <td style="padding:8px 12px;text-align:right;color:#ef4444;">{{ fmt(s.shipping) }}</td>
              <td style="padding:8px 12px;text-align:right;color:#ef4444;">{{ fmt(s.commission) }}</td>
              <td style="padding:8px 12px;text-align:right;color:#6366f1;">{{ fmt(s.refund) }}</td>
              <td style="padding:8px 12px;text-align:right;color:#ef4444;">{{ fmt(s.loss) }}</td>
              <td style="padding:8px 12px;text-align:right;font-weight:800;color:#6366f1;">{{ fmt(getFinal(s)) }}</td>
            </tr>
          </tbody>
        </table>

        <div style="text-align:center;font-size:12px;color:#64748b;">
          <p style="margin:2px 0;">위 내역은 해당 기간 모든 가맹점의 정산 합계입니다.</p>
          <p style="margin:2px 0;">총 {{ filteredStores.length }}개 지점의 데이터가 포함되었습니다.</p>
          <p style="margin:2px 0;">본 문서는 공식 정산 영수증입니다.</p>
        </div>
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

.summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; margin-bottom: 1rem; }
.summary-grid .summary-card:nth-child(-n+3) { grid-column: span 2; }
.summary-grid .summary-card:nth-child(n+4) { grid-column: span 3; }
.summary-card { background: white; padding: 1.15rem 1.4rem; border-radius: 14px; border: 1px solid var(--border-color); transition: transform 0.15s, box-shadow 0.15s; }
.summary-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.summary-card.clickable { cursor: pointer; }
.summary-card.clickable:hover { border-color: #475569; box-shadow: 0 4px 16px rgba(71,85,105,0.15); }
.summary-card.primary .s-value { color: var(--primary); }
.summary-card.refund-card .s-value { color: var(--primary); }
.s-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.s-value { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-dark); text-align: right; }
.s-value.negative { color: #ef4444; }
.s-value.positive { color: #6366f1; }

.final-card { background: linear-gradient(135deg, #334155 0%, #475569 100%); color: white; padding: 1.25rem 2rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; box-shadow: 0 4px 20px rgba(51,65,85,0.3); }
.fc-left { display: flex; flex-direction: column; gap: 0.3rem; }
.fc-label { font-size: 1rem; font-weight: 700; }
.fc-formula { font-size: 0.8rem; opacity: 0.7; font-weight: 500; }
.fc-count { font-size: 0.8rem; opacity: 0.8; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 999px; }
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
  margin-bottom: 2rem;
}
.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
}
.trend-range-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1.2rem;
  border-radius: 14px;
  gap: 0.6rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  transition: all 0.2s;
}
.trend-range-box:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.1);
}
.date-pick-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  font-family: 'Courier New', Courier, monospace; /* To match the aesthetic in screenshot */
}
.range-sep {
  color: var(--text-light);
  font-weight: 500;
}
.cal-icon-sm {
  color: var(--text-dark);
  margin-left: 0.2rem;
}
.chart-wrapper {
  height: 260px;
  width: 100%;
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.header-right-group { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.all-pdf-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid #ef4444; background: white; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; }
.all-pdf-btn:hover { background: #ef4444; color: white; transform: translateY(-1px); }
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
.positive { color: #6366f1 !important; }
.primary-color { color: var(--primary) !important; }
.final-cell { font-weight: 800; color: var(--primary) !important; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.status-done { background: #d1fae5; color: #065f46; }
.status-wait { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #ede9fe; color: #6366f1; }
.detail-btn { padding: 0.35rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.2s; }
.detail-btn:hover { background: #f1f5f9; border-color: #475569; }
.row-receipt-btn { padding: 0.35rem 0.7rem; border-radius: 8px; border: 1px solid #ef4444; background: white; color: #ef4444; cursor: pointer; font-size: 0.75rem; font-weight: 700; transition: all 0.2s; }
.row-receipt-btn:hover { background: #ef4444; color: white; }
</style>
