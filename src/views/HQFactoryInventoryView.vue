<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 공장 재고 관리</h2>
    </div>

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
          <option value="SAFE">안전 (SAFE)</option>
          <option value="WARNING">부족 (WARNING)</option>
          <option value="DANGER">위험 (DANGER)</option>
        </select>
      </div>

    </div>

    <!-- Safety Stock Alert Section -->
    <div v-if="lowStockItems.length > 0" class="alert-section">
      <div class="alert-title">⚠ 안전재고 부족 알림</div>
      <ul>
        <li v-for="item in lowStockItems" :key="item.productCode">
          <strong>{{ item.productName }} ({{ item.productCode }})</strong>의 재고가 
          <span class="danger-text">{{ item.quantity }}</span>개 남았습니다. 
          (안전재고: {{ item.safeStock }})
        </li>
      </ul>
    </div>
    <div v-else class="alert-section safe">
      <div class="alert-title">✅ 모든 재고가 안전합니다.</div>
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>제품 코드</th>
            <th>제품 이름</th>
            <th>수량</th>
            <th>인분</th>
            <th>
              안전재고
              <button class="icon-btn" @click="openPasswordPopup" title="안전재고 설정">⚙️</button>
            </th>
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

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <!-- HQ might check Inventory but not Order from here? Or Order from Factory? Leaving for now -->
      <!-- <button class="action-btn primary" @click="createOrder">발주 생성</button> -->
    </div>

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

        <div class="popup-actions">
          <button @click="closeSettingsPopup">닫기</button>
          <button class="primary" @click="saveSettings" :disabled="!foundProduct">저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = ref({
  productCode: '',
  productName: '',
  status: ''
})

// Popups state
const showPasswordPopup = ref(false)
const showSettingsPopup = ref(false)
const adminPassword = ref('')
const settingForm = ref({ productCode: '', safeStock: 50 })
const foundProduct = ref(null)

const lookupProduct = () => {
    foundProduct.value = inventory.value.find(p => p.productCode === settingForm.value.productCode)
    if (foundProduct.value) {
        settingForm.value.safeStock = foundProduct.value.safeStock
    }
}

// Mock Data
const inventory = ref([])

onMounted(() => {
    generateMockInventory()
})

const generateMockInventory = () => {
    const list = []
    const types = [
        { code: 'OR', name: '오리지널 떡볶이 밀키트' },
        { code: 'RO', name: '로제 떡볶이 밀키트' },
        { code: 'MA', name: '마라 떡볶이 밀키트' }
    ]
    const spices = [
        { code: '01', name: '순한맛' },
        { code: '02', name: '기본맛' },
        { code: '03', name: '매운맛' },
        { code: '04', name: '아주 매운맛' }
    ]
    const sizes = [
        { code: '01', name: '1~2인분', portion: 1 },
        { code: '03', name: '3~4인분', portion: 3 }
    ]

    types.forEach(t => {
        spices.forEach(s => {
            sizes.forEach(sz => {
                const code = `${t.code}${s.code}${sz.code}`
                const name = `${t.name} ${s.name} ${sz.name.replace('~', ',')}`
                
                // Random quantity for demo (Higher for Factory)
                const qty = Math.floor(Math.random() * 500) + 100
                const safe = 50

                list.push({
                    productCode: code,
                    productName: name,
                    quantity: qty,
                    portion: sz.portion,
                    safeStock: safe
                })
            })
        })
    })
    inventory.value = list
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

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchCode = !filter.value.productCode || item.productCode.startsWith(filter.value.productCode)
    const matchName = !filter.value.productName || item.productName.includes(filter.value.productName)
    
    // Status Filter Logic (Based on computed status)
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
  return inventory.value.filter(item => item.quantity <= item.safeStock)
})

// Actions
const createOrder = () => {
  alert('발주 생성 페이지로 이동합니다 (구현 예정)')
}

const goToDetail = (code) => {
    // HQ Factory Detail View? Reusing Store Detail for now or just log?
    // User didn't request separate Detail View for HQ Factory, so linking to Store Detail (might need permission check later)
    // Or maybe just show alert "상세 조회"
    // For now, let's just use the same detail view as it is generic enough
  router.push(`/store/inventory/${code}`)
}

// Popup Logic
const openPasswordPopup = (e) => {
  e.stopPropagation() // Prevent row click
  showPasswordPopup.value = true
  adminPassword.value = ''
}

const closePopup = () => {
  showPasswordPopup.value = false
}

const checkPassword = () => {
  if (adminPassword.value === '1234') {
    showPasswordPopup.value = false
    showSettingsPopup.value = true
  } else {
    alert('비밀번호가 틀렸습니다.')
  }
}

const closeSettingsPopup = () => {
  showSettingsPopup.value = false
  settingForm.value = { productCode: '', safeStock: 50 }
  foundProduct.value = null
}

const saveSettings = () => {
  const item = inventory.value.find(p => p.productCode === settingForm.value.productCode)
  if (item) {
      item.safeStock = settingForm.value.safeStock
      alert('안전재고 설정이 저장되었습니다.')
      closeSettingsPopup()
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

/* Data Table */
.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.25rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
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
</style>
