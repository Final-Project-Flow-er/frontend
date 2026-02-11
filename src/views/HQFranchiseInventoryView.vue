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

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-group">
          <label>상품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="예: OR0101" />
        </div>
        <div class="filter-group">
          <label>상품 이름</label>
          <input type="text" v-model="filter.productName" placeholder="상품 이름 입력" />
        </div>
        <div class="filter-group">
          <label>상태</label>
          <select v-model="filter.status">
            <option value="">전체</option>
            <option value="SAFE">안전 (SAFE)</option>
            <option value="WARNING">부족 (WARNING)</option>
            <option value="DANGER">위험 (DANGER)</option>
          </select>
        </div>
        <button class="search-btn">조회</button>
      </div>

      <!-- Data Table -->
      <div class="data-table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>상품 코드</th>
              <th>상품 이름</th>
              <th>수량</th>
              <th>인분</th>
              <th>안전재고</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredInventory" :key="item.productCode" @click="goToDetail(item.productCode)" class="clickable-row">
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
const filter = ref({
  productCode: '',
  productName: '',
  status: ''
})
const inventory = ref([])

const generateMockInventory = () => {
    // Generate random inventory for the selected store
    const list = []
    const types = [ { code: 'OR', name: '오리지널 떡볶이 밀키트' }, { code: 'RO', name: '로제 떡볶이 밀키트' }, { code: 'MA', name: '마라 떡볶이 밀키트' } ]
    const spices = [ { code: '01', name: '순한맛' }, { code: '02', name: '기본맛' } ]
    const sizes = [ { code: '01', name: '1~2인분', portion: 1 }, { code: '03', name: '3~4인분', portion: 3 } ]

    types.forEach(t => {
        spices.forEach(s => {
            sizes.forEach(sz => {
                const code = `${t.code}${s.code}${sz.code}`
                const name = `${t.name} ${s.name} ${sz.name.replace('~', ',')}`
                
                // Random quantity for demo
                const qty = Math.floor(Math.random() * 30) // Lower for store

                list.push({
                    productCode: code,
                    productName: name,
                    quantity: qty,
                    portion: sz.portion,
                    safeStock: 10
                })
            })
        })
    })
    inventory.value = list
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

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchCode = !filter.value.productCode || item.productCode.startsWith(filter.value.productCode)
    const matchName = !filter.value.productName || item.productName.includes(filter.value.productName)
    
    // Status Filter Logic
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
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
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
</style>
