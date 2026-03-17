<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderDetail } from '@/api/franchiseOrders.js'

const props = defineProps({ orderCode: String })
const router = useRouter()

const detailData = ref(null)
const loading = ref(false)
const error = ref(null)

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''
const formatTime = (iso) => iso ? iso.replace('T', ' ').substring(11, 16) : ''
const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

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

const getStatusClass = (s) => {
  const label = ORDER_STATUS_LABEL[s] || s
  return {
    '대기': 'status-warning',
    '접수': 'status-ok',
    '부분 접수': 'status-primary',
    '배송 대기': 'status-warning',
    '배송중': 'status-primary',
    '배송 완료': 'status-ok',
    '취소': 'status-danger',
    '반려': 'status-danger'
  }[label] || ''
}

onMounted(async () => {
  if (!props.orderCode) {
    alert('발주 코드가 없습니다.')
    router.back()
    return
  }
  loading.value = true
  try {
    const data = await getOrderDetail(props.orderCode)
    detailData.value = {
      orderCode: data.orderCode,
      status: data.status,
      orderDate: formatDate(data.requestedDate),
      receiver: data.receiver || '',
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      arrivalDate: formatDate(data.deliveryDate),
      arrivalTime: data.deliveryTime || formatTime(data.deliveryDate),
      items: (data.items || []).map(item => ({
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.totalPrice || 0)
      })),
      totalAmount: (data.items || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const goBack = () => router.back()
</script>

<template>
  <div class="detail-wrapper">
    <div v-if="loading" class="loading-msg">데이터를 불러오는 중...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <template v-else-if="detailData">
      <!-- Header -->
      <div class="header-row">
        <button @click="goBack" class="back-btn">← 뒤로가기</button>
        <h2>발주 상세 정보</h2>
        <span :class="['status-badge', getStatusClass(detailData.status)]">
          {{ toStatusLabel(detailData.status) }}
        </span>
      </div>

      <!-- 기본 정보 -->
      <div class="info-card">
        <h3>기본 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>발주 코드</label>
            <p>{{ detailData.orderCode }}</p>
          </div>
          <div class="info-item">
            <label>발주 일자</label>
            <p>{{ detailData.orderDate }}</p>
          </div>
          <div class="info-item">
            <label>도착 예정일</label>
            <p>{{ detailData.arrivalDate }}</p>
          </div>
          <div class="info-item">
            <label>도착 예정 시간</label>
            <p>{{ detailData.arrivalTime }}</p>
          </div>
        </div>
      </div>

      <!-- 수령인 정보 -->
      <div class="info-card">
        <h3>수령인 정보</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>수령인 이름</label>
            <p>{{ detailData.receiver }}</p>
          </div>
          <div class="info-item">
            <label>연락처</label>
            <p>{{ detailData.phoneNumber }}</p>
          </div>
          <div class="info-item full-width">
            <label>주소</label>
            <p>{{ detailData.address }}</p>
          </div>
        </div>
      </div>

      <!-- 제품 목록 -->
      <div class="info-card">
        <h3>제품 상세 정보</h3>
        <div class="product-table-wrap">
          <table class="product-table">
            <thead>
              <tr>
                <th>제품 코드</th>
                <th>제품명</th>
                <th class="text-right">수량</th>
                <th class="text-right">단가</th>
                <th class="text-right">총 금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in detailData.items" :key="index">
                <td class="sku-cell">{{ item.productCode }}</td>
                <td>{{ item.productName }}</td>
                <td class="text-right">{{ item.quantity }}개</td>
                <td class="text-right">{{ formatPrice(item.unitPrice) }}원</td>
                <td class="text-right font-bold">{{ formatPrice(item.totalPrice) }}원</td>
              </tr>
            </tbody>
          </table>
          <div class="total-row">
            <span>총 발주 금액</span>
            <span class="total-price">{{ formatPrice(detailData.totalAmount) }}원</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 4rem;
  color: #1f2937;
}

.loading-msg { text-align: center; padding: 3rem; color: #6b7280; }
.error-msg { text-align: center; padding: 1.5rem; color: #991b1b; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca; }

.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
}

.header-row h2 {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.9rem;
}

.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-primary { background: #dbeafe; color: #1e40af; }

.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

.info-item.full-width { grid-column: 1 / -1; }

/* Product Table */
.product-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  background: #f9fafb;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.product-table td {
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border-bottom: 1px solid #e5e7eb;
}

.product-table tr:last-child td { border-bottom: none; }

.code-cell { color: #2563eb; font-weight: 600; }
.text-right { text-align: right; }
.font-bold { font-weight: 700; color: #1e293b; }

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  font-weight: 700;
  border-top: 1px solid #e5e7eb;
}

.total-price {
  color: #2563eb;
  font-size: 1.2rem;
}
</style>
