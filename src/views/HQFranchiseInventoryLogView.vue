<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 입출고 관리 (가맹점 로그)</h2>
      <button class="action-btn" @click="openStoreSelectModal">가맹점 선택</button>
    </div>

    <!-- Store Info (If Selected) -->
    <div v-if="selectedStore" class="store-info-banner">
        <h3>{{ selectedStore.name }}</h3>
        <p>현재 선택된 가맹점의 입출고 내역을 조회 중입니다.</p>
    </div>
    <div v-else class="no-store-banner">
        <p>가맹점을 선택해주세요.</p>
    </div>

    <!-- Reusing StoreInventoryLogView Logic (Simplified here for independence or could import component) -->
    <!-- For this task, I will implement a version of the log view that simulates being 'that' store -->
    <div v-if="selectedStore" class="store-log-content">
        <!-- Filter Section -->
        <div class="filter-section">
        <div class="filter-group date-range">
            <label>조회 기간</label>
            <div class="date-inputs">
            <input type="date" v-model="filter.startDate" />
            <span>~</span>
            <input type="date" v-model="filter.endDate" />
            </div>
        </div>
        <div class="filter-group">
            <label>상품 명</label>
            <input type="text" v-model="filter.productName" placeholder="상품명 입력" />
        </div>
        <div class="filter-group">
            <label>발주/판매 코드</label>
            <input type="text" v-model="filter.orderCode" placeholder="코드 입력" />
        </div>
        <div class="filter-group">
            <label>유형</label>
            <select v-model="filter.logType">
                <option value="">전체</option>
                <option value="INBOUND">입고</option>
                <option value="SALE">판매</option>
                <option value="RETURN_OUT">반품</option>
                <option value="REFUND">환불</option>
            </select>
        </div>
        <button class="search-btn">조회</button>
        </div>

        <!-- Section 1: Logistics Logs (Box Units) -->
        <div class="section-title">
            <h3>물류 입출고 내역</h3>
            <span class="unit-badge">단위: 박스</span>
        </div>
        <div class="table-container mb-2">
            <table>
                <thead>
                <tr>
                    <th>날짜</th>
                    <th>발주 코드</th>
                    <th>박스 코드</th>
                    <th>제품 명</th>
                    <th>유형</th>
                    <th>수량 (박스)</th>
                    <th>보낸 곳</th>
                    <th>받는 곳</th>
                    <th>단가</th>
                    <th>변경수량 (개)</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="log in logisticsLogs" :key="log.logId">
                    <td>{{ formatDate(log.arrivalTime) }}</td>
                    <td class="code-cell">{{ log.orderCode }}</td>
                    <td class="code-cell">{{ log.boxCode }}</td>
                    <td class="name-cell">{{ log.name }}</td>
                    <td>
                    <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                    </td>
                    <td class="number-cell">{{ log.quantity }} 박스</td>
                    <td>{{ getSource(log) }}</td>
                    <td>{{ getDestination(log) }}</td>
                    <td class="number-cell">{{ formatPrice(log.supplyPrice) }}</td>
                    <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                    {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                    </td>
                </tr>
                <tr v-if="logisticsLogs.length === 0">
                    <td colspan="10" class="empty-cell">조회된 물류 내역이 없습니다.</td>
                </tr>
                </tbody>
            </table>
        </div>

        <!-- Section 2: Sales Logs (Item Units) -->
        <div class="section-title">
            <h3>판매/환불 내역</h3>
            <span class="unit-badge sale">단위: 낱개</span>
        </div>
        <div class="table-container">
            <table>
                <thead>
                <tr>
                    <th>날짜</th>
                    <th>판매 코드</th>
                    <th>박스 코드</th>
                    <th>제품 명</th>
                    <th>유형</th>
                    <th>수량 (개)</th>
                    <th>보낸 곳</th>
                    <th>받는 곳</th>
                    <th>판매가</th>
                    <th>변경수량 (개)</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="log in salesLogs" :key="log.logId">
                    <td>{{ formatDate(log.arrivalTime) }}</td>
                    <td class="code-cell">{{ log.serialNumber || log.orderCode || 'S-' + log.logId }}</td>
                    <td class="code-cell">{{ log.boxCode }}</td>
                    <td class="name-cell">{{ log.name }}</td>
                    <td>
                    <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                    </td>
                    <td class="number-cell">{{ log.quantity }} 개</td>
                    <td>{{ getSource(log) }}</td>
                    <td>{{ getDestination(log) }}</td>
                    <td class="number-cell">{{ formatPrice(log.supplyPrice) }}</td>
                    <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                    {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                    </td>
                </tr>
                <tr v-if="salesLogs.length === 0">
                    <td colspan="10" class="empty-cell">조회된 판매 내역이 없습니다.</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>


    <!-- Store Selector Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>가맹점 선택</h3>
        <div class="modal-body">
            <input type="text" v-model="storeSearch" placeholder="가맹점 이름 검색..." class="store-search-input" />
            <ul class="store-list scrollable">
                <li v-for="store in filteredStores" :key="store.code" @click="selectStore(store)">
                    <span class="store-name">{{ store.name }}</span>
                    <span class="store-code">{{ store.code }}</span>
                </li>
            </ul>
        </div>
        <div class="modal-actions">
          <button @click="showModal = false">닫기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showModal = ref(true) // Open on load
const selectedStore = ref(null)
const storeSearch = ref('')

const stores = [
    { name: '서울 강남점', code: 'SE01' },
    { name: '서울 서초점', code: 'SE02' },
    { name: '서울 송파점', code: 'SE03' },
    { name: '서울 마포점', code: 'SE04' },
    { name: '서울 영등포점', code: 'SE05' }
]

const filteredStores = computed(() => {
    return stores.filter(s => s.name.includes(storeSearch.value) || s.code.includes(storeSearch.value))
})

const selectStore = (store) => {
    selectedStore.value = store
    showModal.value = false
    // Here we would ideally load data for this store from API
    // For now we use the mock data
}

const openStoreSelectModal = () => {
    showModal.value = true
}

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  logType: ''
})

// Mock Data (Simulating Store Data)
const logs = ref([
  {
    logId: 1,
    product: { productId: 1 },
    boxCode: 'SEO00120260210OR010100100',
    orderCode: 'SE01202602090001',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'INBOUND',
    supplyPrice: 10000,
    locationType: 'HQ',
    locationId: 100, 
    quantity: 5,
    arrivalTime: '2026-02-10T10:30:00'
  },
  {
    logId: 2,
    product: { productId: 1 },
    boxCode: 'SEO00120260211OR010100100',
    orderCode: 'SE01202602110002', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'SALE',
    supplyPrice: 10000,
    locationType: 'STORE',
    locationId: 200,
    quantity: 1,
    arrivalTime: '2026-02-11T14:20:00'
  }
])

const logisticsLogs = computed(() => {
  return logs.value.filter(log => {
      if (['SALE', 'REFUND'].includes(log.logType)) return false
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchType = !filter.value.logType || log.logType === filter.value.logType
      return matchName && matchType
  })
})

const salesLogs = computed(() => {
  return logs.value.filter(log => {
      if (!['SALE', 'REFUND'].includes(log.logType)) return false
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchType = !filter.value.logType || log.logType === filter.value.logType
      return matchName && matchType
  })
})

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)

const getLogTypeLabel = (type) => {
    switch (type) {
        case 'INBOUND': return '입고'
        case 'SALE': return '판매'
        case 'RETURN_IN': return '반품 입고'
        case 'RETURN_OUT': return '반품 출고'
        case 'REFUND': return '환불'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'INBOUND': return 'inbound'
    case 'SALE': return 'sale'
    case 'RETURN_OUT': return 'return-out'
    case 'REFUND': return 'refund'
    default: return ''
  }
}

// Logic assumes we are viewing 'From the perspective of the STORE'
const getSource = (log) => {
    switch (log.logType) {
        case 'INBOUND': return '본사'
        case 'RETURN_IN': return '타점'
        case 'REFUND': return '고객'
        
        case 'OUTBOUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'RETURN_OUT': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'SALE': return selectedStore.value ? selectedStore.value.name : '가맹점'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'INBOUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'RETURN_IN': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'REFUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        
        case 'OUTBOUND': return '본사/타점'
        case 'RETURN_OUT': return '본사'
        case 'SALE': return '고객'
        default: return '-'
    }
}

const getChangeQuantity = (log) => {
    const qty = log.quantity
    
    // Individual item logic for Sales/Refund
    if (['SALE', 'REFUND'].includes(log.logType)) {
        return log.logType === 'SALE' ? -qty : qty
    }

    // Box logic for Inbound/Returns
    const itemCount = qty * 20
    if (['INBOUND', 'REFUND'].includes(log.logType)) { // Note: Refund is handled above, but keeping logic clear
        return itemCount
    }
    return -itemCount
}

const getChangeClass = (qty) => {
    return qty > 0 ? 'plus' : 'minus'
}

</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.action-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.store-info-banner { background: #eff6ff; padding: 1rem; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 1.5rem; }
.store-info-banner h3 { margin: 0 0 0.5rem 0; color: #1e3a8a; }
.store-info-banner p { margin: 0; color: #3b82f6; }

.no-store-banner { background: #f8fafc; padding: 2rem; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; }
.date-inputs { display: flex; gap: 0.5rem; align-items: center; }
.search-btn {
  background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto;
}

/* Table Styles */
.table-container {
  background: white; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background: #f8fafc; padding: 1rem; font-weight: 600; color: #64748b; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: var(--text-dark); font-size: 0.95rem; vertical-align: middle; white-space: nowrap; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.code-cell { font-family: monospace; color: #475569; font-size: 0.9rem; }
.name-cell { font-weight: 600; color: var(--text-dark); }
.number-cell { font-variant-numeric: tabular-nums; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.inbound { background: #dbeafe; color: #1e40af; } /* Blue */
.type-badge.return-out { background: #ffedd5; color: #9a3412; } /* Orange */
.type-badge.sale { background: #f1f5f9; color: #475569; } /* Gray */
.type-badge.refund { background: #f3e8ff; color: #6b21a8; } /* Purple */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

/* New Section Styles */
.section-title { margin-top: 2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
.section-title h3 { margin: 0; font-size: 1.2rem; color: var(--text-dark); }
.unit-badge { background: #eff6ff; color: #3b82f6; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600; }
.unit-badge.sale { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
.mb-2 { margin-bottom: 2rem; }
.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 400px; display: flex; flex-direction: column; max-height: 80vh; }
.modal-body { flex: 1; overflow-y: auto; margin: 1rem 0; }
.store-search-input { width: 100%; padding: 0.8rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; }
.store-list { list-style: none; padding: 0; margin: 0; }
.store-list li { display: flex; justify-content: space-between; padding: 0.8rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }
.store-list li:hover { background: #f8fafc; }
.store-name { font-weight: 600; }
.store-code { color: #94a3b8; font-size: 0.9rem; }
.modal-actions { display: flex; justify-content: flex-end; }

</style>
