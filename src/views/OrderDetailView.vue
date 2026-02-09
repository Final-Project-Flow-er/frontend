<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const orderItem = ref(null)

// Mock Data - In a real app, fetch by orderId
const orders = [
  { 
    orderStatus: '대기', 
    orderDate: '2023-10-25', 
    orderCode: 'ORD-001', 
    recipientName: '김철수', 
    recipientPhone: '010-1234-5678', 
    address: '서울시 강남구 테헤란로 123',
    arrivalDate: '2023-10-27', 
    arrivalTime: '14:00', 
    productCode: 'P-001',
    productName: '오리지널 떡볶이 밀키트',
    quantity: 50,
    amount: 12900,
    totalAmount: 645000
  },
  { 
    orderStatus: '배송중', 
    orderDate: '2023-10-24', 
    orderCode: 'ORD-002', 
    recipientName: '이영희', 
    recipientPhone: '010-9876-5432', 
    address: '서울시 서초구 서초대로 456',
    arrivalDate: '2023-10-26', 
    arrivalTime: '10:00', 
    productCode: 'P-002',
    productName: '로제 떡볶이 밀키트',
    quantity: 30,
    amount: 14900,
    totalAmount: 447000
  },
  { 
    orderStatus: '배송완료', 
    orderDate: '2023-10-23', 
    orderCode: 'ORD-003', 
    recipientName: '박민수', 
    recipientPhone: '010-5555-4444', 
    address: '경기도 성남시 분당구 판교로 789',
    arrivalDate: '2023-10-25', 
    arrivalTime: '16:30', 
    productCode: 'P-003',
    productName: '마라 떡볶이 밀키트',
    quantity: 20,
    amount: 14900,
    totalAmount: 298000
  },
  { 
    orderStatus: '취소', 
    orderDate: '2023-10-22', 
    orderCode: 'ORD-004', 
    recipientName: '최지원', 
    recipientPhone: '010-1111-2222', 
    address: '인천광역시 송도과학로 10',
    arrivalDate: '-', 
    arrivalTime: '-', 
    productCode: 'P-004',
    productName: '짜장 떡볶이 밀키트',
    quantity: 10,
    amount: 11900,
    totalAmount: 119000
  },
]

onMounted(() => {
  // Simulate fetch
  orderItem.value = orders.find(o => o.orderCode === orderId)
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
}[s] || '')

const cancelOrder = () => {
  if (orderItem.value.orderStatus !== '대기') {
    alert('발주 상태가 대기가 아니면 취소할 수 없습니다.')
    return
  }
  // In a real app, API call to cancel order
  alert('발주가 취소되었습니다.')
  router.push('/orders')
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)
</script>

<template>
  <div class="content-wrapper" v-if="orderItem">
    <div class="header-row">
      <h2>발주 상세 정보</h2>
      <div class="header-actions">
        <button @click="cancelOrder" class="delete-btn">발주 취소</button>
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
        <div class="info-item">
          <label>상품 코드</label>
          <span>{{ orderItem.productCode }}</span>
        </div>
        <div class="info-item">
          <label>상품명</label>
          <span>{{ orderItem.productName }}</span>
        </div>
        <div class="info-item">
          <label>수량</label>
          <span>{{ orderItem.quantity }}개</span>
        </div>
        <div class="info-item">
          <label>개당 금액</label>
          <span>{{ formatPrice(orderItem.amount) }}</span>
        </div>
        <div class="info-item">
          <label>총 금액</label>
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
</style>
