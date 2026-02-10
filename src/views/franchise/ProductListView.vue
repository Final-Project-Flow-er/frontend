<script setup>
import { ref, computed } from 'vue'

const filter = ref({
  salesCode: '',
  date: '',
  productCode: '',
  productName: '',
  quantity: ''
})

const sales = ref([
  { salesCode: 'SAL-001', date: '2023-10-26', productCode: 'P-001', productName: '오리지널 떡볶이 소스', quantity: 50, unitPrice: 4500, totalPrice: 225000 },
  { salesCode: 'SAL-002', date: '2023-10-25', productCode: 'P-002', productName: '밀떡 (1kg)', quantity: 30, unitPrice: 3000, totalPrice: 90000 },
  { salesCode: 'SAL-003', date: '2023-10-24', productCode: 'P-003', productName: '어묵 (1kg)', quantity: 10, unitPrice: 5000, totalPrice: 50000 },
])

const filteredSales = computed(() => {
  return sales.value.filter(item => {
    const matchSalesCode = !filter.value.salesCode || item.salesCode.includes(filter.value.salesCode)
    const matchDate = !filter.value.date || item.date.includes(filter.value.date)
    const matchProductCode = !filter.value.productCode || item.productCode.includes(filter.value.productCode)
    const matchProductName = !filter.value.productName || item.productName.includes(filter.value.productName)
    const matchQuantity = !filter.value.quantity || item.quantity.toString() === filter.value.quantity
    
    return matchSalesCode && matchDate && matchProductCode && matchProductName && matchQuantity
  })
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)

const cancelSale = () => {
  alert('취소 완료')
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>판매 관리</h2>
      <router-link to="/products/sell" class="add-btn">상품 판매</router-link>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>판매 코드</label>
        <input type="text" v-model="filter.salesCode" placeholder="SAL-000" />
      </div>
      <div class="filter-group">
        <label>판매 일시</label>
        <input type="date" v-model="filter.date" />
      </div>
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="P-000" />
      </div>
      <div class="filter-group">
        <label>제품 이름</label>
        <input type="text" v-model="filter.productName" placeholder="제품명" />
      </div>
      <div class="filter-group">
        <label>수량</label>
        <input type="number" v-model="filter.quantity" placeholder="0" />
      </div>
      <button class="search-btn">조회</button>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr><th>판매 코드</th><th>판매 일시</th><th>제품 코드</th><th>제품 이름</th><th>수량</th><th>단위 금액</th><th>총 금액</th><th>취소</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredSales" :key="item.salesCode">
            <td class="sku-cell">{{ item.salesCode }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.productCode }}</td>
            <td class="name-cell">{{ item.productName }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatPrice(item.unitPrice) }}</td>
            <td>{{ formatPrice(item.totalPrice) }}</td>
            <td><button class="action-btn" @click="cancelSale">취소</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 150px;
}
.search-btn {
  background: var(--text-dark);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 42px; /* Align with inputs */
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { font-weight: 600; }
.action-btn { background: white; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }
</style>
