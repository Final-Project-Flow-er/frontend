<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { franchiseSettlementsApi } from '@/api/franchiseSettlements.js'

const route = useRoute()

// 초기값 설정: 쿼리에 date가 있으면 일별, month가 있으면 월별
const activeTab = ref(route.query.tab || (route.query.date ? 'daily' : 'monthly'))
const selectedDate = ref(route.query.date || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
const selectedMonth = ref(route.query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

const salesItems = ref([])
const isLoading = ref(false)

const fetchData = async () => {
    isLoading.value = true
    try {
        let res
        if (activeTab.value === 'daily') {
            res = await franchiseSettlementsApi.getDailySalesItems(selectedDate.value)
        } else {
            res = await franchiseSettlementsApi.getMonthlySalesItems(selectedMonth.value)
        }
        salesItems.value = res
    } catch (error) {
        console.error('Failed to fetch sales items:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)
watch([selectedDate, selectedMonth, activeTab], fetchData)

const totalQty = computed(() => salesItems.value.reduce((s, i) => s + i.totalQuantity, 0))
const totalSales = computed(() => salesItems.value.reduce((s, i) => s + i.totalSales, 0))
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n || 0)
</script>

<template>
  <div class="content-wrapper" :class="{ 'is-loading': isLoading }">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">매출 현황 (전체)</h1>
          <p class="page-desc">{{ activeTab === 'daily' ? selectedDate : selectedMonth }} 매출 현황입니다.</p>
        </div>
      </div>
    </div>

    <!-- 탭 및 선택 -->
    <div class="control-bar">
      <div class="tab-group">
        <button :class="{ active: activeTab === 'daily' }" @click="activeTab = 'daily'">일별</button>
        <button :class="{ active: activeTab === 'monthly' }" @click="activeTab = 'monthly'">월별</button>
      </div>
      <input v-if="activeTab === 'daily'" type="date" v-model="selectedDate" class="date-input" />
      <input v-else type="month" v-model="selectedMonth" class="date-input" />
    </div>

    <!-- 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>매출 상세 내역</h3>
        <span class="badge">{{ salesItems.length }}개 항목</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>상품명</th>
            <th class="text-right">총 판매수량</th>
            <th class="text-right">판매가</th>
            <th class="text-right">총 매출</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in salesItems" :key="item.productName">
            <td class="rank-cell">{{ item.rank || '−' }}</td>
            <td>{{ item.productName }}</td>
            <td class="text-right">{{ item.totalQuantity }}</td>
            <td class="text-right">₩ {{ fmt(item.unitPrice) }}</td>
            <td class="text-right"><strong>₩ {{ fmt(item.totalSales) }}</strong></td>
          </tr>
          <tr v-if="salesItems.length === 0 && !isLoading">
              <td colspan="5" class="empty-cell">매출 내역이 없습니다.</td>
          </tr>
          <tr class="total-row" v-if="salesItems.length > 0">
            <td></td>
            <td><strong>합계</strong></td>
            <td class="text-right"><strong>{{ totalQty }}</strong></td>
            <td></td>
            <td class="text-right"><strong>₩ {{ fmt(totalSales) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; transition: opacity 0.3s; }
.is-loading { opacity: 0.6; pointer-events: none; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }

.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.control-bar { margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; }
.tab-group { display: flex; background: white; border-radius: 10px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.5rem 1.2rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
.tab-group button.active { background: #475569; color: white; }

.date-input { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; background: white; color: var(--text-dark); cursor: pointer; outline: none; }
.date-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.rank-cell { color: var(--text-light); font-weight: 700; font-size: 0.85rem; text-align: center; width: 60px; }
.total-row { background: #f1f5f9 !important; }
.total-row td { border-bottom: none; }
.empty-cell { text-align: center; color: #94a3b8; padding: 4rem 1.5rem !important; }
</style>
