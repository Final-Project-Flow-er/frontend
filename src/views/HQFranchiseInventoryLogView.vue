<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 입출고 관리 (가맹점 로그)</h2>
      <div class="header-actions">
        <button class="action-btn" @click="openStoreSelectModal">
           {{ selectedStore ? selectedStore.name : '가맹점 선택' }} 🔽
        </button>
      </div>
    </div>

    <!-- If no store selected, show prompt -->
    <div v-if="!selectedStore" class="empty-state">
      <div class="empty-message">가맹점을 선택하여 입출고 내역을 조회하세요.</div>
      <button class="action-btn primary" @click="openStoreSelectModal">가맹점 찾기</button>
    </div>

    <div v-else class="store-log-content">
      <!-- Store Info Banner -->
      <div class="store-info-banner">
        <h3>{{ selectedStore.name }}</h3>
        <p>현재 선택된 가맹점의 입출고 내역을 조회 중입니다.</p>
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
        <button class="search-btn" @click="search">검색</button>
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
                    <th>변경수량 (개)</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="log in filteredLogs" :key="log.id">
                    <td>{{ formatDate(log.arrivalTime) }}</td>
                    <td class="code-cell">{{ log.serialNumber || log.orderCode || '-' }}</td>
                    <td class="code-cell">{{ log.boxCode }}</td>
                    <td class="name-cell">{{ log.name }}</td>
                    <td>
                    <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                    </td>
                    <td class="number-cell">{{ Math.abs(getChangeQuantity(log)) }} 개</td>
                    <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                    {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                    </td>
                </tr>
                <tr v-if="filteredLogs.length === 0">
                    <td colspan="7" class="empty-cell">조회된 판매/환불 내역이 없습니다.</td>
                </tr>
                </tbody>
            </table>
          </div>
        </div>
    </div>


    <!-- Store Selector Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>가맹점 선택</h3>
        <div class="modal-body">
            <ul class="store-list scrollable">
                <li v-for="store in stores" :key="store.id" @click="selectStore(store)">
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
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/api/index'

const showModal = ref(true) // Open on load
const selectedStore = ref(null)

const openStoreSelectModal = () => {
    showModal.value = true
}

const expandedRows = ref([])
const boxCodesMap = ref({})
const loadingBoxCodes = ref({})
const logs = ref([])
const loading = ref(false)

const filter = ref({
    startDate: '',
    endDate: '',
    productName: '',
    orderCode: '',
    logType: ''
})
const activeLogType = ref('LOGISTICS') // 'LOGISTICS' or 'SALES'

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
      // Filter by Log Type Group
      const isSalesType = ['SALE', 'REFUND'].includes(log.logType)
      if (activeLogType.value === 'LOGISTICS' && isSalesType) return false
      if (activeLogType.value === 'SALES' && !isSalesType) return false

      const arrivalDate = log.arrivalTime ? log.arrivalTime.split('T')[0] : ''
      const matchStart = !filter.value.startDate || arrivalDate >= filter.value.startDate
      const matchEnd = !filter.value.endDate || arrivalDate <= filter.value.endDate
      const matchName = !filter.value.productName || (log.name && log.name.includes(filter.value.productName))
      const matchCode = !filter.value.orderCode || (log.orderCode && log.orderCode.includes(filter.value.orderCode))
      const matchType = !filter.value.logType || log.logType === filter.value.logType
      
      return matchStart && matchEnd && matchName && matchCode && matchType
  })
})
const fetchLogs = async () => {
    if (!selectedStore.value) return
    loading.value = true
    try {
        const franchiseId = selectedStore.value.id || selectedStore.value.franchiseId || 1 // fallback if id is missing in mock list
        let endpoint = ''
        if (activeLogType.value === 'LOGISTICS') endpoint = `/hq/log/franchise-inventory/${franchiseId}`
        else endpoint = `/hq/log/franchise-sales/${franchiseId}`

        const params = {
           size: 100 // default size
        }

        if (filter.value.startDate) params.startDate = filter.value.startDate
        if (filter.value.endDate) params.endDate = filter.value.endDate
        if (filter.value.productName) params.productName = filter.value.productName
        if (filter.value.orderCode) params.transactionCode = filter.value.orderCode

        const response = await api.get(endpoint, { params })
        if (response.data && response.data.success) {
            const list = response.data.data.franchiseInventoryLogResponseList || []
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
                boxCode: item.boxCode || '', // fallback
                serialNumber: item.transactionCode || '-'
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

const search = () => {
    fetchLogs()
}

const toggleRow = async (id) => {
  if (activeLogType.value === 'SALES') return // Only Logistics logs have box codes to expand
  
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

const stores = ref([])
onMounted(async () => {
    try {
        const res = await api.get('/hq/inventory/franchises')
        const data = res.data.data || {}
        stores.value = Object.entries(data).map(([id, name]) => ({
            id: Number(id),
            name: name,
            code: `가맹점${id}`
        }))
    } catch(e) {
        console.error('가맹점 목록 조회 실패', e)
        stores.value = []
    }
})

const selectStore = (store) => {
    selectedStore.value = store
    showModal.value = false
    fetchLogs()
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
    case 'OUTBOUND': return 'outbound'
    case 'SALE': return 'sale'
    case 'RETURN_IN': return 'return-in'
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
        
        case 'RETURN_OUT': return '본사'
        case 'SALE': return '고객'
        default: return '-'
    }
}

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
.action-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.store-info-banner { background: #eff6ff; padding: 1rem; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 1.5rem; }
.store-info-banner h3 { margin: 0 0 0.5rem 0; color: #1e3a8a; }
.store-info-banner p { margin: 0; color: #3b82f6; }

.empty-state { text-align: center; margin-top: 100px; color: #64748b; }
.empty-message { margin-bottom: 1rem; font-size: 1.2rem; }
.action-btn.primary { background: var(--primary); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; }

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

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9 !important; }
.expanded-row td { background-color: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
.expanded-content { display: flex; flex-direction: column; gap: 0.5rem; color: #475569; font-size: 0.9rem; justify-content: flex-start; text-align: left; }
.loading-text { font-style: italic; color: #64748b; }
.empty-code-text { color: #94a3b8; }

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
