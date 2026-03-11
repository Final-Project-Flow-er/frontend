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
        </div>

        <!-- Safety Stock Alert Section -->
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
                            <strong>{{ item.productName }} ({{ item.productCode }})</strong>의 재고가 
                            <span class="danger-text">{{ item.quantity }}</span>개 남았습니다. 
                            (안전재고: {{ item.safeStock }})
                        </li>
                    </ul>
                </div>
            </template>
        </div>
        <div v-else class="alert-section safe">
            <div class="alert-title">✅ 모든 제품의 안전재고가 충분합니다.</div>
        </div>

        <!-- Expiration Alert Section -->
        <div v-if="expirationItems.length > 0" class="alert-section expiration">
            <div class="alert-header">
                <div class="alert-title">⏳ 유통기한 임박 알림</div>
                <button class="toggle-alert-btn" @click="isExpirationExpanded = !isExpirationExpanded">
                    {{ isExpirationExpanded ? '접기 ▲' : '더보기 ▼' }}
                </button>
            </div>
            
            <!-- Summary Header when Collapsed -->
            <div v-if="!isExpirationExpanded" class="alert-summary pl-2">
                <span>유통기한 임박 <strong>{{ expirationItems.length }}건</strong></span>
            </div>

            <!-- Detailed List -->
            <template v-else>
                <div class="mt-3 pt-3 border-top-dashed">
                    <ul>
                        <li v-for="item in expirationItems" :key="item.manufactureDate + item.productName">
                            <strong>{{ item.productName }}</strong> 제조일 {{ item.manufactureDate }} 배치
                            (<span class="danger-text">{{ item.quantity }}</span>개)
                            — 유통기한까지 <span class="danger-text">{{ item.daysUntilExpiration }}일</span> 남음
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
                <th>
                안전재고
                <button class="icon-btn" @click="openPasswordPopup" title="안전재고 설정">⚙️</button>
                </th>
                <th>상태</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in filteredProducts" :key="item.productCode" @click="goToStep2(item)" class="clickable-row">
                <td class="sku-cell">{{ item.productCode }}</td>
                <td class="name-cell">{{ item.productName }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.portion === 1 ? '1~2인분' : '3~4인분' }}</td>
                <td>{{ item.safeStock }}</td>
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
                    <tr v-for="batch in sortedBatches" :key="batch.productionDate" @click="goToStep3(batch)" class="clickable-row">
                        <td>{{ batch.productionDate }}</td>
                        <td class="number-cell">{{ batch.quantity }}</td>
                    </tr>
                </tbody>
            </table>
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
                        <th>배송완료 일자</th>
                        <th>입고 완료 일자</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in granularItems" :key="item.serialCode">
                        <td><input type="checkbox" :value="item.serialCode" v-model="selectedItems" /></td>
                        <td class="sku-cell">{{ item.serialCode }}</td>
                        <td>{{ item.boxCode || '-' }}</td>
                        <td>{{ item.shippingDate || '-' }}</td>
                        <td>{{ item.arrivalTime || '-' }}</td>
                    </tr>
                </tbody>
            </table>
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
          <button class="warning" @click="resetSettings" :disabled="!foundProduct" style="background-color:#f0ad4e; color:white; border:none; border-radius:4px; padding:0.5rem 1rem;">초기화</button>
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
        
        // lowStockItems는 이제 프론트엔드 computed에서 직접 계산하므로(가맹점 화면과 통일)
        // 백엔드 API에서 받아오는 safetyStockAlerts 부분 생략
        
        expirationItems.value = (data.expirationAlerts || []).map(e => ({
            productName: e.productName,
            manufactureDate: e.manufactureDate,
            quantity: e.quantity,
            daysUntilExpiration: e.daysUntilExpiration
        }))
    } catch (e) {
        console.error('알림 조회 실패', e)
    }
}

const fetchBatches = async (productId) => {
    try {
        const res = await api.get(`/hq/inventory/batches/${productId}`)
        batches.value = (res.data.data || [])
            .map(b => ({
                productionDate: b.manufactureDate,
                quantity: b.totalQuantity
            }))
            .sort((a, b) => a.productionDate.localeCompare(b.productionDate))
    } catch (e) {
        console.error('배치 조회 실패', e)
    }
}

const fetchItems = async (manufactureDate) => {
    try {
        const res = await api.get('/hq/inventory/items', {
            params: {
                productId: selectedProduct.value.productId,
                manufactureDate
            }
        })
        allItems.value = (res.data.data || []).map(item => ({
            inventoryId: item.inventoryId,
            serialCode: item.serialCode,
            boxCode: item.boxCode,
            productionDate: manufactureDate,
            shippingDate: item.shippedAt ? item.shippedAt.substring(0, 10) : null,
            arrivalTime: item.receivedAt ? item.receivedAt.substring(0, 10) : null
        }))
    } catch (e) {
        console.error('아이템 조회 실패', e)
    }
}

onMounted(() => {
    fetchProducts()
    fetchAlerts()
})

// --- Status Helpers ---
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

// --- Computed ---

const lowStockItems = computed(() => {
    return products.value.filter(item => item.quantity <= item.safeStock)
})

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
    currentStep.value = 2
    await fetchBatches(product.productId)
}

const goToStep3 = async (batch) => {
    selectedProductionDate.value = batch.productionDate
    selectedItems.value = []
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
        await fetchAlerts()
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
        await fetchAlerts()
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
.data-table th { text-align: center; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); text-align: center; }
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9; }

.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { font-weight: 600; }

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
</style>
