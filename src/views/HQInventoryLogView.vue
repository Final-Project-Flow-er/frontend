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
        <label>상품 명</label>
        <input type="text" v-model="filter.productName" placeholder="상품명 입력" />
      </div>
      <div class="filter-group">
        <label>반품/발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="코드 입력" />
      </div>
      <div class="filter-group">
        <label>유형</label>
        <select v-model="filter.logType">
            <option value="">전체</option>
            <option value="RETURN_IN">반품 입고</option>
            <option value="RETURN_OUT">반품 출고</option>
        </select>
      </div>
    </div>

    <!-- Section 1: 반품 입고 내역 -->
    <div class="section-title">
      <h3>반품 입고 내역</h3>
      <span class="unit-badge">단위: 박스</span>
    </div>
    <div class="table-container mb-2">
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>반품 코드</th>
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
          <tr v-for="log in inboundLogs" :key="log.logId">
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
          <tr v-if="inboundLogs.length === 0">
            <td colspan="10" class="empty-cell">조회된 반품 입고 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 2: 반품 출고 내역 -->
    <div class="section-title">
      <h3>반품 출고 내역</h3>
      <span class="unit-badge outbound">단위: 박스</span>
    </div>
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
            <th>보낸 곳</th>
            <th>받는 곳</th>
            <th>단가</th>
            <th>변경수량 (개)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in outboundLogs" :key="log.logId">
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
          <tr v-if="outboundLogs.length === 0">
            <td colspan="10" class="empty-cell">조회된 반품 출고 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
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

// Mock Data for HQ Log (Focus on Returns)
const logs = ref([
  {
    logId: 1,
    product: { productId: 1 },
    boxCode: 'SEO00120260210OR010100100', // Ends in 00
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
    boxCode: 'SEO00120260210RO020100100', // Ends in 00
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
    boxCode: 'SEO00120260210OR010100100', // Ends in 00
    orderCode: 'SE01202602110001', 
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    logType: 'RETURN_OUT', // 반품 출고
    supplyPrice: 10000,
    locationType: 'HQ',
    locationId: 100,
    quantity: 5,
    arrivalTime: '2026-02-11T09:00:00',
    targetStore: '서울 강남점'
  }
])

const inboundLogs = computed(() => {
  return logs.value.filter(log => {
      if (log.logType !== 'RETURN_IN') return false
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchCode = !filter.value.orderCode || log.orderCode.includes(filter.value.orderCode)
      return matchName && matchCode
  })
})

const outboundLogs = computed(() => {
  return logs.value.filter(log => {
      if (log.logType !== 'RETURN_OUT') return false
      const matchName = !filter.value.productName || log.name.includes(filter.value.productName)
      const matchCode = !filter.value.orderCode || log.orderCode.includes(filter.value.orderCode)
      return matchName && matchCode
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
        case 'RETURN_IN': return '반품 입고'
        case 'RETURN_OUT': return '반품 출고'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'RETURN_IN': return 'return-in'
    case 'RETURN_OUT': return 'return-out'
    default: return ''
  }
}

const getSource = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return log.sourceStore || '가맹점'
        case 'RETURN_OUT': return '본사'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return '본사'
        case 'RETURN_OUT': return log.targetStore || '가맹점'
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
    // Negative impact on Stock (Outbound to Factory)
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
table { width: 100%; border-collapse: collapse; text-align: left; }
th { background: #f8fafc; padding: 0.75rem 0.5rem; font-weight: 600; color: #64748b; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #f1f5f9; color: var(--text-dark); font-size: 0.85rem; vertical-align: middle; white-space: nowrap; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.code-cell { font-family: monospace; color: #475569; font-size: 0.75rem; letter-spacing: -0.02em; }
.name-cell { font-weight: 600; color: var(--text-dark); white-space: normal; min-width: 150px; }
.number-cell { font-variant-numeric: tabular-nums; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.return-in { background: #dcfce7; color: #166534; } /* Green */
.type-badge.return-out { background: #fee2e2; color: #991b1b; } /* Red */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

/* Section Title Styles */
.section-title { margin-top: 2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; }
.section-title h3 { margin: 0; font-size: 1.2rem; color: var(--text-dark); }
.unit-badge { background: #eff6ff; color: #3b82f6; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600; }
.unit-badge.outbound { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
.mb-2 { margin-bottom: 2rem; }
.empty-cell { text-align: center; color: #94a3b8; padding: 2.5rem !important; }

</style>
