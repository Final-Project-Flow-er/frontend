<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 입출고 관리 (로그)</h2>
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
        <label>반품/발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="코드 입력" />
      </div>
    </div>

    <!-- Toggle Selector -->
    <div class="toggle-container">
      <div class="radio-group">
        <label :class="{ active: activeLogType === 'RETURN_IN' }">
          <input type="radio" v-model="activeLogType" value="RETURN_IN" />
          반품 입고 내역
        </label>
        <label :class="{ active: activeLogType === 'RETURN_OUT' }">
          <input type="radio" v-model="activeLogType" value="RETURN_OUT" />
          반품 출고 내역
        </label>
        <label :class="{ active: activeLogType === 'DISPOSAL' }">
          <input type="radio" v-model="activeLogType" value="DISPOSAL" />
          폐기 내역
        </label>
      </div>
      <span class="unit-badge" :class="activeLogType.toLowerCase().replace('_', '-')">단위: 박스</span>
    </div>

    <!-- Consolidated Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>{{ getCodeLabel() }}</th>
            <th>박스 코드</th>
            <th>제품 명</th>
            <th>유형</th>
            <th>수량 (박스)</th>
            <th>{{ activeLogType === 'RETURN_IN' ? '보낸 곳 (가맹점)' : '보낸 곳' }}</th>
            <th>{{ activeLogType === 'RETURN_OUT' ? '받는 곳 (가맹점)' : '받는 곳' }}</th>
            <th>공급가</th>
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
            <td>{{ getSource(log) }}</td>
            <td>{{ getDestination(log) }}</td>
            <td class="number-cell">{{ formatPrice(log.supplyPrice) }}</td>
            <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
              {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
            </td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="10" class="empty-cell">조회된 {{ getLogTypeLabel(activeLogType) }} 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeLogType = ref('RETURN_IN')

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: ''
})

// Mock Data for HQ Log (Returns & Disposals)
const logs = ref([
  {
    logId: 1,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    orderCode: 'RESE0120260210001', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'RETURN_IN', // 반품 입고
    supplyPrice: 10000,
    locationType: 'HQ',
    locationId: 100,
    quantity: 1,
    arrivalTime: '2026-02-10T14:00:00',
    sourceStore: '서울 강남점'
  },
  {
    logId: 2,
    product: { productId: 2 },
    boxCode: 'SE03-FA01-A1-RO0201-001',
    orderCode: 'RESE0320260210002',
    name: '로제 떡볶이 밀키트 기본맛 3,4인분',
    logType: 'RETURN_IN',
    supplyPrice: 22000,
    locationType: 'HQ',
    locationId: 100,
    quantity: 3,
    arrivalTime: '2026-02-10T10:30:00',
    sourceStore: '서울 송파점'
  },
  {
    logId: 3,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    orderCode: 'SE0120260211001', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'RETURN_OUT', // 반품 출고
    supplyPrice: 10000,
    locationType: 'HQ',
    locationId: 100,
    quantity: 5,
    arrivalTime: '2026-02-11T09:00:00',
    targetStore: '서울 강남점'
  },
  {
    logId: 4,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-005',
    orderCode: '-', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'DISPOSAL', // 폐기 (박스 단위)
    supplyPrice: 10000,
    locationType: 'HQ',
    locationId: 100,
    quantity: 2,
    arrivalTime: '2026-02-12T11:00:00'
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
      if (log.logType !== activeLogType.value) return false

      const arrivalDate = log.arrivalTime.split('T')[0]
      const matchStart = !filter.value.startDate || arrivalDate >= filter.value.startDate
      const matchEnd = !filter.value.endDate || arrivalDate <= filter.value.endDate
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchCode = !filter.value.orderCode || log.orderCode.includes(filter.value.orderCode)
      return matchStart && matchEnd && matchName && matchCode
  })
})

const getCodeLabel = () => {
    if (activeLogType.value === 'RETURN_IN') return '반품 코드'
    if (activeLogType.value === 'RETURN_OUT') return '발주 코드'
    return '참조 코드'
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const getLogTypeLabel = (type) => {
    switch (type) {
        case 'RETURN_IN': return '반품 입고'
        case 'RETURN_OUT': return '반품 출고'
        case 'DISPOSAL': return '폐기'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'RETURN_IN': return 'return-in'
    case 'RETURN_OUT': return 'return-out'
    case 'DISPOSAL': return 'refund' // Purple
    default: return ''
  }
}

const getSource = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return log.sourceStore || '가맹점'
        case 'RETURN_OUT': return '본사'
        case 'DISPOSAL': return '본사'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return '본사'
        case 'RETURN_OUT': return log.targetStore || '가맹점'
        case 'DISPOSAL': return '폐기장'
        default: return '-'
    }
}

// 1 Box = 20 Items
const getChangeQuantity = (log) => {
    const boxCount = log.quantity
    const itemCount = boxCount * 20
    
    // Positive impact on Stock (Receiving returns / Inbound)
    if (log.logType === 'RETURN_IN') {
        return itemCount
    }
    // Negative impact on Stock (Outbound / Disposal)
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
.search-btn {
  background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto;
}

/* Table Styles */
.table-container {
  background: white; border: 1px solid var(--border-color); border-radius: 12px; 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
}
table { width: 100%; border-collapse: collapse; text-align: center; }
th { background: #f8fafc; padding: 0.75rem 0.5rem; font-weight: 600; color: #64748b; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; text-align: center; }
td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: var(--text-dark); font-size: 0.85rem; vertical-align: middle; white-space: nowrap; text-align: center; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.code-cell { font-family: monospace; color: #475569; font-size: 0.75rem; letter-spacing: -0.02em; }
.name-cell { font-weight: 600; color: var(--text-dark); white-space: nowrap; min-width: 150px; }
.number-cell { font-variant-numeric: tabular-nums; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.return-in { background: #dcfce7; color: #166534; } /* Green */
.type-badge.return-out { background: #fee2e2; color: #991b1b; } /* Red */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

/* Unit Badge */
.unit-badge { background: #eff6ff; color: #3b82f6; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600; }
.unit-badge.return-out { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
.unit-badge.disposal { background: #f3e8ff; color: #6b21a8; border-color: #e9d5ff; }

.empty-cell { text-align: center; color: #94a3b8; padding: 2.5rem !important; }

/* Radio Toggle Styles */
.toggle-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 12px; }
.radio-group { display: flex; gap: 0.5rem; }
.radio-group label {
  padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: #64748b;
  transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
}
.radio-group label:hover { background: rgba(255,255,255,0.5); }
.radio-group label.active { background: white; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.radio-group input[type="radio"] { display: none; }

</style>
