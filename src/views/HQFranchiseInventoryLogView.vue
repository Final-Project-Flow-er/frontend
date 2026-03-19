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
            <label>{{ isDisposalView ? '박스 코드' : '코드 검색' }}</label>
            <input type="text" v-model="filter.orderCode" :placeholder="isDisposalView ? '박스 코드 입력' : '코드 입력'" />
        </div>
        <button type="button" class="btn-reset-filters" @click="resetFilters" title="필터 초기화">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
          초기화
        </button>
        <div class="filter-hint-row">기본 조회는 최근 6개월 데이터입니다. 이전 데이터는 조회 기간을 설정해 확인하세요.</div>
      </div>
 
        <!-- Toggle Selector -->
        <div class="toggle-container">
          <div class="radio-group">
            <label :class="{ active: activeLogType === 'LOGISTICS' }">
              <input type="radio" v-model="activeLogType" value="LOGISTICS" />
              입출고 로그
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
                    <th v-if="activeLogType !== 'OUTBOUND'">보낸 곳</th>
                    <th v-if="activeLogType !== 'INBOUND' && activeLogType !== 'RETURN_IN'">받는 곳</th>
                    <th>변경수량 (개)</th>
                </tr>
                </thead>
                <tbody>
                <template v-for="log in filteredLogs" :key="log.id">
                  <tr class="clickable-row" @click="toggleRow(log.id)">
                      <td>{{ formatDate(log.arrivalTime) }}</td>
                      <td v-if="!isDisposalView" :class="['code-cell', getCodeTypeClass()]">{{ log.orderCode }}</td>
                      <td class="name-cell">{{ log.name }}</td>
                      <td>
                        <span :class="['type-badge', getTypeClass(log.logType)]">{{ getLogTypeLabel(log.logType) }}</span>
                      </td>
                      <td class="number-cell">{{ Math.abs(getChangeQuantity(log) / 20) }} 박스</td>
                      <td v-if="!isDisposalView && activeLogType !== 'OUTBOUND'">{{ getSource(log) }}</td>
                      <td v-if="!isDisposalView && activeLogType !== 'INBOUND' && activeLogType !== 'RETURN_IN'">{{ getDestination(log) }}</td>
                      <td class="number-cell" :class="getChangeClass(getChangeQuantity(log))">
                        {{ getChangeQuantity(log) > 0 ? '+' : '' }}{{ getChangeQuantity(log) }}
                      </td>
                  </tr>
                  <tr v-if="isExpanded(log.id)" class="expanded-row">
                    <td :colspan="isDisposalView ? 5 : (activeLogType === 'OUTBOUND' ? 7 : (activeLogType === 'INBOUND' || activeLogType === 'RETURN_IN' ? 7 : 8))">
                      <div class="expanded-content">
                        <div v-if="loadingBoxCodes[log.id]" class="loading-text">박스 코드 불러오는 중...</div>
                        <div v-else-if="boxCodesMap[log.id] && boxCodesMap[log.id].length > 0" class="boxcode-panel">
                          <div class="boxcode-title">박스 코드</div>
                          <div class="boxcode-list">
                            <span class="boxcode-pill" v-for="(box, index) in boxCodesMap[log.id]" :key="index">
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
                    <td colspan="10" class="empty-cell">조회된 내역이 없습니다.</td>
                </tr>
                </tbody>
            </table>
          </div>
        </div>
    </div>
    
    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
        <button class="page-nav-btn" :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-numbers">
            <button
                class="page-group-btn"
                :disabled="!canGoPrevPageGroup"
                @click="goPrevPageGroup"
                aria-label="이전 페이지 그룹"
            >
                ‹
            </button>
            <button 
                v-for="p in visiblePageNumbers" 
                :key="p" 
                @click="changePage(p - 1)" 
                :class="{ active: currentPage === p - 1 }"
                class="page-num-btn"
            >
                {{ p }}
            </button>
            <button
                class="page-group-btn"
                :disabled="!canGoNextPageGroup"
                @click="goNextPageGroup"
                aria-label="다음 페이지 그룹"
            >
                ›
            </button>
        </div>
        <button class="page-nav-btn" :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
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

// Pagination state
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = ref(20)
const PAGE_GROUP_SIZE = 10
let filterDebounceTimer = null

const filter = ref({
    startDate: '',
    endDate: '',
    productName: '',
    orderCode: '',
    logType: ''
})

const resetFilters = () => {
    filter.value = {
        startDate: '',
        endDate: '',
        productName: '',
        orderCode: '',
        logType: ''
    }
    currentPage.value = 0
}
const activeLogType = ref('LOGISTICS') 

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

const fetchLogs = async () => {
    if (!selectedStore.value) return
    loading.value = true
    try {
        const franchiseId = selectedStore.value.id || selectedStore.value.franchiseId || 1 
        const endpoint = `/hq/log/franchise-inventory/${franchiseId}`

        const params = {
           page: currentPage.value,
           size: pageSize.value,
           pageSize: pageSize.value
        }

        if (filter.value.startDate) params.startDate = filter.value.startDate
        if (filter.value.endDate) params.endDate = filter.value.endDate
        if (filter.value.productName) params.productName = filter.value.productName
        if (filter.value.orderCode) params.transactionCode = filter.value.orderCode
        
        // Map frontend type to backend enum
        if (activeLogType.value === 'LOGISTICS') {
            // Backend defaults to INBOUND/OUTBOUND when logType is omitted
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
            logs.value = list.map((item, index) => ({
                id: item.id || `log-${index}`, 
                arrivalTime: item.date || '',
                orderCode: item.transactionCode || '-',
                name: item.productName || '',
                logType: item.logType || '',
                supplyPrice: item.supplyPrice || 0,
                fromLocationId: item.fromLocationId,
                toLocationId: item.toLocationId,
                changedQuantity: item.changedQuantity || 0,
                boxCode: item.boxCode || '', 
                serialNumber: item.transactionCode || '-'
            }))
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
 
watch(activeLogType, () => {
    expandedRows.value = []
    boxCodesMap.value = {}
    currentPage.value = 0
    fetchLogs()
})
 
watch(selectedStore, () => {
    currentPage.value = 0
    // fetchLogs is called by selectStore usually
})

watch(filter, () => {
    if (!selectedStore.value) return
    currentPage.value = 0
    if (filterDebounceTimer) clearTimeout(filterDebounceTimer)
    filterDebounceTimer = setTimeout(() => {
        fetchLogs()
    }, 120)
}, { deep: true })

const changePage = (page) => {
    if (page < 0 || page >= totalPages.value) return
    currentPage.value = page
    fetchLogs()
}

const pageGroupStart = computed(() => {
  return Math.floor(currentPage.value / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE
})

const visiblePageNumbers = computed(() => {
  const start = pageGroupStart.value + 1
  const end = Math.min(start + PAGE_GROUP_SIZE - 1, totalPages.value)
  const pages = []
  for (let p = start; p <= end; p += 1) {
    pages.push(p)
  }
  return pages
})

const canGoPrevPageGroup = computed(() => pageGroupStart.value > 0)
const canGoNextPageGroup = computed(() => pageGroupStart.value + PAGE_GROUP_SIZE < totalPages.value)

const goPrevPageGroup = () => {
  if (!canGoPrevPageGroup.value) return
  changePage(pageGroupStart.value - PAGE_GROUP_SIZE)
}

const goNextPageGroup = () => {
  if (!canGoNextPageGroup.value) return
  changePage(pageGroupStart.value + PAGE_GROUP_SIZE)
}
 
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
    const log = logs.value.find(l => l.id === id)
    if (log && log.orderCode && log.orderCode !== '-') {
        if (!boxCodesMap.value[id]) {
            loadingBoxCodes.value[id] = true
            try {
                const params = { transactionCode: log.orderCode }
                const date = toApiDate(log.arrivalTime)
                if (date) params.date = date
                if (log.name) params.productName = log.name
                if (log.logType) params.logType = log.logType
                const res = await api.get('/hq/log/boxes', { params })
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
        case 'SALE': return '판매'
        case 'RETURN_IN':
        case 'RETURN_INBOUND': return '반품 입고'
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND': return '반품 출고'
        case 'REFUND': return '환불'
        case 'DISPOSAL': return '폐기'
        default: return type
    }
}
 
const getTypeClass = (type) => {
  switch (type) {
    case 'INBOUND': return 'inbound'
    case 'OUTBOUND': return 'outbound'
    case 'SALE': return 'sale'
    case 'RETURN_IN':
    case 'RETURN_INBOUND': return 'return-in'
    case 'RETURN_OUT':
    case 'RETURN_OUTBOUND': return 'return-out'
    case 'REFUND': return 'refund'
    case 'DISPOSAL': return 'refund'
    default: return ''
  }
}
 
// Logic assumes we are viewing 'From the perspective of the STORE'
const getSource = (log) => {
    switch (log.logType) {
        case 'INBOUND': return '본사'
        case 'RETURN_IN':
        case 'RETURN_INBOUND': return '본사'
        case 'REFUND': return '고객'
        
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'OUTBOUND':
        case 'SALE': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'DISPOSAL': return selectedStore.value ? selectedStore.value.name : '가맹점'
        default: return '-'
    }
}
 
const getDestination = (log) => {
    switch (log.logType) {
        case 'INBOUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'RETURN_IN':
        case 'RETURN_INBOUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        case 'REFUND': return selectedStore.value ? selectedStore.value.name : '가맹점'
        
        case 'RETURN_OUT':
        case 'RETURN_OUTBOUND': return '본사'
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
.filter-hint-row { flex-basis: 100%; margin-top: -0.25rem; font-size: 0.78rem; color: #6b7280; }
.search-btn {
  background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto;
}
.filter-section .btn-reset-filters { margin-left: auto; }

/* Table Styles */
.table-container {
  background: white; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
table { width: 100%; border-collapse: collapse; text-align: center; }
th { background: #f8fafc; padding: 1.05rem 0.8rem !important; height: 58px !important; font-weight: 600; color: #64748b; font-size: 0.9rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; border-bottom: 1px solid var(--border-color); white-space: nowrap; text-align: center; }
td { padding: 1.05rem 0.8rem !important; height: 58px !important; border-bottom: 1px solid #f1f5f9; color: var(--text-dark); font-size: 0.95rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; line-height: 1.35 !important; vertical-align: middle; text-align: center; }
tr:last-child td { border-bottom: none; }
tr:hover { background: #f8fafc; }

.code-cell { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; color: #475569; font-size: 0.95rem !important; }
.name-cell { font-weight: 600; color: var(--text-dark); }
.number-cell { font-variant-numeric: tabular-nums; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9 !important; }
.expanded-row td { background-color: #f8fafc; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
.expanded-content { display: flex; flex-direction: column; gap: 0.5rem; color: #475569; font-size: 0.9rem; justify-content: flex-start; text-align: left; }
.loading-text { font-style: italic; color: #64748b; font-size: 0.82rem; }
.empty-code-text { color: #94a3b8; font-size: 0.82rem; }
.boxcode-panel { background: #f7f7f5; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.6rem 0.7rem; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05); }
.boxcode-title { font-size: 0.74rem; color: #52525b; font-weight: 700; margin-bottom: 0.45rem; }
.boxcode-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.boxcode-pill { font-family: monospace; font-size: 0.78rem; color: #3f3f46; background: #ffffff; border: 1px solid #d4d4d8; border-radius: 999px; padding: 0.2rem 0.5rem; }

/* Badges */
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
.type-badge.inbound { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; } /* Deep Sky Blue */
.type-badge.outbound { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; } /* Vivid Red */
.type-badge.return-in { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; } /* Emerald Green */
.type-badge.return-out { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; } /* Bright Orange */
.type-badge.sale { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; } /* Gray */
.type-badge.refund { background: #f3e8ff; color: #9333ea; border: 1px solid #e9d5ff; } /* Rich Purple */

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

/* Pagination Styles */
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
.page-group-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  color: var(--text-dark);
  transition: all 0.2s;
}
.page-group-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

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
