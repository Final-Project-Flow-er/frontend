<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 재고 관리</h2>
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

      <!-- No Alerts -->
      <div v-if="lowStockItems.length === 0 && expiringItems.length === 0" class="alert-section safe">
        <div class="alert-title">✅ 모든 재고가 안전하며, 임박한 상품이 없습니다.</div>
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
                <button class="icon-btn" @click.stop="openPasswordPopup" title="안전재고 설정">⚙️</button>
              </th>
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

      <!-- Bottom Actions -->
      <div class="bottom-actions">
        <button class="action-btn primary" @click="createOrder">발주 생성</button>
      </div>
    </template>

    <!-- Step 2: FIFO Summary (Batch List) -->
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
          <label>입고 일자</label>
          <input type="date" v-model="step3Filter.arrivalTime" />
        </div>
      </div>

      <div class="data-table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input type="checkbox" @change="toggleAllInStep3" :checked="isAllSelectedInStep3" />
              </th>
              <th>제품 식별 코드</th>
              <th>박스 코드</th>
              <th>상태</th>
              <th>배송완료 일자</th>
              <th>입고 일자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in granularItems" :key="item.serialCode">
              <td>
                <input type="checkbox" :checked="selectedItems.includes(item.serialCode)" @change="toggleItemSelection(item)" />
              </td>
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
            <tr v-if="granularItems.length === 0">
              <td colspan="6" class="empty-cell">조회된 상세 제품이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Actions -->
      <div class="bottom-actions" v-if="selectedItems.length > 0">
        <button class="action-btn disposal" @click="requestDisposal">폐기 처리 ({{ selectedItems.length }}개)</button>
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
          <label>상품 코드</label>
          <input type="text" v-model="settingForm.productCode" placeholder="예: OR0101" @input="lookupProduct" />
        </div>
        
        <div v-if="foundProduct" class="found-product-info">
          <strong>찾은 상품:</strong> {{ foundProduct.productName }}
        </div>
        <div v-else-if="settingForm.productCode && !foundProduct" class="error-text">
          해당 코드를 가진 상품을 찾을 수 없습니다.
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/index'

const router = useRouter()

// View State
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
  shippingDate: '',
  arrivalTime: ''
})

// Popups state
const showPasswordPopup = ref(false)
const showSettingsPopup = ref(false)
const adminPassword = ref('')
const settingForm = ref({ productCode: '', safeStock: 10 })
const foundProduct = ref(null)

const lookupProduct = () => {
    foundProduct.value = products.value.find(p => p.productCode === settingForm.value.productCode)
    if (foundProduct.value) {
        settingForm.value.safeStock = foundProduct.value.safeStock
    }
}

// Data Store
const products = ref([])
const inventoryItems = ref([])

onMounted(async () => {
    await fetchProducts()
})

const fetchProducts = async () => {
    try {
        const res = await api.get('/franchise/inventory') // Principal 사용하므로 id 불필요
        const data = res.data.data || []
        products.value = data.map(p => ({
            productId: p.productId,
            productCode: p.productCode,
            productName: p.productName,
            quantity: p.totalQuantity,
            portion: p.size === '01' ? 1 : 3,
            safeStock: p.safetyStock || 0,
            status: p.status
        }))
        await fetchAlerts()
    } catch (e) {
        console.error('가맹점 재고 데이터 조회 실패:', e)
        products.value = []
    }
}

const fetchAlerts = async () => {
    try {
        const res = await api.get('/franchise/inventory/alerts')
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

// Logic for Status Label
const getStatusLabel = (qty, safe) => {
  if (qty <= 0) return '품절'
  if (qty <= safe - 10) return '위험'
  if (qty <= safe) return '부족'
  return '안전'
}

const getStatusClass = (qty, safe) => {
  if (qty <= 0) return 'sold'
  if (qty <= safe - 10) return 'danger'
  if (qty <= safe) return 'warning'
  return 'safe'
}

// Step 1 Compute
const filteredProducts = computed(() => {
  return products.value.filter(item => {
    const matchCode = !filter.value.productCode || item.productCode.includes(filter.value.productCode)
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

// Step 2 Compute -> API 연동
const sortedBatches = ref([])

const fetchBatches = async (productId) => {
    try {
        const res = await api.get(`/franchise/inventory/batches/${productId}`)
        sortedBatches.value = (res.data.data || []).map(b => ({
            productionDate: b.manufactureDate,
            total: b.totalQuantity,
            available: b.availableQuantity,
            pending: b.returnPending
        }))
    } catch (e) {
        console.error('중분류(제조일별) 조회 실패:', e)
        sortedBatches.value = []
    }
}

// Step 3 Compute -> API 연동
const granularItems = ref([])

const fetchItems = async () => {
	if (!selectedProduct.value || !selectedProductionDate.value) return
	try {
		const requestBody = {
			productId: selectedProduct.value.productId,
			manufactureDate: selectedProductionDate.value
		}
		if (step3Filter.value.serialCode) requestBody.serialCode = step3Filter.value.serialCode
		if (step3Filter.value.boxCode) requestBody.boxCode = step3Filter.value.boxCode
		if (step3Filter.value.shippingDate) requestBody.shippedAt = step3Filter.value.shippingDate
		if (step3Filter.value.arrivalTime) requestBody.receivedAt = step3Filter.value.arrivalTime

		const res = await api.post('/franchise/inventory/items', requestBody)
		granularItems.value = (res.data.data || []).map(i => {
			const rawStatus = i.status || '';
			const parsedStatus = rawStatus.includes('.') ? rawStatus.split('.').pop() : rawStatus;
			return {
				inventoryId: i.inventoryId,
				serialCode: i.serialCode,
				boxCode: i.boxCode,
				status: parsedStatus,
				shippingDate: i.shippedAt ? i.shippedAt.split('T')[0] : null,
				arrivalTime: i.receivedAt ? i.receivedAt.split('T')[0] : null
			};
		})
	} catch (e) {
		console.error('소분류(바코드별) 조회 실패:', e)
		granularItems.value = []
	}
}

watch(step3Filter, () => {
    if (currentStep.value === 3) {
        fetchItems()
    }
}, { deep: true })

// Selection Logic
const isAllSelectedInStep3 = computed(() => {
    return granularItems.value.length > 0 && granularItems.value.every(item => selectedItems.value.includes(item.serialCode))
})

const toggleAllInStep3 = () => {
    if (isAllSelectedInStep3.value) {
        // Deselect all visible items
        const serialsToRemove = granularItems.value.map(i => i.serialCode)
        selectedItems.value = selectedItems.value.filter(s => !serialsToRemove.includes(s))
    } else {
        // Select all visible items
        granularItems.value.forEach(item => {
            if (!selectedItems.value.includes(item.serialCode)) {
                selectedItems.value.push(item.serialCode)
            }
        })
    }
}

const toggleItemSelection = (item) => {
    const isSelected = selectedItems.value.includes(item.serialCode)
    // Business Rule: Return is BOX-based. Selecting one selects the whole box.
    const boxItems = inventoryItems.value.filter(i => i.boxCode === item.boxCode)
    const boxSerials = boxItems.map(i => i.serialCode)
    
    if (isSelected) {
        // Deselect whole box
        selectedItems.value = selectedItems.value.filter(s => !boxSerials.includes(s))
    } else {
        // Select whole box
        const newSelected = [...selectedItems.value]
        boxSerials.forEach(s => {
            if (!newSelected.includes(s)) {
                newSelected.push(s)
            }
        })
        selectedItems.value = newSelected
    }
}

// Actions
const createOrder = () => {
  router.push('/franchise/orders/create')
}

const goToStep2 = async (product) => {
    selectedProduct.value = product
    await fetchBatches(product.productId)
    currentStep.value = 2
    selectedItems.value = [] // Reset selection when moving
}

const goToStep3 = async (batch) => {
    selectedProductionDate.value = batch.productionDate
    await fetchItems()
    currentStep.value = 3
}

const requestDisposal = async () => {
	const selectedIds = granularItems.value
		.filter(i => selectedItems.value.includes(i.serialCode))
		.map(i => i.inventoryId)
	if (selectedIds.length === 0) return
	if (!confirm(`선택한 ${selectedIds.length}개 제품을 폐기 처리하시겠습니까?`)) return
	try {
		await api.post('/franchise/inventory/disposal', {
			actorType: 'FRANCHISE',
			actorId: null,
			inventoryIds: selectedIds
		})
		alert('폐기 처리가 완료되었습니다.')
		selectedItems.value = []
		await fetchItems()
		await fetchProducts()
	} catch (e) {
		console.error('폐기 처리 실패:', e)
		alert('폐기 처리에 실패했습니다.')
	}
}

// Popup Logic
const openPasswordPopup = () => {
  showPasswordPopup.value = true
  adminPassword.value = ''
}

const closePopup = () => {
  showPasswordPopup.value = false
}

const checkPassword = async () => {
	try {
		const res = await api.post('/franchise/inventory/verify-password', { password: adminPassword.value })
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
  settingForm.value = { productCode: '', safeStock: 10 }
  foundProduct.value = null
}

const saveSettings = async () => {
  const item = products.value.find(p => p.productCode === settingForm.value.productCode)
  if (item) {
      try {
        await api.post('/franchise/inventory/set/safety-stock', {
            productId: item.productId,
            safetyStock: settingForm.value.safeStock
        })
        item.safeStock = settingForm.value.safeStock
        alert('안전재고 설정이 저장되었습니다.')
        closeSettingsPopup()
      } catch (e) {
        console.error('안전재고 변경 실패:', e)
        alert('안전재고 변경에 실패했습니다.')
      }
  }
}

const resetSettings = async () => {
  const item = products.value.find(p => p.productCode === settingForm.value.productCode)
  if (item) {
      if (!confirm('이 상품의 안전재고를 자동 계산 방식으로 초기화하시겠습니까?')) return
      try {
        await api.post(`/franchise/inventory/reset/safety-stock/${item.productId}`)
        alert('안전재고가 시스템 산식에 따라 초기화되었습니다.')
        
        // 데이터 다시 불러오기
        await fetchProducts()
        await fetchAlerts()
        closeSettingsPopup()
      } catch (e) {
        console.error('초기화 실패:', e)
        alert('안전재고 초기화에 실패했습니다.')
      }
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


/* Data Table */
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: center; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); color: var(--text-dark); text-align: center; }
.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f1f5f9; }

.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { font-weight: 600; }
.number-cell { font-variant-numeric: tabular-nums; font-weight: 600; }

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

.checkbox-col { width: 50px; text-align: center; }
input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }

.icon-btn {
  background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: 0.5rem;
}

.action-btn {
  padding: 0.75rem 2rem; border-radius: 8px; font-weight: 700; cursor: pointer; border: none;
}
.action-btn.primary { background: var(--primary); color: white; }
.action-btn.danger { background: #e53e3e; color: white; margin-left: auto; }

/* Modal/Popup Styles */
.popup-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.popup-content {
  background: white; padding: 2rem; border-radius: 12px; width: 400px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.popup-content h3 { margin-top: 0; font-weight: 700; }
.popup-content input {
  width: 100%; padding: 0.75rem; margin: 1rem 0; border: 1px solid var(--border-color); border-radius: 6px;
}
.popup-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
.popup-actions button {
  padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-weight: 600;
}
.popup-actions button.primary { background: var(--primary); color: white; border-color: var(--primary); }

.mb-1 { margin-bottom: 1rem; }
.modal-hint { font-size: 0.9rem; color: #64748b; margin-top: -1rem; margin-bottom: 1.5rem; }
.found-product-info { background: #f0f9ff; padding: 0.75rem; border-radius: 6px; color: #0369a1; font-size: 0.9rem; margin-bottom: 1rem; border: 1px solid #bae6fd; }
.error-text { color: #ef4444; font-size: 0.85rem; margin-bottom: 1rem; }

.bottom-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; gap: 1rem; }

/* Redesign Specific Styles */
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--border-color); padding-bottom: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 700; color: var(--text-dark); transition: all 0.2s; }
.back-btn:hover { background: #f8fafc; border-color: var(--text-light); }
.selected-info h3 { margin: 0; font-size: 1.4rem; color: var(--text-dark); font-weight: 800; }
.sub-info { color: #64748b; font-weight: 500; font-size: 1.1rem; margin-left: 0.75rem; }

.number-cell.available { color: #166534; }
.number-cell.pending { color: #991b1b; }

.filter-section.mini { padding: 1rem; gap: 1rem; margin-bottom: 1rem; background: #f8fafc; }
.filter-section.mini .filter-group { min-width: 120px; }
.filter-section.mini input { padding: 0.4rem 0.75rem; font-size: 0.85rem; }

.status-item-badge { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
.status-item-badge.available { background: #dcfce7; color: #166534; }
.status-item-badge.return_wait { background: #fee2e2; color: #991b1b; }
.status-item-badge.expired { background: #fef3c7; color: #92400e; }

.empty-cell { text-align: center; color: #94a3b8; padding: 3rem !important; }
</style>
