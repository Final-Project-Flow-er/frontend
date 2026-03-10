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
      <button class="search-btn" @click="search">검색</button>
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
          <tr v-if="activeLogType === 'RETURN_IN'">
            <th>날짜</th>
            <th>반품 코드</th>
            <th>제품 명</th>
            <th>유형</th>
            <th>수량 (박스)</th>
            <th>보낸 곳</th>
            <th>변경수량 (개)</th>
          </tr>
          <tr v-else-if="activeLogType === 'RETURN_OUT'">
            <th>날짜</th>
            <th>발주 코드</th>
            <th>제품 명</th>
            <th>유형</th>
            <th>수량 (박스)</th>
            <th>받는 곳</th>
            <th>변경수량 (개)</th>
          </tr>
          <tr v-else>
            <th>날짜</th>
            <th>제품 명</th>
            <th>유형</th>
            <th>수량 (박스)</th>
            <th>변경수량 (개)</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="log in filteredLogs" :key="log.id">
            <tr class="clickable-row" @click="toggleRow(log.id)">
              <td>{{ formatDate(log.arrivalTime) }}</td>
              <td class="code-cell" v-if="activeLogType !== 'DISPOSAL'">{{ log.orderCode }}</td>
              <td class="name-cell">{{ log.name }}</td>
              <td>
                <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
              </td>
              <td class="number-cell">{{ Math.abs(getChangeQuantity(log) / 20) }} 박스</td>
              <td v-if="activeLogType !== 'RETURN_OUT' && activeLogType !== 'DISPOSAL'">{{ getSource(log) }}</td>
              <td v-if="activeLogType !== 'RETURN_IN' && activeLogType !== 'DISPOSAL'">{{ getDestination(log) }}</td>
              <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
              </td>
            </tr>
            <tr v-if="isExpanded(log.id)" class="expanded-row">
              <td :colspan="activeLogType === 'DISPOSAL' ? 5 : (activeLogType === 'RETURN_IN' || activeLogType === 'RETURN_OUT' ? 7 : 8)">
                <div class="expanded-content">
                  <div v-if="loadingBoxCodes[log.id]" class="loading-text">박스 코드 불러오는 중...</div>
                  <div v-else-if="boxCodesMap[log.id] && boxCodesMap[log.id].length > 0">
                    <strong>박스 코드:</strong> 
                    <span class="code-cell" v-for="(box, index) in boxCodesMap[log.id]" :key="index">
                      {{ box.boxCode }}<span v-if="index < boxCodesMap[log.id].length - 1">, </span>
                    </span>
                  </div>
                  <div v-else class="empty-code-text">조회된 박스 코드가 없습니다.</div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="10" class="empty-cell">조회된 {{ getLogTypeLabel(activeLogType) }} 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/api/index'

const activeLogType = ref('RETURN_IN')

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: ''
})

const logs = ref([])
const loading = ref(false)
const expandedRows = ref([])
const boxCodesMap = ref({})
const loadingBoxCodes = ref({})

const fetchLogs = async () => {
    loading.value = true
    try {
        let endpoint = ''
        if (activeLogType.value === 'RETURN_IN') endpoint = '/hq/log/return-inbound'
        else if (activeLogType.value === 'RETURN_OUT') endpoint = '/hq/log/return-outbound'
        else if (activeLogType.value === 'DISPOSAL') endpoint = '/hq/log/disposal'

        const params = {
           size: 100 // default size
        }

        if (filter.value.startDate) params.startDate = filter.value.startDate
        if (filter.value.endDate) params.endDate = filter.value.endDate
        if (filter.value.productName) params.productName = filter.value.productName
        if (filter.value.orderCode) params.transactionCode = filter.value.orderCode

        const response = await api.get(endpoint, { params })
        if (response.data && response.data.success) {
            logs.value = response.data.data.inventoryLogResponses.map((item, index) => ({
                id: item.id || `log-${index}`, // use temporary id if missing
                arrivalTime: item.date,
                orderCode: item.transactionCode || '-',
                name: item.productName,
                logType: item.logType,
                supplyPrice: item.supplyPrice,
                fromLocationId: item.fromLocationId,
                toLocationId: item.toLocationId,
                changedQuantity: item.changedQuantity,
                boxCode: item.boxCode // fallback
            }))
        } else {
            logs.value = []
        }
    } catch (error) {
        console.error("Failed to fetch logs:", error)
        logs.value = []
    } finally {
        loading.value = false
    }
}

watch(activeLogType, () => {
    expandedRows.value = []
    boxCodesMap.value = {}
    fetchLogs()
})

onMounted(() => {
    fetchLogs()
})

const search = () => {
    fetchLogs()
}

const toggleRow = async (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index === -1) {
    expandedRows.value.push(id)
    const log = logs.value.find(l => l.id === id)
    if (log && log.orderCode && log.orderCode !== '-') {
        // Fetch box codes
        if (!boxCodesMap.value[id]) {
            loadingBoxCodes.value[id] = true
            try {
                const res = await api.get('/hq/log/boxes', { params: { transactionCode: log.orderCode } })
                if (res.data && res.data.success) {
                    boxCodesMap.value[id] = res.data.data
                } else {
                    boxCodesMap.value[id] = []
                }
            } catch (err) {
                console.error("Failed to fetch box codes", err)
                boxCodesMap.value[id] = []
            } finally {
                loadingBoxCodes.value[id] = false
            }
        }
    }
  } else {
    expandedRows.value.splice(index, 1)
  }
}

const isExpanded = (id) => expandedRows.value.includes(id)

const filteredLogs = computed(() => {
  return logs.value
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
        case 'RETURN_IN': 
        case 'RETURN_INBOUND': return '반품 입고'
        case 'RETURN_OUT': 
        case 'RETURN_OUTBOUND': return '반품 출고'
        case 'DISPOSAL': return '폐기'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'RETURN_IN':
    case 'RETURN_INBOUND': return 'return-in'
    case 'RETURN_OUT':
    case 'RETURN_OUTBOUND': return 'return-out'
    case 'DISPOSAL': return 'refund' // Purple
    default: return ''
  }
}

// API maps from/to locationId, UI mapping might need franchise store lookups
const getSource = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return (log.fromLocationId ? `가맹점 (${log.fromLocationId})` : '가맹점')
        case 'RETURN_OUT': return '본사'
        case 'DISPOSAL': return '본사'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'RETURN_IN': return '본사'
        case 'RETURN_OUT': return (log.toLocationId ? `가맹점 (${log.toLocationId})` : '가맹점')
        case 'DISPOSAL': return '폐기장'
        default: return '-'
    }
}

// 1 Box = 20 Items
const getChangeQuantity = (log) => {
    if (log.changedQuantity != null) return log.changedQuantity;
    return 0;
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

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9 !important; }
.expanded-row td { background-color: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); text-align: left; }
.expanded-content { display: flex; flex-direction: column; gap: 0.5rem; color: #475569; font-size: 0.9rem; justify-content: flex-start; }
.loading-text { font-style: italic; color: #64748b; }
.empty-code-text { color: #94a3b8; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.return-in { background: #dcfce7; color: #166534; } /* Green */
.type-badge.return-out { background: #ffedd5; color: #9a3412; } /* Orange */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

/* Unit Badge */
.unit-badge { background: #eff6ff; color: #3b82f6; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 4px; border: 1px solid #bfdbfe; font-weight: 600; }
.unit-badge.return-out { background: #fff7ed; color: #ea580c; border-color: #ffedd5; }
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
