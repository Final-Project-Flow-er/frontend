<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 가맹점 재고 관리</h2>
      <div class="header-actions">
        <!-- Store Selector Button -->
        <button class="action-btn" @click="openStoreSelectModal">
           {{ selectedStore ? selectedStore.name : '가맹점 선택' }} 🔽
        </button>
      </div>
    </div>

    <!-- If no store selected, show prompt -->
    <div v-if="!selectedStore" class="empty-state">
      <div class="empty-message">가맹점을 선택하여 재고를 조회하세요.</div>
      <button class="action-btn primary" @click="openStoreSelectModal">가맹점 찾기</button>
    </div>

    <!-- Inventory View (Only shown when store selected) -->
    <div v-else>
      <!-- Store Info Banner -->
      <div class="store-info-banner">
        <h3>{{ selectedStore.name }}</h3>
        <p>현재 선택된 가맹점의 재고 현황을 조회 중입니다.</p>
      </div>

      <!-- Step 1: Product Overview -->
      <template v-if="currentStep === 1">
        <!-- Filter Section -->
        <div class="filter-section">
          <div class="filter-group">
            <label>제품 코드</label>
            <input type="text" v-model="filter.productCode" placeholder="예: OR0101" />
          </div>
          <div class="filter-group">
            <label>제품 이름</label>
            <input type="text" v-model="filter.productName" placeholder="제품 이름 입력" />
          </div>
          <div class="filter-group">
            <label>상태</label>
            <select v-model="filter.status">
              <option value="">전체</option>
              <option value="SAFE">안전</option>
              <option value="WARNING">부족</option>
              <option value="DANGER">위험</option>
            </select>
          </div>
        </div>

        <!-- Safety Stock Alert Section (Collapsible) -->
        <div v-if="lowStockItems.length > 0" class="alert-section">
            <div class="alert-header">
                <div class="alert-title">⚠️ 안전재고 부족 알림</div>
                <button class="toggle-alert-btn" @click="isSafeStockExpanded = !isSafeStockExpanded">
                    {{ isSafeStockExpanded ? '접기 ▲' : '더보기 ▼' }}
                </button>
            </div>
            
            <!-- Summary Header when Collapsed -->
            <div v-if="!isSafeStockExpanded" class="alert-summary pl-2">
                <span>안전재고 부족 <strong>{{ lowStockItems.length }}건</strong></span>
            </div>

            <!-- Detailed List -->
            <template v-else>
                <div class="mt-3 pt-3 border-top-dashed">
                    <ul>
                        <li v-for="item in lowStockItems" :key="item.productCode">
                            <strong>{{ item.productName }}</strong> ({{item.productCode}}): 재고 <span class="danger-text">{{ item.quantity }}</span> (안전재고: {{item.safeStock}})
                        </li>
                    </ul>
                </div>
            </template>
        </div>

        <!-- Expiration Alert Section (Collapsible) -->
        <div v-if="expiringItems.length > 0" class="alert-section expiration">
            <div class="alert-header">
                <div class="alert-title">⏳ 유통기한 임박 알림</div>
                <button class="toggle-alert-btn" @click="isExpirationExpanded = !isExpirationExpanded">
                    {{ isExpirationExpanded ? '접기 ▲' : '더보기 ▼' }}
                </button>
            </div>
            
            <!-- Summary Header when Collapsed -->
            <div v-if="!isExpirationExpanded" class="alert-summary pl-2">
                <span>유통기한 임박 <strong>{{ expiringItems.length }}건</strong></span>
            </div>

            <!-- Detailed List -->
            <template v-else>
                <div class="mt-3 pt-3 border-top-dashed">
                    <ul>
                        <li v-for="group in expiringItems" :key="group.key">
                            <strong>{{ group.productName }}</strong> ({{ group.productionDate }} 제조) - <span class="danger-text">{{ group.count }}개</span>가 {{ group.daysLeft }}일 후 만료됩니다.
                        </li>
                    </ul>
                </div>
            </template>
        </div>

        <!-- Data Table -->
        <div class="data-table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>제품 코드</th>
                <th>제품 이름</th>
                <th>총 수량</th>
                <th>인분</th>
                <th>안전재고</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredProducts" :key="item.productCode" @click="goToStep2(item)" class="clickable-row">
                <td class="sku-cell">{{ item.productCode }}</td>
                <td class="name-cell">{{ item.productName }}</td>
                <td class="number-cell">{{ item.quantity }}</td>
                <td>{{ item.portion === 1 ? '1~2인분' : '3~4인분' }}</td>
                <td class="number-cell">{{ item.safeStock }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(item.quantity, item.safeStock)]">
                    {{ getStatusLabel(item.quantity, item.safeStock) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Step 2: FIFO Summary with Available/Return Pending -->
      <template v-else-if="currentStep === 2">
        <div class="step-header">
            <div class="selected-info">
                <h3>{{ selectedProduct.productName }} <span class="sub-info">({{ selectedProduct.productCode }})</span></h3>
            </div>
            <button class="back-btn" @click="currentStep = 1">목록으로</button>
        </div>

        <div class="data-table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>제조일</th>
                        <th>총 수량</th>
                        <th>가용 수량</th>
                        <th>반품 대기</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="batch in sortedBatches" :key="batch.productionDate" @click="goToStep3(batch)" class="clickable-row">
                        <td>{{ batch.productionDate }}</td>
                        <td class="number-cell">{{ batch.total }}</td>
                        <td class="number-cell available">{{ batch.available }}</td>
                        <td class="number-cell pending">{{ batch.pending }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Step 2 Pagination -->
            <div class="pagination" v-if="batchTotalPages > 1">
                <button class="page-nav-btn" :disabled="batchPage === 0" @click="changeBatchPage(batchPage - 1)">이전</button>
                <div class="page-numbers">
                    <button 
                        v-for="p in batchTotalPages" 
                        :key="p" 
                        @click="changeBatchPage(p - 1)" 
                        :class="{ active: batchPage === p - 1 }"
                        class="page-num-btn"
                    >
                        {{ p }}
                    </button>
                </div>
                <button class="page-nav-btn" :disabled="batchPage === batchTotalPages - 1" @click="changeBatchPage(batchPage + 1)">다음</button>
            </div>
        </div>
      </template>

      <!-- Step 3: Granular Item Details & Filters -->
      <template v-else-if="currentStep === 3">
        <div class="step-header">
            <div class="selected-info">
                <h3>{{ selectedProduct.productName }} <span class="sub-info">| {{ selectedProductionDate }} 제조분</span></h3>
            </div>
            <button class="back-btn" @click="currentStep = 2">이전으로</button>
        </div>

        <!-- Step 3 Filters -->
        <div class="filter-section mini">
            <div class="filter-group">
                <label>제품 식별 코드</label>
                <input type="text" v-model="step3Filter.serialCode" placeholder="코드 검색" />
            </div>
            <div class="filter-group">
                <label>박스 코드</label>
                <input type="text" v-model="step3Filter.boxCode" placeholder="박스코드 검색" />
            </div>
            <div class="filter-group">
                <label>배송완료 일자</label>
                <input type="date" v-model="step3Filter.shippingDate" />
            </div>
            <div class="filter-group">
                <label>입고 완료 일자</label>
                <input type="date" v-model="step3Filter.inboundDate" />
            </div>
        </div>

        <div class="data-table-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>제품 식별 코드</th>
                        <th>박스 코드</th>
                        <th>상태</th>
                        <th>배송완료 일자</th>
                        <th>입고 완료 일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in granularItems" :key="item.serialCode">
                        <td class="sku-cell">{{ item.serialCode }}</td>
                        <td>{{ item.boxCode }}</td>
                        <td>
                            <span :class="['status-item-badge', (item.status || '').toLowerCase().split('.').pop()]">
                                {{ (item.status || '').includes('AVAILABLE') ? '가용' : ((item.status || '').includes('EXPIRED') ? '만료' : '반품 대기') }}
                            </span>
                        </td>
                        <td>{{ item.shippingDate || '-' }}</td>
                        <td>{{ item.arrivalTime || '-' }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Step 3 Pagination -->
            <div class="pagination" v-if="itemTotalPages > 1">
                <button class="page-nav-btn" :disabled="itemPage === 0" @click="changeItemPage(itemPage - 1)">이전</button>
                <div class="page-numbers">
                    <button 
                        v-for="p in itemTotalPages" 
                        :key="p" 
                        @click="changeItemPage(p - 1)" 
                        :class="{ active: itemPage === p - 1 }"
                        class="page-num-btn"
                    >
                        {{ p }}
                    </button>
                </div>
                <button class="page-nav-btn" :disabled="itemPage === itemTotalPages - 1" @click="changeItemPage(itemPage + 1)">다음</button>
            </div>
        </div>
      </template>
    </div>

    <!-- Store Select Modal -->
    <div v-if="showStoreModal" class="modal-overlay">
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
          <button @click="showStoreModal = false">닫기</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/index'

const router = useRouter()

// Store Selection Logic
const showStoreModal = ref(true) // Open by default initially? Or false? User said "Pop window first"
const selectedStore = ref(null)

const stores = ref([])

const fetchStores = async () => {
    try {
        const res = await api.get('/hq/inventory/franchises')
        const data = res.data.data || {}
        stores.value = Object.entries(data).map(([id, name]) => ({
            id: Number(id),
            name: name,
            code: `가맹점${id}` // franchiseCode가 Map에 없어 임시로 표시
        }))
    } catch (e) {
        console.error('가맹점 목록 조회 실패', e)
    }
}

const openStoreSelectModal = () => {
    showStoreModal.value = true
}

const selectStore = async (store) => {
    selectedStore.value = store
    showStoreModal.value = false
    await fetchFranchiseInventory(store.id)
}

onMounted(() => {
    fetchStores()
})

// Inventory Logic
const currentStep = ref(1)
const selectedProduct = ref(null)
const selectedProductionDate = ref(null)
const isSafeStockExpanded = ref(false)
const isExpirationExpanded = ref(false)

const filter = ref({
  productCode: '',
  productName: '',
  status: ''
})

const step3Filter = ref({
  serialCode: '',
  boxCode: '',
  shippingDate: '',
  inboundDate: ''
})

const products = ref([])
const inventoryItems = ref([]) // Granular items


const fetchFranchiseInventory = async (franchiseId) => {
    try {
        currentStep.value = 1
        selectedProduct.value = null
        
        const res = await api.get(`/hq/inventory/franchises/${franchiseId}`)
        products.value = (res.data.data || []).map(p => ({
            productId: p.productId,
            productCode: p.productCode,
            productName: p.productName,
            quantity: p.totalQuantity,
            safeStock: p.safetyStock || 0,
            portion: p.size === '01' ? 1 : 3,
            status: p.status
        }))

        await fetchFranchiseAlerts(franchiseId)
    } catch (e) {
        console.error('가맹점 재고 데이터 조회 실패:', e)
        products.value = []
    }
}

const fetchFranchiseAlerts = async (franchiseId) => {
    try {
        const res = await api.get(`/hq/inventory/franchises/${franchiseId}/alerts`)
        const data = res.data.data || {}
        expiringItems.value = (data.expirationAlerts || []).map(e => ({
            productName: e.productName,
            productionDate: e.manufactureDate,
            count: e.quantity,
            daysLeft: e.daysUntilExpiration,
            key: e.manufactureDate + e.productName
        }))
    } catch (e) {
        console.error('가맹점 알림 조회 실패:', e)
        expiringItems.value = []
    }
}

const getStatusLabel = (qty, safe) => {
  if (qty <= 0) return '품절'
  if (qty <= safe) return '위험'
  if (qty <= safe + 20) return '부족'
  return '안전'
}

const getStatusClass = (qty, safe) => {
  if (qty <= 0) return 'sold'
  if (qty <= safe) return 'danger'
  if (qty <= safe + 20) return 'warning'
  return 'safe'
}

const filteredProducts = computed(() => {
  return products.value.filter(item => {
    const matchCode = !filter.value.productCode || item.productCode.startsWith(filter.value.productCode)
    const matchName = !filter.value.productName || item.productName.includes(filter.value.productName)
    
    let statusMatch = true
    if (filter.value.status) {
      const currentStatusLabel = getStatusLabel(item.quantity, item.safeStock)
      if (filter.value.status === 'SAFE') statusMatch = currentStatusLabel === '안전'
      if (filter.value.status === 'WARNING') statusMatch = currentStatusLabel === '부족'
      if (filter.value.status === 'DANGER') statusMatch = currentStatusLabel === '위험' || currentStatusLabel === '품절'
    }

    return matchCode && matchName && statusMatch
  })
})

const lowStockItems = computed(() => {
  return products.value.filter(item => item.quantity <= item.safeStock)
})

const expiringItems = ref([])
const hasMoreAlerts = computed(() => {
    return lowStockItems.value.length > 0 || expiringItems.value.length > 0
})

const sortedBatches = ref([])

const granularItems = ref([])

const batchPage = ref(0)
const batchSize = ref(20)
const batchTotalPages = ref(0)

const itemPage = ref(0)
const itemSize = ref(20)
const itemTotalPages = ref(0)

const fetchBatches = async (productId) => {
  try {
    const res = await api.get(`/hq/inventory/franchises/${selectedStore.value.id}/batches/${productId}`, {
      params: { page: batchPage.value, size: batchSize.value }
    })
    const pageData = res.data.data || {}
    sortedBatches.value = (pageData.content || []).map(b => ({
      productionDate: b.manufactureDate,
      total: b.totalQuantity,
      available: b.availableQuantity,
      pending: b.returnPending
    }))
    batchTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('batch fetch failed:', e)
    sortedBatches.value = []
    batchTotalPages.value = 0
  }
}

const fetchItems = async () => {
  if (!selectedProduct.value || !selectedProductionDate.value || !selectedStore.value) return
  try {
    const params = {
      franchiseId: selectedStore.value.id,
      productId: selectedProduct.value.productId,
      manufactureDate: selectedProductionDate.value,
      page: itemPage.value,
      size: itemSize.value
    }
    if (step3Filter.value.serialCode) params.serialCode = step3Filter.value.serialCode
    if (step3Filter.value.boxCode) params.boxCode = step3Filter.value.boxCode
    if (step3Filter.value.shippingDate) params.shippedAt = step3Filter.value.shippingDate
    if (step3Filter.value.inboundDate) params.receivedAt = step3Filter.value.inboundDate

    const res = await api.get('/hq/inventory/franchises/items', { params })
    const pageData = res.data.data || {}
    granularItems.value = (pageData.content || []).map(i => {
      const rawStatus = i.status || ''
      const parsedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus
      return {
        serialCode: i.serialCode,
        boxCode: i.boxCode,
        status: parsedStatus,
        shippingDate: i.shippedAt ? i.shippedAt.split('T')[0] : null,
        arrivalTime: i.receivedAt ? i.receivedAt.split('T')[0] : null
      }
    })
    itemTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('item fetch failed:', e)
    granularItems.value = []
    itemTotalPages.value = 0
  }
}

const changeBatchPage = async (page) => {
  batchPage.value = page
  await fetchBatches(selectedProduct.value.productId)
}

const changeItemPage = async (page) => {
  itemPage.value = page
  await fetchItems()
}

const goToStep2 = async (product) => {
  selectedProduct.value = product
  batchPage.value = 0
  await fetchBatches(product.productId)
  currentStep.value = 2
}

const goToStep3 = async (batch) => {
  selectedProductionDate.value = batch.productionDate
  itemPage.value = 0
  await fetchItems()
  currentStep.value = 3
}


// ----------------

// Filter for items changes -> fetch from backend again
watch(step3Filter, () => {
    if (currentStep.value === 3) {
        fetchItems()
    }
}, { deep: true })

const goToDetail = (code) => {
  router.push(`/store/inventory/${code}`)
}

</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

.empty-state {
    text-align: center; margin-top: 100px; color: #64748b;
}
.empty-message { margin-bottom: 1rem; font-size: 1.2rem; }

/* Filter Styles */
.filter-section {
  background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; width: 100%; }
.search-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; }

/* Table */
.data-table-card { 
    background: white; 
    border-radius: 16px; 
    border: 1px solid var(--border-color); 
    overflow-x: auto; /* 가로 스크롤 허용 */
}
.data-table { 
    width: 100%; 
    border-collapse: collapse; 
    min-width: 1000px; /* 창이 좁아져도 형태 유지 */
}
.data-table th { text-align: center; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); text-align: center; }
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9; }

.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { font-weight: 600; }

.store-info-banner { 
  background: #eff6ff; padding: 1rem; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 1.5rem; 
}
.store-info-banner h3 { margin: 0 0 0.5rem 0; color: #1e3a8a; }
.store-info-banner p { margin: 0; color: #3b82f6; }

.status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
.status-badge.safe { background: #e6fffa; color: #2c7a7b; }
.status-badge.warning { background: #fffaf0; color: #dd6b20; }
.status-badge.danger { background: #fff5f5; color: #e53e3e; }
.status-badge.sold { background: #edf2f7; color: #4a5568; }
.action-btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-weight: 600; }
.action-btn.primary { background: var(--primary); color: white; border: none; }

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

/* Redesign Specific Styles */
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; color: var(--text-dark); transition: all 0.2s; }
.back-btn:hover { background: #f8fafc; border-color: var(--text-light); }
.selected-info h3 { margin: 0; font-size: 1.4rem; color: var(--text-dark); font-weight: 800; }
.sub-info { color: #64748b; font-weight: 500; font-size: 1.1rem; margin-left: 0.75rem; }
.number-cell { font-variant-numeric: tabular-nums; font-weight: 600; }
.number-cell.available { color: #2f855a; }
.number-cell.pending { color: #c53030; }

.filter-section.mini { padding: 1rem; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; }
.filter-section.mini .filter-group { min-width: 120px; }
.filter-section.mini input { padding: 0.4rem 0.75rem; font-size: 0.85rem; }

.status-item-badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
.status-item-badge.available { background: #e6fffa; color: #2c7a7b; }
.status-item-badge.return_wait { background: #fee2e2; color: #991b1b; }
.status-item-badge.expired { background: #fef3c7; color: #92400e; }


/* Alert Section */
.alert-section {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.alert-section.safe {
  background: #f0fff4;
  border-color: #c6f6d5;
}
.alert-section.expiration {
  background: #fffbeb;
  border-color: #fde68a;
}
.alert-section.expiration .alert-title { color: #92400e; }
.alert-section.expiration li { color: #78350f; }
.alert-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #c53030;
}
.safe .alert-title { color: #2f855a; margin-bottom: 0; }
.alert-section ul { margin: 0; padding-left: 1.5rem; }
.alert-section li { margin-bottom: 0.25rem; color: #742a2a; }
.danger-text { color: #e53e3e; font-weight: 700; }
.alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.toggle-alert-btn { background: none; border: none; font-size: 0.85rem; color: #718096; cursor: pointer; text-decoration: underline; }
.alert-summary { font-size: 0.95rem; color: #c53030; margin-bottom: 0.5rem; }
.pl-2 { padding-left: 0.5rem; }
.mx-2 { margin: 0 0.5rem; color: #fed7d7; }

.expiration-warning { margin-top: 1rem; border-top: 1px dashed #feb2b2; padding-top: 1rem; }
.sub-alert-title { font-weight: 700; color: #c05621; margin-bottom: 0.5rem; }

.mt-3 { margin-top: 0.75rem; }
.pt-3 { padding-top: 0.75rem; }
.border-top-dashed { border-top: 1px dashed #fed7d7; }
.no-list-style { list-style: none; padding-left: 0.5rem; }


/* 커스텀 가로 스크롤바 */
.data-table-card::-webkit-scrollbar {
    height: 8px;
}
.data-table-card::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 0 0 16px 16px;
}
.data-table-card::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}
.data-table-card::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

</style>
