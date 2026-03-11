<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { settlementsApi } from '@/api/settlements.js'

const route = useRoute()
const router = useRouter()

const type = computed(() => route.query.type || 'sales')
const date = computed(() => route.query.date || '')
const month = computed(() => route.query.month || '')
const tab = computed(() => route.query.tab || 'daily')

const typeMap = {
  sales: { title: '가맹점별 매출 현황', label: '매출액', field: 'totalSaleAmount', typeName: '판매', apiType: 'SALES' },
  refund: { title: '가맹점별 반품 환급 현황', label: '반품 환급액', field: 'refundAmount', typeName: '반품', apiType: 'REFUND' },
  orderCost: { title: '가맹점별 발주 대금 현황', label: '발주 대금', field: 'orderAmount', typeName: '발주', apiType: 'ORDER' },
  shipping: { title: '가맹점별 배송비 현황', label: '배송비', field: 'deliveryFee', typeName: '배송', apiType: 'SHIPPING' },
  loss: { title: '가맹점별 손실 현황', label: '손실', field: 'lossAmount', typeName: '손실', apiType: 'LOSS' },
  commission: { title: '가맹점별 수수료 현황', label: '수수료', field: 'commissionFee', typeName: '수수료', apiType: 'COMMISSION' },
}

const currentInfo = computed(() => typeMap[type.value] || typeMap.sales)

/* ── 데이터 상태 ── */
const isLoading = ref(false)
const storesSummary = ref([])
const transactions = ref([])
const totalAmount = ref(0)
const totalTxCount = ref(0)

const fetchData = async () => {
  isLoading.value = true
  try {
    // 1. 가맹점별 요약 (목록 API 재사용)
    const listRes = tab.value === 'daily'
      ? await settlementsApi.getDailyFranchises({ date: date.value, size: 100 })
      : await settlementsApi.getMonthlyFranchises({ month: month.value, size: 100 })
    
    const field = currentInfo.value.field
    storesSummary.value = listRes.data.content.map(s => ({
      id: s.franchiseId,
      name: s.franchiseName,
      amount: s[field] || 0
    })).filter(s => s.amount > 0)

    totalAmount.value = storesSummary.value.reduce((acc, curr) => acc + curr.amount, 0)

    // 2. 통합 전표 내역
    const voucherRes = await settlementsApi.getAllVouchers({
      period: tab.value === 'daily' ? 'DAILY' : 'MONTHLY',
      date: date.value,
      month: month.value,
      type: currentInfo.value.apiType,
      size: 100
    })
    // FranchiseVoucherResponse에는 franchiseName이 없어서 가맹점별 요약 테이블의 매핑 정보를 활용하거나, 
    // 백엔드에서 DTO에 franchiseName을 추가해주면 좋음.
    // 일단 referenceCode 등을 통해 유추하거나, 백엔드 DTO를 한 번 더 체크.
    transactions.value = voucherRes.content.map(v => {
        // v.referenceCode 등을 보고 매핑 (현실적으로는 DTO에 franchiseId가 있어야 함)
        // 일단 UI는 유지하되, 백엔드 DTO에 franchiseName이 없음을 인지.
        return {
            id: v.referenceCode,
            typeName: currentInfo.value.typeName,
            description: v.description,
            amount: v.amount,
            date: v.occurredAt?.replace('T', ' ').substring(0, 16)
        }
    })
    totalTxCount.value = voucherRes.totalElements
  } catch (error) {
    console.error('Failed to fetch summary detail:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
watch([type, date, month, tab], fetchData)

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n || 0))

const goBack = () => {
  router.push({ path: '/hq/settlement', query: route.query })
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
      <div class="total-summary-badge" v-if="!isLoading">
        <span class="label">총 합계</span>
        <span class="value" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(type), 'primary-color': ['sales', 'refund'].includes(type) }">
          ₩ {{ fmt(totalAmount) }}
        </span>
      </div>
    </div>

    <!-- 가맹점별 요약 테이블 -->
    <div class="card-grid" v-if="!isLoading">
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
                <td class="text-right" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(type), 'primary-color': ['sales', 'refund'].includes(type) }">
                  ₩ {{ fmt(s.amount) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>합계</td>
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
          <span class="badge">{{ totalTxCount }}건</span>
        </div>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>전표번호</th>
                <th>내역</th>
                <th class="text-right">금액</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td class="id-cell">{{ tx.id }}</td>
                <td>{{ tx.description }}</td>
                <td class="text-right fw700" :class="{ 'negative': ['orderCost', 'shipping', 'loss', 'commission'].includes(type), 'primary-color': ['sales', 'refund'].includes(type) }">
                  ₩ {{ fmt(tx.amount) }}
                </td>
                <td class="time-cell">{{ tx.date }}</td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="4" class="empty-cell">데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="text-center" style="padding: 5rem;">데이터를 불러오는 중입니다...</div>
  </div>
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
.badge { background: #475569; color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }

.table-scroll { max-height: 700px; overflow-y: auto; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { position: sticky; top: 0; padding: 1rem 1.5rem; background: #f1f5f9; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; text-align: left; z-index: 10; }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }

.text-right { text-align: right; }
.text-center { text-align: center; }
.store-cell { font-weight: 700; }
.id-cell { font-family: monospace; color: #6366f1; font-weight: 600; font-size: 0.85rem; }
.time-cell { color: var(--text-light); font-size: 0.85rem; }
.fw700 { font-weight: 700; }
.negative { color: #ef4444; }
.primary-color { color: #6366f1; }

.total-row { background: #f1f5f9; font-weight: 800; color: var(--text-dark); }
.total-row td { border-bottom: none; font-size: 1rem; }

.empty-cell { text-align: center; color: var(--text-light); padding: 4rem !important; }

@media (max-width: 1000px) {
  .card-grid { grid-template-columns: 1fr; }
  .summary-table { order: 2; }
  .detail-table { order: 1; }
}
</style>
