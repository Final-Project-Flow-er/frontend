<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SettlementReceiptModal from '@/components/settlement/SettlementReceiptModal.vue'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.query.type || 'sales')
const date = computed(() => route.query.date || '')
const month = computed(() => route.query.month || '')
const tab = computed(() => route.query.tab || 'daily')

const typeMap = {
  sales: { title: '가맹점별 매출 현황', label: '매출액', field: 'sales', typeName: '판매' },
  refund: { title: '가맹점별 반품 환급 현황', label: '반품 환급액', field: 'refund', typeName: '반품' },
  orderCost: { title: '가맹점별 발주 대금 현황', label: '발주 대금', field: 'orderCost', typeName: '발주' },
  shipping: { title: '가맹점별 배송비 현황', label: '배송비', field: 'shipping', typeName: '배송' },
  loss: { title: '가맹점별 손실 현황', label: '손실', field: 'loss', typeName: '손실' },
  commission: { title: '가맹점별 수수료 현황', label: '수수료', field: 'commission', typeName: '수수료' },
}

const currentInfo = computed(() => typeMap[type.value] || typeMap.sales)

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

// 가맹점별 합계 데이터
const storesSummary = computed(() => {
  const d = tab.value === 'daily' ? date.value : month.value
  return storeNames.map((s, i) => {
    const base = seed(d + s.id)
    const sales = round100(seededRand(base, 250000, 750000))
    const orderCost = round100(seededRand(base * 2 + i, 80000, 250000))
    const shipping = round100(seededRand(base * 3 + i, 10000, 25000))
    const commission = Math.round(sales * 0.03)
    const refund = i % 3 === 0 ? round100(seededRand(base * 4 + i, 0, 40000)) : 0
    const loss = i % 4 === 0 ? round100(seededRand(base * 5 + i, 0, 25000)) : 0
    return { ...s, sales, orderCost, shipping, commission, refund, loss }
  })
})

const totalAmount = computed(() => {
  const field = currentInfo.value.field
  return storesSummary.value.reduce((acc, curr) => acc + curr[field], 0)
})

// 가맹점별 상세 전표 데이터 생성 (시드 기반)
const transactions = computed(() => {
  const d = tab.value === 'daily' ? date.value : month.value
  const field = currentInfo.value.field
  const results = []

  storesSummary.value.forEach((store, idx) => {
    const amount = store[field]
    if (amount === 0) return

    const base = seed(d + store.id + field)
    const count = seededRand(base, 2, 5) // 가맹점당 2~5개의 가짜 전표 생성
    let remaining = amount

    for (let j = 0; j < count; j++) {
      const isLast = j === count - 1
      const partAmount = isLast ? remaining : round100(seededRand(base + j, amount / count / 2, amount / count))
      remaining -= partAmount

      if (partAmount <= 0 && !isLast) continue

      const time = `${seededRand(base + j, 9, 21)}:${seededRand(base + j + 10, 10, 59)}`
      const prefix = field.substring(0, 2).toUpperCase()
      results.push({
        id: `${prefix}-${store.id}-${j + 1}`,
        storeName: store.name,
        type: currentInfo.value.typeName,
        description: getDescription(field, j),
        amount: partAmount,
        date: `${d} ${time}`
      })
    }
  })
  return results.sort((a, b) => b.date.localeCompare(a.date))
})

const getDescription = (field, idx) => {
  const descriptions = {
    sales: ['일반 주문 건', '포장 주문 건', '배달 주문 건', '키오스크 주문 건'],
    refund: ['상품 파손 반품', '오발주 반품', '유통기한 임박 반품', '고객 변심 반품'],
    orderCost: ['정기 발주 결제', '비정기 발주 결제', '추가 물량 결제', '긴급 발주 결제'],
    shipping: ['기본 배송비', '추가 배송료', '유류비 할증', '야간 배송료'],
    loss: ['재고 오차 조정', '폐기 처리 손실', '파손 처리 손실', '기타 손실'],
    commission: ['매출 수수료 (3%)', '플랫폼 수수료', '결제 수수료', '정산 수수료'],
  }
  const list = descriptions[field] || ['기타 내역']
  return list[idx % list.length]
}

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const goBack = () => {
  router.push({ path: '/hq/settlement', query: route.query })
}

/* ── 영수증 모달 ── */
const showReceiptModal = ref(false)
const selectedReceiptStore = ref(null)
const openReceipt = (store) => {
  selectedReceiptStore.value = store
  showReceiptModal.value = true
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div>
          <h1 class="page-title">{{ currentInfo.title }}</h1>
          <p class="page-desc">{{ tab === 'daily' ? date : month }} 기준 조회 결과입니다.</p>
        </div>
      </div>
      <div class="total-summary-badge">
        <span class="label">총 합계</span>
        <span class="value" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(currentInfo.field), 'primary-color': ['sales', 'refund'].includes(currentInfo.field) }">
          ₩ {{ fmt(totalAmount) }}
        </span>
      </div>
    </div>

    <!-- 가맹점별 요약 테이블 -->
    <div class="card-grid">
      <div class="data-table-card summary-table">
        <div class="table-header">
          <h3>가맹점별 요약</h3>
          <span class="badge">{{ storesSummary.length }}개 가맹점</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>가맹점</th>
                <th class="text-right">{{ currentInfo.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in storesSummary" :key="s.id">
                <td class="store-cell">{{ s.name }}</td>
                <td class="text-right" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(currentInfo.field), 'primary-color': ['sales', 'refund'].includes(currentInfo.field) }">
                  ₩ {{ fmt(s[currentInfo.field]) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2">합계</td>
                <td class="text-right">₩ {{ fmt(totalAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 상세 전표 내역 테이블 -->
      <div class="data-table-card detail-table">
        <div class="table-header">
          <h3>상세 전표 내역</h3>
          <span class="badge">{{ transactions.length }}건</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>전표번호</th>
                <th>가맹점</th>
                <th>내역</th>
                <th class="text-right">금액</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td class="id-cell">{{ tx.id }}</td>
                <td>{{ tx.storeName }}</td>
                <td>{{ tx.description }}</td>
                <td class="text-right fw700" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(currentInfo.field), 'primary-color': ['sales', 'refund'].includes(currentInfo.field) }">
                  ₩ {{ fmt(tx.amount) }}
                </td>
                <td class="time-cell">{{ tx.date }}</td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="5" class="empty-cell">데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- 정산 영수증 모달 -->
  <SettlementReceiptModal
    :is-open="showReceiptModal"
    :store="selectedReceiptStore"
    :date="tab === 'daily' ? (date ? date.split('-')[0]+'년 '+(date.split('-')[1])+'월 '+(date.split('-')[2])+'일' : '') : (month ? month.split('-')[0]+'년 '+(month.split('-')[1])+'월' : '')"
    @close="showReceiptModal = false"
  />
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-left { display: flex; align-items: center; gap: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-light); transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.back-btn:hover { background: #f1f5f9; color: var(--text-dark); border-color: #cbd5e1; transform: translateX(-2px); }

.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.total-summary-badge { background: white; padding: 0.75rem 1.5rem; border-radius: 14px; border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: flex-end; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.total-summary-badge .label { font-size: 0.8rem; color: var(--text-light); font-weight: 600; margin-bottom: 0.2rem; }
.total-summary-badge .value { font-size: 1.4rem; font-weight: 800; }

.card-grid { display: grid; grid-template-columns: 400px 1fr; gap: 1.5rem; align-items: start; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); background: #f8fafc; }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }

.table-scroll { max-height: 700px; overflow-y: auto; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { position: sticky; top: 0; padding: 1rem 1.5rem; background: #f1f5f9; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; text-align: left; z-index: 10; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }

.text-right { text-align: right; }
.text-center { text-align: center; }
.store-cell { font-weight: 700; }
.id-cell { font-family: monospace; color: var(--primary); font-weight: 600; font-size: 0.85rem; }
.time-cell { color: var(--text-light); font-size: 0.85rem; }
.fw700 { font-weight: 700; }
.negative { color: #ef4444; }
.primary-color { color: var(--primary); }

.total-row { background: #f1f5f9; font-weight: 800; color: var(--text-dark); }
.total-row td { border-bottom: none; font-size: 1rem; }

.empty-cell { text-align: center; color: var(--text-light); padding: 4rem !important; }

.icon-btn { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 4px; transition: all 0.2s; }
.icon-btn:hover { color: var(--primary); background: #f1f5f9; }

@media (max-width: 1000px) {
  .card-grid { grid-template-columns: 1fr; }
  .summary-table { order: 2; }
  .detail-table { order: 1; }
}
</style>
