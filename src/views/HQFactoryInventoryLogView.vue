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
      <button class="search-btn" @click="search">검색</button>
    </div>

    <!-- Log List -->
    <div class="table-outer-container">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>발주 코드</th>
              <th>제품 명</th>
              <th>유형</th>
              <th>박스 수</th>
              <th>보낸 곳</th>
              <th>받는 곳</th>
              <th>변경수량 (개)</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="log in filteredLogs" :key="log.id">
              <tr class="clickable-row" @click="toggleRow(log.id)">
                <td>{{ formatDate(log.arrivalTime) }}</td>
                <td class="code-cell">{{ log.orderCode }}</td>
                <td class="name-cell">{{ log.name }}</td>
                <td>
                  <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                </td>
                <td class="number-cell">{{ Math.abs(getChangeQuantity(log) / 20) }} 박스</td>
                <td>{{ getSource(log) }}</td>
                <td>{{ getDestination(log) }}</td>
                <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                  {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                </td>
              </tr>
              <tr v-if="isExpanded(log.id)" class="expanded-row">
                <td colspan="8">
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
              <td colspan="8" class="empty-cell">조회된 공장 로그 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/index'

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: '',
  logType: ''
})

const expandedRows = ref([])
const boxCodesMap = ref({})
const loadingBoxCodes = ref({})
const logs = ref([])
const loading = ref(false)
const factoryId = ref(1) // Defaulting to factory 1

const fetchLogs = async () => {
    loading.value = true
    try {
        const endpoint = `/hq/log/factory/${factoryId.value}`

        const params = {
           size: 100 // default size
        }

        if (filter.value.startDate) params.startDate = filter.value.startDate
        if (filter.value.endDate) params.endDate = filter.value.endDate
        if (filter.value.productName) params.productName = filter.value.productName
        if (filter.value.orderCode) params.transactionCode = filter.value.orderCode
        if (filter.value.logType) params.logType = filter.value.logType

        const response = await api.get(endpoint, { params })
        if (response.data && response.data.success) {
            const list = response.data.data.factoryInventoryLogResponseList || []
            logs.value = list.map((item, index) => ({
                id: item.id || `log-${index}`, // use temporary id if missing
                arrivalTime: item.date || '',
                orderCode: item.transactionCode || '-',
                name: item.productName || '',
                logType: item.logType || '',
                supplyPrice: item.supplyPrice || 0,
                fromLocationId: item.fromLocationId,
                toLocationId: item.toLocationId,
                changedQuantity: item.changedQuantity || 0,
                boxCode: item.boxCode || '' // fallback
            }))
        } else {
            logs.value = []
        }
    } catch (error) {
        console.error("Failed to fetch factory logs:", error)
        logs.value = []
    } finally {
        loading.value = false
    }
}

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
        case 'RETURN_IN': return (log.fromLocationId ? `가맹점 (${log.fromLocationId})` : '가맹점')
        
        case 'DISTRIBUTION': return '공장'
        case 'DISPOSAL': return '공장'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'PRODUCTION': return '공장'
        case 'RETURN_IN': return '공장'
        
        case 'DISTRIBUTION': return (log.toLocationId ? `가맹점 (${log.toLocationId})` : '가맹점')
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
.search-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto; }

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

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9 !important; }
.expanded-row td { background-color: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); text-align: left; }
.expanded-content { display: flex; flex-direction: column; gap: 0.5rem; color: #475569; font-size: 0.9rem; justify-content: flex-start; }
.loading-text { font-style: italic; color: #64748b; }
.empty-code-text { color: #94a3b8; }

/* Badges */
.type-badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; min-width: 60px; text-align: center; }
.type-badge.inbound { background: #dbeafe; color: #1e40af; } /* Blue */
.type-badge.outbound { background: #fee2e2; color: #991b1b; } /* Red */
.type-badge.return-in { background: #dcfce7; color: #166534; } /* Green */
.type-badge.return-out { background: #ffedd5; color: #9a3412; } /* Orange */
.type-badge.refund { background: #f3e8ff; color: #6b21a8; } /* Purple */

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }



</style>
