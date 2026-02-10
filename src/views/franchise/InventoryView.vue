<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  searchQuery: { type: String, default: '' }
})

const inventoryItems = ref([
  { id: 'OR0101', name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', category: '밀키트', stock: 150, price: 10000, status: '정상' },
  { id: 'MA0301', name: '마라 떡볶이 밀키트 매운맛 1,2인분', category: '밀키트', stock: 85, price: 12000, status: '정상' },
  { id: 'RO0201', name: '로제 떡볶이 밀키트 기본맛 1,2인분', category: '밀키트', stock: 42, price: 12000, status: '정상' },
  { id: 'OR0103', name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', category: '밀키트', stock: 12, price: 18000, status: '정상' },
])

const selectedCategory = ref('전체')
const categories = ['전체', '밀키트']

const filteredItems = computed(() => {
  return inventoryItems.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(props.searchQuery.toLowerCase()) || 
                         item.id.toLowerCase().includes(props.searchQuery.toLowerCase())
    const matchesCategory = selectedCategory.value === '전체' || item.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)
const getStatusClass = (s) => ({ '정상': 'status-ok', '품절임박': 'status-warning', '품절': 'status-danger' }[s] || '')
</script>

<template>
  <div class="content-wrapper">
    <section class="summary-section">
      <div class="summary-card"><span class="s-label">총 재고 액</span><p class="s-value">₩ 3,240,000</p></div>
      <div class="summary-card"><span class="s-label">전체 SKU</span><p class="s-value">{{ inventoryItems.length }}건</p></div>
      <div class="summary-card warn"><span class="s-label">품절/부족</span><p class="s-value">2건</p></div>
    </section>

    <div class="control-bar">
      <div class="filter-tabs">
        <button v-for="cat in categories" :key="cat" :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">{{ cat }}</button>
      </div>
      <button class="add-btn">+ 신규 품목 등록</button>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr><th>SKU 번호</th><th>상품 명칭</th><th>카테고리</th><th>현재 재고</th><th>단가</th><th>상태</th><th>작업</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <td class="sku-cell">{{ item.id }}</td>
            <td class="name-cell">{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td :class="{ 'text-danger': item.stock < 5 }"><strong>{{ item.stock }}</strong> 개</td>
            <td>{{ formatPrice(item.price) }}</td>
            <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
            <td><button class="action-btn edit">관리</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.summary-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.s-label { font-size: 0.9rem; color: var(--text-light); }
.s-value { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
.summary-card.warn .s-value { color: #ef4444; }
.control-bar { display: flex; justify-content: space-between; margin-bottom: 1.25rem; }
.filter-tabs { display: flex; gap: 8px; }
.filter-tabs button { padding: 0.5rem 1.2rem; border-radius: 999px; border: 1px solid var(--border-color); background: white; cursor: pointer; }
.filter-tabs button.active { background: var(--primary); color: white; }
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.sku-cell { color: var(--primary); font-weight: 600; }
.status-tag { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-danger { background: #fee2e2; color: #991b1b; }
.text-danger { color: #ef4444; }
</style>