<template>
  <div class="content-wrapper">
    <div class="page-header">
      <div>
        <h1 class="page-title">본사 정산 - 가맹점별 매출 현황</h1>
        <p class="page-desc">선택된 날짜의 가맹점별 총 매출 현황을 보여줍니다.</p>
      </div>
      <div class="header-actions">
        <button class="action-btn back-btn" @click="router.back()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          뒤로가기
        </button>
      </div>
    </div>

    <div class="data-table-card">
      <div class="table-header">
        <h3>매출 상세 목록 ({{ displayDate }})</h3>
        <span class="badge">{{ filteredStores.length }}개</span>
      </div>
      <table class="modal-table">
        <thead>
        <tr><th>가맹점</th><th class="text-right">매출액</th></tr>
        </thead>
        <tbody>
        <tr v-for="s in filteredStores" :key="s.id">
          <td>{{ s.name }}</td>
          <td class="text-right">{{ fmt(s.sales) }}</td>
        </tr>
        <tr class="total-row">
          <td>합계</td>
          <td class="text-right">{{ fmt(totals.sales) }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const selectedDate = ref(route.query.date || '')
const selectedMonth = ref(route.query.month || '') // Not directly used here, but kept for consistency if needed
const activeTab = ref(route.query.tab || 'daily') // To determine whether to use selectedDate or selectedMonth

const pad = (n) => String(n).padStart(2, '0')
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 } return Math.abs(h) }
const seededRand = (s, min, max) => min + (s % (max - min + 1))
const round100 = (n) => Math.round(n / 100) * 100
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const storeNames = [
  { id: 'S001', name: '강남점' },   { id: 'S002', name: '홍대점' },
  { id: 'S003', name: '신촌점' },   { id: 'S004', name: '이태원점' },
  { id: 'S005', name: '잠실점' },   { id: 'S006', name: '명동점' },
  { id: 'S007', name: '건대점' },   { id: 'S008', name: '서울대점' },
  { id: 'S009', name: '합정점' },   { id: 'S010', name: '성수점' },
]

// This logic is duplicated from HqSettlementListView.vue, which is necessary for the page to be standalone.
const stores = computed(() => {
  const d = activeTab.value === 'daily' ? selectedDate.value : selectedMonth.value + '-01' // Use 1st day for monthly seed
  return storeNames.map((s, i) => {
    const base = seed(d + s.id)
    const sales = round100(seededRand(base, 250000, 750000))
    const orderCost = round100(seededRand(base * 2 + i, 80000, 250000))
    const shipping = round100(seededRand(base * 3 + i, 10000, 25000))
    const commission = Math.round(sales * 0.03)
    const refund = i % 3 === 0 ? round100(seededRand(base * 4 + i, 0, 40000)) : 0
    const loss = i % 4 === 0 ? round100(seededRand(base * 5 + i, 0, 25000)) : 0
    // status is not relevant for this view
    return { ...s, sales, orderCost, shipping, commission, refund, loss }
  })
})

const filteredStores = computed(() => stores.value) // No search filter on this page for now

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

const formatDateDisplay = (d) => {
  if (!d) return '';
  const [y, m, dd] = d.split('-');
  return `${y}년 ${m}월 ${dd}일`;
};

const formatMonthDisplay = (d) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${y}년 ${m}월`;
};

const displayDate = computed(() => {
  if (activeTab.value === 'monthly') {
    return formatMonthDisplay(selectedMonth.value);
  } else {
    return formatDateDisplay(selectedDate.value);
  }
});

</script>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; padding-top: 2rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1rem; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
.back-btn { background: #64748b; color: white; }
.back-btn:hover { background: #475569; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1rem; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }

.modal-table { width: 100%; border-collapse: collapse; }
.modal-table th { text-align: left; padding: 0.85rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; }
.modal-table td { padding: 0.85rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.modal-table .total-row { background: #f1f5f9; }
.modal-table .total-row td { border-bottom: none; color: var(--primary); }
.text-right { text-align: right; }
</style>
