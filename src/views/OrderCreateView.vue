<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- Product Data & filtering ---
const showRecommendation = ref(false)

const productFilter = ref({
  code: '',
  name: '',
  status: '',
  flavor: ''
})

const products = ref([
 { code: 'P-001', name: '오리지널 떡볶이 밀키트', status: '안전', flavor: '기본맛', stock: 500, safetyStock: 200, recommendedStock: 0, actualQuantity: 0 },
 { code: 'P-002', name: '마라 떡볶이 밀키트', status: '부족', flavor: '매운맛', stock: 50, safetyStock: 100, recommendedStock: 150, actualQuantity: 0 },
 { code: 'P-003', name: '로제 떡볶이 밀키트', status: '위험', flavor: '안매운맛', stock: 10, safetyStock: 100, recommendedStock: 200, actualQuantity: 0 },
 { code: 'P-004', name: '짜장 떡볶이 밀키트', status: '입고 예정', flavor: '안매운맛', stock: 0, safetyStock: 100, recommendedStock: 100, actualQuantity: 0 },
])

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchCode = !productFilter.value.code || p.code.includes(productFilter.value.code)
    const matchName = !productFilter.value.name || p.name.includes(productFilter.value.name)
    const matchStatus = !productFilter.value.status || p.status === productFilter.value.status
    const matchFlavor = !productFilter.value.flavor || p.flavor === productFilter.value.flavor
    return matchCode && matchName && matchStatus && matchFlavor
  })
})

const getStatusClass = (s) => ({
  '위험': 'status-danger',
  '부족': 'status-warning',
  '입고 예정': 'status-info',
  '안전': 'status-ok'
}[s] || '')


// --- Order Form Logic ---
const calculateArrivalDate = () => {
  const today = new Date()
  const day = today.getDay()
  let targetDate = new Date(today)
  
  // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  if (day >= 1 && day <= 3) { 
    // Mon(1), Tue(2), Wed(3) -> This Friday(5)
    // Mon: 1 -> 5 (+4)
    // Tue: 2 -> 5 (+3)
    // Wed: 3 -> 5 (+2)
    targetDate.setDate(today.getDate() + (5 - day))
  } else {
    // Thu(4), Fri(5), Sat(6), Sun(0) -> Next Tuesday(2)
    // Thu: 4 -> Next Tue (+5)
    // Fri: 5 -> Next Tue (+4)
    // Sat: 6 -> Next Tue (+3)
    // Sun: 0 -> Next Tue (+2)
    let daysToAdd = (2 + 7 - day) % 7
    if (daysToAdd === 0) daysToAdd = 7 // Safety, though not reached for Tue
    targetDate.setDate(today.getDate() + daysToAdd)
  }
  return targetDate.toISOString().split('T')[0]
}

const form = ref({
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  notes: '',
  arrivalDate: calculateArrivalDate()
})

const submitOrder = () => {
  // Check if any product quantity is selected
  const selectedProducts = products.value.filter(p => p.actualQuantity > 0)
  if (selectedProducts.length === 0) {
    alert('최소 하나 이상의 상품 수량을 입력해주세요.')
    return
  }
  if (!form.value.recipientName || !form.value.recipientPhone || !form.value.recipientAddress) {
    alert('수령인 정보를 모두 입력해주세요.')
    return
  }

  alert('발주가 등록되었습니다.')
  router.push('/orders')
}

const isFormValid = computed(() => {
  return form.value.recipientName && form.value.recipientPhone && form.value.recipientAddress
})
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>신규 발주 등록</h2>
    </div>

    <!-- 1. Product List Section -->
    <div class="section-card">
      <div class="section-header">
        <h3>상품 선택</h3>
        <div class="controls">
          <label class="toggle-switch">
            추천 재고
            <input type="checkbox" v-model="showRecommendation" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-row">
        <input type="text" v-model="productFilter.code" placeholder="제품 코드" />
        <input type="text" v-model="productFilter.name" placeholder="제품명" />
        <select v-model="productFilter.status">
          <option value="">상태 전체</option>
          <option value="위험">위험</option>
          <option value="부족">부족</option>
          <option value="입고 예정">입고 예정</option>
          <option value="안전">안전</option>
        </select>
        <select v-model="productFilter.flavor">
          <option value="">맛 전체</option>
          <option value="기본맛">기본맛</option>
          <option value="매운맛">매운맛</option>
          <option value="안매운맛">안매운맛</option>
        </select>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>제품 코드</th>
            <th>제품명</th>
            <th>제품 상태</th>
            <th>맛</th>
            <th>현 재고</th>
            <th>안전 재고</th>
            <th v-if="showRecommendation" class="rec-col">추천 재고</th>
            <th>발주 수량</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredProducts" :key="p.code">
            <td class="code-cell">{{ p.code }}</td>
            <td class="name-cell">{{ p.name }}</td>
            <td><span :class="['status-tag', getStatusClass(p.status)]">{{ p.status }}</span></td>
            <td>{{ p.flavor }}</td>
            <td>{{ p.stock }}</td>
            <td>{{ p.safetyStock }}</td>
            <td v-if="showRecommendation" class="rec-col">{{ p.recommendedStock }}</td>
            <td>
              <input type="number" v-model="p.actualQuantity" min="0" class="qty-input" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 2. Order Info Section -->
    <div class="section-card">
      <h3>발주 정보 입력</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>수령인 이름</label>
          <input type="text" v-model="form.recipientName" placeholder="이름" />
        </div>
        <div class="form-group">
          <label>수령인 전화번호</label>
          <input type="text" v-model="form.recipientPhone" placeholder="010-0000-0000" />
        </div>
        <div class="form-group">
          <label>도착 날짜 (고정)</label>
          <input type="date" v-model="form.arrivalDate" readonly disabled />
        </div>
        <div class="form-group full-width">
          <label>수령 주소</label>
          <input type="text" v-model="form.recipientAddress" placeholder="주소 입력" />
        </div>
        <div class="form-group full-width">
          <label>요구사항</label>
          <textarea v-model="form.notes" rows="3" placeholder="배송 시 요청사항 등"></textarea>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="cancel-btn" @click="$router.back()">취소</button>
      <button class="submit-btn" @click="submitOrder" :disabled="!isFormValid">발주 등록</button>
    </div>
  </div>
</template>

<style scoped>
.header-row { margin-bottom: 1.5rem; }
.content-wrapper { max-width: 1000px; margin: 0 auto; padding-bottom: 4rem; }

.section-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }

/* Filter Row */
.filter-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.filter-row input, .filter-row select { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; }

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.75rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.code-cell { color: var(--text-light); }
.name-cell { font-weight: 600; }
.qty-input { width: 80px; padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 4px; }
.rec-col { color: var(--primary); font-weight: 600; background: #f0fdf4; }

/* Status Tags */
.status-tag { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-danger { background: #fee2e2; color: #991b1b; }

/* Checkbox Toggle */
.toggle-switch { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.toggle-switch input { margin-right: 0.25rem; }

/* Form Grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.95rem; width: 100%; }

.actions { display: flex; justify-content: flex-end; gap: 1rem; }
.cancel-btn { background: white; border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
.submit-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.submit-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
