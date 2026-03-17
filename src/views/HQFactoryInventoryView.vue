<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 공장 재고 관리</h2>
    </div>

    <!-- Step 1: Product Overview -->
    <template v-if="currentStep === 1">
        <!-- Filter Section (3 Columns) -->
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
                <th>재고</th>
                <th>
                  안전재고
                  <button class="icon-btn" @click="openPasswordPopup" title="안전재고 설정">⚙️</button>
                </th>
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

    <!-- Step 2: Production Date Summary (FIFO) -->
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
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="batch in batches" :key="batch.productionDate" @click="goToStep3(batch)" class="clickable-row">
                        <td>{{ batch.productionDate }}</td>
                        <td class="number-cell">{{ batch.quantity }}</td>
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

    <!-- Step 3: Granular Item Details -->
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
                <input type="text" v-model="step3Filter.serialCode" placeholder="코드 입력" />
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
                        <th style="width: 50px;"><input type="checkbox" :checked="isAllSelected" @change="toggleAll" /></th>
                        <th>제품 식별 코드</th>
                        <th>박스 코드</th>
                        <th>상태</th>
                        <th>배송완료 일자</th>
                        <th>입고 완료 일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in granularItems" :key="item.serialCode">
                        <td><input type="checkbox" :checked="selectedItems.includes(item.serialCode)" @change="toggleItemSelection(item)" /></td>
                        <td class="sku-cell">{{ item.serialCode }}</td>
                        <td>{{ item.boxCode || '-' }}</td>
                        <td><span :class="['status-badge', getItemStatusClass(item.status)]">{{ getStatusKor(item.status) }}</span></td>
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

        <!-- Step 3 Bottom Actions -->
        <div class="bottom-actions" v-if="selectedItems.length > 0">
            <button class="action-btn disposal" @click="requestDisposal" style="background-color: #e53e3e; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 1rem;">폐기 처리 ({{ selectedItems.length }}개)</button>
        </div>
    </template>

    <!-- Password Popup -->
    <div v-if="showPasswordPopup" class="popup-overlay">
      <div class="popup-content">
        <h3>관리자 확인</h3>
        <p>안전재고 설정을 위해 비밀번호를 입력하세요.</p>
        <input type="password" v-model="adminPassword" placeholder="비밀번호 입력" @keyup.enter="checkPassword" />
        <div class="popup-actions">
          <button @click="closePopup">취소</button>
          <button class="primary" @click="checkPassword">확인</button>
        </div>
      </div>
    </div>

    <!-- Safe Stock Settings Popup -->
    <div v-if="showSettingsPopup" class="popup-overlay">
      <div class="popup-content">
        <h3>안전재고 설정</h3>
        <p class="modal-hint">설정할 제품의 코드를 입력하세요.</p>
        
        <div class="form-group mb-1">
          <label>제품 코드</label>
          <input type="text" v-model="settingForm.productCode" placeholder="예: OR0101" @input="lookupProduct" />
        </div>
        
        <div v-if="foundProduct" class="found-product-info">
          <strong>찾은 제품:</strong> {{ foundProduct.productName }}
        </div>
        <div v-else-if="settingForm.productCode && !foundProduct" class="error-text">
          해당 코드를 가진 제품을 찾을 수 없습니다.
        </div>

        <div class="form-group">
          <label>새 안전재고 수량</label>
          <input type="number" v-model="settingForm.safeStock" min="0" />
        </div>

        <div class="popup-actions" style="justify-content: space-between; display: flex; width: 100%;">
          <button class="btn-reset-filters" @click="resetSettings" :disabled="!foundProduct">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            초기화
          </button>
          <div>
            <button @click="closeSettingsPopup" style="margin-right: 0.5rem;">닫기</button>
            <button class="primary" @click="saveSettings" :disabled="!foundProduct">저장</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/index'

// Redesign State
const currentStep = ref(1)
const selectedProduct = ref(null)
const selectedProductionDate = ref(null)
const selectedItems = ref([])
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
  boxCode: '',
  productionDate: '',
  shippingDate: '',
  inboundDate: ''
})

// Popups state
const showPasswordPopup = ref(false)
const showSettingsPopup = ref(false)
const adminPassword = ref('')
const settingForm = ref({ productCode: '', safeStock: 50 })
const foundProduct = ref(null)

// API Data
const products = ref([])
const batches = ref([])
const allItems = ref([])
const expirationItems = ref([])

const batchPage = ref(0)
const batchSize = ref(20)
const batchTotalPages = ref(0)

const itemPage = ref(0)
const itemSize = ref(20)
const itemTotalPages = ref(0)

// --- API Calls ---
const fetchProducts = async () => {
    try {
        const res = await api.get('/hq/inventory')
        products.value = (res.data.data || []).map(p => ({
            productId: p.productId,
            productCode: p.productCode,
            productName: p.productName,
            quantity: p.totalQuantity,
            portion: p.sizeCode === '01' ? 1 : 3,
            safeStock: p.safetyStock
        }))
    } catch (e) {
        console.error('재고 조회 실패', e)
    }
}

const fetchAlerts = async () => {
    try {
        const res = await api.get('/hq/inventory/alerts')
        const data = res.data.data || {}
        expirationItems.value = data.expirationAlerts || []
    } catch (e) {
        console.error('알림 조회 실패', e)
        expirationItems.value = []
    }
}

const fetchBatches = async (productId) => {
  try {
    const res = await api.get(`/hq/inventory/batches/${productId}`, {
      params: { page: batchPage.value, size: batchSize.value }
    })
    const pageData = res.data.data || {}
    batches.value = (pageData.content || [])
        .map(b => ({
          productionDate: b.manufactureDate,
          quantity: b.totalQuantity
        }))
        .sort((a, b) => a.productionDate.localeCompare(b.productionDate))
    batchTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('batch fetch failed', e)
    batches.value = []
    batchTotalPages.value = 0
  }
}

const fetchItems = async (manufactureDate) => {
  try {
    const res = await api.get('/hq/inventory/items', {
      params: {
        productId: selectedProduct.value.productId,
        manufactureDate,
        page: itemPage.value,
        size: itemSize.value
      }
    })
    const pageData = res.data.data || {}
    allItems.value = (pageData.content || []).map(item => {
      const rawStatus = item.status || ''
      const parsedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus
      return {
        inventoryId: item.inventoryId,
        serialCode: item.serialCode,
        boxCode: item.boxCode,
        productionDate: manufactureDate,
        shippingDate: item.shippedAt ? item.shippedAt.substring(0, 10) : null,
        arrivalTime: item.receivedAt ? item.receivedAt.substring(0, 10) : null,
        status: parsedStatus
      }
    })
    itemTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('item fetch failed', e)
    allItems.value = []
    itemTotalPages.value = 0
  }
}

const changeBatchPage = async (page) => {
  batchPage.value = page
  await fetchBatches(selectedProduct.value.productId)
}

const changeItemPage = async (page) => {
  itemPage.value = page
  await fetchItems(selectedProductionDate.value)
}

onMounted(() => {
    fetchProducts()
    fetchAlerts()
})

// --- Status Helpers ---
const getStatusKor = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('AVAILABLE')) return '가용';
    if (s.includes('EXPIRED')) return '만료';
    if (s.includes('DISCARDED')) return '폐기';
    if (s.includes('RESERVED')) return '예약';
    if (s.includes('OUTBOUND')) return '출고';
    if (s.includes('RETURN_WAIT')) return '반품대기';
    if (s.includes('SHIPPING')) return '배송 중';
    return status || '가용';
}

const getItemStatusClass = (status) => {
    const s = (status || '').toUpperCase();
    if (s.includes('AVAILABLE')) return 'safe';
    if (s.includes('RESERVED')) return 'warning';
    if (s.includes('EXPIRED')) return 'danger';
    if (s.includes('DISCARDED')) return 'sold';
    if (s.includes('OUTBOUND')) return 'sold';
    if (s.includes('RETURN_WAIT')) return 'warning';
    if (s.includes('SHIPPING')) return 'shipping';
    return 'safe';
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
    return new Set((expirationItems.value || []).map(item => item.productName))
})

const isExpiringProduct = (productName) => expiringProductNameSet.value.has(productName)

const expiringAlertRows = computed(() => {
    return (expirationItems.value || []).map((item, index) => ({
        key: `${item.productName}-${item.manufactureDate || item.productionDate || index}`,
        productCode: products.value.find(product => product.productName === item.productName)?.productCode || '',
        productName: item.productName,
        manufactureDate: item.manufactureDate || item.productionDate || '-',
        quantity: item.quantity ?? item.count ?? 0,
        daysUntilExpiration: item.daysUntilExpiration ?? item.daysLeft ?? '-'
    }))
})

// --- Computed ---

const filteredProducts = computed(() => {
    return products.value.filter(item => {
        const matchCode = !filter.value.productCode || item.productCode.startsWith(filter.value.productCode)
        const matchName = !filter.value.productName || item.productName.includes(filter.value.productName)
        let statusMatch = true
        if (filter.value.status) {
            const lbl = getStatusLabel(item.quantity, item.safeStock)
            if (filter.value.status === 'SAFE') statusMatch = lbl === '안전'
            if (filter.value.status === 'WARNING') statusMatch = lbl === '부족'
            if (filter.value.status === 'DANGER') statusMatch = lbl === '위험' || lbl === '품절'
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

const sortedBatches = computed(() => batches.value)

const granularItems = computed(() => {
    return allItems.value.filter(i => {
        const matchSerial = !step3Filter.value.serialCode || i.serialCode.includes(step3Filter.value.serialCode)
        const matchBox = !step3Filter.value.boxCode || (i.boxCode && i.boxCode.includes(step3Filter.value.boxCode))
        const matchProdDate = !step3Filter.value.productionDate || i.productionDate === step3Filter.value.productionDate
        const matchShipDate = !step3Filter.value.shippingDate || i.shippingDate === step3Filter.value.shippingDate
        const matchInboundDate = !step3Filter.value.inboundDate || i.arrivalTime === step3Filter.value.inboundDate
        return matchSerial && matchBox && matchProdDate && matchShipDate && matchInboundDate
    })
})

// --- Actions ---
const goToStep2 = async (product) => {
  selectedProduct.value = product
  selectedItems.value = []
  batchPage.value = 0
  currentStep.value = 2
  await fetchBatches(product.productId)
}

const goToStep3 = async (batch) => {
  selectedProductionDate.value = batch.productionDate
  selectedItems.value = []
  itemPage.value = 0
  currentStep.value = 3
  await fetchItems(batch.productionDate)
}


const isAllSelected = computed(() => {
    return granularItems.value.length > 0 && selectedItems.value.length === granularItems.value.length
})

const toggleAll = () => {
    if (isAllSelected.value) {
        selectedItems.value = []
    } else {
        selectedItems.value = granularItems.value.map(i => i.serialCode)
    }
}

const toggleItemSelection = (item) => {
    const isSelected = selectedItems.value.includes(item.serialCode)
    // 박스 단위 선택 로직: 동일한 boxCode를 가진 상품들을 찾아서 처리
    // 단, boxCode가 없는 경우는 개별 상품으로 처리
    const sameBoxItems = item.boxCode 
        ? granularItems.value.filter(i => i.boxCode === item.boxCode)
        : [item]
    
    const boxSerials = sameBoxItems.map(i => i.serialCode)
    
    if (isSelected) {
        // 이미 선택된 경우 박스 전체 해제
        selectedItems.value = selectedItems.value.filter(s => !boxSerials.includes(s))
    } else {
        // 선택되지 않은 경우 박스 전체 추가
        const newSelected = [...selectedItems.value]
        boxSerials.forEach(s => {
            if (!newSelected.includes(s)) {
                newSelected.push(s)
            }
        })
        selectedItems.value = newSelected
    }
}

const requestDisposal = async () => {
    const selectedIds = granularItems.value
        .filter(i => selectedItems.value.includes(i.serialCode))
        .map(i => i.inventoryId)
    
    if (selectedIds.length === 0) return
    if (!confirm(`선택한 ${selectedIds.length}개 제품을 폐기 처리하시겠습니까?`)) return

    try {
        await api.post('/hq/inventory/disposal', {
            actorType: 'FACTORY',
            actorId: 1, // 공장 아이디 고정
            inventoryIds: selectedIds
        })
        alert('폐기 처리가 완료되었습니다.')
        selectedItems.value = []
        await fetchItems(selectedProductionDate.value)
        await fetchProducts()
    } catch (e) {
        console.error('폐기 처리 실패:', e)
        alert('폐기 처리에 실패했습니다.')
    }
}

// --- Popup Logic ---
const lookupProduct = () => {
    foundProduct.value = products.value.find(p => p.productCode === settingForm.value.productCode)
    if (foundProduct.value) {
        settingForm.value.safeStock = foundProduct.value.safeStock
    }
}

const openPasswordPopup = (e) => {
    e.stopPropagation()
    showPasswordPopup.value = true
    adminPassword.value = ''
}

const closePopup = () => {
    showPasswordPopup.value = false
}

const checkPassword = async () => {
    try {
        const res = await api.post('/hq/inventory/verify-password', { password: adminPassword.value })
        if (res.data.data) {
            showPasswordPopup.value = false
            showSettingsPopup.value = true
        } else {
            alert('비밀번호가 틀렸습니다.')
        }
    } catch (e) {
        console.error('비밀번호 확인 실패:', e)
        alert('비밀번호 확인 중 오류가 발생했습니다.')
    }
}

const closeSettingsPopup = () => {
    showSettingsPopup.value = false
    settingForm.value = { productCode: '', safeStock: 50 }
    foundProduct.value = null
}

const saveSettings = async () => {
    if (!foundProduct.value) return
    try {
        await api.post('/hq/inventory/set/safety-stock', {
            productId: foundProduct.value.productId,
            safetyStock: settingForm.value.safeStock
        })
        alert('안전재고 설정이 변경되었습니다.')
        await fetchProducts()
        closeSettingsPopup()
    } catch (e) {
        alert('저장에 실패했습니다.')
        console.error(e)
    }
}

const resetSettings = async () => {
    if (!foundProduct.value) return
    if (!confirm('이 상품의 안전재고를 자동 계산 방식으로 초기화하시겠습니까?')) return

    try {
        await api.post(`/hq/inventory/reset/safety-stock/${foundProduct.value.productId}`)
        alert('안전재고가 시스템 산식에 따라 초기화되었습니다.')
        await fetchProducts()
        closeSettingsPopup()
    } catch (e) {
        console.error('초기화 실패:', e)
        alert('안전재고 초기화에 실패했습니다.')
    }
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
.filter-group input, .filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  width: 100%;
}
.search-btn {
  background: var(--text-dark);
  color: white;
  border: none;
  padding: 0.6rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 42px;
}
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
.danger-text { color: #e53e3e; font-weight: 800; }
.alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.toggle-alert-btn { background: none; border: none; font-size: 0.85rem; color: #718096; cursor: pointer; text-decoration: underline; }
.alert-summary { font-size: 0.95rem; color: #c53030; margin-bottom: 0.5rem; }
.pl-2 { padding-left: 0.5rem; }

.mt-3 { margin-top: 0.75rem; }
.pt-3 { padding-top: 0.75rem; }
.border-top-dashed { border-top: 1px dashed #fed7d7; }

/* Data Table */
.data-table-card { 
    background: white; 
    border-radius: 16px; 
    border: 1px solid var(--border-color); 
    overflow-x: auto; /* 가로 스크롤 허용 */
}
.data-table { 
    width: 100%; 
    border-collapse: collapse; 
    min-width: 1000px; /* 창이 좁아져도 가로 형태 유지 */
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-badge.safe { background: #e6fffa; color: #2c7a7b; }
.status-badge.warning { background: #fffaf0; color: #dd6b20; }
.status-badge.danger { background: #fff5f5; color: #e53e3e; }
.status-badge.sold { background: #edf2f7; color: #4a5568; }
.status-badge.expiring { background: #fef3c7; color: #92400e; }
.status-badge.shipping { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

.icon-btn {
  background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: 0.5rem;
}

.action-btn.primary {
  background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;
}

/* Modal/Popup Styles */
.popup-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.popup-content {
  background: white; padding: 2rem; border-radius: 12px; width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.popup-content h3 { margin-top: 0; }
.popup-content input {
  width: 100%; padding: 0.75rem; margin: 1rem 0; border: 1px solid var(--border-color); border-radius: 6px;
}
.popup-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.popup-actions button {
  padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); background: white; cursor: pointer;
}
.popup-actions button.primary { background: var(--primary); color: white; border-color: var(--primary); }

.setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.setting-row input { width: 80px; margin: 0; }

.mb-1 { margin-bottom: 1rem; }
.modal-hint { font-size: 0.9rem; color: #64748b; margin-top: -1rem; margin-bottom: 1.5rem; }
.found-product-info { background: #f0f9ff; padding: 0.75rem; border-radius: 6px; color: #0369a1; font-size: 0.9rem; margin-bottom: 1rem; border: 1px solid #bae6fd; }
.error-text { color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; }

.bottom-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.soldout-wrap { margin-top: 1rem; }
.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }
.expiry-wrap { margin-bottom: 1rem; }

.filter-section.mini { padding: 1rem; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; }
.filter-section.mini .filter-group { min-width: 120px; }
.filter-section.mini input { padding: 0.4rem 0.75rem; font-size: 0.85rem; }

/* Redesign Specific Styles */
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; color: var(--text-dark); transition: all 0.2s; }
.back-btn:hover { background: #f8fafc; border-color: var(--text-light); }
.selected-info h3 { margin: 0; font-size: 1.4rem; color: var(--text-dark); font-weight: 800; }
.sub-info { color: #64748b; font-weight: 500; font-size: 1.1rem; margin-left: 0.75rem; }
.sub-code { color: var(--text-light); font-weight: 500; font-size: 1rem; margin-left: 0.5rem; }
.production-tag { background: var(--primary); color: white; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem; margin-left: 1rem; vertical-align: middle; }
.number-cell { font-variant-numeric: tabular-nums; font-weight: 600; }

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
  .priority-head { flex-wrap: wrap; }
  .stock-cell { min-width: 140px; }
}
</style>
