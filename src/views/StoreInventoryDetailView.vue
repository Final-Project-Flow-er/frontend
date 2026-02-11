<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>재고 상세 조회 ({{ productCode }})</h2>
      <div class="header-actions">
        <button class="action-btn back-btn" @click="goBack">뒤로가기</button>
      </div>
    </div>

    <!-- Filter Section (Grid) -->
    <div class="filter-section">
      <div class="filter-group">
        <label>유통기한</label>
        <input type="date" v-model="filter.expireDate" />
      </div>
      <div class="filter-group">
        <label>제조일자</label>
        <input type="date" v-model="filter.manufactureDate" />
      </div>
      <div class="filter-group">
        <label>배송완료 일자</label>
        <input type="date" v-model="filter.deliveryDate" />
      </div>
      <div class="filter-group">
        <label>입고완료 일자</label>
        <input type="date" v-model="filter.inboundDate" />
      </div>
      <div class="filter-group">
        <label>상태</label>
        <select v-model="filter.status">
          <option value="">전체</option>
          <option value="AVAILABLE">가용</option>
          <option value="RETURN_WAIT">반품대기</option>
        </select>
      </div>
      <div class="filter-actions">

      </div>
   
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="route.query.source === 'store'" class="checkbox-cell"><input type="checkbox" v-model="selectAll" @change="toggleAll" /></th>
            <th>식별 코드</th>
            <th>박스 코드</th>
            <th>유통기한</th>
            <th>제조일자</th>
            <th>배송완료 일자</th>
            <th>입고완료 일자</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item.serialCode">
            <td v-if="route.query.source === 'store'" class="checkbox-cell"><input type="checkbox" v-model="selectedItems" :value="item.serialCode" /></td>
            <td class="sku-cell">{{ item.serialCode }}</td>
            <td>{{ item.boxCode }}</td>
            <td>{{ item.expireDate }}</td>
            <td>{{ item.manufactureDate }}</td>
            <td>{{ item.deliveryCompleteDate }}</td>
            <td>{{ item.inboundCompleteDate }}</td>
            <td>
              <span :class="['status-badge', item.status === 'AVAILABLE' ? 'safe' : 'warning']">
                {{ item.status === 'AVAILABLE' ? '가용' : '반품대기' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <button v-if="route.query.source === 'store'" class="action-btn danger" @click="requestReturn">반품 요청</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const productCode = ref(route.params.productCode)
const userRole = sessionStorage.getItem('userRole')

const filter = ref({
  expireDate: '',
  manufactureDate: '',
  deliveryDate: '',
  inboundDate: '',
  status: ''
})

const selectedItems = ref([])
const selectAll = ref(false)

// Mock Data Generation
const items = ref([])

onMounted(() => {
  // Generate dummy items based on productCode
  // Box Code format: UL01{YYYYMMDD}{ProductCodeWithPadd}{Seq}
  // User Req: UL01 + Factory Numbering ? For now assume UL01 is fixed prefix.
  // Actually regex-like: UL01 + Date + Product Code + Box Code
  
  const today = '20260209'
  const prefix = productCode.value 
  
  for (let b = 1; b <= 5; b++) { // 5 boxes
    const boxSeq = b < 10 ? '0' + b : b
    // Box Code ends in '00'
    const boxCode = `SEO001${today}${prefix}${boxSeq}00`
    
    for (let i = 1; i <= 20; i++) { // 20 items per box
      const itemSeq = i < 10 ? '0' + i : i
      // Identification Code ends in 01~20
      const serialCode = `SEO001${today}${prefix}${boxSeq}${itemSeq}`
      
      items.value.push({
        boxCode: boxCode,
        serialCode: serialCode, 
        expireDate: '2026-08-09',
        manufactureDate: '2026-02-09',
        deliveryCompleteDate: '2026-02-10 14:00:00',
        inboundCompleteDate: '2026-02-10 15:30:00',
        status: (b * i) > 90 ? 'RETURN_WAIT' : 'AVAILABLE'
      })
    }
  }
})

const filteredItems = computed(() => {
  return items.value.filter(item => {
    const matchExpire = !filter.value.expireDate || item.expireDate === filter.value.expireDate
    const matchManu = !filter.value.manufactureDate || item.manufactureDate === filter.value.manufactureDate
    const matchDeliv = !filter.value.deliveryDate || item.deliveryCompleteDate.startsWith(filter.value.deliveryDate)
    const matchInbound = !filter.value.inboundDate || item.inboundCompleteDate.startsWith(filter.value.inboundDate)
    const matchStatus = !filter.value.status || item.status === filter.value.status
    
    return matchExpire && matchManu && matchDeliv && matchInbound && matchStatus
  })
})

const toggleAll = () => {
  if (selectAll.value) {
    selectedItems.value = filteredItems.value.map(i => i.serialCode)
  } else {
    selectedItems.value = []
  }
}

// Actions
const goBack = () => router.back()

const requestReturn = () => {
  if (selectedItems.value.length === 0) {
    alert('반품할 항목을 선택해주세요.')
    return
  }
  
  // Prepare data for the return creation page
  const selectedList = items.value
    .filter(item => selectedItems.value.includes(item.serialCode))
    .map(item => ({
      boxCode: item.boxCode,
      idCode: item.serialCode, // Item identification code
      productCode: productCode.value,
      productName: `[개별] ${productCode.value}`, // Placeholder name
      orderCode: 'DUMMY-ORDER-001', // Required for grouping in ReturnCreateView
      quantity: 1,
      totalAmount: 0
    }))

  router.push({ 
    name: 'franchise-return-create', 
    state: { returnItems: selectedList } 
  })
}
</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.header-actions { display: flex; gap: 1rem; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
}
.filter-actions {
    margin-left: auto;
}
.search-btn {
  background: var(--text-dark);
  color: white;
  border: none;
  padding: 0.6rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 42px;
}

/* Data Table */
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.sku-cell { color: var(--primary); font-weight: 600; }
.checkbox-cell { width: 50px; text-align: center; }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-badge.safe { background: #e6fffa; color: #2c7a7b; }
.status-badge.warning { background: #fffaf0; color: #9c4221; }

.action-btn {
  padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; border: 1px solid var(--border-color); background: white;
}
.action-btn.danger { background: #fff5f5; color: #e53e3e; border: none; }
.action-btn.back-btn { margin-right: 0.5rem; }

.bottom-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
</style>
