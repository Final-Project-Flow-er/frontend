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
        <label>{{ isDisposalView ? '박스 코드' : '발주/판매 코드' }}</label>
        <input type="text" v-model="filter.orderCode" :placeholder="isDisposalView ? '박스 코드 입력' : '코드 입력'" />
      </div>
      <div class="filter-group">
        <label>유형</label>
        <select v-model="filter.logType">
          <option value="">전체</option>
          <template v-if="activeLogType === 'LOGISTICS'">
            <option value="INBOUND">입고</option>
            <option value="OUTBOUND">출고</option>
          </template>
          <template v-else-if="activeLogType === 'RETURN_IN'">
            <option value="RETURN_INBOUND">반품 입고</option>
          </template>
          <template v-else-if="activeLogType === 'RETURN_OUT'">
            <option value="RETURN_OUTBOUND">반품 출고</option>
          </template>
          <template v-else-if="activeLogType === 'DISPOSAL'">
            <option value="DISPOSAL">폐기</option>
          </template>
        </select>
      </div>
      <div class="filter-hint-row">기본 조회는 최근 6개월 데이터입니다. 이전 데이터는 조회 기간을 설정해 확인하세요.</div>
    </div>

    <!-- Toggle Selector -->
    <div class="toggle-container">
      <div class="radio-group">
        <label :class="{ active: activeLogType === 'LOGISTICS' }">
          <input type="radio" v-model="activeLogType" value="LOGISTICS" />
          입출고 로그
        </label>
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

    <!-- Consolidated Table Area -->
    <div class="table-outer-container">
      <div class="table-container">
        <table>
          <thead>
            <tr v-if="isDisposalView">
              <th>일시</th>
              <th>제품 명</th>
              <th>유형</th>
              <th>수량 (박스)</th>
              <th>변경수량 (개)</th>
            </tr>
            <tr v-else>
              <th>일시</th>
              <th>{{ getCodeLabel() }}</th>
              <th>제품 명</th>
              <th>유형</th>
              <th>수량 (박스)</th>
              <th v-if="activeLogType !== 'RETURN_OUT'">보낸 곳</th>
              <th v-if="activeLogType !== 'LOGISTICS' || activeLogType === 'LOGISTICS'">받는 곳</th>
              <th>변경수량 (개)</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="log in filteredLogs" :key="log.logId">
              <tr class="clickable-row" @click="toggleRow(log.logId)">
                <td>{{ formatDate(log.arrivalTime) }}</td>
                <td v-if="!isDisposalView" :class="['code-cell', getCodeTypeClass()]">{{ log.orderCode }}</td>
                <td class="name-cell">{{ log.name }}</td>
                <td>
                  <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                </td>
                <td class="number-cell">{{ log.quantity }} 박스</td>
                <td v-if="!isDisposalView">{{ getSource(log) }}</td>
                <td v-if="!isDisposalView">{{ getDestination(log) }}</td>
                <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                  {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                </td>
              </tr>
              <tr v-if="isExpanded(log.logId)" class="expanded-row">
                <td :colspan="isDisposalView ? 5 : 8">
                  <div class="expanded-content">
                    <div v-if="loadingBoxCodes[log.logId]" class="loading-text">박스 코드 불러오는 중...</div>
                    <div v-else-if="boxCodesMap[log.logId] && boxCodesMap[log.logId].length > 0" class="boxcode-panel">
                      <div class="boxcode-title">박스 코드</div>
                      <div class="boxcode-list">
                        <span class="boxcode-pill" v-for="(box, index) in boxCodesMap[log.logId]" :key="index">
                          {{ box.boxCode }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="empty-code-text">조회된 박스 코드가 없습니다.</div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="filteredLogs.length === 0">
              <td :colspan="isDisposalView ? 5 : 8" class="empty-cell">조회된 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-nav-btn" :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-numbers">
          <button 
            v-for="p in totalPages" 
            :key="p" 
            @click="changePage(p - 1)" 
            :class="{ active: currentPage === p - 1 }"
            class="page-num-btn"
          >
            {{ p }}
          </button>
        </div>
        <button class="page-nav-btn" :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api'
import { ref, computed, onMounted, watch } from 'vue'

const activeLogType = ref('LOGISTICS')

const filter = ref({
  startDate: '',
  endDate: '',
  productName: '',
  orderCode: '',
  logType: ''
})

const logs = ref([])
const loading = ref(false)

// Pagination state
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = ref(20)
let filterDebounceTimer = null

const expandedRows = ref([])
const boxCodesMap = ref({})
const loadingBoxCodes = ref({})

const isExpanded = (id) => expandedRows.value.includes(id)

const toApiDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const toggleRow = async (id) => {
  const index = expandedRows.value.indexOf(id)
  if (index === -1) {
    expandedRows.value.push(id)
    const log = logs.value.find(l => l.logId === id)
    if (log && log.orderCode && log.orderCode !== '-') {
        if (!boxCodesMap.value[id]) {
            loadingBoxCodes.value[id] = true
            try {
                const params = { transactionCode: log.orderCode }
                const date = toApiDate(log.arrivalTime)
                if (date) params.date = date
                const res = await api.get('/hq/log/boxes', { params })
                if (res.data && res.data.success) {
                    boxCodesMap.value[id] = res.data.data || []
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

const fetchLogs = async () => {
    loading.value = true
    try {
        const endpoint = `/franchise/log/inventory`
            
        const params = {
           page: currentPage.value,
           size: pageSize.value
        }
        if (filter.value.startDate) params.startDate = filter.value.startDate
        if (filter.value.endDate) params.endDate = filter.value.endDate
        if (filter.value.productName) params.productName = filter.value.productName
        if (filter.value.orderCode) params.transactionCode = filter.value.orderCode
        
        // Map frontend type to backend enum
        if (activeLogType.value === 'LOGISTICS') {
            params.logType = null // Backend defaults to INBOUND/OUTBOUND
        } else if (activeLogType.value === 'RETURN_IN') {
            params.logType = 'RETURN_INBOUND'
        } else if (activeLogType.value === 'RETURN_OUT') {
            params.logType = 'RETURN_OUTBOUND'
        } else {
            params.logType = activeLogType.value
        }
        
        const response = await api.get(endpoint, { params })
        if (response.data && response.data.success) {
            const data = response.data.data
            const list = data.franchiseInventoryLogResponseList || []
            logs.value = list.map((item, index) => {
                return {
                    logId: item.id || `log-${index}`,
                    arrivalTime: item.date || '',
                    orderCode: item.transactionCode || '-',
                    boxCode: item.boxCode || '-',
                    name: item.productName || '',
                    logType: item.logType || '',
                    supplyPrice: item.supplyPrice || 0,
                    quantity: Math.abs((item.changedQuantity || 0) / 20),
                    changedQuantity: item.changedQuantity || 0,
                    serialNumber: item.transactionCode || '-',
                    fromLocationId: item.fromLocationId,
                    toLocationId: item.toLocationId
                }
            })
            totalPages.value = data.totalPages || 0
        } else {
            logs.value = []
            totalPages.value = 0
        }
    } catch (error) {
        console.error("Failed to fetch logs:", error)
        logs.value = []
    } finally {
        loading.value = false
    }
}

const changePage = (page) => {
    currentPage.value = page
    fetchLogs()
}

onMounted(() => {
    fetchLogs()
})

const filteredLogs = computed(() => {
    return logs.value.filter(log => {
        if (activeLogType.value === 'LOGISTICS') {
            return log.logType === 'INBOUND' || log.logType === 'OUTBOUND'
        }
        if (activeLogType.value === 'RETURN_IN') {
            return log.logType === 'RETURN_IN' || log.logType === 'RETURN_INBOUND'
        }
        if (activeLogType.value === 'RETURN_OUT') {
            return log.logType === 'RETURN_OUT' || log.logType === 'RETURN_OUTBOUND'
        }
        return log.logType === activeLogType.value
    })
})

const isDisposalView = computed(() => activeLogType.value === 'DISPOSAL')

watch(activeLogType, () => {
    expandedRows.value = []
    boxCodesMap.value = {}
    currentPage.value = 0
    fetchLogs()
})

watch(filter, () => {
    currentPage.value = 0
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
    filterDebounceTimer = setTimeout(() => {
        fetchLogs()
    }, 120)
}, { deep: true })

const getCodeLabel = () => {
    if (activeLogType.value === 'DISPOSAL') return '박스 코드'
    if (activeLogType.value === 'RETURN_IN') return '반품 코드'
    if (activeLogType.value === 'RETURN_OUT') return '발주 코드'
    return '발주 코드'
}

const getCodeTypeClass = () => {
    if (activeLogType.value === 'RETURN_IN') return 'code-return'
    return 'code-order'
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

const getLogTypeLabel = (type) => {
    switch (type) {
        case 'INBOUND': return '입고'
        case 'OUTBOUND': return '출고'
        case 'RETURN_IN':
        case 'RETURN_INBOUND': return '반품 입고'
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND': return '반품 출고'
        case 'SALE': return '판매'
        case 'REFUND': return '환불'
        case 'DISPOSAL': return '폐기'
        default: return type
    }
}

const getTypeClass = (type) => {
  switch (type) {
    case 'INBOUND': return 'inbound'
    case 'OUTBOUND': return 'outbound'
    case 'RETURN_IN':
    case 'RETURN_INBOUND': return 'return-in'
    case 'RETURN_OUT':
    case 'RETURN_OUTBOUND': return 'return-out'
    case 'SALE': return 'sale'
    case 'REFUND': return 'refund'
    case 'DISPOSAL': return 'refund'
    default: return ''
  }
}

const getSource = (log) => {
    switch (log.logType) {
        case 'INBOUND': return '본사'
        case 'RETURN_IN':
        case 'RETURN_INBOUND': return '본사'
        case 'REFUND': return '고객'
        case 'OUTBOUND':
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND':
        case 'SALE': return '가맹점'
        case 'DISPOSAL': return '가맹점'
        default: return '-'
    }
}

const getDestination = (log) => {
    switch (log.logType) {
        case 'INBOUND':
        case 'RETURN_IN':
        case 'RETURN_INBOUND':
        case 'REFUND': return '가맹점'
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND': return '본사'
        case 'OUTBOUND':
        case 'SALE': return '고객'
        case 'DISPOSAL': return '폐기장'
        default: return '-'
    }
}

const getChangeQuantity = (log) => {
    const qty = Math.abs(log.changedQuantity || 0);
    const positiveTypes = ['INBOUND', 'RETURN_IN', 'RETURN_INBOUND', 'REFUND', 'PRODUCTION'];
    const negativeTypes = ['OUTBOUND', 'SALE', 'RETURN_OUT', 'RETURN_OUTBOUND', 'DISPOSAL'];
    
    if (positiveTypes.includes(log.logType)) return qty;
    if (negativeTypes.includes(log.logType)) return -qty;
    return qty;
}

const getChangeClass = (qty) => {
    return qty > 0 ? 'plus' : 'minus'
}
</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

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
.filter-hint-row { flex-basis: 100%; margin-top: -0.25rem; font-size: 0.78rem; color: #6b7280; }
.search-btn {
  background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto;
}

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

.type-badge {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  min-width: 75px;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  letter-spacing: -0.01em;
}
.type-badge.inbound { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
.type-badge.outbound { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
.type-badge.return-in { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
.type-badge.return-out { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
.type-badge.sale { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.type-badge.refund { background: #f3e8ff; color: #9333ea; border: 1px solid #e9d5ff; }

.plus { color: #166534; font-weight: 700; }
.minus { color: #991b1b; font-weight: 700; }

.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }

.toggle-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 12px; }
.radio-group { display: flex; gap: 0.5rem; }
.radio-group label {
  padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: #64748b;
  transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem;
}
.radio-group label:hover { background: rgba(255,255,255,0.5); }
.radio-group label.active { background: white; color: var(--primary); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
.radio-group input[type="radio"] { display: none; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9; }

.expanded-row td { background-color: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
.expanded-content { display: flex; flex-direction: column; gap: 0.5rem; color: #475569; font-size: 0.9rem; justify-content: flex-start; text-align: left; }

.loading-text { color: #64748b; font-style: italic; font-size: 0.82rem; }
.empty-code-text { color: #94a3b8; font-size: 0.82rem; }
.boxcode-panel { background: #f7f7f5; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.6rem 0.7rem; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); }
.boxcode-title { font-size: 0.74rem; color: #52525b; font-weight: 700; margin-bottom: 0.45rem; }
.boxcode-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.boxcode-pill { font-family: monospace; font-size: 0.78rem; color: #3f3f46; background: #ffffff; border: 1px solid #d4d4d8; border-radius: 999px; padding: 0.2rem 0.5rem; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem 0;
}
.page-nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-dark);
  transition: all 0.2s;
}
.page-nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-numbers {
  display: flex;
  gap: 0.5rem;
}
.page-num-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-dark);
  transition: all 0.2s;
}
.page-num-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.page-num-btn.active {
  background: var(--text-dark);
  color: white;
  border-color: var(--text-dark);
}
</style>
