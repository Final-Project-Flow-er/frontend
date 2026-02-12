<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>공장 입출고 관리 (로그)</h2>
    </div>

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
        <label>제품 명</label>
        <input type="text" v-model="filter.productName" placeholder="제품명 입력" />
      </div>
      <div class="filter-group">
        <label>발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="발주 코드 입력" />
      </div>
      <div class="filter-group">
        <label>유형</label>
        <select v-model="filter.logType">
            <option value="">전체</option>
            <option value="PRODUCTION">입고</option>
            <option value="DISTRIBUTION">출고</option>
            <option value="DISPOSAL">폐기</option>
        </select>
      </div>
    </div>

    <!-- Log List -->
    <div class="table-outer-container">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>발주 코드</th>
              <th>박스 코드</th>
              <th>제품 명</th>
              <th>유형</th>
              <th>수량 (박스)</th>
              <th>단가</th>
              <th>변경수량 (개)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.logId">
              <td>{{ formatDate(log.arrivalTime) }}</td>
              <td class="code-cell">{{ log.orderCode }}</td>
              <td class="code-cell">{{ log.boxCode }}</td>
              <td class="name-cell">{{ log.name }}</td>
              <td>
                <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
              </td>
              <td class="number-cell">{{ log.quantity }} 박스</td>
              <td class="number-cell">{{ formatPrice(log.supplyPrice) }}</td>
              <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" class="empty-cell">조회된 공장 로그 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: '',
  logType: ''
})

// Mock Data for Factory Context
// LogType: PRODUCTION (Inbound), DISTRIBUTION (Outbound to Store), RETURN_IN (From Store), DISPOSAL
const logs = ref([
  {
    logId: 1,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    orderCode: 'HEAD20260210001', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'PRODUCTION', // 입고 (생산)
    supplyPrice: 10000,
    locationType: 'FACTORY', 
    locationId: 100, 
    quantity: 100, 
    arrivalTime: '2026-02-10T08:00:00'
  },
  {
    logId: 2,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    orderCode: 'SE0120260210001',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'DISTRIBUTION', // 출고 (To Store)
    supplyPrice: 10000,
    locationType: 'STORE',
    locationId: 200,
    quantity: 10,
    arrivalTime: '2026-02-10T10:00:00',
    targetStore: '서울 강남점'
  },
  {
    logId: 4,
    product: { productId: 3 },
    boxCode: 'SE01-FA01-A1-MA0301-001',
    orderCode: '-',
    name: '마라 떡볶이 밀키트 매운맛 1,2인분',
    logType: 'DISPOSAL', // 폐기
    supplyPrice: 12000,
    locationType: 'FACTORY',
    locationId: 100,
    quantity: 2,
    arrivalTime: '2026-02-10T15:00:00'
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
      const arrivalDate = log.arrivalTime.split('T')[0]
      const matchStart = !filter.value.startDate || arrivalDate >= filter.value.startDate
      const matchEnd = !filter.value.endDate || arrivalDate <= filter.value.endDate
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchCode = !filter.value.orderCode || log.orderCode.includes(filter.value.orderCode)
      const matchType = !filter.value.logType || log.logType === filter.value.logType
      return matchStart && matchEnd && matchName && matchCode && matchType
  })
})

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const getLogTypeLabel = (type) => {
    switch (type) {
        case 'PRODUCTION': return '입고'
        case 'DISTRIBUTION': return '출고'
        case 'RETURN_IN': return '반품 입고'
        case 'DISPOSAL': return '폐기'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'PRODUCTION': return 'inbound' // Blue
    case 'DISTRIBUTION': return 'outbound' // Red
    case 'RETURN_IN': return 'return-in' // Green
    case 'DISPOSAL': return 'refund' // Purple (reused)
    default: return ''
  }
}

// Source Logic based on LogType (Factory View)
const getSource = (log) => {
    switch (log.logType) {
        case 'PRODUCTION': return '공장 (생산라인)'
        case 'RETURN_IN': return log.sourceStore || '가맹점'
        
        case 'DISTRIBUTION': return '공장'
        case 'DISPOSAL': return '공장'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'PRODUCTION': return '공장'
        case 'RETURN_IN': return '공장'
        
        case 'DISTRIBUTION': return log.targetStore || '가맹점'
        case 'DISPOSAL': return '폐기장'
        default: return '-'
    }
}

// 1 Box = 20 Items
const getChangeQuantity = (log) => {
    const boxCount = log.quantity
    const itemCount = boxCount * 20
    
    // Positive impact on Stock
    if (['PRODUCTION', 'RETURN_IN'].includes(log.logType)) {
        return itemCount
    }
    // Negative impact on Stock
    return -itemCount
}

const getChangeClass = (qty) => {
    return qty > 0 ? 'plus' : 'minus'
}

</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

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

/* Table Styles */
.table-outer-container {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: white;
}
.table-container {
  overflow-x: auto;
}
table { width: 100%; border-collapse: collapse; text-align: center; }
th { background: #f8fafc; padding: 1rem; font-weight: 600; color: #64748b; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; text-align: center; }
td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: var(--text-dark); font-size: 0.95rem; vertical-align: middle; text-align: center; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.code-cell { font-family: monospace; color: #475569; font-size: 0.9rem; }
.name-cell { font-weight: 600; color: var(--text-dark); }
.number-cell { font-variant-numeric: tabular-nums; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.inbound { background: #dbeafe; color: #1e40af; } /* Blue */
.type-badge.outbound { background: #fee2e2; color: #991b1b; } /* Red */
.type-badge.return-in { background: #dcfce7; color: #166534; } /* Green */
.type-badge.refund { background: #f3e8ff; color: #6b21a8; } /* Purple */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }

</style>
