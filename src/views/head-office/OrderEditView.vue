<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 수정</h2>
      <div class="header-actions">
        <button @click="cancelEdit" class="back-btn">취소</button>
        <button @click="saveChanges" class="action-btn" :disabled="!orderItem || orderItem.orderStatus !== '대기'">저장</button>
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
        <div class="info-item">
          <label>현재 제조일</label>
          <span>{{ orderItem.manufacturedDate || '-' }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <template v-if="orderItem.orderStatus === '대기'">
        <div class="section-title"><h3>제조일 수정</h3></div>
        <div class="info-grid">
          <div class="info-item">
            <label for="manufactureDate">제조일</label>
            <input type="date" id="manufactureDate" v-model="editManufactureDate" />
          </div>
        </div>

        <div class="divider"></div>

        <div class="section-title"><h3>상품 목록 (읽기 전용)</h3></div>
        <div class="product-list-table">
          <div class="product-list-header">
            <span>상품 ID</span>
            <span>수량</span>
            <span>단가</span>
            <span>총 금액</span>
          </div>
          <div v-for="(item, index) in orderItem.items" :key="index" class="product-list-item">
            <span>{{ item.productId }}</span>
            <span>{{ item.quantity }}</span>
            <span>{{ formatPrice(item.unitPrice) }}</span>
            <span>{{ formatPrice(item.totalPrice) }}</span>
          </div>
          <div class="product-list-total">
            <label>총 발주 금액</label>
            <span class="total-price">{{ formatPrice(orderItem.totalAmount) }}</span>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, updateOrder } from '@/api/hqOrders.js'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

const orderItem = ref(null)
const editManufactureDate = ref('')

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

onMounted(async () => {
  try {
    const data = await getOrderDetail(orderId)
    orderItem.value = {
      orderCode: data.orderCode,
      orderStatus: data.status,
      orderDate: formatDate(data.requestedDate),
      manufacturedDate: formatDate(data.manufacturedDate),
      items: (data.items || []).map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice || 0),
        totalPrice: Number(item.totalPrice || 0)
      })),
      totalAmount: (data.items || []).reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    }
    editManufactureDate.value = data.manufacturedDate ? data.manufacturedDate.substring(0, 10) : ''
  } catch (e) {
    alert(e.message)
  }
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송 대기': 'status-info',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
}[s] || '')

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const saveChanges = async () => {
  if (orderItem.value.orderStatus !== '대기') {
    alert('발주 상태가 대기가 아니므로 수정할 수 없습니다.')
    return
  }
  if (!editManufactureDate.value) {
    alert('제조일을 입력해주세요.')
    return
  }
  try {
    await updateOrder(orderId, {
      manufactureDate: `${editManufactureDate.value}T00:00:00`,
      items: []
    })
    alert('수정 사항이 저장되었습니다.')
    router.back()
  } catch (e) {
    alert(e.message || '저장에 실패했습니다.')
  }
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

.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.info-item span, .info-item input { font-size: 1rem; color: var(--text-dark); }
.info-item input {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
}

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
  grid-template-columns: 2fr 1.5fr 2fr 2fr;
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

.total-price { color: var(--primary); font-size: 1.2rem !important; }

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
