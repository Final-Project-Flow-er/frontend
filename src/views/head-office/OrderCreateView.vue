<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHQStock } from '@/api/hqInventory.js'
import { getMyInfo } from '@/api/users.js'

const router = useRouter()

const statusMap = {
  'SAFE': '안전',
  'WARNING': '부족',
  'DANGER': '위험'
}

const parseSpicinessFromName = (name) => {
  if (name.includes('아주 매운맛')) return '아주 매운맛'
  if (name.includes('매운맛')) return '매운맛'
  if (name.includes('기본맛')) return '기본맛'
  if (name.includes('순한맛')) return '순한맛'
  return ''
}

const stocks = ref([])

const filter = ref({
  code: '',
  name: '',
  status: '',
  spiciness: ''
})

const statuses = ['위험', '부족', '입고 예정', '안전', '품절']
const spicinessLevels = ['순한맛', '기본맛', '매운맛', '아주 매운맛']

// Filtered Stock Logic
const filteredStocks = computed(() => {
  return stocks.value.filter(s => {
    return (!filter.value.code || s.code.includes(filter.value.code)) &&
           (!filter.value.name || s.name.includes(filter.value.name)) &&
           (!filter.value.status || s.status === filter.value.status) &&
           (!filter.value.spiciness || s.spiciness === filter.value.spiciness)
  })
})

onMounted(async () => {
  try {
    const [stockData, myInfo] = await Promise.all([getHQStock(), getMyInfo()])
    stocks.value = (stockData || []).map(s => ({
      id: s.productId,
      code: s.productCode,
      name: s.productName,
      status: (s.status == null || s.status === 0) ? '품절' : (statusMap[s.status] || s.status || ''),
      spiciness: parseSpicinessFromName(s.productName),
      current: s.totalQuantity ?? 0,
      safety: s.safetyStock ?? 0,
      inputQty: 0
    }))
    orderInfo.value.managerName = myInfo.username || ''
    orderInfo.value.managerPhone = myInfo.phone || ''
  } catch (e) {
    alert(e.message || '데이터를 불러오는데 실패했습니다.')
  }
})

// Order Info
const getRegularDeadline = () => {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() + 2, 1)
  const y = target.getFullYear()
  const m = String(target.getMonth() + 1).padStart(2, '0')
  const d = '01'
  return `${y}-${m}-${d}`
}

const orderInfo = ref({
  managerName: '',
  managerPhone: '',
  requirements: '',
  type: '정기',
  deadline: getRegularDeadline()
})

const handleTypeChange = (type) => {
  orderInfo.value.type = type
  orderInfo.value.deadline = type === '정기' ? getRegularDeadline() : ''
}

const getStatusClass = (s) => ({
  '위험': 'status-danger',
  '부족': 'status-warning',
  '입고 예정': 'status-info',
  '안전': 'status-ok',
  '품절': 'status-soldout'
}[s] || '')

const createOrder = async () => {
  const selectedItems = stocks.value.filter(s => s.inputQty > 0)
  if (selectedItems.length === 0) {
    alert('발주할 수량을 입력해주세요.')
    return
  }
  if (!orderInfo.value.deadline) {
    alert('마감 기한을 입력해주세요.')
    return
  }

  try {
    const { createOrder: createOrderApi } = await import('@/api/hqOrders.js')
    await createOrderApi({
      username: orderInfo.value.managerName,
      phoneNumber: orderInfo.value.managerPhone,
      description: orderInfo.value.requirements,
      isRegular: orderInfo.value.type === '정기',
      manufactureDate: orderInfo.value.deadline + 'T00:00:00',
      items: selectedItems.map(s => ({ productCode: s.code, quantity: s.inputQty }))
    })
    alert('발주가 성공적으로 생성되었습니다.')
    router.push({ name: 'head-office-order-list' })
  } catch (e) {
    alert(e.message || '발주 생성에 실패했습니다.')
  }
}

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 생성</h2>
      <div class="header-actions">
        <button class="secondary-btn" @click="router.back()">닫기</button>
      </div>
    </div>

    <!-- Section 1: Stock Inquiry -->
    <div class="section-card">
      <div class="section-header">
        <h3>현 재고 조회</h3>
      </div>

      <!-- Filters -->
      <div class="filter-row">
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.code" placeholder="OR0101" />
        </div>
        <div class="filter-group">
          <label>제품명</label>
          <input type="text" v-model="filter.name" />
        </div>
        <div class="filter-group">
          <label>제품 상태</label>
          <select v-model="filter.status">
            <option value="">전체</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>맵기</label>
          <select v-model="filter.spiciness">
            <option value="">전체</option>
            <option v-for="s in spicinessLevels" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="table-container">
        <table class="stock-table">
          <thead>
            <tr>
              <th>제품 코드</th>
              <th>제품명</th>
              <th>상태</th>
              <th>맵기</th>
              <th class="num-col">현 재고</th>
              <th class="num-col">안전 재고</th>
              <th class="qty-col">실 수량 (발주)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in filteredStocks" :key="stock.id">
              <td class="code-cell">{{ stock.code }}</td>
              <td>{{ stock.name }}</td>
              <td><span :class="['status-tag', getStatusClass(stock.status)]">{{ stock.status }}</span></td>
              <td>{{ stock.spiciness }}</td>
              <td class="num-col">{{ stock.current.toLocaleString() }}</td>
              <td class="num-col">{{ stock.safety.toLocaleString() }}</td>
              <td class="qty-col">
                <input type="number" v-model.number="stock.inputQty" class="qty-input" min="0" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 2: Order Info -->
    <div class="section-card">
      <div class="section-header">
        <h3>발주 정보 입력</h3>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>발주자 이름</label>
          <input type="text" v-model="orderInfo.managerName" readonly class="disabled" />
        </div>
        <div class="form-group">
          <label>발주자 전화번호</label>
          <input type="text" v-model="orderInfo.managerPhone" readonly class="disabled" />
        </div>
        <div class="form-group wide">
          <label>요구사항</label>
          <textarea v-model="orderInfo.requirements" rows="3" placeholder="추가 요청 사항을 입력해주세요."></textarea>
        </div>
        <div class="form-group">
          <label>발주 구분</label>
          <div class="radio-buttons">
            <button 
              :class="['radio-btn', { active: orderInfo.type === '정기' }]"
              @click="handleTypeChange('정기')"
            >정기</button>
            <button 
              :class="['radio-btn', { active: orderInfo.type === '비정기' }]"
              @click="handleTypeChange('비정기')"
            >비정기</button>
          </div>
        </div>
        <div class="form-group">
          <label>마감 기한</label>
          <input 
            type="date" 
            v-model="orderInfo.deadline" 
            :disabled="orderInfo.type === '정기'" 
            :class="{ disabled: orderInfo.type === '정기' }"
          />
        </div>
      </div>
    </div>
    <div class="button-container">
      <button class="primary-btn" @click="createOrder">발주 생성</button>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1200px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding: 1rem 0; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.header-actions { display: flex; gap: 1rem; }

.section-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-dark); }

/* Filters */
.filter-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select { padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; }

/* Table */
.table-container { overflow-x: auto; }
.stock-table { width: 100%; border-collapse: collapse; }
.stock-table th { padding: 1rem; background: #f8fafc; text-align: left; font-size: 0.85rem; border-bottom: 1px solid var(--border-color); color: var(--text-light); }
.stock-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; }

.num-col { text-align: right; font-family: 'JetBrains Mono', monospace; }
.code-cell { font-weight: 600; color: var(--primary); }

.qty-col { text-align: center; width: 150px; }
.qty-input { width: 80px; padding: 0.5rem; border: 2px solid var(--primary); border-radius: 6px; text-align: right; font-weight: 700; }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-soldout { background: #f1f5f9; color: #64748b; }

/* Form */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.wide { grid-column: span 2; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.form-group input, .form-group textarea { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 10px; font-size: 1rem; }
.form-group input.disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }

.radio-buttons { display: flex; gap: 1rem; }
.radio-btn { flex: 1; padding: 0.75rem; border: 1px solid var(--border-color); background: white; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.radio-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }

.primary-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.secondary-btn { background: white; border: 1px solid var(--border-color); padding: 0.75rem 2rem; border-radius: 10px; font-weight: 600; cursor: pointer; }

.button-container { display: flex; justify-content: flex-end; margin-top: 2rem; }


</style>
