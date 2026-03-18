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
          <button type="button" class="btn-reset-filters" @click="resetFilters" title="필터 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            초기화
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="summary-grid">
          <article class="summary-card risk">
            <span class="summary-label">위험 재고</span>
            <strong class="summary-value">{{ inventorySummary.risk }}</strong>
            <small class="summary-desc">안전재고 이하 (품절 제외)</small>
          </article>
          <article class="summary-card sold">
            <span class="summary-label">품절</span>
            <strong class="summary-value">{{ inventorySummary.sold }}</strong>
            <small class="summary-desc">재고 0개</small>
          </article>
          <article class="summary-card expiring">
            <span class="summary-label">유통기한 임박</span>
            <strong class="summary-value">{{ expiringAlertRows.length }}</strong>
            <small class="summary-desc">소진/폐기 확인 필요</small>
          </article>
          <article class="summary-card safe">
            <span class="summary-label">정상 재고</span>
            <strong class="summary-value">{{ inventorySummary.safe }}</strong>
            <small class="summary-desc">안전재고 초과</small>
          </article>
        </div>

        <!-- Priority Section -->
        <div v-if="priorityItems.length > 0" class="priority-section">
          <div class="section-header">
            <h3>우선 확인 필요 ({{ priorityItems.length }}건)</h3>
            <span></span>
          </div>
          <div class="priority-list">
            <button
              v-for="item in priorityItems"
              :key="item.productCode"
              class="priority-item"
              @click="goToStep2(item)"
            >
              <div class="priority-head">
                <span class="priority-code">{{ item.productCode }}</span>
                <span class="priority-name">{{ item.productName }} ({{ getPortionLabel(item.portion) }})</span>
                <span v-if="isExpiringProduct(item.productName)" class="expiring-badge">
                  유통임박
                </span>
                <span :class="['status-badge', getStatusClass(item.quantity, item.safeStock)]">
                  {{ getStatusLabel(item.quantity, item.safeStock) }}
                </span>
              </div>
              <div class="stock-bar-track">
                <div
                  :class="['stock-bar-fill', getStatusClass(item.quantity, item.safeStock)]"
                  :style="{ width: `${getStockFillPercent(item.quantity, item.safeStock)}%` }"
                />
              </div>
              <p class="stock-value">{{ item.quantity }} / {{ item.safeStock }}</p>
            </button>
          </div>
        </div>

        <div v-if="expiringAlertRows.length > 0" class="data-table-card expiry-wrap">
          <div class="section-header">
            <h3>유통기한 임박 ({{ expiringAlertRows.length }}건)</h3>
            <button class="toggle-alert-btn" @click="isExpiryExpanded = !isExpiryExpanded">
              {{ isExpiryExpanded ? '접기 ▲' : '펼치기 ▼' }}
            </button>
          </div>
          <table v-if="isExpiryExpanded" class="data-table">
            <thead>
              <tr>
                <th>제품</th>
                <th>제조일</th>
                <th>임박 수량</th>
                <th>만료까지</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in expiringAlertRows" :key="item.key" class="row-expiring">
                <td class="product-cell">
                  <p class="product-code sku-cell">{{ item.productCode || '-' }}</p>
                  <p class="product-name">{{ item.productName }}</p>
                </td>
                <td>{{ item.manufactureDate }}</td>
                <td class="number-cell">{{ item.quantity }}</td>
                <td>
                  <span class="status-badge expiring">{{ item.daysUntilExpiration }}일</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Main Inventory Table -->
        <div class="data-table-card">
          <div class="section-header compact">
            <h3>재고 현황</h3>
            <span>위험 항목 우선 정렬</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>제품</th>
                <th>재고 / 안전재고</th>
                <th>안전재고</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in nonSoldFilteredProducts"
                :key="item.productCode"
                @click="goToStep2(item)"
                :class="['clickable-row', `row-${getStatusClass(item.quantity, item.safeStock)}`]"
              >
                <td class="product-cell">
                  <p class="product-code sku-cell">{{ item.productCode }}</p>
                  <p class="product-name">{{ item.productName }} ({{ getPortionLabel(item.portion) }})</p>
                </td>
                <td>
                  <div class="stock-cell">
                    <div class="stock-bar-track">
                      <div
                        :class="['stock-bar-fill', getStatusClass(item.quantity, item.safeStock)]"
                        :style="{ width: `${getStockFillPercent(item.quantity, item.safeStock)}%` }"
                      />
                    </div>
                    <p class="stock-value">{{ item.quantity }} / {{ item.safeStock }}</p>
                  </div>
                </td>
                <td class="number-cell">{{ item.safeStock }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(item.quantity, item.safeStock)]">
                    {{ getStatusLabel(item.quantity, item.safeStock) }}
                  </span>
                </td>
              </tr>
              <tr v-if="nonSoldFilteredProducts.length === 0">
                <td colspan="4" class="empty-cell">표시할 재고 데이터가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sold-out Section -->
        <div v-if="soldOutFilteredProducts.length > 0" class="data-table-card soldout-wrap">
          <div class="section-header">
            <h3>품절 ({{ soldOutFilteredProducts.length }}건)</h3>
            <button class="toggle-alert-btn" @click="isSoldOutExpanded = !isSoldOutExpanded">
              {{ isSoldOutExpanded ? '접기 ▲' : '펼치기 ▼' }}
            </button>
          </div>
          <table v-if="isSoldOutExpanded" class="data-table">
            <thead>
              <tr>
                <th>제품</th>
                <th>재고</th>
                <th>안전재고</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in soldOutFilteredProducts"
                :key="item.productCode"
                @click="goToStep2(item)"
                class="clickable-row row-sold"
              >
                <td class="product-cell">
                  <p class="product-code sku-cell">{{ item.productCode }}</p>
                  <p class="product-name">{{ item.productName }} ({{ getPortionLabel(item.portion) }})</p>
                </td>
                <td class="number-cell">0</td>
                <td class="number-cell">{{ item.safeStock }}</td>
                <td><span class="status-badge sold">품절</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Step 2: FIFO Summary with Right Detail Panel -->
      <template v-else-if="currentStep === 2">
        <div class="step-header">
            <div class="selected-info">
                <h3>{{ selectedProduct.productName }} <span class="sub-info">({{ selectedProduct.productCode }})</span></h3>
            </div>
            <button class="back-btn" @click="currentStep = 1">목록으로</button>
        </div>

        <div class="step2-split">
            <div class="data-table-card left-pane">
                <div class="batch-accordion">
                    <div v-for="group in monthlyBatches" :key="group.monthKey" class="month-group">
                        <button type="button" class="month-row" @click="toggleMonth(group.monthKey)">
                            <span class="month-main">
                                <span class="month-label">{{ formatMonthLabel(group.monthKey) }}</span>
                                <span class="month-sub">재고 {{ group.totalQuantity }}개</span>
                            </span>
                            <span class="month-arrow">{{ isMonthExpanded(group.monthKey) ? '▼' : '▶' }}</span>
                        </button>

                        <div v-if="isMonthExpanded(group.monthKey)" class="day-list">
                            <button
                                v-for="day in group.days"
                                :key="day.productionDate"
                                type="button"
                                class="day-row"
                                @click="selectBatchInStep2(day)"
                            >
                                <span class="day-date">{{ day.productionDate }}</span>
                                <span class="day-count">{{ day.total }}개</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="data-table-card right-pane">
                <div v-if="!selectedProductionDate" class="detail-empty">
                    왼쪽에서 제조일을 선택하면 상세가 여기에 표시됩니다.
                </div>
                <template v-else>
                    <div class="section-header compact">
                        <h3>{{ selectedProductionDate }} 제조분 상세</h3>
                        <span>{{ granularItems.length }}건</span>
                    </div>

                    <div class="filter-section mini step3-filter">
                        <div class="filter-group">
                            <label>제품 식별 코드</label>
                            <input type="text" v-model="step3Filter.serialCode" placeholder="코드 검색" />
                        </div>
                        <div class="filter-group">
                            <label>박스 코드</label>
                            <input type="text" v-model="step3Filter.boxCode" placeholder="박스코드 검색" />
                        </div>
                    </div>

                    <table class="data-table step3-table">
                        <colgroup>
                            <col style="width: 44%;" />
                            <col style="width: 40%;" />
                            <col style="width: 16%;" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>제품 식별 코드</th>
                                <th>박스 코드</th>
                                <th>상태</th>
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
                            </tr>
                            <tr v-if="granularItems.length === 0">
                                <td colspan="3" class="empty-cell">해당 제조일의 상세 데이터가 없습니다.</td>
                            </tr>
                        </tbody>
                    </table>

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
                </template>
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
        <div class="filter-section mini step3-filter">
            <div class="filter-group">
                <label>제품 식별 코드</label>
                <input type="text" v-model="step3Filter.serialCode" placeholder="코드 검색" />
            </div>
            <div class="filter-group">
                <label>박스 코드</label>
                <input type="text" v-model="step3Filter.boxCode" placeholder="박스코드 검색" />
            </div>
        </div>

        <div class="data-table-card">
            <table class="data-table step3-table">
                <colgroup>
                    <col style="width: 44%;" />
                    <col style="width: 40%;" />
                    <col style="width: 16%;" />
                </colgroup>
                <thead>
                    <tr>
                        <th>제품 식별 코드</th>
                        <th>박스 코드</th>
                        <th>상태</th>
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
const isSoldOutExpanded = ref(false)
const isExpiryExpanded = ref(false)

const filter = ref({
  productCode: '',
  productName: '',
  status: ''
})

const resetFilters = () => {
  filter.value = {
    productCode: '',
    productName: '',
    status: ''
  }
}

const step3Filter = ref({
  serialCode: '',
  boxCode: ''
})

const products = ref([])
const inventoryItems = ref([]) // Granular items
const expiringItems = ref([])

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
        expiringItems.value = data.expirationAlerts || []
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

const getStatusPriority = (qty, safe) => {
  const status = getStatusClass(qty, safe)
  if (status === 'sold') return 0
  if (status === 'danger') return 1
  if (status === 'warning') return 2
  return 3
}

const getStockFillPercent = (qty, safe) => {
  if (safe <= 0) return qty > 0 ? 100 : 0
  return Math.max(0, Math.min(100, Math.round((qty / safe) * 100)))
}

const getPortionLabel = (portion) => (portion === 1 ? '1~2인분' : '3~4인분')

const expiringProductNameSet = computed(() => {
  return new Set((expiringItems.value || []).map(item => item.productName))
})

const isExpiringProduct = (productName) => expiringProductNameSet.value.has(productName)

const expiringAlertRows = computed(() => {
  return (expiringItems.value || []).map((item, index) => ({
    key: `${item.productName}-${item.manufactureDate || item.productionDate || index}`,
    productCode: products.value.find(product => product.productName === item.productName)?.productCode || '',
    productName: item.productName,
    manufactureDate: item.manufactureDate || item.productionDate || '-',
    quantity: item.quantity ?? item.count ?? 0,
    daysUntilExpiration: item.daysUntilExpiration ?? item.daysLeft ?? '-'
  }))
})

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

const sortedFilteredProducts = computed(() => {
  return [...filteredProducts.value].sort((a, b) => {
    const priorityDiff = getStatusPriority(a.quantity, a.safeStock) - getStatusPriority(b.quantity, b.safeStock)
    if (priorityDiff !== 0) return priorityDiff
    return a.productCode.localeCompare(b.productCode)
  })
})

const nonSoldFilteredProducts = computed(() => {
  return sortedFilteredProducts.value.filter(item => item.quantity > 0)
})

const soldOutFilteredProducts = computed(() => {
  return sortedFilteredProducts.value.filter(item => item.quantity <= 0)
})

const priorityItems = computed(() => {
  return sortedFilteredProducts.value
    .filter(item => item.quantity > 0 && item.quantity <= item.safeStock)
    .slice(0, 5)
})

const inventorySummary = computed(() => {
  const summary = { risk: 0, sold: 0, safe: 0 }
  filteredProducts.value.forEach(item => {
    if (item.quantity <= 0) {
      summary.sold += 1
      return
    }
    if (item.quantity <= item.safeStock) {
      summary.risk += 1
      return
    }
    summary.safe += 1
  })
  return summary
})

const sortedBatches = ref([])

const granularItems = ref([])

const expandedMonths = ref([])

const itemPage = ref(0)
const itemSize = ref(20)
const itemTotalPages = ref(0)

const fetchBatches = async (productId) => {
  try {
    const pageSize = 200
    let page = 0
    let totalPages = 1
    const merged = []

    while (page < totalPages) {
      const res = await api.get(`/hq/inventory/franchises/${selectedStore.value.id}/batches/${productId}`, {
        params: { page, size: pageSize }
      })
      const pageData = res.data.data || {}
      const content = (pageData.content || []).map(b => ({
        productionDate: b.manufactureDate,
        total: b.totalQuantity,
        available: b.availableQuantity
      }))
      merged.push(...content)
      totalPages = pageData.totalPages || 0
      if (totalPages === 0) break
      page += 1
    }

    sortedBatches.value = merged.sort((a, b) => b.productionDate.localeCompare(a.productionDate))
  } catch (e) {
    console.error('batch fetch failed:', e)
    sortedBatches.value = []
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

    const res = await api.get('/hq/inventory/franchises/items', { params })
    const pageData = res.data.data || {}
    granularItems.value = (pageData.content || []).map(i => {
      const rawStatus = i.status || ''
      const parsedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus
      return {
        serialCode: i.serialCode,
        boxCode: i.boxCode,
        status: parsedStatus
      }
    })
    itemTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('item fetch failed:', e)
    granularItems.value = []
    itemTotalPages.value = 0
  }
}

const changeItemPage = async (page) => {
  itemPage.value = page
  await fetchItems()
}

const goToStep2 = async (product) => {
  selectedProduct.value = product
  expandedMonths.value = []
  selectedProductionDate.value = null
  granularItems.value = []
  itemTotalPages.value = 0
  step3Filter.value = { serialCode: '', boxCode: '' }
  await fetchBatches(product.productId)
  currentStep.value = 2
}

const goToStep3 = async (batch) => {
  selectedProductionDate.value = batch.productionDate
  itemPage.value = 0
  await fetchItems()
  currentStep.value = 3
}

const selectBatchInStep2 = async (batch) => {
  selectedProductionDate.value = batch.productionDate
  itemPage.value = 0
  await fetchItems()
}

const monthlyBatches = computed(() => {
  const monthMap = new Map()
  sortedBatches.value.forEach(batch => {
    const monthKey = (batch.productionDate || '').slice(0, 7)
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { monthKey, totalQuantity: 0, days: [] })
    }
    const group = monthMap.get(monthKey)
    group.totalQuantity += Number(batch.total || 0)
    group.days.push(batch)
  })
  return Array.from(monthMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
})

const isMonthExpanded = (monthKey) => expandedMonths.value.includes(monthKey)

const toggleMonth = (monthKey) => {
  if (isMonthExpanded(monthKey)) {
    expandedMonths.value = expandedMonths.value.filter(key => key !== monthKey)
  } else {
    expandedMonths.value = [...expandedMonths.value, monthKey]
  }
}

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '-'
  const [year, month] = monthKey.split('-')
  return `${year}.${month}`
}


// ----------------

// Filter for items changes -> fetch from backend again
watch(step3Filter, () => {
    if ((currentStep.value === 2 || currentStep.value === 3) && selectedProductionDate.value) {
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
.filter-section > .btn-reset-filters { margin-left: auto; }

/* Summary */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.summary-card {
  border-radius: 14px;
  padding: 1rem 1.1rem;
  border: 1px solid var(--border-color);
  background: #ffffff;
}
.summary-card.risk { background: #fff5f5; border-color: #fecaca; }
.summary-card.sold { background: #f8fafc; border-color: #cbd5e1; }
.summary-card.expiring { background: #fff8eb; border-color: #fcd34d; }
.summary-card.safe { background: #ecfdf3; border-color: #bbf7d0; }
.summary-label { display: block; font-size: 0.85rem; color: #475569; margin-bottom: 0.3rem; font-weight: 700; }
.summary-value { display: block; font-size: 1.7rem; line-height: 1.1; color: #0f172a; }
.summary-desc { display: block; margin-top: 0.3rem; color: #64748b; font-size: 0.78rem; }

/* Section common */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.2rem 0.75rem;
}
.section-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}
.section-header span {
  color: #64748b;
  font-size: 0.85rem;
}
.section-header.compact {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.7rem;
}

/* Priority */
.priority-section {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  margin-bottom: 1.25rem;
}
.priority-list {
  padding: 0 1.2rem 1.1rem;
  display: grid;
  gap: 0.75rem;
}
.priority-item {
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fff8f8;
  text-align: left;
  padding: 0.85rem 0.9rem;
  cursor: pointer;
}
.priority-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.55rem;
}
.priority-code {
  color: #b91c1c;
  font-weight: 800;
  font-size: 0.86rem;
}
.priority-name {
  color: #111827;
  font-weight: 700;
  flex: 1;
  font-size: 0.9rem;
}
.expiring-badge {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.12rem 0.5rem;
}

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
.data-table th {
  text-align: center;
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  background: #f8fafc;
  color: var(--text-light);
  font-size: 0.9rem !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  border-bottom: 1px solid var(--border-color);
}
.data-table td {
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  font-size: 0.95rem !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  line-height: 1.35 !important;
}
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9; }
.row-danger { background: #fff3f3; }
.row-sold { background: #f8fafc; }
.row-expiring { background: #fffdf5; }

.sku-cell { color: #1d4ed8; font-weight: 600; }
.name-cell { font-weight: 600; }
.product-cell { text-align: left !important; }
.product-code { margin: 0; color: #1e293b; font-size: 0.83rem; font-weight: 800; }
.product-code.sku-cell { color: #1d4ed8; }
.product-name { margin: 0.2rem 0 0; color: #334155; font-weight: 600; }
.stock-cell { min-width: 200px; }
.stock-bar-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}
.stock-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}
.stock-bar-fill.safe { background: #16a34a; }
.stock-bar-fill.warning { background: #f59e0b; }
.stock-bar-fill.danger { background: #ef4444; }
.stock-bar-fill.sold { background: #475569; }
.stock-value {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: #334155;
  font-weight: 700;
}

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
.status-badge.expiring { background: #fef3c7; color: #92400e; }
.action-btn { padding: 0.6rem 1.2rem; border-radius: 6px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-weight: 600; }
.action-btn.primary { background: var(--primary); color: white; border: none; }
.soldout-wrap { margin-top: 1rem; }
.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }
.expiry-wrap { margin-bottom: 1rem; }

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
.step2-split { display: grid; grid-template-columns: minmax(280px, 40%) minmax(0, 60%); gap: 1rem; align-items: stretch; }
.left-pane,
.right-pane { height: 68vh; min-height: 520px; overflow: auto; }
.detail-empty { height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: 600; background: #f8fafc; border-radius: 16px; text-align: center; padding: 1rem; }
.batch-accordion { padding: 0.9rem 1rem 1rem; display: grid; gap: 0.7rem; background: #f8fafc; }
.month-group { border: 1px solid #d6e0ea; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06); }
.month-row { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; padding: 0.85rem 1rem; border: 0; background: #f1f5f9; cursor: pointer; color: #0f172a; text-align: left; }
.month-main { display: flex; flex-direction: column; gap: 0.15rem; align-items: flex-start; }
.month-label { font-weight: 700; font-size: 0.95rem; letter-spacing: 0.01em; font-variant-numeric: tabular-nums; color: #0f172a; }
.month-sub { font-size: 0.78rem; color: #64748b; font-weight: 600; }
.month-arrow { width: 18px; flex: 0 0 18px; text-align: center; color: #475569; font-size: 0.9rem; }
.day-list { display: grid; padding: 0.15rem 0.95rem 0.35rem; background: #fff; }
.day-row { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 0.55rem; border: 0; border-bottom: 1px solid #f1f5f9; background: transparent; border-radius: 0; padding: 0.62rem 0.35rem 0.62rem 0.9rem; cursor: pointer; color: #334155; text-align: left; }
.day-row:last-child { border-bottom: 0; }
.day-row:hover { background: #fafafa; }
.day-date { width: 128px; flex: 0 0 128px; font-weight: 700; font-variant-numeric: tabular-nums; text-align: left; }
.day-count { width: 76px; flex: 0 0 76px; font-weight: 700; color: #0f766e; font-variant-numeric: tabular-nums; text-align: right; }

.filter-section.mini { padding: 1rem; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; }
.filter-section.mini .filter-group { min-width: 120px; }
.filter-section.mini input { padding: 0.4rem 0.75rem; font-size: 0.85rem; }
.filter-section.mini.step3-filter {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
  justify-content: start;
  align-items: end;
}
.filter-section.mini.step3-filter .filter-group { min-width: 0; width: 100%; }
.data-table.step3-table {
  min-width: 720px;
  table-layout: fixed;
}
.data-table.step3-table th,
.data-table.step3-table td {
  padding-left: 1.1rem !important;
  padding-right: 1.1rem !important;
}
.data-table.step3-table th:nth-child(1),
.data-table.step3-table td:nth-child(1) {
  text-align: left;
}
.data-table.step3-table th:nth-child(2),
.data-table.step3-table td:nth-child(2) {
  text-align: left;
}
.data-table.step3-table th:nth-child(3),
.data-table.step3-table td:nth-child(3) {
  text-align: center;
}

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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.page-nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 8px;
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
  border-radius: 8px;
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
@media (max-width: 960px) {
  .summary-grid { grid-template-columns: 1fr; }
  .step2-split { grid-template-columns: 1fr; }
  .left-pane,
  .right-pane { height: auto; min-height: 0; overflow: visible; }
  .priority-head { flex-wrap: wrap; }
  .stock-cell { min-width: 140px; }
}

</style>
