<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getReturnDetail, updateReturn } from '@/api/hqReturns.js'

const route = useRoute()
const router = useRouter()

const returnItem = ref(null)
const isLoading = ref(true)

const inspectionProducts = ref([])
const productsFilter = ref({
  boxCode: '',
  productIdCode: '',
  inspectionStatus: '',
  productCondition: ''
})

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }
const RETURN_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  SHIPPING_PENDING: '배송 대기',
  SHIPPING: '배송중',
  COMPLETED: '배송 완료',
  INSPECTING: '검수 중',
  DEDUCTION_COMPLETED: '대금 차감 완료',
  DEDUCTION_REJECTED: '대금 차감 거절',
  CANCELED: '취소'
}
const STATUS_LABEL = { BEFORE_INSPECTION: '검수 전', PENDING: '검수 전', INSPECTED: '검수 완료', NORMAL: '정상', DEFECTIVE: '하자' }
const inspectionStatuses = ['검수 전', '검수 완료']
const productConditions = ['검수 전', '정상', '하자']

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

onMounted(async () => {
  try {
    const data = await getReturnDetail(route.params.id)
    returnItem.value = {
      returnCode: data.returnCode,
      franchiseCode: data.franchiseCode,
      requestDate: formatDate(data.requestedDate),
      status: RETURN_STATUS_LABEL[data.status] || data.status,
      orderCode: data.orderCode,
      productCode: '',
      productName: '',
      reason: TYPE_LABEL[data.type] || data.type,
      quantity: (data.items || []).length,
      amount: Number(data.totalAmount || 0),
      recipientName: data.username || '',
      recipientPhone: data.phoneNumber || '',
      address: '',
      memo: data.description || ''
    }
    inspectionProducts.value = (data.items || []).map((item, i) => ({
      id: i,
      boxCode: item.boxCode || '',
      productIdCode: item.serialCode || '',
      inspectionStatus: item.isInspected ? '검수 완료' : '검수 전',
      productCondition: STATUS_LABEL[item.status] || '검수 전'
    }))
  } catch (e) {
    alert(e.message)
  } finally {
    isLoading.value = false
  }
})

const canInspect = computed(() => returnItem.value?.status === '배송 완료')

// Filtering Logic
const filteredProducts = computed(() => {
  return inspectionProducts.value.filter(p => {
    return (!productsFilter.value.boxCode || p.boxCode.includes(productsFilter.value.boxCode)) && // [복구]
        (!productsFilter.value.productIdCode || p.productIdCode.includes(productsFilter.value.productIdCode)) &&
        (!productsFilter.value.inspectionStatus || p.inspectionStatus === productsFilter.value.inspectionStatus) &&
        (!productsFilter.value.productCondition || p.productCondition === productsFilter.value.productCondition)
  })
})

const allInspected = computed(() => {
  return inspectionProducts.value.length > 0 && inspectionProducts.value.every(p => p.inspectionStatus === '검수 완료')
})

const hasDefect = computed(() => {
  return inspectionProducts.value.some(p => p.productCondition === '하자')
})

const handleStatusChange = (product) => {
  if (product.inspectionStatus === '검수 전') {
    product.productCondition = '검수 전'
  } else if (product.productCondition === '검수 전') {
    product.productCondition = '정상' // Default to normal when completed
  }
}

const formatNumber = (val) => new Intl.NumberFormat('ko-KR').format(val)

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '검수 중': 'status-primary',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || 'status-default')

const CONDITION_API = { '검수 전': 'BEFORE_INSPECTION', '정상': 'NORMAL', '하자': 'DEFECTIVE' }

const saveInspections = async (returnStatus) => {
  try {
    const updates = inspectionProducts.value.map(p => ({
      boxCode: p.boxCode,
      serialCode: p.productIdCode,
      isInspected: p.inspectionStatus === '검수 완료',
      status: CONDITION_API[p.productCondition] || 'BEFORE_INSPECTION'
    }))
    await updateReturn(route.params.id, {
      returnStatus,
      items: updates
    })
  } catch (e) {
    throw e
  }
}

// Decision Actions
const finishWithDeduction = async () => {
  try {
    await saveInspections('DEDUCTION_COMPLETED')
    if (returnItem.value.reason === '오발주') {
      alert('경고를 부여하며 대금 차감 승인 처리를 진행합니다.')
    } else {
      alert('대금 차감 승인 처리를 진행합니다.')
    }
    returnItem.value.status = '대금 차감 완료'
  } catch (e) {
    alert(e.message || '처리에 실패했습니다.')
  }
}

const finishWithRejection = async () => {
  try {
    await saveInspections('DEDUCTION_REJECTED')
    if (returnItem.value.reason === '오발주') {
      alert('경고를 부여하며 반품 거절 처리를 진행합니다.')
    } else {
      alert('반품 거절 처리를 진행합니다.')
    }
    returnItem.value.status = '대금 차감 거절'
  } catch (e) {
    alert(e.message || '처리에 실패했습니다.')
  }
}

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <div class="title-area">
        <h2>반품 요청 상세 및 검수</h2>
        <p class="header-desc">반품 요청된 상품들을 검수합니다.</p>
      </div>
      <button class="secondary-btn" @click="router.back()">목록으로 돌아가기</button>
    </div>

    <div v-if="isLoading" class="loading-state">
      데이터를 불러오는 중입니다...
    </div>

    <div v-else-if="returnItem" class="detail-container">
      <!-- Section 1: Basic Info -->
      <div class="info-card">
        <div class="card-header">
          <div class="header-title-row">
            <h3>기본 정보</h3>
            <span :class="['status-badge', getStatusClass(returnItem.status)]">{{ returnItem.status }}</span>
          </div>
        </div>
        <div class="info-grid basic-grid">
          <!-- Row 1 -->
          <div class="info-item">
            <span class="label">반품 코드</span>
            <span class="valueHighlight">{{ returnItem.returnCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">발주 코드</span>
            <span class="value">{{ returnItem.orderCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">가맹점 코드</span>
            <span class="value">{{ returnItem.franchiseCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">요청 일자</span>
            <span class="value">{{ returnItem.requestDate }}</span>
          </div>

          <!-- Row 2 -->
          <div class="info-item">
            <span class="label">수령인 / 연락처</span>
            <span class="value">{{ returnItem.recipientName }} ({{ returnItem.recipientPhone }})</span>
          </div>
          <div class="info-item">
            <span class="label">반품 수량 / 금액</span>
            <span class="value">{{ formatNumber(returnItem.quantity) }}개 / <span class="price-text">{{ formatNumber(returnItem.amount) }}</span></span>
          </div>
          <div class="info-item full-width-item">
            <span class="label">반품 사유</span>
            <span class="value reason-text">{{ returnItem.reason }}</span>
          </div>
        </div>
      </div>

      <!-- Section 2: Product Inspection Table -->
      <div class="info-card">
        <div class="card-header">
          <h3>반품 상품 검수</h3>
        </div>

        <!-- Inspection Filters -->
        <div class="table-filters" :class="{ 'disabled-overlay': !canInspect }">
          <div class="filter-row">
            <!-- [추가] 박스 코드 필터 -->
            <input type="text" v-model="productsFilter.boxCode" placeholder="박스 코드 검색" :disabled="!canInspect" />
            <input type="text" v-model="productsFilter.productIdCode" placeholder="제품 식별코드 검색" :disabled="!canInspect" />
            <select v-model="productsFilter.inspectionStatus" :disabled="!canInspect">
              <option value="">검수 상태 (전체)</option>
              <option v-for="s in inspectionStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="productsFilter.productCondition" :disabled="!canInspect">
              <option value="">제품 상태 (전체)</option>
              <option v-for="c in productConditions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <p v-if="!canInspect" class="locked-msg">
            상태가 '배송 완료'인 경우에만 검수가 가능합니다. (현재 상태: {{ returnItem.status }})
          </p>
        </div>

        <div class="table-container" :class="{ 'disabled-table': !canInspect }">
          <table class="inspection-table">
            <thead>
            <tr>
              <!-- [추가] 박스 코드 컬럼 -->
              <th>박스 코드</th>
              <th>제품 식별코드</th>
              <th>검수 상태</th>
              <th>제품 상태</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="p in filteredProducts" :key="p.id">
              <!-- [추가] 박스 코드 데이터 -->
              <td>{{ p.boxCode }}</td>
              <td class="id-code-cell">{{ p.productIdCode }}</td>
              <td>
                <select v-model="p.inspectionStatus" @change="handleStatusChange(p)" class="inline-select" :disabled="!canInspect">
                  <option v-for="s in inspectionStatuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </td>
              <td>
                <select
                    v-model="p.productCondition"
                    :disabled="!canInspect || p.inspectionStatus !== '검수 완료'"
                    class="inline-select"
                    :class="{ 'condition-defective': p.productCondition === '하자' }"
                >
                  <option v-for="c in productConditions" :key="c" :value="c" :disabled="c === '검수 전' && p.inspectionStatus === '검수 완료'">{{ c }}</option>
                </select>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Final Decision Buttons -->
      <div class="decision-section" v-if="canInspect && allInspected">
        <div class="decision-guide">
          <p class="guide-text">※ 모든 제품의 검수가 완료되었습니다. 정산 처리를 진행해 주세요.</p>
        </div>
        <div class="action-buttons">
          <template v-if="returnItem.reason === '상품 하자'">
            <button v-if="hasDefect" class="deduction-btn approve" @click="finishWithDeduction">반품 승인</button>
            <button v-else class="deduction-btn reject" @click="finishWithRejection">반품 거절</button>
          </template>
          <template v-else-if="returnItem.reason === '오발주'">
            <button v-if="!hasDefect" class="deduction-btn approve" @click="finishWithDeduction">반품 승인 (경고 부여)</button>
            <button v-else class="deduction-btn reject" @click="finishWithRejection">반품 거절 (경고 부여)</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1200px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem 0; }
.title-area { display: flex; flex-direction: column; gap: 0.5rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.header-desc { margin: 0.2rem 0 0; color: var(--text-light); font-size: 0.95rem; }

.secondary-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
.secondary-btn:hover { background: #f8fafc; border-color: var(--text-dark); }

/* Info Cards */
.detail-container { display: flex; flex-direction: column; gap: 1.5rem; }
.info-card { background: white; border-radius: 12px; border: 1px solid var(--border-color); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-header { background: #f8fafc; padding: 0.8rem 1.2rem; border-bottom: 1px solid var(--border-color); }
.card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-dark); }
.header-title-row { display: flex; align-items: center; gap: 1rem; }

/* Grid Layout Updated for 4 Columns */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; padding: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.full-width-item { grid-column: span 2; } /* 사유 텍스트 길어질 수 있으므로 */

.label { font-size: 0.8rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.02em; }
.value { font-size: 0.95rem; color: var(--text-dark); font-weight: 500; word-break: break-all; }
.valueHighlight { font-weight: 700; color: var(--primary); font-family: 'JetBrains Mono', monospace; }
.reason-text { font-weight: 700; color: #1e40af; }

/* Table Section */
.table-filters { padding: 1rem; background: #fafafa; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.8rem; }
.filter-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.8rem; }
.filter-row input, .filter-row select { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; width: 100%; transition: all 0.2s; }

.disabled-overlay { position: relative; }
.locked-msg {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #e11d48;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}
.locked-msg .material-icons { font-size: 1.2rem; }

.disabled-table { opacity: 0.7; pointer-events: none; grayscale: 50%; }
.table-container {
  overflow-x: auto;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.inspection-table {
  width: 100%;
  border-collapse: collapse;
}

.inspection-table th {
  background: #f1f5f9;
  padding: 1rem 1.5rem;
  font-size: 0.8rem;
  color: var(--text-light);
  border-bottom: 1px solid var(--border-color);
  text-align: left;
  white-space: nowrap;
}

.inspection-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  white-space: nowrap;
}

.id-code-cell {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #374151;
}

.inline-select { padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem; background: white; min-width: 100px; }
.inline-select:disabled { background: #f3f4f6; color: #94a3b8; }
.condition-defective { color: #ef4444; font-weight: 700; border-color: #fca5a5; }

/* Status & Decision */
.status-badge { padding: 4px 12px; border-radius: 12px; font-weight: 700; font-size: 0.75rem; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.decision-section { padding: 1.5rem; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.guide-text { color: #92400e; font-weight: 600; font-size: 0.95rem; margin: 0; }
.action-buttons { display: flex; gap: 1rem; }

.deduction-btn { padding: 1rem 2.5rem; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
.approve { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.approve:hover { transform: translateY(-2px); box-shadow: 0 6px 10px -1px rgba(0,0,0,0.15); }
.reject { background: #ef4444; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.reject:hover { transform: translateY(-2px); box-shadow: 0 6px 10px -1px rgba(0,0,0,0.15); }

.price-text { color: #ef4444; font-weight: 700; }

.loading-state { text-align: center; padding: 5rem; color: var(--text-light); }
</style>
