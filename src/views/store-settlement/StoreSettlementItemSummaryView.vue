<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/* ── 항목별 요약 데이터 ── */
const categories = ref([
  { key: 'sales',      label: '판매 대금',   icon: '💰', count: 37, total: 11404000,  color: '#6366f1' },
  { key: 'order',      label: '발주 대금',   icon: '📦', count: 12, total: 3700000,   color: '#f97316' },
  { key: 'shipping',   label: '배송비',      icon: '🚚', count: 12, total: 300000,    color: '#0ea5e9' },
  { key: 'commission', label: '수수료',      icon: '🏷️', count: 37, total: 342120,    color: '#8b5cf6' },
  { key: 'refund',     label: '반품 환급',   icon: '↩️', count: 3,  total: 258000,    color: '#10b981' },
  { key: 'loss',       label: '손실 금액',   icon: '⚠️', count: 2,  total: 44000,     color: '#ef4444' },
  { key: 'adjust',     label: '기타 조정',   icon: '✏️', count: 1,  total: -15000,    color: '#64748b' },
])

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n))

/* ── 전표 목록으로 이동 ── */
const goToVouchers = (filterType) => {
  router.push({ path: '/store/settlement/vouchers', query: { filter: filterType } })
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/store/settlement')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 class="page-title">정산 항목 요약</h1>
          <p class="page-desc">항목별 건수 및 합계를 조회합니다. 클릭 시 전표 목록으로 이동합니다.</p>
        </div>
      </div>
    </div>

    <!-- 항목 카드 그리드 -->
    <section class="category-grid">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="category-card"
        @click="goToVouchers(cat.key)"
      >
        <div class="cat-top">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-count">{{ cat.count }}건</span>
        </div>
        <h3 class="cat-label">{{ cat.label }}</h3>
        <p class="cat-amount" :class="{ minus: cat.total < 0 }">
          {{ cat.total < 0 ? '−' : '' }}₩ {{ fmt(cat.total) }}
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
        <span class="ts-val plus">+ ₩ {{ fmt(categories.find(c => c.key === 'sales').total) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">차감 항목 합계 (발주 + 배송 + 수수료 + 손실)</span>
        <span class="ts-val minus">− ₩ {{ fmt(categories.filter(c => ['order','shipping','commission','loss'].includes(c.key)).reduce((s,c) => s + c.total, 0)) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">반품 환급 합계</span>
        <span class="ts-val plus">+ ₩ {{ fmt(categories.find(c => c.key === 'refund').total) }}</span>
      </div>
      <div class="ts-row">
        <span class="ts-label">기타 조정</span>
        <span class="ts-val" :class="categories.find(c => c.key === 'adjust').total < 0 ? 'minus' : 'plus'">
          {{ categories.find(c => c.key === 'adjust').total < 0 ? '−' : '+' }} ₩ {{ fmt(categories.find(c => c.key === 'adjust').total) }}
        </span>
      </div>
      <div class="ts-divider"></div>
      <div class="ts-row final">
        <span class="ts-label">최종 정산 금액</span>
        <span class="ts-val">₩ {{ fmt(
          categories.find(c => c.key === 'sales').total
          - categories.filter(c => ['order','shipping','commission','loss'].includes(c.key)).reduce((s,c) => s + c.total, 0)
          + categories.find(c => c.key === 'refund').total
          + categories.find(c => c.key === 'adjust').total
        ) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

/* ── 페이지 헤더 ── */
.page-header { margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

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
