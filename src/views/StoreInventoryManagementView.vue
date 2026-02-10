<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>재고 관리</h2>
    </div>

    <!-- Filter Section (3 Columns) -->
    <div class="filter-section">
      <div class="filter-group">
        <label>제품 코드</label>
        <select v-model="filter.productCode">
          <option value="">전체</option>
          <option value="RO01">RO01 (로제 순한맛)</option>
          <option value="RO02">RO02 (로제 기본맛)</option>
          <option value="OR01">OR01 (오리지널 순한맛)</option>
          <option value="OR02">OR02 (오리지널 기본맛)</option>
        </select>
      </div>
      <div class="filter-group">
        <label>제품 이름</label>
        <select v-model="filter.productName">
          <option value="">전체</option>
          <option value="로제 순한맛">로제 순한맛</option>
          <option value="로제 기본맛">로제 기본맛</option>
          <option value="오리지널 순한맛">오리지널 순한맛</option>
          <option value="오리지널 기본맛">오리지널 기본맛</option>
        </select>
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
            <td>{{ item.portion }}인분</td>
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
      <button class="action-btn primary" @click="createOrder">발주 생성</button>
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
        <div v-for="item in inventory" :key="item.productCode" class="setting-row">
          <label>{{ item.productName }} ({{ item.productCode }})</label>
          <input type="number" v-model="item.safeStock" min="0" />
        </div>
        <div class="popup-actions">
          <button @click="closeSettingsPopup">닫기</button>
          <button class="primary" @click="saveSettings">저장</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

// Mock Data
const inventory = ref([
  { productCode: 'RO011', productName: '로제 순한맛', quantity: 50, portion: 1, safeStock: 10 },
  { productCode: 'RO012', productName: '로제 순한맛', quantity: 2, portion: 2, safeStock: 10 }, // Danger
  { productCode: 'RO021', productName: '로제 기본맛', quantity: 30, portion: 1, safeStock: 10 },
  { productCode: 'RO022', productName: '로제 기본맛', quantity: 8, portion: 2, safeStock: 10 }, // Warning
  { productCode: 'OR011', productName: '오리지널 순한맛', quantity: 100, portion: 1, safeStock: 20 },
  { productCode: 'OR012', productName: '오리지널 순한맛', quantity: 15, portion: 2, safeStock: 5 },
  { productCode: 'OR021', productName: '오리지널 기본맛', quantity: 0, portion: 1, safeStock: 10 }, // Danger
  { productCode: 'OR022', productName: '오리지널 기본맛', quantity: 8, portion: 2, safeStock: 10 } // Warning
])

// Logic for Status Label
const getStatusLabel = (qty, safe) => {
  if (qty <= 0) return '품절'
  if (qty < safe * 0.3) return '위험' // < 30% of Safe Stock
  if (qty < safe) return '부족'
  return '안전'
}

const getStatusClass = (qty, safe) => {
  if (qty <= 0) return 'sold'
  if (qty < safe * 0.3) return 'danger'
  if (qty < safe) return 'warning'
  return 'safe'
}

const filteredInventory = computed(() => {
  return inventory.value.filter(item => {
    const matchCode = !filter.value.productCode || item.productCode.startsWith(filter.value.productCode)
    const matchName = !filter.value.productName || item.productName === filter.value.productName
    
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
  return inventory.value.filter(item => item.quantity < item.safeStock)
})

// Actions
const createOrder = () => {
  alert('발주 생성 페이지로 이동합니다 (구현 예정)')
}

const goToDetail = (code) => {
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
}

const saveSettings = () => {
  alert('안전재고 설정이 저장되었습니다.')
  showSettingsPopup.value = false
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
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 200px; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group select {
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

.bottom-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
</style>
