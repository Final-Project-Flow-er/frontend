<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { franchiseSettlementsApi } from '@/api/franchiseSettlements.js'

const router = useRouter()
const route = useRoute()

/* ── 상태 ── */
const activeTab = ref(route.query.tab || (route.query.date ? 'daily' : 'monthly'))
const selectedDate = ref(route.query.date || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`)
const selectedMonth = ref(route.query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

const isLoading = ref(false)

const categories = ref([
  { key: 'sales',      label: '판매 대금',   icon: '💰', count: 0, total: 0,  color: '#6366f1', type: 'SALES' },
  { key: 'order',      label: '발주 대금',   icon: '📦', count: 0, total: 0,  color: '#f97316', type: 'ORDER' },
  { key: 'shipping',   label: '배송비',      icon: '🚚', count: 0, total: 0,  color: '#0ea5e9', type: 'DELIVERY' },
  { key: 'commission', label: '수수료',      icon: '🏷️', count: 0, total: 0,  color: '#8b5cf6', type: 'COMMISSION' },
  { key: 'refund',     label: '반품 환급',   icon: '↩️', count: 0, total: 0,  color: '#10b981', type: 'REFUND' },
  { key: 'loss',       label: '손실 금액',   icon: '⚠️', count: 0, total: 0,  color: '#ef4444', type: 'LOSS' },
  { key: 'adjust',     label: '기타 조정',   icon: '✏️', count: 0, total: 0,  color: '#64748b', type: 'ADJUSTMENT' },
])

const summaryData = ref({
    totalSaleAmount: 0,
    orderAmount: 0,
    deliveryFee: 0,
    commissionFee: 0,
    refundAmount: 0,
    lossAmount: 0,
    adjustmentAmount: 0,
    finalAmount: 0
})

/* ── 데이터 페칭 ── */
const fetchData = async () => {
    isLoading.value = true
    try {
        let sumRes
        if (activeTab.value === 'daily') {
            sumRes = await franchiseSettlementsApi.getDailySummary(selectedDate.value)
        } else {
            sumRes = await franchiseSettlementsApi.getMonthlySummary(selectedMonth.value)
        }
        summaryData.value = sumRes
        
        // 카테고리별 금액 업데이트
        categories.value.find(c => c.key === 'sales').total = summaryData.value.totalSaleAmount
        categories.value.find(c => c.key === 'order').total = summaryData.value.orderAmount
        categories.value.find(c => c.key === 'shipping').total = summaryData.value.deliveryFee
        categories.value.find(c => c.key === 'commission').total = summaryData.value.commissionFee
        categories.value.find(c => c.key === 'refund').total = summaryData.value.refundAmount
        categories.value.find(c => c.key === 'loss').total = summaryData.value.lossAmount
        categories.value.find(c => c.key === 'adjust').total = summaryData.value.adjustmentAmount
        
        // 카테고리별 건수 페칭 (병렬)
        await Promise.all(categories.value.map(async (cat) => {
            const params = {
                period: activeTab.value.toUpperCase(),
                type: cat.type,
                page: 0,
                size: 1
            }
            if (activeTab.value === 'daily') params.date = selectedDate.value
            else params.month = selectedMonth.value
            
            try {
                const res = await franchiseSettlementsApi.getVouchers(params)
                cat.count = res.totalElements
            } catch (e) {
                console.error(`Failed to fetch count for ${cat.key}`, e)
            }
        }))
        
    } catch (error) {
        console.error('Failed to fetch summary data:', error)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)
watch([selectedDate, selectedMonth, activeTab], fetchData)

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n || 0))

/* ── 전표 목록으로 이동 ── */
const goToVouchers = (cat) => {
  const query = { 
      type: cat.type,
      period: activeTab.value.toUpperCase()
  }
  if (activeTab.value === 'daily') query.date = selectedDate.value
  else query.month = selectedMonth.value
  
  router.push({ path: '/store/settlement/vouchers', query })
}
</script>

<template>
  <div class="content-wrapper" :class="{ 'is-loading': isLoading }">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">정산 항목 요약</h1>
          <p class="page-desc">{{ activeTab === 'daily' ? selectedDate : selectedMonth }} 항목별 건수 및 합계입니다.</p>
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

    <!-- 항목 카드 그리드 -->
    <section class="category-grid">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="category-card"
        @click="goToVouchers(cat)"
      >
        <div class="cat-top">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-count">{{ cat.count }}건</span>
        </div>
        <h3 class="cat-label">{{ cat.label }}</h3>
        <p class="cat-amount" :class="{ minus: ['order', 'shipping', 'commission', 'loss'].includes(cat.key) || cat.total < 0 }">
          {{ (['order', 'shipping', 'commission', 'loss'].includes(cat.key) || cat.total < 0) ? '−' : '' }}₩ {{ fmt(cat.total) }}
        </p>
        <div class="cat-bar" :style="{ backgroundColor: cat.color }"></div>
        <div class="cat-action">
          <span>전표 보기</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </section>

    <!-- 전체 합계 -->
    <div class="total-summary-card">
      <div class="ts-row">
        <span class="ts-label">판매 대금 합계</span>
        <span class="ts-val plus">+ ₩ {{ fmt(summaryData.totalSaleAmount) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">차감 항목 합계 (발주 + 배송 + 수수료 + 손실)</span>
        <span class="ts-val minus">− ₩ {{ fmt(summaryData.orderAmount + summaryData.deliveryFee + summaryData.commissionFee + summaryData.lossAmount) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">반품 환급 합계</span>
        <span class="ts-val plus">+ ₩ {{ fmt(summaryData.refundAmount) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">기타 조정</span>
        <span class="ts-val" :class="summaryData.adjustmentAmount < 0 ? 'minus' : 'plus'">
          {{ summaryData.adjustmentAmount < 0 ? '−' : '+' }} ₩ {{ fmt(summaryData.adjustmentAmount) }}
        </span>
      </div>
      <div class="ts-divider"></div>
      <div class="ts-row final">
        <span class="ts-label">최종 정산 금액</span>
        <span class="ts-val">₩ {{ fmt(summaryData.finalAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; transition: opacity 0.3s; }
.is-loading { opacity: 0.6; pointer-events: none; }

/* ── 페이지 헤더 ── */
.page-header { margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }

.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.control-bar { margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; }
.tab-group { display: flex; background: white; border-radius: 10px; border: 1px solid var(--border-color); overflow: hidden; }
.tab-group button { padding: 0.5rem 1.2rem; border: none; background: transparent; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
.tab-group button.active { background: #475569; color: white; }

.date-input { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; background: white; color: var(--text-dark); cursor: pointer; outline: none; }
.date-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

/* ── 카테고리 그리드 ── */
.category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.category-card { background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
.category-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: var(--primary); }
.cat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.cat-icon { font-size: 1.5rem; }
.cat-count { background: #f1f5f9; color: var(--text-light); padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.cat-label { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 700; color: var(--text-dark); }
.cat-amount { margin: 0 0 0.75rem; font-size: 1.4rem; font-weight: 800; color: var(--text-dark); }
.cat-amount.minus { color: #ef4444; }
.cat-bar { height: 3px; border-radius: 2px; margin-bottom: 1rem; }
.cat-action { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-light); font-weight: 500; }

/* ── 전체 합계 카드 ── */
.total-summary-card { background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem 2rem; }
.ts-row { display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0; }
.ts-row.final { padding-top: 1rem; }
.ts-label { font-size: 0.9rem; color: var(--text-light); }
.ts-val { font-size: 1rem; font-weight: 700; color: var(--text-dark); }
.ts-val.plus { color: #10b981; }
.ts-val.minus { color: #ef4444; }
.ts-row.final .ts-label { font-size: 1.1rem; font-weight: 700; color: var(--text-dark); }
.ts-row.final .ts-val { font-size: 1.35rem; font-weight: 800; color: var(--primary); }
.ts-divider { height: 1px; background: var(--border-color); margin: 0.5rem 0; }
</style>
