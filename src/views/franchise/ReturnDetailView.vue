<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReturnDetail, cancelReturn, updateReturn } from '@/api/franchiseReturns.js'

const route = useRoute()
const router = useRouter()
const returnId = route.params.id
const returnItem = ref(null)

const isEditing = ref(false)
const editableItem = ref(null)
const selectedProducts = ref([])
const availableProducts = ref([])

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }
const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

onMounted(async () => {
  try {
    const data = await getReturnDetail(returnId)
    const products = (data.items || []).map(item => ({
      boxCode: item.boxCode,
      idCode: item.boxCode, // use boxCode as idCode for selection
      productCode: item.productCode,
      productName: item.productName,
      quantity: 1,
      amount: Number(item.unitPrice || 0),
      totalAmount: Number(item.unitPrice || 0)
    }))
    returnItem.value = {
      returnCode: data.returnCode,
      orderCode: data.orderCode,
      franchiseCode: data.franchiseCode,
      date: formatDate(data.requestedDate),
      status: data.status,
      recipientName: data.username,
      recipientPhone: data.phoneNumber,
      reason: TYPE_LABEL[data.returnType] || data.returnType,
      details: data.description,
      products,
      grandTotal: products.reduce((sum, p) => sum + p.totalAmount, 0)
    }
    availableProducts.value = products
  } catch (e) {
    alert(e.message)
  }
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송 대기': 'status-info',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '검수': 'status-primary',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || '')

const cancelReturnRequest = async () => {
  if (returnItem.value.status !== '대기') {
    alert('처리 상태가 대기가 아니면 취소할 수 없습니다.')
    return
  }
  if (!confirm('반품 요청을 취소하시겠습니까?')) return
  try {
    await cancelReturn(returnId)
    alert('반품 요청이 취소되었습니다.')
    router.back()
  } catch (e) {
    alert(e.message || '반품 취소에 실패했습니다.')
  }
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const startEditing = () => {
  editableItem.value = { ...returnItem.value }
  selectedProducts.value = returnItem.value.products.map(p => p.idCode)
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editableItem.value = null
}

const saveChanges = async () => {
  const newProducts = availableProducts.value.filter(p => selectedProducts.value.includes(p.idCode))
  try {
    const boxCodes = newProducts.map(p => p.boxCode)
    await updateReturn(returnId, boxCodes.map(b => ({ boxCode: b })))
    returnItem.value = {
      ...editableItem.value,
      products: newProducts,
      grandTotal: newProducts.reduce((sum, p) => sum + p.totalAmount, 0)
    }
    alert('변경사항이 저장되었습니다.')
    isEditing.value = false
  } catch (e) {
    alert(e.message || '저장에 실패했습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>반품 상세 정보</h2>
      <div class="header-actions">
        <template v-if="!isEditing">
          <button v-if="returnItem && returnItem.status === '대기'" @click="cancelReturnRequest" class="delete-btn">반품 취소</button>
          <button v-if="returnItem && returnItem.status === '대기'" @click="startEditing" class="edit-btn">수정</button>
          <button @click="$router.back()" class="back-btn">목록으로 돌아가기</button>
        </template>
        <template v-else>
          <button @click="saveChanges" class="save-btn">저장</button>
          <button @click="cancelEdit" class="cancel-btn">취소</button>
        </template>
      </div>
    </div>

    <div v-if="returnItem" class="detail-card">
      <div class="section-title">
        <h3>기본 정보</h3>
        <span :class="['status-tag', getStatusClass(returnItem.status)]">{{ returnItem.status }}</span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>반품 코드</label>
          <span>{{ returnItem.returnCode }}</span>
        </div>
        <div class="info-item">
          <label>발주 코드</label>
          <span>{{ returnItem.orderCode }}</span>
        </div>
        <div class="info-item">
          <label>가맹점 코드</label>
          <span>{{ returnItem.franchiseCode }}</span>
        </div>
        <div class="info-item">
          <label>요청 일자</label>
          <span>{{ returnItem.date }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title"><h3>수령인 정보 및 사유</h3></div>
      <div v-if="!isEditing" class="info-grid">
        <div class="info-item">
          <label>수령인 이름</label>
          <span>{{ returnItem.recipientName }}</span>
        </div>
        <div class="info-item">
          <label>수령인 전화번호</label>
          <span>{{ returnItem.recipientPhone }}</span>
        </div>
        <div class="info-item">
          <label>반품 사유</label>
          <span>{{ returnItem.reason }}</span>
        </div>
        <div class="info-item full-width">
          <label>세부 사항</label>
          <div class="details-box">{{ returnItem.details }}</div>
        </div>
      </div>
      <div v-else class="info-grid">
        <div class="info-item">
          <label>수령인 이름</label>
          <input type="text" v-model="editableItem.recipientName" class="edit-input" />
        </div>
        <div class="info-item">
          <label>수령인 전화번호</label>
          <input type="text" v-model="editableItem.recipientPhone" class="edit-input" />
        </div>
        <div class="info-item">
          <label>반품 사유</label>
          <select v-model="editableItem.reason" class="edit-input">
            <option value="파손">파손</option>
            <option value="오배송">오배송</option>
            <option value="단순변심">단순변심</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div class="info-item full-width">
          <label>세부 사항</label>
          <textarea v-model="editableItem.details" class="edit-input textarea-input"></textarea>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title"><h3>제품 목록</h3></div>
      <div class="product-selection-note" v-if="isEditing">
        * 해당 박스(<strong>{{ returnItem.boxCode }}</strong>)의 모든 제품입니다. 반품할 제품을 선택해주세요.
      </div>
      <div class="product-list-table">
        <div class="product-list-header">
          <span v-if="isEditing" class="check-col">선택</span>
          <span class="box-col">박스 코드</span>
          <span class="id-col">제품 식별코드</span>
          <span class="sku-col">제품 코드</span>
          <span class="name-header">제품명</span>
          <span class="qty-col">수량</span>
          <span class="price-col">금액</span>
          <span class="total-col">총 금액</span>
        </div>
        <template v-if="!isEditing">
          <div v-for="(product, index) in returnItem.products" :key="index" class="product-list-item">
            <span class="box-col">{{ product.boxCode }}</span>
            <span class="id-code id-col">{{ product.idCode }}</span>
            <span class="sku-col">{{ product.productCode }}</span>
            <span class="name-cell">{{ product.productName }}</span>
            <span class="qty-col">{{ product.quantity }}개</span>
            <span class="price-col">{{ formatPrice(product.amount) }}</span>
            <span class="item-total total-col">{{ formatPrice(product.totalAmount) }}</span>
          </div>
        </template>
        <template v-else>
          <div v-for="(product, index) in availableProducts" :key="index" class="product-list-item">
            <span class="check-col"><input type="checkbox" :value="product.idCode" v-model="selectedProducts" /></span>
            <span class="box-col">{{ product.boxCode }}</span>
            <span class="id-code id-col">{{ product.idCode }}</span>
            <span class="sku-col">{{ product.productCode }}</span>
            <span class="name-cell">{{ product.productName }}</span>
            <span class="qty-col">{{ product.quantity }}개</span>
            <span class="price-col">{{ formatPrice(product.amount) }}</span>
            <span class="item-total total-col">{{ formatPrice(product.totalAmount) }}</span>
          </div>
        </template>
      </div>

      <!-- Total Amount moved to bottom -->
      <div class="summary-section">
        <div class="summary-row total">
          <label>총 반품 금액</label>
          <span class="total-price">{{ formatPrice(isEditing ? (availableProducts.filter(p => selectedProducts.includes(p.idCode)).reduce((sum, p) => sum + p.totalAmount, 0)) : returnItem.grandTotal) }}</span>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>해당 반품 정보를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; }
.header-actions { display: flex; gap: 0.75rem; align-items: center; }
.back-btn { padding: 0.6rem 1.2rem; border: 1px solid var(--border-color); border-radius: 8px; text-decoration: none; color: var(--text-dark); font-weight: 600; background: white; transition: background 0.2s; }
.back-btn:hover { background: #f8fafc; }

.edit-btn { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.edit-btn:hover { background: #c7d2fe; }

.delete-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.delete-btn:hover { background: #fecaca; }
.edit-actions { display: flex; gap: 0.5rem; }
.save-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.cancel-btn { background: white; border: 1px solid var(--border-color); color: var(--text-dark); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item label { font-size: 0.85rem; color: var(--text-light); font-weight: 600; }
.info-item span { font-size: 1rem; color: var(--text-dark); font-weight: 500; }

.info-item.full-width { grid-column: 1 / -1; }

/* Product List Table Styles */
.product-list-table { 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  overflow-x: auto; 
  margin-top: 1rem; 
}
.product-list-header, .product-list-item { 
  display: grid; 
  /* Wider columns for long codes */
  grid-template-columns: 280px 280px 120px 250px 80px 120px 120px; 
  padding: 0.8rem 1rem; 
  align-items: center; 
  border-bottom: 1px solid var(--border-color); 
  font-size: 0.9rem;
  min-width: 1300px;
  white-space: nowrap;
}
.product-list-header { background: #f8fafc; font-weight: 600; color: var(--text-light); }
.product-list-item:last-child { border-bottom: none; }

.summary-section {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.summary-row.total {
  display: flex;
  align-items: center;
  gap: 2rem;
  font-weight: 700;
}
.summary-row label { font-size: 1rem; color: var(--text-dark); }
.total-price { color: #ef4444; font-size: 1.5rem; }
.id-code { color: var(--primary); font-weight: 600; }
.name-cell { font-weight: 600; }
.item-total { font-weight: 600; }

.status-text { color: var(--primary); font-weight: 700; }
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }
.details-box { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 60px; }

.edit-input { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 1rem; width: 100%; }
.textarea-input { resize: vertical; min-height: 80px; font-family: inherit; }

/* Edit mode specific table column */
.check-col { width: 50px; text-align: center; justify-content: center; flex-shrink: 0; }
.product-selection-note { font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem; padding: 0.5rem 1rem; background: #fffbeb; border-radius: 8px; border: 1px solid #fef3c7; }

.not-found { text-align: center; padding: 4rem; color: var(--text-light); }
</style>
