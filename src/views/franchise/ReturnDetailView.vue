<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const returnId = route.params.id
const returnItem = ref(null)

const isEditing = ref(false)
const editForm = ref({})

// Mock Data (Simulating Database)
const returns = [
 { 
   orderCode: 'ORD-001', 
   returnCode: 'RET-001',
   boxCode: 'BOX-A01', 
   idCode: 'ID-8821', 
   productCode: 'P-001', 
   productName: '오리지널 떡볶이 밀키트',
   quantity: 1, 
   amount: 12900,
   totalAmount: 12900,
   recipientName: '김철수', 
   recipientPhone: '010-1234-5678', 
   franchiseCode: 'FC-001', 
   details: '박스 파손 심함',
   reason: '파손', 
   date: '2023-10-26', 
   status: '대기'
 },
 { 
   orderCode: 'ORD-002', 
   returnCode: 'RET-002',
   boxCode: 'BOX-B05', 
   idCode: 'ID-9932', 
   productCode: 'P-002', 
   productName: '로제 떡볶이 밀키트',
   quantity: 2, 
   amount: 14900,
   totalAmount: 29800,
   recipientName: '이영희', 
   recipientPhone: '010-9876-5432', 
   franchiseCode: 'FC-002', 
   details: '고객 변심 반품',
   reason: '단순변심', 
   date: '2023-10-25', 
   status: '접수'
 },
 { 
   orderCode: 'ORD-003', 
   returnCode: 'RET-003',
   boxCode: 'BOX-C10', 
   idCode: 'ID-7711', 
   productCode: 'P-003', 
   productName: '마라 떡볶이 밀키트',
   quantity: 1, 
   amount: 14900,
   totalAmount: 14900,
   recipientName: '박민수', 
   recipientPhone: '010-5555-4444', 
   franchiseCode: 'FC-001', 
   details: '오배송 확인됨',
   reason: '오배송', 
   date: '2023-10-24', 
   status: '배송중'
 }
]

onMounted(() => {
  returnItem.value = returns.find(r => r.returnCode === returnId)
})

const startEdit = () => {
  editForm.value = { ...returnItem.value }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {}
}

const saveEdit = () => {
  // In a real app, make an API call here.
  Object.assign(returnItem.value, editForm.value)
  isEditing.value = false
  alert('수정이 완료되었습니다.')
}

const cancelReturnRequest = () => {
  if (returnItem.value.status !== '대기') {
    alert('처리 상태가 대기가 아니면 취소할 수 없습니다.')
    return
  }
  // In a real app, API call to delete/cancel
  alert('반품 요청이 취소되었습니다.')
  router.push('/returns')
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>반품 상세 정보</h2>
      <div class="header-actions">
        <!-- New Cancel Button -->
        <button v-if="!isEditing" @click="cancelReturnRequest" class="delete-btn">반품 취소</button>
        
        <button v-if="!isEditing" @click="startEdit" class="edit-btn">수정</button>
        <div v-else class="edit-actions">
          <button @click="cancelEdit" class="cancel-btn">취소</button>
          <button @click="saveEdit" class="save-btn">저장</button>
        </div>
        <router-link to="/returns" class="back-btn">목록으로 돌아가기</router-link>
      </div>
    </div>

    <div v-if="returnItem" class="detail-card">
      <div class="detail-section">
        <h3>기본 정보</h3>
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
          <div class="info-item">
            <label>처리 상태</label>
            <span class="status-text">{{ returnItem.status }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>제품 정보</h3>
        <div class="info-grid">
           <div class="info-item">
            <label>제품명</label>
            <span>{{ returnItem.productName }}</span>
          </div>
          <div class="info-item">
            <label>제품 코드</label>
            <span>{{ returnItem.productCode }}</span>
          </div>
          <div class="info-item">
            <label>제품 식별코드</label>
            <span>{{ returnItem.idCode }}</span>
          </div>
          <div class="info-item">
            <label>박스 코드</label>
            <span>{{ returnItem.boxCode }}</span>
          </div>
          <div class="info-item">
            <label>수량</label>
            <span>{{ returnItem.quantity }}</span>
          </div>
           <div class="info-item">
            <label>제품 금액</label>
            <span>{{ formatPrice(returnItem.amount) }}</span>
          </div>
           <div class="info-item">
            <label>총 금액</label>
            <span class="total-price">{{ formatPrice(returnItem.totalAmount) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3>반품 사유 및 수령인</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>반품 사유</label>
            <span v-if="!isEditing">{{ returnItem.reason }}</span>
            <select v-else v-model="editForm.reason" class="edit-input">
              <option value="파손">파손</option>
              <option value="오배송">오배송</option>
            </select>
          </div>
          <div class="info-item">
            <label>수령인 이름</label>
            <span v-if="!isEditing">{{ returnItem.recipientName }}</span>
            <input v-else type="text" v-model="editForm.recipientName" class="edit-input" />
          </div>
          <div class="info-item">
            <label>수령인 전화번호</label>
            <span v-if="!isEditing">{{ returnItem.recipientPhone }}</span>
            <input v-else type="text" v-model="editForm.recipientPhone" class="edit-input" />
          </div>
           <div class="info-item full-width">
            <label>세부 사항</label>
            <div v-if="!isEditing" class="details-box">{{ returnItem.details }}</div>
            <textarea v-else v-model="editForm.details" class="edit-input textarea-input" rows="3"></textarea>
          </div>
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

.edit-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.delete-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.delete-btn:hover { background: #fecaca; }
.edit-actions { display: flex; gap: 0.5rem; }
.save-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.cancel-btn { background: white; border: 1px solid var(--border-color); color: var(--text-dark); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

.detail-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.detail-section { margin-bottom: 2.5rem; }
.detail-section:last-child { margin-bottom: 0; }
.detail-section h3 { font-size: 1.1rem; color: var(--text-dark); margin-bottom: 1rem; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.5rem; }
.info-item label { font-size: 0.85rem; color: var(--text-light); font-weight: 600; }
.info-item span { font-size: 1rem; color: var(--text-dark); font-weight: 500; }

.info-item.full-width { grid-column: 1 / -1; }

.status-text { color: var(--primary); font-weight: 700; }
.total-price { color: var(--primary); font-weight: 700; font-size: 1.1rem !important; }
.details-box { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 60px; }

.edit-input { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 1rem; width: 100%; }
.textarea-input { resize: vertical; min-height: 80px; font-family: inherit; }

.not-found { text-align: center; padding: 4rem; color: var(--text-light); }
</style>
