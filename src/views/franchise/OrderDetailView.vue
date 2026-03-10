<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/franchiseOrders.js'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderItem = ref(null)

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''
const formatTime = (iso) => iso ? iso.replace('T', ' ').substring(11, 16) : ''

onMounted(async () => {
  try {
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
      totalAmount: (data.items || []).reduce((sum, p) => sum + (p.quantity * Number(p.unitPrice || 0)), 0)
    }
  } catch (e) {
    alert(e.message)
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

const cancelOrder = async () => {
  if (orderItem.value.orderStatus !== '대기') {
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

const goToEdit = () => {
  router.push({ name: 'head-office-order-edit', params: { id: orderId } })
}
</script>

<template>
  <div class="content-wrapper" v-if="orderItem">
    <div class="header-row">
      <h2>발주 상세 정보</h2>
      <div class="header-actions">
        <button v-if="orderItem.orderStatus === '대기'" @click="cancelOrder" class="delete-btn">발주 취소</button>
        <button v-if="orderItem.orderStatus === '대기'" @click="goToEdit" class="edit-btn">수정</button>
        <button @click="$router.back()" class="back-btn">목록으로 돌아가기</button>
      </div>
    </div>

    <div class="detail-card">
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
          <span>{{ product.productCode }}</span>
          <span>{{ product.productName }}</span>
          <span>{{ product.quantity }}개</span>
          <span>{{ formatPrice(product.amount) }}</span>
          <span>{{ formatPrice(product.quantity * product.amount) }}</span>
        </div>
        <div class="product-list-total">
          <label>총 발주 금액</label>
          <span class="total-price">{{ formatPrice(orderItem.totalAmount) }}</span>
        </div>
      </div>


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
  overflow: hidden;
  margin-top: 1.5rem;
}

.product-list-header, .product-list-item {
  display: grid;
  grid-template-columns: 2fr 3fr 1fr 2fr 2fr; /* Adjust column widths as needed */
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

</style>
