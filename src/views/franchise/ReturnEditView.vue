<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>반품 수정</h2>
      <div class="header-actions">
        <button @click="$router.back()" class="back-btn">취소</button>
        <button @click="saveChanges" class="save-btn" :disabled="!returnItem || returnItem.status !== '대기'">저장</button>
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
          <label>반품 사유</label>
          <span>{{ returnItem.reason }}</span>
        </div>
        <div class="info-item full-width">
          <label>세부 사항</label>
          <div class="details-box">{{ returnItem.description }}</div>
        </div>
      </div>

      <div class="divider"></div>

      <template v-if="returnItem.status === '대기'">
        <div class="section-title"><h3>반품 상품 선택</h3></div>
        <p class="selection-note">반품할 상품을 선택해주세요.</p>
        <div class="product-list-table">
          <div class="product-list-header">
            <span class="check-col">선택</span>
            <span>박스 코드</span>
            <span>상품 코드</span>
            <span>상품명</span>
            <span>단가</span>
          </div>
          <div v-for="item in returnItem.items" :key="item.boxCode" class="product-list-item">
            <span class="check-col">
              <input type="checkbox" :value="item.boxCode" v-model="selectedBoxCodes" />
            </span>
            <span>{{ item.boxCode }}</span>
            <span>{{ item.productCode }}</span>
            <span>{{ item.productName }}</span>
            <span>{{ formatPrice(Number(item.unitPrice || 0)) }}</span>
          </div>
          <div v-if="returnItem.items.length === 0" class="empty-row">반품 가능한 상품이 없습니다.</div>
        </div>
      </template>

      <template v-else>
        <p class="edit-disabled-message">반품 상태가 '대기'일 때만 수정 가능합니다.</p>
      </template>
    </div>

    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReturnDetail, updateReturn } from '@/api/franchiseReturns.js'

const route = useRoute()
const router = useRouter()
const returnCode = route.params.id

const returnItem = ref(null)
const selectedBoxCodes = ref([])

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }

onMounted(async () => {
  try {
    const data = await getReturnDetail(returnCode)
    returnItem.value = {
      returnCode: data.returnCode,
      orderCode: data.orderCode,
      status: data.status,
      reason: TYPE_LABEL[data.returnType] || data.returnType,
      description: data.description,
      items: data.items || []
    }
    selectedBoxCodes.value = (data.items || []).map(item => item.boxCode)
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

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const saveChanges = async () => {
  if (returnItem.value.status !== '대기') {
    alert('반품 상태가 대기가 아니면 수정할 수 없습니다.')
    return
  }
  try {
    await updateReturn(returnCode, selectedBoxCodes.value.map(b => ({ boxCode: b })))
    alert('변경사항이 저장되었습니다.')
    router.back()
  } catch (e) {
    alert(e.message || '저장에 실패했습니다.')
  }
}
</script>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; }
.header-actions { display: flex; gap: 0.75rem; }
.back-btn { padding: 0.6rem 1.2rem; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; color: var(--text-dark); font-weight: 600; background: white; transition: background 0.2s; }
.back-btn:hover { background: #f8fafc; }
.save-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.save-btn:disabled { background: #cccccc; cursor: not-allowed; }

.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item.full-width { grid-column: 1 / -1; }
.info-item label { font-size: 0.85rem; color: var(--text-light); font-weight: 600; }
.info-item span { font-size: 1rem; color: var(--text-dark); font-weight: 500; }
.details-box { background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 60px; }

.selection-note { font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem; padding: 0.5rem 1rem; background: #fffbeb; border-radius: 8px; border: 1px solid #fef3c7; }

.product-list-table { border: 1px solid var(--border-color); border-radius: 8px; overflow-x: auto; margin-top: 1rem; }
.product-list-header, .product-list-item {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 2fr 1fr;
  padding: 0.8rem 1rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}
.product-list-header { background: #f8fafc; font-weight: 600; color: var(--text-light); }
.product-list-item:last-child { border-bottom: none; }
.check-col { display: flex; justify-content: center; }
.empty-row { padding: 2rem; text-align: center; color: var(--text-light); }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

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

.loading { text-align: center; padding: 3rem; color: var(--text-light); }
</style>
