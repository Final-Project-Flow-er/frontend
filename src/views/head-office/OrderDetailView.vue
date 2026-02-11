<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderItem = ref(null)

const orders = [
  { 
    orderStatus: '대기', 
    orderDate: '2023-10-25', 
    orderCode: 'HEAD20231025001', 
    franchiseCode: 'SE01',
    managerName: '김민기', 
    managerPhone: '010-1111-2222', 
    stockInDate: '2023-10-27',
    arrivalDate: '2023-10-27', 
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
    franchiseCode: 'SE02',
    managerName: '송지은', 
    managerPhone: '010-3333-4444', 
    stockInDate: '2023-10-26',
    arrivalDate: '2023-10-26', 
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
    franchiseCode: 'SE03',
    managerName: '박원규', 
    managerPhone: '010-5555-6666', 
    stockInDate: '2023-10-25',
    arrivalDate: '2023-10-25', 
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
    franchiseCode: 'SE04',
    managerName: '김민수', 
    managerPhone: '010-7777-8888', 
    stockInDate: '-',
    arrivalDate: '2023-10-24', 
    products: [
      { productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 30, amount: 18000 },
      { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 10, amount: 10000 }
    ],
    totalAmount: 640000
  }
]

onMounted(() => {
  orderItem.value = orders.find(o => o.orderCode === orderId) || orders[0] // Fallback for demo
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수 완료': 'status-ok',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
}[s] || '')

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const goToEdit = () => {
  router.push({ name: 'head-office-order-edit', params: { id: orderItem.value.orderCode } })
}

const cancelOrder = () => {
  if (confirm('이 발주를 취소하시겠습니까?')) {
    orderItem.value.orderStatus = '취소'
    alert('발주가 취소되었습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper" v-if="orderItem">
    <div class="header-row">
      <h2>본사 발주 상세 내역</h2>
      <div class="header-actions">
        <button v-if="orderItem.orderStatus === '대기'" @click="goToEdit" class="edit-btn">수정</button>
        <button v-if="orderItem.orderStatus === '대기'" @click="cancelOrder" class="cancel-btn-outline">발주 취소</button>
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
.product-list-header, .product-list-item { display: grid; grid-template-columns: 1fr 2fr 1fr 1fr 1fr; padding: 0.8rem 1.5rem; align-items: center; border-bottom: 1px solid var(--border-color); }
.product-list-header { background: #f8fafc; font-weight: 600; color: var(--text-light); font-size: 0.9rem; }
.product-list-item { font-size: 0.9rem; border-bottom: 1px solid var(--border-color); }
.product-list-item:last-child { border-bottom: none; }
.product-list-total { display: flex; justify-content: flex-end; align-items: center; padding: 1rem 1.5rem; background: #f8fafc; font-weight: 700; gap: 1rem; border-top: 1px solid var(--border-color); }
.total-price { color: var(--primary); font-size: 1.2rem; }
</style>
