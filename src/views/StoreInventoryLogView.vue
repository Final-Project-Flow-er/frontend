<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 입출고 관리(로그)</h2>
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
        <label>발주/판매 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="코드 입력" />
      </div>
      <div class="filter-group">
        <label>유형</label>
        <select v-model="filter.logType">
            <option value="">전체</option>
            <template v-if="activeLogType === 'LOGISTICS'">
                <option value="INBOUND">입고</option>
                <option value="RETURN_IN">반품 입고</option>
                <option value="RETURN_OUT">반품 출고</option>
            </template>
            <template v-else>
                <option value="SALE">판매</option>
                <option value="REFUND">환불</option>
            </template>
        </select>
      </div>
    </div>

    <!-- Toggle Selector -->
    <div class="toggle-container">
      <div class="radio-group">
        <label :class="{ active: activeLogType === 'LOGISTICS' }">
          <input type="radio" v-model="activeLogType" value="LOGISTICS" />
          물류 입출고 내역
        </label>
        <label :class="{ active: activeLogType === 'SALES' }">
          <input type="radio" v-model="activeLogType" value="SALES" />
          판매/환불 내역
        </label>
      </div>
      <span class="unit-badge" :class="{ sale: activeLogType === 'SALES' }">
        단위: {{ activeLogType === 'LOGISTICS' ? '박스' : '낱개' }}
      </span>
    </div>

    <!-- Consolidated Table Area -->
    <div class="table-outer-container">
      <div class="table-container">
        <!-- Section 1: Logistics Logs (Box Units) -->
        <table v-if="activeLogType === 'LOGISTICS'">
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
              <td colspan="8" class="empty-cell">조회된 물류 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>

        <!-- Section 2: Sales Logs (Item Units) -->
        <table v-else>
          <thead>
            <tr>
              <th>날짜</th>
              <th>판매 코드</th>
              <th>박스 코드</th>
              <th>제품 명</th>
              <th>유형</th>
              <th>수량 (개)</th>
              <th>판매가</th>
              <th>변경수량 (개)</th>
            </tr>
          </thead>
          <tbody>
                <tr v-for="log in filteredLogs" :key="log.logId">
                  <td>{{ formatDate(log.arrivalTime) }}</td>
                  <td class="code-cell">{{ log.serialNumber || log.orderCode || '-' }}</td>
                  <td class="code-cell">{{ log.boxCode }}</td>
                  <td class="name-cell">{{ log.name }}</td>
                  <td>
                    <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                  </td>
                  <td class="number-cell">{{ log.quantity }} 개</td>
                  <td class="number-cell">{{ formatPrice(log.supplyPrice) }}</td>
                  <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                    {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                  </td>
                </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" class="empty-cell">조회된 판매/환불 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeLogType = ref('LOGISTICS')

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: '',
  logType: ''
})

// Mock Data matching Entity Structure
// LocationId is Source.
// Mock Data matching Entity Structure
const logs = ref([
  {
    logId: 1,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    orderCode: 'SE0120260210001',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'INBOUND', // 입고
    supplyPrice: 10000,
    locationType: 'HQ', // Source is HQ
    locationId: 100, 
    quantity: 5, // Box count
    arrivalTime: '2026-02-10T10:30:00'
  },
  {
    logId: 2,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    serialNumber: '202602110001',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'SALE', // 판매
    supplyPrice: 10000,
    locationType: 'STORE', // Source is Store
    locationId: 200,
    quantity: 1,
    arrivalTime: '2026-02-11T14:20:00'
  },
  {
    logId: 3,
    product: { productId: 2 },
    boxCode: 'SE01-FA01-A1-RO0203-001',
    orderCode: 'RESE0120260211001',
    name: '로제 떡볶이 밀키트 기본맛 3,4인분',
    logType: 'RETURN_OUT', // 반품 출고
    supplyPrice: 22000,
    locationType: 'STORE', // Source is Store
    locationId: 200,
    quantity: 2,
    arrivalTime: '2026-02-11T09:00:00'
  },
  {
    logId: 4,
    product: { productId: 1 },
    boxCode: 'SE01-FA01-A1-OR0101-001',
    serialNumber: '202602110002', // Sale/Refund Code
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'REFUND', // 환불
    supplyPrice: 10000,
    locationType: 'CUSTOMER', // Source is Customer
    locationId: 0,
    quantity: 1,
    arrivalTime: '2026-02-11T11:00:00'
  }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
      // Filter by Log Type Group
      const isSalesType = ['SALE', 'REFUND'].includes(log.logType)
      if (activeLogType.value === 'LOGISTICS' && isSalesType) return false
      if (activeLogType.value === 'SALES' && !isSalesType) return false
      
      const arrivalDate = log.arrivalTime.split('T')[0]
      const matchStart = !filter.value.startDate || arrivalDate >= filter.value.startDate
      const matchEnd = !filter.value.endDate || arrivalDate <= filter.value.endDate
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchCode = !filter.value.orderCode || (log.orderCode && log.orderCode.includes(filter.value.orderCode))
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
        case 'INBOUND': return '입고'
        case 'RETURN_IN': return '반품 입고'
        case 'RETURN_OUT': return '반품 출고'
        case 'SALE': return '판매'
        case 'REFUND': return '환불'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'INBOUND': return 'inbound'
    case 'RETURN_IN': return 'return-in'
    case 'RETURN_OUT': return 'return-out'
    case 'SALE': return 'sale'
    case 'REFUND': return 'refund'
    default: return ''
  }
}

// Source Logic based on LogType and Context (Store View)
const getSource = (log) => {
    switch (log.logType) {
        case 'INBOUND': return '본사' // From HQ
        case 'RETURN_IN': return '송파점' // From Other Store (Mock)
        case 'REFUND': return '고객' // From Customer
        
        case 'RETURN_OUT': return '강남점' // From Me
        case 'SALE': return '강남점' // From Me
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'INBOUND': return '강남점' // To Me
        case 'RETURN_IN': return '강남점' // To Me
        case 'REFUND': return '강남점' // To Me
        
        case 'RETURN_OUT': return '본사' // Return to HQ
        case 'SALE': return '고객' // To Customer
        default: return '-'
    }
}

// 1 Box = 20 Items, but SALE/REFUND are already in Items (1 unit = 1 item)
const getChangeQuantity = (log) => {
    const qty = log.quantity
    
    // Individual item logic for Sales/Refund
    if (['SALE', 'REFUND'].includes(log.logType)) {
        return log.logType === 'SALE' ? -qty : qty
    }

    // Box logic for Inbound/Returns
    const itemCount = qty * 20
    if (['INBOUND', 'RETURN_IN'].includes(log.logType)) {
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
  background: white; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
.type-badge.return-out { background: #ffedd5; color: #9a3412; } /* Orange */
.type-badge.sale { background: #f1f5f9; color: #475569; } /* Gray */
.type-badge.refund { background: #f3e8ff; color: #6b21a8; } /* Purple */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }

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

/* Responsive Table Wrapper */
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
table { width: 100%; border-collapse: collapse; text-align: left; }


</style>
