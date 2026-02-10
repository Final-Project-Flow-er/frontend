<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data for the sales list
const salesItems = ref([
  { productCode: 'P-001', productName: '오리지널 떡볶이 소스', quantity: 2, unitPrice: 4500, totalPrice: 9000 },
  { productCode: 'P-002', productName: '밀떡 (1kg)', quantity: 3, unitPrice: 3000, totalPrice: 9000 },
  { productCode: 'P-004', productName: '단무지 (500g)', quantity: 1, unitPrice: 2000, totalPrice: 2000 }
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
        <tfoot>
          <tr class="total-row">
            <td colspan="4" class="total-label">합계</td>
            <td class="total-value">{{ formatPrice(grandTotal) }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="actions">
        <button class="cancel-btn" @click="$router.back()">취소</button>
        <button class="submit-btn" @click="submitSale">결제 완료</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-row { margin-bottom: 2rem; }
.content-wrapper { max-width: 1000px; margin: 0 auto; }

.list-card { background: white; padding: 2rem; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }

.data-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
.data-table th { text-align: left; padding: 1rem; background: #f8fafc; color: var(--text-light); font-size: 0.9rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 1rem; }

.code-cell { color: var(--text-light); }
.name-cell { font-weight: 600; color: var(--text-dark); }

.total-row td { background: #f8fafc; font-weight: 700; border-top: 2px solid var(--border-color); }
.total-label { text-align: right; font-size: 1.1rem; }
.total-value { font-size: 1.2rem; color: var(--primary); }

.actions { display: flex; justify-content: flex-end; gap: 1rem; }
.cancel-btn { background: white; border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
.submit-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
</style>
