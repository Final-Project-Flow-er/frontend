<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, cancelOrder as cancelOrderApi, updateOrder } from '@/api/franchiseOrders.js'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderItem = ref(null)

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''
const formatTime = (iso) => iso ? iso.replace('T', ' ').substring(11, 16) : ''

const ORDER_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  PARTIAL: '부분 접수',
  SHIPPING_PENDING: '배송 대기',
  SHIPPING: '배송중',
  COMPLETED: '배송 완료',
  CANCELED: '취소',
  REJECTED: '반려'
}
const toStatusLabel = (s) => ORDER_STATUS_LABEL[s] || s

onMounted(async () => {
  try {
    await fetchDetail()
  } catch (e) {
    alert(e.message)
  }
})

const getStatusClass = (s) => {
  const label = ORDER_STATUS_LABEL[s] || s
  return {
    '대기': 'status-warning',
    '접수': 'status-info',
    '부분 접수': 'status-info',
    '배송 대기': 'status-warning',
    '배송중': 'status-primary',
    '배송 완료': 'status-ok',
    '취소': 'status-danger',
    '반려': 'status-danger'
  }[label] || ''
}

const cancelOrder = async () => {
  if (orderItem.value.orderStatus !== 'PENDING') {
    alert('발주 상태가 대기가 아니면 취소할 수 없습니다.')
    return
  }
  if (!confirm('이 발주를 취소하시겠습니까?')) return
  try {
    await cancelOrderApi(orderId)
    alert('발주가 취소되었습니다.')
    router.push({ name: 'franchise-order-list' })
  } catch (e) {
    alert(e.message || '발주 취소에 실패했습니다.')
  }
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const isEditing = ref(false)
const editQuantities = ref([])

const startEdit = () => {
  editQuantities.value = orderItem.value.products.map(p => p.quantity)
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const editTotalAmount = computed(() => {
  if (!orderItem.value) return 0
  return orderItem.value.products.reduce((sum, p, i) => sum + (editQuantities.value[i] || 0) * p.amount, 0)
})

const fetchDetail = async () => {
  const data = await getOrderDetail(orderId)
  orderItem.value = {
    orderCode: data.orderCode,
    orderStatus: data.status,
    orderDate: formatDate(data.requestedDate),
    recipientName: data.receiver,
    recipientPhone: data.phoneNumber,
    address: data.address,
    arrivalDate: formatDate(data.deliveryDate),
    arrivalTime: data.deliveryTime || formatTime(data.deliveryDate),
    products: (data.items || []).map(p => ({
      productCode: p.productCode,
      productName: p.productName,
      quantity: p.quantity,
      amount: Number(p.unitPrice || 0)
    })),
    totalAmount: (data.items || []).reduce((sum, p) => sum + (p.quantity * Number(p.unitPrice || 0)), 0),
    canceledReason: data.canceledReason || null
  }
}

const saveEdit = async () => {
  const data = orderItem.value.products.map((p, i) => ({
    productCode: p.productCode,
    quantity: editQuantities.value[i]
  }))
  try {
    await updateOrder(orderId, data)
    alert('수정이 완료되었습니다.')
    await fetchDetail()
    isEditing.value = false
  } catch (e) {
    alert(e.message || '수정에 실패했습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper" v-if="orderItem">
    <div class="header-row">
      <h2>발주 상세 정보</h2>
      <div class="header-actions">
        <template v-if="isEditing">
          <button @click="saveEdit" class="edit-btn">수정 완료</button>
          <button @click="cancelEdit" class="back-btn">취소</button>
        </template>
        <template v-else>
          <button v-if="orderItem.orderStatus === 'PENDING'" @click="cancelOrder" class="delete-btn">발주 취소</button>
          <button v-if="orderItem.orderStatus === 'PENDING'" @click="startEdit" class="edit-btn">수정</button>
          <button @click="$router.back()" class="back-btn">목록으로 돌아가기</button>
        </template>
      </div>
    </div>

    <div class="detail-card">
      <div class="section-title">
        <h3>기본 정보</h3>
        <span :class="['status-tag', getStatusClass(orderItem.orderStatus)]">{{ toStatusLabel(orderItem.orderStatus) }}</span>
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

      <div class="section-title"><h3>수령인 정보</h3></div>
      <div class="info-grid">
        <div class="info-item">
          <label>이름</label>
          <span>{{ orderItem.recipientName }}</span>
        </div>
        <div class="info-item">
          <label>연락처</label>
          <span>{{ orderItem.recipientPhone }}</span>
        </div>
        <div class="info-item full-width">
          <label>주소</label>
          <span>{{ orderItem.address }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title"><h3>배송 및 상품 정보</h3></div>
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
        <div v-for="(product, index) in orderItem.products" :key="index" class="product-list-item">
          <span class="sku-cell">{{ product.productCode }}</span>
          <span>{{ product.productName }}</span>
          <span v-if="isEditing"><input type="number" v-model.number="editQuantities[index]" min="1" class="qty-input" /></span>
          <span v-else>{{ product.quantity }}개</span>
          <span>{{ formatPrice(product.amount) }}</span>
          <span v-if="isEditing">{{ formatPrice((editQuantities[index] || 0) * product.amount) }}</span>
          <span v-else>{{ formatPrice(product.quantity * product.amount) }}</span>
        </div>
        <div class="product-list-total">
          <label>총 발주 금액</label>
          <span class="total-price">{{ formatPrice(isEditing ? editTotalAmount : orderItem.totalAmount) }}</span>
        </div>
      </div>

      <!-- 취소 사유 -->
      <template v-if="orderItem.canceledReason">
        <div class="divider"></div>
        <div class="section-title"><h3>취소 사유</h3></div>
        <div class="cancel-reason-box">
          <p>{{ orderItem.canceledReason }}</p>
        </div>
      </template>

    </div>
  </div>
  <div v-else class="loading">
    Loading...
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { font-size: 1.5rem; color: var(--text-dark); margin: 0; }
.header-actions { display: flex; gap: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--text-light); color: var(--text-dark); }
.delete-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.delete-btn:hover { background: #fecaca; }

.edit-btn { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.edit-btn:hover { background: #c7d2fe; }

.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item.full-width { grid-column: 1 / -1; }

.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.info-item span { font-size: 1rem; color: var(--text-dark); }
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
  overflow-x: auto;
  margin-top: 1.5rem;
}

.product-list-header, .product-list-item {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 0.8rem 1.5rem;
  align-items: center;
  justify-items: center;
  text-align: center;
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

.product-list-item .sku-cell { color: var(--primary); font-weight: 600; }

.product-list-item:last-child {
  border-bottom: none;
}

.product-list-total {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 0.8rem 1.5rem;
  align-items: center;
  background: #f8fafc;
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
}

.product-list-total label {
  grid-column: 1 / 5;
  text-align: center;
}

.product-list-total .total-price {
  color: var(--primary);
  font-size: 1.1rem;
}

.qty-input {
  width: 70px;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}

.cancel-reason-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem 1.5rem;
}
.cancel-reason-box p {
  margin: 0;
  color: #991b1b;
  font-size: 0.95rem;
  line-height: 1.6;
}

</style>
