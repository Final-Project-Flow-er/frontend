<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSalesList } from '@/api/franchiseSales.js'

const router = useRouter()

const filter = ref({
  salesCode: '',
  date: ''
})

const sales = ref([])
const loading = ref(false)
const error = ref(null)

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchSales = async () => {
  loading.value = true
  error.value = null
  try {
    const pageData = (await getSalesList({ page: currentPage.value, size: pageSize.value })) || {}
    sales.value = pageData.content || []
    totalPages.value = pageData.totalPages || 0
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const changePage = async (page) => {
  currentPage.value = page
  await fetchSales()
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = 5
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(maxVisible / 2))
  let end = start + maxVisible
  if (end > total) { end = total; start = end - maxVisible }
  return Array.from({ length: end - start }, (_, i) => start + i)
})

onMounted(() => fetchSales())

const formatSalesDate = (isoStr) => {
  if (!isoStr) return ''
  return isoStr.replace('T', ' ').substring(0, 16)
}

// salesCode 기준으로 그룹핑: 수량 합산, 총 금액 = 각 상품별 단가*수량 합산
const groupedSales = computed(() => {
  const map = {}
  for (const item of sales.value) {
    if (!map[item.salesCode]) {
      map[item.salesCode] = {
        salesCode: item.salesCode,
        salesDate: item.salesDate,
        quantity: 0,
        totalPrice: 0
      }
    }
    map[item.salesCode].quantity += item.quantity
    map[item.salesCode].totalPrice += item.unitPrice * item.quantity
  }
  return Object.values(map)
})

const filteredSales = computed(() => {
  return groupedSales.value.filter(item => {
    const formattedDate = formatSalesDate(item.salesDate)
    const matchSalesCode = !filter.value.salesCode || item.salesCode.includes(filter.value.salesCode)
    const matchDate = !filter.value.date || formattedDate.startsWith(filter.value.date)

    return matchSalesCode && matchDate
  })
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const goToSalesDetail = (salesCode) => {
  router.push({ name: 'franchise-sales-detail', params: { salesCode } })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 판매 관리</h2>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>판매 코드</label>
        <input type="text" v-model="filter.salesCode" placeholder="Code..." />
      </div>
      <div class="filter-group">
        <label>판매 일시</label>
        <input type="date" v-model="filter.date" />
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>

    <div class="data-table-card">
      <div class="table-scroll-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>판매 코드</th>
            <th>판매 일시</th>
            <th class="text-right">수량</th>
            <th class="text-right">총 금액</th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center loading-row">불러오는 중...</td>
          </tr>
          <tr v-else-if="filteredSales.length === 0">
            <td colspan="4" class="text-center loading-row">판매 내역이 없습니다.</td>
          </tr>
          <tr v-else v-for="(item, index) in filteredSales" :key="index" class="clickable-row" @click="goToSalesDetail(item.salesCode)">
            <td class="sales-code">{{ item.salesCode }}</td>
            <td>{{ formatSalesDate(item.salesDate) }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right total-cell">{{ formatPrice(item.totalPrice) }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 페이지네이션 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-nav-btn" :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-numbers">
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="changePage(p)"
            :class="{ active: currentPage === p }"
            class="page-num-btn"
          >{{ p + 1 }}</button>
        </div>
        <button class="page-nav-btn" :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

.filter-section {
  background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);
  margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-end; flex-wrap: nowrap; overflow-x: auto;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); white-space: nowrap; }
.filter-group input { padding: 0.6rem 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; min-width: 140px; }
.filter-group.grow-2 input { min-width: 200px; }
.filter-group.narrow input { min-width: 80px; width: 80px; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); }
.table-scroll-container { overflow-x: auto; width: 100%; border-radius: 8px; }
.data-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
.data-table th, .data-table td { white-space: nowrap; padding: 1.05rem 0.8rem !important; height: 58px !important; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.data-table th { text-align: left; background: #f8fafc; color: var(--text-light); font-size: 0.9rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; }
.data-table td { font-size: 0.95rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; line-height: 1.35 !important; }

.sales-code { color: #6d28d9 !important; font-weight: 600 !important; }
.sku-cell { color: #1d4ed8; font-weight: 600; }

.name-cell { color: var(--text-dark); max-width: 300px; white-space: normal; }
.total-cell { font-weight: 700; color: var(--text-dark); }
.text-right { text-align: right; }
.text-center { text-align: center; }



.clickable-row { cursor: pointer; transition: background 0.15s; }
.clickable-row:hover { background: #f8fafc; }
.loading-row { padding: 2rem; color: var(--text-light); }
.error-message { background: #fee2e2; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }

:root {
  --primary: #4f46e5;
  --text-light: #64748b;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
}
</style>
