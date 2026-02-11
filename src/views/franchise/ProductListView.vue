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

const groupedSales = computed(() => {
  const groups = {}
  filteredSales.value.forEach(item => {
    if (!groups[item.salesCode]) {
      groups[item.salesCode] = {
        salesCode: item.salesCode,
        date: item.date,
        items: [],
        totalAmount: 0
      }
    }
    groups[item.salesCode].items.push(item)
    groups[item.salesCode].totalAmount += item.totalPrice
  })
  return Object.values(groups)
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const cancelSale = () => {
  alert('취소 완료')
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
        <input type="text" v-model="filter.salesCode" placeholder="2026021014220001" />
      </div>
      <div class="filter-group">
        <label>판매 일시</label>
        <input type="date" v-model="filter.date" />
      </div>
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="OR0101" />
      </div>
      <div class="filter-group">
        <label>제품 이름</label>
        <input type="text" v-model="filter.productName" placeholder="제품명" />
      </div>
      <div class="filter-group">
        <label>수량</label>
        <input type="number" v-model="filter.quantity" placeholder="0" />
      </div>
    </div>

    <div class="data-table-card">
      <div class="table-scroll-container">
        <table class="data-table">
          <thead>
            <tr><th>판매 코드</th><th>판매 일시</th><th>제품 코드</th><th>제품 이름</th><th>수량</th><th>단위 금액</th><th>단위 총 금액</th><th>총 금액</th><th>취소</th></tr>
          </thead>
          <tbody>
            <tr v-for="group in groupedSales" :key="group.salesCode">
              <td class="sku-cell">{{ group.salesCode }}</td>
              <td>{{ group.date }}</td>
              <td>
                <div v-for="(item, idx) in group.items" :key="idx" class="nested-item">{{ item.productCode }}</div>
              </td>
              <td class="name-cell">
                <div v-for="(item, idx) in group.items" :key="idx" class="nested-item">{{ item.productName }}</div>
              </td>
              <td>
                <div v-for="(item, idx) in group.items" :key="idx" class="nested-item">{{ item.quantity }}개</div>
              </td>
              <td>
                <div v-for="(item, idx) in group.items" :key="idx" class="nested-item">{{ formatPrice(item.unitPrice) }}</div>
              </td>
              <td>
                <div v-for="(item, idx) in group.items" :key="idx" class="nested-item">{{ formatPrice(item.quantity * item.unitPrice) }}</div>
              </td>
              <td class="total-cell">
                <div class="grand-total">{{ formatPrice(group.totalAmount) }}</div>
              </td>
              <td><button class="action-btn" @click="cancelSale">취소</button></td>
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

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); }
.table-scroll-container { overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; }
.data-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
.data-table th, .data-table td { white-space: nowrap; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.data-table th { text-align: left; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; }
.data-table td { font-size: 0.85rem; }
.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { color: var(--text-dark); }
.action-btn { background: white; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

.nested-item {
  padding: 0.2rem 0;
  border-bottom: 1px dashed #edf2f7;
}
.nested-item:last-child {
  border-bottom: none;
}

.total-cell { }
.grand-total { font-weight: 700; color: var(--primary); font-size: 1rem; }
.sub-totals { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
.sub-price { font-size: 0.8rem; color: var(--text-light); }
</style>
