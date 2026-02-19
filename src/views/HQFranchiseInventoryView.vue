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

        <!-- Safety Stock & Expiration Alert Section (Collapsible) -->
        <div v-if="lowStockItems.length > 0 || expiringItems.length > 0" class="alert-section">
            <div class="alert-header">
                <div class="alert-title">⚠ 재고 경고 알림</div>
                <button v-if="hasMoreAlerts" class="toggle-alert-btn" @click="toggleAlertExpand">
                    {{ isAlertExpanded ? '접기 ▲' : '더보기 ▼' }}
                </button>
            </div>
            
            <!-- Summary Header when Collapsed -->
            <div v-if="!isAlertExpanded" class="alert-summary pl-2">
                <span v-if="expiringItems.length > 0">유통기한 임박 <strong>{{ expiringItems.length }}건</strong></span>
                <span v-if="lowStockItems.length > 0 && expiringItems.length > 0" class="mx-2">|</span>
                <span v-if="lowStockItems.length > 0">안전재고 부족 <strong>{{ lowStockItems.length }}건</strong></span>
            </div>

            <!-- Detailed Lists (Only when Expanded) -->
            <template v-if="isAlertExpanded">
                <!-- Expiration Alert -->
                <div v-if="expiringItems.length > 0" class="expiration-warning" style="border-top: none; padding-top: 0; margin-top: 0; margin-bottom: 1rem;">
                    <div class="sub-alert-title">⏳ 유통기한 임박 (3일 이내)</div>
                    <ul>
                        <li v-for="group in expiringItems" :key="group.key">
                            <strong>{{ group.productName }}</strong> ({{ group.productionDate }} 제조) - <span class="danger-text">{{ group.count }}개</span>가 {{ group.daysLeft }}일 후 만료됩니다.
                        </li>
                    </ul>
                </div>

                <!-- Low Stock -->
                <div v-if="lowStockItems.length > 0" :class="{ 'mt-3 pt-3 border-top-dashed': expiringItems.length > 0 }">
                    <div class="sub-alert-title">⚠️ 안전재고 부족</div>
                    <ul>
                        <li v-for="item in lowStockItems" :key="item.productCode">
                            <strong>{{ item.productName }}</strong> ({{item.productCode}}): 재고 <span class="danger-text">{{ item.quantity }}</span> (안전재고: {{item.safeStock}})
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
                <label>제조일자</label>
                <input type="date" v-model="step3Filter.productionDate" />
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
                            <span :class="['status-item-badge', item.status === 'AVAILABLE' ? 'available' : 'return_pending']">
                                {{ item.status === 'AVAILABLE' ? '가용' : '반품 대기' }}
                            </span>
                        </td>
                        <td>{{ item.shippingDate || '-' }}</td>
                        <td>{{ item.arrivalTime || '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </template>
    </div>

    <!-- Store Select Modal -->
    <div v-if="showStoreModal" class="modal-overlay">
      <div class="modal-content">
        <h3>가맹점 선택</h3>
        <div class="modal-body">
            <input type="text" v-model="storeSearch" placeholder="가맹점 이름 검색..." class="store-search-input" />
            <ul class="store-list scrollable">
                <li v-for="store in filteredStores" :key="store.code" @click="selectStore(store)">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Store Selection Logic
const showStoreModal = ref(true) // Open by default initially? Or false? User said "Pop window first"
const selectedStore = ref(null)
const storeSearch = ref('')

const stores = ref([
    { name: '서울 강남점', code: 'SE01' },
    { name: '서울 서초점', code: 'SE02' },
    { name: '서울 송파점', code: 'SE03' },
    { name: '서울 마포점', code: 'SE04' },
    { name: '서울 영등포점', code: 'SE05' }
])

const filteredStores = computed(() => {
    return stores.value.filter(s => s.name.includes(storeSearch.value) || s.code.includes(storeSearch.value))
})

const openStoreSelectModal = () => {
    showStoreModal.value = true
}

const selectStore = (store) => {
    selectedStore.value = store
    showStoreModal.value = false
    generateMockInventory() // Regenerate inventory for this store (Mock)
}

// Inventory Logic
const currentStep = ref(1)
const selectedProduct = ref(null)
const selectedProductionDate = ref(null)
const isAlertExpanded = ref(false)

const toggleAlertExpand = () => {
    isAlertExpanded.value = !isAlertExpanded.value
}

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

const products = ref([])
const inventoryItems = ref([]) // Granular items


const generateMockInventory = () => {
    // Reset steps
    currentStep.value = 1
    selectedProduct.value = null

    const pList = []
    const iList = []
    const types = [ { code: 'OR', name: '오리지널 떡볶이 밀키트' }, { code: 'RO', name: '로제 떡볶이 밀키트' }, { code: 'MA', name: '마라 떡볶이 밀키트' } ]
    const spices = [ { code: '01', name: '순한맛' }, { code: '02', name: '기본맛' } ]
    const sizes = [ { code: '01', name: '1~2인분', portion: 1 }, { code: '03', name: '3~4인분', portion: 3 } ]

    // Force dates to trigger expiration (Today is 02-19, Mfg 02-06~02-08 triggers 14-day limit)
    const dates = ['2026-02-01', '2026-02-07', '2026-02-10'] 
    const storeCode = selectedStore.value.code
    const regionCode = 'UL01'
    const factoryCode = 'FA01'
    const productionLines = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9']

    types.forEach((t, tIdx) => {
        spices.forEach((s, sIdx) => {
            sizes.forEach((sz, szIdx) => {
                const code = `${t.code}${s.code}${sz.code}`
                const name = `${t.name} ${s.name} ${sz.name.replace('~', ',')}`
                
                // Force safeStock to be high for the first item to trigger low stock alert
                const safe = (tIdx === 0 && sIdx === 0 && szIdx === 0) ? 200 : 10
                let totalQty = 0

                dates.forEach(d => {
                    const line = productionLines[Math.floor(Math.random() * productionLines.length)]
                    
                    const batchQty = 25 
                    totalQty += batchQty

                    const boxStatuses = {} 

                    for(let i=0; i<batchQty; i++) {
                        const boxIndex = Math.floor(i/20) + 1
                        const itemIndex = (i % 20) + 1
                        const boxCode = `${storeCode}-${factoryCode}-${line}-${code}-${boxIndex.toString().padStart(3, '0')}`
                        const serialCode = `${regionCode}-${factoryCode}-${line}-${code}-${boxIndex.toString().padStart(3, '0')}-${itemIndex.toString().padStart(2, '0')}`

                        if (boxStatuses[boxIndex] === undefined) {
                            boxStatuses[boxIndex] = 'AVAILABLE'
                        }

                        iList.push({
                            serialCode: serialCode,
                            boxCode: boxCode,
                            productCode: code,
                            productionDate: d,
                            shippingDate: '2026-02-11',
                            arrivalTime: '2026-02-12',
                            status: boxStatuses[boxIndex]
                        })
                    }
                })

                pList.push({
                    productCode: code,
                    productName: name,
                    quantity: totalQty,
                    portion: sz.portion,
                    safeStock: safe
                })
            })
        })
    })
    products.value = pList
    inventoryItems.value = iList
}

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

const sortedBatches = computed(() => {
    if (!selectedProduct.value) return []
    const dates = {}
    inventoryItems.value
        .filter(i => i.productCode === selectedProduct.value.productCode)
        .forEach(i => {
            if (!dates[i.productionDate]) {
                dates[i.productionDate] = { total: 0, available: 0, pending: 0 }
            }
            dates[i.productionDate].total++
            if (i.status === 'AVAILABLE') dates[i.productionDate].available++
            else dates[i.productionDate].pending++
        })
    
    return Object.entries(dates)
        .map(([date, counts]) => ({ productionDate: date, ...counts }))
        .sort((a, b) => a.productionDate.localeCompare(b.productionDate)) // FIFO
})

// Expiration Logic: Mfg Date + 14 Days
const expiringItems = computed(() => {
    const today = new Date()
    const alertList = []

    // Group by Product & MfgDate
    const groups = {}

    inventoryItems.value.forEach(item => {
        if (item.status !== 'AVAILABLE') return

        const mfg = new Date(item.productionDate)
        const exp = new Date(mfg)
        exp.setDate(mfg.getDate() + 14) // +14 Days Expiration policy
        
        const diffTime = exp - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 3 && diffDays >= 0) {
            const key = `${item.productCode}-${item.productionDate}`
            if (!groups[key]) {
                const prod = products.value.find(p => p.productCode === item.productCode)
                groups[key] = {
                    key,
                    productName: prod ? prod.productName : item.productCode,
                    productionDate: item.productionDate,
                    count: 0,
                    daysLeft: diffDays
                }
            }
            groups[key].count++
        }
    })
    // 3개만 보이게 제한 (보여주기 식)
    return Object.values(groups).slice(0, 3)
})

const hasMoreAlerts = computed(() => {
    return lowStockItems.value.length > 0 || expiringItems.value.length > 0
})

const granularItems = computed(() => {
    if (!selectedProduct.value || !selectedProductionDate.value) return []
    return inventoryItems.value.filter(i => {
        const matchProduct = i.productCode === selectedProduct.value.productCode && i.productionDate === selectedProductionDate.value
        
        const matchSerial = !step3Filter.value.serialCode || i.serialCode.includes(step3Filter.value.serialCode)
        const matchBox = !step3Filter.value.boxCode || i.boxCode.includes(step3Filter.value.boxCode)
        const matchProdDate = !step3Filter.value.productionDate || i.productionDate === step3Filter.value.productionDate
        const matchShipDate = !step3Filter.value.shippingDate || i.shippingDate === step3Filter.value.shippingDate
        const matchInboundDate = !step3Filter.value.inboundDate || i.arrivalTime === step3Filter.value.inboundDate

        return matchProduct && matchSerial && matchBox && matchProdDate && matchShipDate && matchInboundDate
    })
})

const goToStep2 = (product) => {
    selectedProduct.value = product
    currentStep.value = 2
}

const goToStep3 = (batch) => {
    selectedProductionDate.value = batch.productionDate
    currentStep.value = 3
}

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
.status-item-badge.return_pending { background: #fff5f5; color: #e53e3e; }


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
