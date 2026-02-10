<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for the sales list
const salesItems = ref([
  { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 2, unitPrice: 5000, totalPrice: 10000 },
  { productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 3, unitPrice: 7000, totalPrice: 21000 },
  { productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 1, unitPrice: 7000, totalPrice: 7000 },
  { productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 1, unitPrice: 13000, totalPrice: 13000 },
  { productCode: 'RO0103', productName: '로제 떡볶이 밀키트 순한맛 3,4인분', quantity: 2, unitPrice: 17000, totalPrice: 34000 }
])

const grandTotal = computed(() => {
  return salesItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)

const submitSale = () => {
  alert('결제 완료')
  router.push('/products')
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>상품 판매 등록</h2>
    </div>

    <div class="list-card">
      <div class="table-scroll-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>제품 코드</th>
              <th>제품 이름</th>
              <th>수량</th>
              <th>단위 금액</th>
              <th>총 금액</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in salesItems" :key="index">
              <td class="code-cell">{{ item.productCode }}</td>
              <td class="name-cell">{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatPrice(item.unitPrice) }}</td>
              <td>{{ formatPrice(item.totalPrice) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="sales-summary">
        <span class="total-label">총 결제 금액</span>
        <span class="total-value">{{ formatPrice(grandTotal) }}</span>
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="$router.back()">취소</button>
        <button class="submit-btn" @click="submitSale">결제 완료</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-row { margin-bottom: 1rem; }
.content-wrapper { max-width: 1000px; margin: 0 auto; padding: 1rem; }

.list-card { background: white; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); }
.table-scroll-container { overflow-x: auto; width: 100%; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; }

.data-table { width: 100%; border-collapse: collapse; min-width: 900px; }
.data-table th, .data-table td { white-space: nowrap; padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); }
.data-table th { text-align: left; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; }
.data-table td { font-size: 0.85rem; }

.code-cell { color: var(--text-light); }
.name-cell { color: var(--text-dark); }

.sales-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}
.total-label { font-size: 1.1rem; font-weight: 700; color: var(--text-dark); }
.total-value { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

.actions { display: flex; justify-content: flex-end; gap: 1rem; }
.cancel-btn { background: white; border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
.submit-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
</style>
