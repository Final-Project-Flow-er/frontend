<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const selectedMonth = ref(route.query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

/* ── 시드 기반 Mock 데이터 ── */
const seed = (str) => { let h = 0; for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0 }; return Math.abs(h) }
const seededRand = (s, min, max) => min + (s % (max - min + 1))

const allProducts = [
  { name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 10000 },
  { name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 18000 },
  { name: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 18000 },
  { name: '로제 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 12000 },
  { name: '로제 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 22000 },
  { name: '로제 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 순한맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 기본맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 매운맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 아주 매운맛 1,2인분', unitPrice: 12000 },
  { name: '마라 떡볶이 밀키트 순한맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 기본맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 매운맛 3,4인분', unitPrice: 22000 },
  { name: '마라 떡볶이 밀키트 아주 매운맛 3,4인분', unitPrice: 22000 },
]

const orderItems = computed(() => {
  const m = selectedMonth.value
  const items = allProducts.map((p) => {
    const base = seed(m + 'order' + p.name)
    const qty = seededRand(base, 5, 200)
    return { product: p.name, qty, unitPrice: p.unitPrice, total: qty * p.unitPrice }
  })
  return items.sort((a, b) => b.qty - a.qty)
})

const totalQty = computed(() => orderItems.value.reduce((s, i) => s + i.qty, 0))
const totalAmount = computed(() => orderItems.value.reduce((s, i) => s + i.total, 0))
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <div>
          <h1 class="page-title">발주내역 (전체)</h1>
          <p class="page-desc">{{ selectedMonth }} 월별 전체 발주내역입니다.</p>
        </div>
      </div>
    </div>

    <!-- 월 선택 -->
    <div class="control-bar">
      <input type="month" v-model="selectedMonth" class="date-input" />
    </div>

    <!-- 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>발주내역</h3>
        <span class="badge">{{ orderItems.length }}개 상품</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>제품명</th>
            <th class="text-right">총 수량</th>
            <th class="text-right">개당 가격</th>
            <th class="text-right">총 금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in orderItems" :key="idx">
            <td class="rank-cell">{{ idx + 1 }}</td>
            <td>{{ item.product }}</td>
            <td class="text-right">{{ item.qty }}</td>
            <td class="text-right">₩ {{ fmt(item.unitPrice) }}</td>
            <td class="text-right"><strong>₩ {{ fmt(item.total) }}</strong></td>
          </tr>
          <tr class="total-row">
            <td></td>
            <td><strong>합계</strong></td>
            <td class="text-right"><strong>{{ totalQty }}</strong></td>
            <td></td>
            <td class="text-right"><strong>₩ {{ fmt(totalAmount) }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }

.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.control-bar { margin-bottom: 1.5rem; }
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
</style>
