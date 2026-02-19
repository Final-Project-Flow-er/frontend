<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = ref({
  salesCode: '',
  date: '',
  productCode: '',
  productName: '',
  quantity: ''
})

const sales = ref([
  { salesCode: '2023102614300001', date: '2023-10-26 14:30', productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 5, unitPrice: 5000, totalPrice: 25000 },
  { salesCode: '2023102614300001', date: '2023-10-26 14:30', productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 2, unitPrice: 7000, totalPrice: 14000 },
  { salesCode: '2023102510150001', date: '2023-10-25 10:15', productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 3, unitPrice: 7000, totalPrice: 21000 },
  { salesCode: '2023102510150001', date: '2023-10-25 10:15', productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 1, unitPrice: 13000, totalPrice: 13000 },
  { salesCode: '2023102409000001', date: '2023-10-24 09:00', productCode: 'RO0103', productName: '로제 떡볶이 밀키트 순한맛 3,4인분', quantity: 1, unitPrice: 17000, totalPrice: 17000 },
  { salesCode: '2023102409000001', date: '2023-10-24 09:00', productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 4, unitPrice: 7000, totalPrice: 28000 },
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

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const goToSalesDetail = (salesCode) => {
  router.push({ name: 'franchise-sales-detail', params: { salesCode } })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 판매 관리</h2>
      <router-link :to="{ name: 'franchise-product-sales-form' }" class="add-btn">상품 판매</router-link>
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
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="Code..." />
      </div>
      <div class="filter-group grow-2">
        <label>제품 이름</label>
        <input type="text" v-model="filter.productName" placeholder="Product Name..." />
      </div>
      <div class="filter-group narrow">
        <label>수량</label>
        <input type="number" v-model="filter.quantity" placeholder="0" />
      </div>
    </div>

    <div class="data-table-card">
      <div class="table-scroll-container">
        <table class="data-table">
          <thead>
          <tr>
            <th>판매 코드</th>
            <th>판매 일시</th>
            <th>제품 코드</th>
            <th>제품 이름</th>
            <th class="text-right">수량</th>
            <th class="text-right">단가</th>
            <th class="text-right">총 금액</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, index) in filteredSales" :key="index" class="clickable-row" @click="goToSalesDetail(item.salesCode)">
            <!-- [변경] 판매 코드: code-cell 제거 후 sku-cell (파란색) 적용 -->
            <td class="sku-cell">{{ item.salesCode }}</td>
            <td>{{ item.date }}</td>
            <td class="sku-cell">{{ item.productCode }}</td>
            <td class="name-cell">{{ item.productName }}</td>
            <td class="text-right">{{ item.quantity }}</td>
            <td class="text-right">{{ formatPrice(item.unitPrice) }}</td>
            <td class="text-right total-cell">{{ formatPrice(item.totalPrice) }}</td>
          </tr>
          </tbody>
        </table>
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
.data-table th, .data-table td { white-space: nowrap; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.data-table th { text-align: left; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; }
.data-table td { font-size: 0.85rem; }

/* [변경] code-cell 스타일 삭제, sku-cell이 판매 코드에도 적용됨 */
.sku-cell { color: var(--primary); font-weight: 600; } /* 제품 코드 & 판매 코드 파란색 */

.name-cell { color: var(--text-dark); max-width: 300px; white-space: normal; }
.total-cell { font-weight: 700; color: var(--text-dark); }
.text-right { text-align: right; }
.text-center { text-align: center; }



.clickable-row { cursor: pointer; transition: background 0.15s; }
.clickable-row:hover { background: #f8fafc; }

:root {
  --primary: #4f46e5;
  --text-light: #64748b;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
}
</style>
