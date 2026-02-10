<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Mock main return item
const returnItem = ref(null)
const isLoading = ref(true)

// Inspection Products Data
const inspectionProducts = ref([])
const productsFilter = ref({
  boxCode: '',
  productIdCode: '',
  productCode: '',
  productName: '',
  inspectionStatus: '',
  productCondition: '',
  orderCode: '',
  returnCode: ''
})

const inspectionStatuses = ['검수 전', '검수 완료']
const productConditions = ['검수 전', '정상', '하자']

// Multi-ID Mock Data Logic
const allReturns = [
  { 
    returnCode: 'RESE0120231101001', franchiseCode: 'SE01', requestDate: '2023-11-05', status: '대기',
    boxCode: 'SE01FA0120231105OR0101001', productIdCode: 'SE01FA01AOR0101B001', orderCode: 'SE0120231101001', productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    reason: '파손', quantity: 5, amount: 50000, recipientName: '김가맹', recipientPhone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123', memo: '배송 대기 중인 항목입니다.',
    products: [
      { code: 'OR0101', name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 5, unitPrice: 10000, condition: '정상' }
    ]
  },
  { 
    returnCode: 'RESE0220231102005', franchiseCode: 'SE02', requestDate: '2023-11-06', status: '배송중',
    boxCode: 'SE02FA0120231106RO0201010', productIdCode: 'SE02FA02ARO0201B010', orderCode: 'SE0220231102005', productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분',
    reason: '오발주', quantity: 10, amount: 200000, recipientName: '이점주', recipientPhone: '010-9876-5432',
    address: '부산시 해운대구 ...', memo: '현재 배송 중입니다.'
  },
  { 
    returnCode: 'RESE0320231030020', franchiseCode: 'SE03', requestDate: '2023-11-04', status: '배송 완료',
    boxCode: 'SE03FA0120231104MA0303020', productIdCode: 'SE03FA01AMA0303B020', orderCode: 'SE0320231030020', productCode: 'MA0303', productName: '마라 떡볶이 밀키트 매운맛 3,4인분',
    reason: '상품 하자', quantity: 2, amount: 60000, recipientName: '박센터', recipientPhone: '010-5555-4444',
    address: '대전시 유성구 ...', memo: '배송 완료되어 검수 가능한 항목입니다.'
  }
]

onMounted(() => {
  isLoading.value = true
  setTimeout(() => {
    const found = allReturns.find(r => r.returnCode === route.params.id)
    if (found) {
      returnItem.value = { ...found }
      // Generate inspection items for the mock
      inspectionProducts.value = Array.from({ length: found.quantity }).map((_, i) => ({
        id: Date.now() + i,
        boxCode: found.boxCode,
        productIdCode: `${found.productIdCode}-${i+1}`,
        productCode: found.productCode,
        productName: found.productName,
        inspectionStatus: '검수 전',
        productCondition: '검수 전',
        orderCode: found.orderCode,
        returnCode: found.returnCode
      }))
    }
    isLoading.value = false
  }, 300)
})

const canInspect = computed(() => returnItem.value?.status === '배송 완료')

// Filtering Logic
const filteredProducts = computed(() => {
  return inspectionProducts.value.filter(p => {
    return (!productsFilter.value.boxCode || p.boxCode.includes(productsFilter.value.boxCode)) &&
           (!productsFilter.value.productIdCode || p.productIdCode.includes(productsFilter.value.productIdCode)) &&
           (!productsFilter.value.productCode || p.productCode.includes(productsFilter.value.productCode)) &&
           (!productsFilter.value.productName || p.productName.includes(productsFilter.value.productName)) &&
           (!productsFilter.value.inspectionStatus || p.inspectionStatus === productsFilter.value.inspectionStatus) &&
           (!productsFilter.value.productCondition || p.productCondition === productsFilter.value.productCondition) &&
           (!productsFilter.value.orderCode || p.orderCode.includes(productsFilter.value.orderCode)) &&
           (!productsFilter.value.returnCode || p.returnCode.includes(productsFilter.value.returnCode))
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

// Decision Actions
const finishWithDeduction = () => {
  if (returnItem.value.reason === '오발주') {
    alert('경고를 부여하며 대금 차감 승인 처리를 진행합니다.')
  } else {
    alert('대금 차감 승인 처리를 진행합니다.')
  }
  returnItem.value.status = '대금 차감 완료'
}

const finishWithRejection = () => {
  if (returnItem.value.reason === '오발주') {
    alert('경고를 부여하며 대금 차감 거절 처리를 진행합니다.')
  } else {
    alert('대금 차감 거절 처리를 진행합니다.')
  }
  returnItem.value.status = '대금 차감 거절'
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
          <div class="info-item">
            <span class="label">반품 코드</span>
            <span class="valueHighlight">{{ returnItem.returnCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">가맹점 코드</span>
            <span class="value">{{ returnItem.franchiseCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">요청 일자</span>
            <span class="value">{{ returnItem.requestDate }}</span>
          </div>
          <div class="info-item">
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
            <input type="text" v-model="productsFilter.boxCode" placeholder="박스 코드" :disabled="!canInspect" />
            <input type="text" v-model="productsFilter.productIdCode" placeholder="제품 식별코드" :disabled="!canInspect" />
            <input type="text" v-model="productsFilter.productCode" placeholder="제품 코드" :disabled="!canInspect" />
            <input type="text" v-model="productsFilter.productName" placeholder="제품명" :disabled="!canInspect" />
          </div>
          <div class="filter-row">
            <select v-model="productsFilter.inspectionStatus" :disabled="!canInspect">
              <option value="">검수 상태 (전체)</option>
              <option v-for="s in inspectionStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="productsFilter.productCondition" :disabled="!canInspect">
              <option value="">제품 상태 (전체)</option>
              <option v-for="c in productConditions" :key="c" :value="c">{{ c }}</option>
            </select>
            <input type="text" v-model="productsFilter.orderCode" placeholder="발주 코드" :disabled="!canInspect" />
            <input type="text" v-model="productsFilter.returnCode" placeholder="반품 코드" :disabled="!canInspect" />
          </div>
          <p v-if="!canInspect" class="locked-msg">
            상태가 '배송 완료'인 경우에만 검수가 가능합니다. (현재 상태: {{ returnItem.status }})
          </p>
        </div>

        <div class="table-container" :class="{ 'disabled-table': !canInspect }">
          <table class="inspection-table">
            <thead>
              <tr>
                <th>박스 코드</th>
                <th>제품 식별코드</th>
                <th>제품 코드</th>
                <th>제품명</th>
                <th>검수 상태</th>
                <th>제품 상태</th>
                <th>발주 코드</th>
                <th>반품 코드</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredProducts" :key="p.id">
                <td>{{ p.boxCode }}</td>
                <td><small>{{ p.productIdCode }}</small></td>
                <td>{{ p.productCode }}</td>
                <td>{{ p.productName }}</td>
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
                <td>{{ p.orderCode }}</td>
                <td>{{ p.returnCode }}</td>
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
          <!-- Logic: 
            사유:상품하자 & 하자있음 -> 차감완료
            사유:상품하자 & 하자없음 -> 차감거절
            사유:오발주 & 하자있음 -> 차감거절 + 경고
            사유:오발주 & 하자없음 -> 차감완료 + 경고
          -->
          <template v-if="returnItem.reason === '상품 하자'">
            <button v-if="hasDefect" class="deduction-btn approve" @click="finishWithDeduction">대금 차감 완료</button>
            <button v-else class="deduction-btn reject" @click="finishWithRejection">대금 차감 거절</button>
          </template>
          <template v-else-if="returnItem.reason === '오발주'">
            <button v-if="!hasDefect" class="deduction-btn approve" @click="finishWithDeduction">대금 차감 완료 (경고 부여)</button>
            <button v-else class="deduction-btn reject" @click="finishWithRejection">대금 차감 거절 (경고 부여)</button>
          </template>
        </div>
      </div>

      <!-- Section 4: Logistical & Financial Summary -->
      <div class="info-card tertiary-card">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">수령인 / 연락처</span>
            <span class="value">{{ returnItem.recipientName }} ({{ returnItem.recipientPhone }})</span>
          </div>
          <div class="info-item">
            <span class="label">반품 수량 / 금액</span>
            <span class="value">{{ formatNumber(returnItem.quantity) }}개 / <span class="price-text">{{ formatNumber(returnItem.amount) }}원</span></span>
          </div>
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

.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; padding: 1.2rem; }
.basic-grid { grid-template-columns: 1fr 1fr 1fr 1.5fr; }
.info-item { display: flex; flex-direction: column; gap: 0.3rem; }
.label { font-size: 0.8rem; font-weight: 600; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.02em; }
.value { font-size: 0.95rem; color: var(--text-dark); font-weight: 500; }
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
  min-width: 1600px; /* Further increased to prevent any overlap of long codes */
}

.inspection-table th { 
  background: #f1f5f9; 
  padding: 1rem 1.5rem; /* Increased horizontal padding */
  font-size: 0.8rem; 
  color: var(--text-light); 
  border-bottom: 1px solid var(--border-color); 
  text-align: left; 
  white-space: nowrap;
}

.inspection-table td { 
  padding: 1rem 1.5rem; /* Increased horizontal padding */
  border-bottom: 1px solid var(--border-color); 
  font-size: 0.85rem; 
  white-space: nowrap;
}

.inline-select { padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; font-size: 0.85rem; background: white; }
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
