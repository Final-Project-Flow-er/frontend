<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SettlementReceiptModal from '@/components/settlement/SettlementReceiptModal.vue'
import SettlementBatchReceiptModal from '@/components/settlement/SettlementBatchReceiptModal.vue'

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

/* ── 개별 영수증 모달 ── */
const showReceiptModal = ref(false)
const selectedReceiptStore = ref(null)
const openReceipt = (store) => {
  selectedReceiptStore.value = store
  showReceiptModal.value = true
}

/* ── 전체 영수증 모달 ── */
const showBatchModal = ref(false)
const openBatchReceipt = () => {
  showBatchModal.value = true
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
        <span class="fc-label">전체 가맹점 최종 정산 합계</span>
        <span class="fc-count">{{ filteredStores.length }}개 가맹점</span>
      </div>
      <p class="fc-amount">₩ {{ fmt(totalFinal) }}</p>
    </div>

    <section class="summary-grid">
      <div class="summary-card primary clickable" @click="goToSummaryDetail('sales')">
        <span class="s-label">총 매출</span>
        <p class="s-value">₩ {{ fmt(totals.sales) }}</p>
      </div>
      <div class="summary-card refund-card clickable" @click="goToSummaryDetail('refund')">
        <span class="s-label">반품 환급</span>
        <p class="s-value primary-color">₩ {{ fmt(totals.refund) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('orderCost')">
        <span class="s-label">발주 대금</span>
        <p class="s-value negative">₩ {{ fmt(totals.orderCost) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('shipping')">
        <span class="s-label">배송비</span>
        <p class="s-value negative">₩ {{ fmt(totals.shipping) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('loss')">
        <span class="s-label">손실</span>
        <p class="s-value negative">₩ {{ fmt(totals.loss) }}</p>
      </div>
      <div class="summary-card clickable" @click="goToSummaryDetail('commission')">
        <span class="s-label">수수료</span>
        <p class="s-value negative">₩ {{ fmt(totals.commission) }}</p>
      </div>
    </section>

    <!-- 가맹점별 정산 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>가맹점별 정산 목록</h3>
        <div class="header-right-group">
          <button class="all-pdf-btn" @click="openBatchReceipt">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            전체 가맹점 영수증 PDF
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
              <button class="detail-btn" @click="goToDetail(s.id)">상세</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 개별 정산 영수증 모달 -->
  <SettlementReceiptModal
    :is-open="showReceiptModal"
    :store="selectedReceiptStore"
    :date="activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth)"
    @close="showReceiptModal = false"
  />

  <!-- 전체 가맹점 영수증 모달 -->
  <SettlementBatchReceiptModal
    :is-open="showBatchModal"
    :stores="filteredStores"
    :date="activeTab === 'daily' ? formatDate(selectedDate) : formatMonth(selectedMonth)"
    @close="showBatchModal = false"
  />
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
.positive { color: #10b981 !important; }
.primary-color { color: var(--primary) !important; }
.final-cell { font-weight: 800; color: var(--primary) !important; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.status-done { background: #d1fae5; color: #065f46; }
.status-wait { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #ede9fe; color: #6366f1; }
.detail-btn { padding: 0.35rem 0.9rem; border-radius: 8px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #475569; transition: all 0.2s; }
.detail-btn:hover { background: #f1f5f9; border-color: #475569; }
</style>
