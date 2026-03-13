<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, cancelOrder as cancelOrderApi } from '@/api/hqOrders.js'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderItem = ref(null)

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

onMounted(async () => {
  try {
    const data = await getOrderDetail(orderId)
    const info = data.orderInfo || data
    const items = data.items || []
    orderItem.value = {
      orderCode: info.orderCode,
      orderStatus: info.status,
      orderDate: formatDate(info.requestedDate),
      franchiseCode: '',
      managerName: info.username || '',
      managerPhone: info.phoneNumber || '',
      stockInDate: info.storedDate || '',
      arrivalDate: formatDate(info.manufacturedDate),
      products: items.map(item => ({
        productCode: item.productCode || '',
        quantity: item.quantity || 0,
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.totalPrice || 0)
      })),
      totalAmount: items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    }
  } catch (e) {
    alert(e.message)
  }
})

const HQ_ORDER_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  CANCELED: '취소',
  REJECTED: '반려'
}
const toStatusLabel = (s) => HQ_ORDER_STATUS_LABEL[s] || s

const getStatusClass = (s) => {
  const label = HQ_ORDER_STATUS_LABEL[s] || s
  return {
    '대기': 'status-warning',
    '접수': 'status-ok',
    '취소': 'status-danger',
    '반려': 'status-danger'
  }[label] || ''
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const goToEdit = () => {
  router.push({ name: 'head-office-order-edit', params: { id: orderItem.value.orderCode } })
}

const cancelOrder = async () => {
  if (!confirm('이 발주를 취소하시겠습니까?')) return
  try {
    await cancelOrderApi(orderId)
    alert('발주가 취소되었습니다.')
    router.push({ name: 'head-office-order-list' })
  } catch (e) {
    alert(e.message || '발주 취소에 실패했습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper" v-if="orderItem">
    <div class="header-row">
      <h2>본사 발주 상세 내역</h2>
      <div class="header-actions">
        <button v-if="orderItem.orderStatus === 'PENDING'" @click="goToEdit" class="edit-btn">수정</button>
        <button v-if="orderItem.orderStatus === 'PENDING'" @click="cancelOrder" class="cancel-btn-outline">발주 취소</button>
        <button @click="$router.back()" class="back-btn">목록으로 돌아가기</button>
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
          <label>가맹점 코드</label>
          <span>{{ orderItem.franchiseCode }}</span>
        </div>
        <div class="info-item">
          <label>발주 일자</label>
          <span>{{ orderItem.orderDate }}</span>
        </div>
        <div class="info-item">
          <label>입고 날짜</label>
          <span>{{ orderItem.stockInDate }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title"><h3>담당자 정보</h3></div>
      <div class="info-grid">
        <div class="info-item">
          <label>담당자 이름</label>
          <span>{{ orderItem.managerName }}</span>
        </div>
        <div class="info-item">
          <label>담당자 전화번호</label>
          <span>{{ orderItem.managerPhone }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title"><h3>상품 정보</h3></div>
      <div class="product-list-table">
        <div class="product-list-header">
          <span>제품 코드</span>
          <span class="text-right">수량</span>
          <span class="text-right">단가</span>
          <span class="text-right">총 금액</span>
        </div>
        <div v-for="(product, index) in orderItem.products" :key="index" class="product-list-item">
          <span>{{ product.productCode }}</span>
          <span class="text-right">{{ product.quantity }}개</span>
          <span class="text-right">{{ formatPrice(product.unitPrice) }}원</span>
          <span class="text-right">{{ formatPrice(product.totalPrice) }}원</span>
        </div>
        <div class="product-list-total">
          <label>총 발주 금액</label>
          <span class="total-price">{{ formatPrice(orderItem.totalAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1000px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { font-size: 1.5rem; color: var(--text-dark); margin: 0; }
.header-actions { display: flex; gap: 1rem; }

.edit-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
.edit-btn:hover { background: #000; }
.cancel-btn-outline { background: white; color: #ef4444; border: 1px solid #fecaca; padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 700; transition: all 0.2s; }
.cancel-btn-outline:hover { background: #fee2e2; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-light); }

.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }
.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item.full-width { grid-column: 1 / -1; }
.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.info-item span { font-size: 1rem; color: var(--text-dark); font-weight: 500; }

.status-tag { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.product-list-table { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-top: 1.5rem; }
.product-list-header, .product-list-item { display: grid; grid-template-columns: 2fr 1fr 1.5fr 1.5fr; padding: 0.8rem 1.5rem; align-items: center; border-bottom: 1px solid var(--border-color); }
.text-right { text-align: right; }
.product-list-header { background: #f8fafc; font-weight: 600; color: var(--text-light); font-size: 0.9rem; }
.product-list-item { font-size: 0.9rem; border-bottom: 1px solid var(--border-color); }
.product-list-item:last-child { border-bottom: none; }
.product-list-total { display: flex; justify-content: flex-end; align-items: center; padding: 1rem 1.5rem; background: #f8fafc; font-weight: 700; gap: 1rem; border-top: 1px solid var(--border-color); }
.total-price { color: var(--primary); font-size: 1.2rem; }
</style>
