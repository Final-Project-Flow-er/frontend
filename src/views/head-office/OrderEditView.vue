<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 수정</h2>
      <div class="header-actions">
        <button @click="cancelEdit" class="back-btn">취소</button>
        <button @click="saveChanges" class="action-btn" :disabled="orderItem && orderItem.orderStatus !== '대기'">저장</button>
      </div>
    </div>

    <div class="detail-card" v-if="orderItem">
      <div class="section-title">
        <h3>기본 정보</h3>
        <span :class="['status-tag', getStatusClass(orderItem.orderStatus)]">{{ orderItem.orderStatus }}</span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>발주 코드</label>
          <span>{{ orderItem.orderCode }}</span>
        </div>
        <div class="info-item">
          <label>발주 일자</label>
          <span>{{ orderItem.orderDate }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <template v-if="orderItem.orderStatus === '대기'">
        <div class="section-title"><h3>담당자 정보 수정</h3></div>
        <div class="info-grid">
          <div class="info-item">
            <label for="recipientName">이름</label>
            <input type="text" id="recipientName" v-model="editedRecipientName" />
          </div>
          <div class="info-item">
            <label for="recipientPhone">연락처</label>
            <input type="text" id="recipientPhone" v-model="editedRecipientPhone" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="section-title"><h3>배송 및 상품 정보 수정</h3></div>
        <div class="info-grid">
          <div class="info-item">
            <label>도착 예정일</label>
            <span>{{ orderItem.arrivalDate }}</span>
          </div>
          <div class="info-item">
            <label>도착 예정 시간</label>
            <span>{{ orderItem.arrivalTime }}</span>
          </div>
        </div>

        <div class="product-list-table">
          <div class="product-list-header">
            <span>상품 코드</span>
            <span>상품명</span>
            <span>수량</span>
            <span>개당 금액</span>
            <span>총 금액</span>
          </div>
          <div v-for="(product, index) in editedProducts" :key="index" class="product-list-item">
            <span>{{ product.productCode }}</span>
            <span>{{ product.productName }}</span>
            <input type="number" v-model.number="product.quantity" min="1" class="quantity-input" />
            <span>{{ formatPrice(product.amount) }}</span>
            <span>{{ formatPrice(product.quantity * product.amount) }}</span>
          </div>
          <div class="product-list-total">
            <label>총 발주 금액</label>
            <span class="total-price">{{ formatPrice(calculateTotalAmount) }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <p class="edit-disabled-message">발주 상태가 '대기'일 때만 수정 가능합니다. 현재 상태: <span :class="getStatusClass(orderItem.orderStatus)">{{ orderItem.orderStatus }}</span></p>
      </template>

    </div>
    <div v-else class="loading">
      Loading...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

const orderItem = ref(null)
const editedRecipientName = ref('')
const editedRecipientPhone = ref('')
const editedProducts = ref([])

// Mock Data - In a real app, fetch by orderId from an API
const orders = [
  { 
    orderStatus: '대기', 
    orderDate: '2023-10-25', 
    orderCode: 'HEAD20231025001', 
    recipientName: '김민기', 
    recipientPhone: '010-1111-2222', 
    address: '서울시 강남구 테헤란로 123',
    arrivalDate: '2023-10-27', 
    arrivalTime: '14:00', 
    products: [
      { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 50, amount: 10000 },
      { productCode: 'OR0103', productName: '오리지널 떡볶이 밀키트 순한맛 3,4인분', quantity: 20, amount: 18000 }
    ],
    totalAmount: 860000 
  },
  { 
    orderStatus: '배송중', 
    orderDate: '2023-10-24', 
    orderCode: 'HEAD20231024005', 
    recipientName: '송지은', 
    recipientPhone: '010-3333-4444', 
    address: '경기도 성남시 분당구 판교로 789',
    arrivalDate: '2023-10-26', 
    arrivalTime: '10:00', 
    products: [
      { productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 30, amount: 12000 },
      { productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 10, amount: 12000 }
    ],
    totalAmount: 480000
  },
  { 
    orderStatus: '배송완료', 
    orderDate: '2023-10-23', 
    orderCode: 'HEAD20231023020', 
    recipientName: '박원규', 
    recipientPhone: '010-5555-6666', 
    address: '부산시 해운대구 마린시티 456',
    arrivalDate: '2023-10-25', 
    arrivalTime: '16:30', 
    products: [
      { productCode: 'MA0303', productName: '마라 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 200, amount: 22000 },
      { productCode: 'RO0103', productName: '로제 떡볶이 밀키트 순한맛 3,4인분', quantity: 50, amount: 22000 }
    ],
    totalAmount: 5500000 
  },
  { 
    orderStatus: '취소', 
    orderDate: '2023-10-22', 
    orderCode: 'HEAD20231022030', 
    recipientName: '김민수', 
    recipientPhone: '010-7777-8888', 
    address: '인천시 남동구 구월동 789',
    arrivalDate: '2023-10-24', 
    arrivalTime: '11:00', 
    products: [
      { productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 30, amount: 18000 },
      { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 10, amount: 10000 }
    ],
    totalAmount: 640000
  },
]

onMounted(() => {
  const foundOrder = orders.find(o => o.orderCode === orderId)
  if (foundOrder) {
    orderItem.value = foundOrder
    editedRecipientName.value = foundOrder.recipientName
    editedRecipientPhone.value = foundOrder.recipientPhone
    // Deep copy products to avoid direct mutation of original mock data
    editedProducts.value = foundOrder.products.map(p => ({ ...p }))
  }
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
}[s] || '')

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const calculateTotalAmount = computed(() => {
  if (!editedProducts.value) return 0
  return editedProducts.value.reduce((sum, product) => sum + (product.quantity * product.amount), 0)
})

const saveChanges = () => {
  if (orderItem.value.orderStatus !== '대기') {
    alert('발주 상태가 대기가 아니므로 수정할 수 없습니다.')
    return
  }
  // In a real app, send edited data to API
  console.log('Saving changes:', {
    orderCode: orderId,
    recipientName: editedRecipientName.value,
    recipientPhone: editedRecipientPhone.value,
    products: editedProducts.value,
    totalAmount: calculateTotalAmount.value
  })
  alert('수정 사항이 저장되었습니다.')
  router.back()
}

const cancelEdit = () => {
  router.back()
}
</script>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { font-size: 1.5rem; color: var(--text-dark); margin: 0; }
.header-actions { display: flex; gap: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--text-light); color: var(--text-dark); }
.action-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.action-btn:disabled { background: #cccccc; cursor: not-allowed; }
.action-btn:hover:not(:disabled) { background: var(--primary-dark); }


.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item.full-width { grid-column: 1 / -1; }

.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.info-item span, .info-item input { font-size: 1rem; color: var(--text-dark); }
.info-item input {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 200px;
}
.total-price { font-weight: 700; color: var(--primary); font-size: 1.1rem !important; }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.loading { text-align: center; padding: 3rem; color: var(--text-light); }

.product-list-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 1.5rem;
}

.product-list-header, .product-list-item {
  display: grid;
  grid-template-columns: 2fr 3fr 1.5fr 2fr 2fr; /* Adjusted column widths for quantity input */
  padding: 0.8rem 1.5rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.product-list-header {
  background: #f8fafc;
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.product-list-item {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.product-list-item:last-child {
  border-bottom: none;
}

.product-list-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  font-weight: 700;
  font-size: 1rem;
  gap: 1rem;
}

.product-list-total .total-price {
  color: var(--primary);
  font-size: 1.2rem !important;
}

.quantity-input {
  width: 80px; /* Adjust width as needed */
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.edit-disabled-message {
  padding: 1.5rem;
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: center;
  font-weight: 600;
}
</style>