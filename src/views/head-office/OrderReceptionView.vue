<script setup>
import { ref, computed, watch } from 'vue'

// Mock Central Inventory
const centralStock = ref({
  'OR0101': 50,
  'RO0201': 20,
  'MA0301': 30,
  'OR0403': 10,
  'RO0103': 100
})

// Mock Orders (Aggregated)
const orders = ref([
  { 
    id: 1, 
    orderCode: 'SE0120231026001', 
    franchiseCode: 'SE01', 
    recipientName: '김철수', 
    recipientPhone: '010-1111-2222', 
    orderDate: '2023-10-26', 
    arrivalDate: '2023-10-27', 
    products: [
      { productCode: 'OR0101', quantity: 20, amount: 10000 },
      { productCode: 'OR0103', quantity: 30, amount: 18000 }
    ],
    status: '대기' 
  },
  { 
    id: 2, 
    orderCode: 'SE0220231025005', 
    franchiseCode: 'SE02', 
    recipientName: '이영희', 
    recipientPhone: '010-3333-4444', 
    orderDate: '2023-10-25', 
    arrivalDate: '2023-10-26', 
    products: [
      { productCode: 'RO0201', quantity: 15, amount: 12000 },
      { productCode: 'MA0301', quantity: 10, amount: 12000 }
    ],
    status: '대기' 
  },
  { 
    id: 3, 
    orderCode: 'SE0320231024010', 
    franchiseCode: 'SE03', 
    recipientName: '박민수', 
    recipientPhone: '010-5555-6666', 
    orderDate: '2023-10-24', 
    arrivalDate: '2023-10-25', 
    products: [
      { productCode: 'OR0101', quantity: 100, amount: 10000 },
      { productCode: 'RO0103', quantity: 50, amount: 22000 }
    ],
    status: '대기' 
  }
])

const filter = ref({
  orderCode: '',
  franchiseCode: '',
  recipientName: '',
  recipientPhone: '',
  productCode: '',
  orderDate: '',
  arrivalDate: ''
})

const selectedIds = ref([])
const selectionMode = ref(null) // null, 'accept', 'reject'

// Filtering Logic
const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    return (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
           (!filter.value.franchiseCode || item.franchiseCode.includes(filter.value.franchiseCode)) &&
           (!filter.value.recipientName || item.recipientName.includes(filter.value.recipientName)) &&
           (!filter.value.recipientPhone || item.recipientPhone.includes(filter.value.recipientPhone)) &&
           (!filter.value.productCode || item.products.some(p => p.productCode.includes(filter.value.productCode))) &&
           (!filter.value.orderDate || item.orderDate === filter.value.orderDate) &&
           (!filter.value.arrivalDate || item.arrivalDate === filter.value.arrivalDate)
  })
})

const reservedStock = computed(() => {
  const stock = {}
  selectedIds.value.forEach(id => {
    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.products.forEach(p => {
        stock[p.productCode] = (stock[p.productCode] || 0) + p.quantity
      })
    }
  })
  return stock
})

// Real-time Availability (가불 여부) logic
const orderAvailability = computed(() => {
  const availabilityMap = {}
  
  orders.value.forEach(order => {
    let availableCount = 0
    let totalCount = order.products.length
    
    order.products.forEach(p => {
      const currentReserved = reservedStock.value[p.productCode] || 0
      const stockInWarehouse = centralStock.value[p.productCode] || 0
      const needToCover = selectedIds.value.includes(order.id) ? currentReserved : (currentReserved + p.quantity)
      
      if (stockInWarehouse >= needToCover) {
        availableCount++
      }
    })
    
    if (availableCount === totalCount) {
      availabilityMap[order.id] = 'possible'
    } else if (availableCount > 0) {
      availabilityMap[order.id] = 'partial'
    } else {
      availabilityMap[order.id] = 'impossible'
    }
  })

  return availabilityMap
})

const getAvailabilityText = (id) => ({
  'possible': '가능',
  'partial': '부분 가능',
  'impossible': '불가능'
}[orderAvailability.value[id]])

const getAvailabilityClass = (id) => ({
  'possible': 'status-ok',
  'partial': 'status-warning',
  'impossible': 'status-danger'
}[orderAvailability.value[id]])

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

// Actions
const enterAcceptMode = () => {
  selectionMode.value = 'accept'
  selectedIds.value = []
}

const enterRejectMode = () => {
  selectionMode.value = 'reject'
  selectedIds.value = []
}

const cancelSelection = () => {
  selectionMode.value = null
  selectedIds.value = []
}

const confirmAccept = () => {
  if (selectedIds.value.length === 0) {
    alert('접수할 발주를 선택해주세요.')
    return
  }

  const impossible = selectedIds.value.find(id => orderAvailability.value[id] === 'impossible')
  if (impossible) {
    alert('재고가 전혀 없는 제품이 포함된 발주가 있습니다. 체크를 해제하거나 확인해주세요.')
    return
  }

  orders.value = orders.value.map(o => {
    if (selectedIds.value.includes(o.id)) {
      const avail = orderAvailability.value[o.id]
      return { ...o, status: avail === 'possible' ? '접수 완료' : '부분 접수' }
    }
    return o
  })
  
  selectedIds.value.forEach(id => {
      const o = orders.value.find(item => item.id === id)
      o.products.forEach(p => {
        // Only deduct stock if available
        const currentReserved = (reservedStock.value[p.productCode] || 0) - p.quantity // reserved excluding itself
        if (centralStock.value[p.productCode] >= (currentReserved + p.quantity)) {
           centralStock.value[p.productCode] -= p.quantity
        }
      })
  })

  alert('선택한 발주가 처리되었습니다.')
  selectionMode.value = null
  selectedIds.value = []
}

const confirmReject = () => {
    if (selectedIds.value.length === 0) {
    alert('반려할 발주를 선택해주세요.')
    return
  }

  if (confirm('선택한 발주를 반려하시겠습니까?')) {
    orders.value = orders.value.map(o => {
        if (selectedIds.value.includes(o.id)) {
            return { ...o, status: '반려' }
        }
        return o
    })
    alert('선택한 발주가 반려되었습니다.')
    selectionMode.value = null
    selectedIds.value = []
  }
}

const toggleSelectAll = (event) => {
    if (event.target.checked) {
        selectedIds.value = filteredOrders.value.filter(o => o.status === '대기').map(o => o.id)
    } else {
        selectedIds.value = []
    }
}

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 요청 접수</h2>
      <div class="top-actions">
        <template v-if="selectionMode === null">
          <button @click="enterAcceptMode" class="accept-btn">접수</button>
          <button @click="enterRejectMode" class="reject-btn">반려</button>
        </template>
        <template v-else-if="selectionMode === 'accept'">
          <button @click="confirmAccept" class="save-btn">선택 접수 완료</button>
          <button @click="cancelSelection" class="cancel-btn">취소</button>
        </template>
        <template v-else-if="selectionMode === 'reject'">
          <button @click="confirmReject" class="reject-complete-btn">선택 반려 완료</button>
          <button @click="cancelSelection" class="cancel-btn">취소</button>
        </template>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>발주 코드</label>
          <input type="text" v-model="filter.orderCode" placeholder="SE0120260210001" />
        </div>
        <div class="filter-group">
          <label>가맹점 코드</label>
          <input type="text" v-model="filter.franchiseCode" placeholder="SE01" />
        </div>
        <div class="filter-group">
          <label>수령인 이름</label>
          <input type="text" v-model="filter.recipientName" placeholder="이름" />
        </div>
        <div class="filter-group">
          <label>연락처</label>
          <input type="text" v-model="filter.recipientPhone" placeholder="010-..." />
        </div>
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="OR0101" />
        </div>
        <div class="filter-group">
          <label>발주일</label>
          <input type="date" v-model="filter.orderDate" />
        </div>
        <div class="filter-group">
          <label>도착 예정일</label>
          <input type="date" v-model="filter.arrivalDate" />
        </div>
      </div>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="selectionMode">
                <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.length > 0 && selectedIds.length === filteredOrders.filter(o => o.status === '대기').length" />
            </th>
            <th>발주 코드</th>
            <th>상태</th>
            <th>가맹점 코드</th>
            <th>수령인 이름</th>
            <th>연락처</th>
            <th>제품 코드</th>
            <th>수량</th>
            <th>가용 재고</th>
            <th>발주일</th>
            <th>도착 예정일</th>
            <th>가불 여부</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :class="{ 'selected-row': selectedIds.includes(order.id), 'processing-row': order.status !== '대기' }">
            <td v-if="selectionMode">
                <input type="checkbox" :value="order.id" v-model="selectedIds" :disabled="order.status !== '대기'" />
            </td>
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td>
                <span :class="['status-tag', 
                  order.status === '대기' ? 'status-warning' : 
                  (order.status === '접수 완료' ? 'status-ok' : 
                  (order.status === '부분 접수' ? 'status-primary' : 'status-danger'))]">
                    {{ order.status }}
                </span>
            </td>
            <td>{{ order.franchiseCode }}</td>
            <td>{{ order.recipientName }}</td>
            <td>{{ order.recipientPhone }}</td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode" class="sku-cell small">
                  {{ p.productCode }}
                </span>
              </div>
            </td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode">
                  {{ p.quantity }}
                </span>
              </div>
            </td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode" class="stock-qty" :class="{ 'low-stock': (centralStock[p.productCode] - (reservedStock[p.productCode] || 0)) < 10 }">
                  {{ centralStock[p.productCode] - (reservedStock[p.productCode] || 0) }}
                </span>
              </div>
            </td>
            <td>{{ order.orderDate }}</td>
            <td>{{ order.arrivalDate }}</td>
            <td>
              <span v-if="order.status === '대기'" :class="['status-tag', getAvailabilityClass(order.id)]">
                {{ getAvailabilityText(order.id) }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="total-cell">{{ formatPrice(order.products.reduce((acc, p) => acc + (p.quantity * p.amount), 0)) }}</td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
              <td colspan="12" class="empty-cell">조회된 발주 요청이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1600px; margin: 0 auto; padding-bottom: 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }

.top-actions { display: flex; align-items: center; gap: 1rem; }
.stock-info { font-size: 0.85rem; color: var(--text-light); border: 1px dashed var(--border-color); padding: 0.5rem 1rem; border-radius: 8px; display: flex; gap: 0.75rem; }
.stock-badge { color: var(--primary); font-weight: 700; }

.accept-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.accept-btn:hover { opacity: 0.9; }
.reject-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.reject-btn:hover { background: #fecaca; }

.save-btn { background: var(--primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.cancel-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.reject-complete-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.data-table th { text-align: left; padding: 0.75rem 0.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; vertical-align: middle; white-space: nowrap; }

.sku-cell { font-weight: 600; color: var(--primary); }
.total-cell { color: var(--text-dark); }
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-danger { background: #fee2e2; color: #991b1b; }

.stock-qty { color: var(--text-dark); }
.low-stock { color: #ef4444; }

.multi-line-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sku-cell.small {
  font-size: 0.8rem;
}
</style>
