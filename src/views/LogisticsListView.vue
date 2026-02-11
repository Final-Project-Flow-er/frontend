<template>
  <div class="logistics-list-container">
    <div class="list-header">
      <div class="header-left">
        <h1>업체 및 차량 조회</h1>
        <p class="subtitle">협력 운송 업체 정보 및 배송 차량을 관리하세요</p>
      </div>
    </div>

    <!-- 탭 전환 + 신규 등록 (위치 하향 조정) -->
    <div class="tab-header-row">
      <div class="tab-menu">
        <button 
          @click="activeTab = 'companies'" 
          :class="['tab-btn', { active: activeTab === 'companies' }]"
        >
          운송 업체 ({{ companies.length }})
        </button>
        <button 
          @click="activeTab = 'vehicles'" 
          :class="['tab-btn', { active: activeTab === 'vehicles' }]"
        >
          배송 차량 ({{ vehicles.length }})
        </button>
      </div>
      <button @click="$router.push('/admin/logistics-registration')" class="btn-register-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>
        신규 등록
      </button>
    </div>

    <div v-if="activeTab === 'companies'" class="table-section fade-in">
      <div class="filter-bar">
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">상태: 전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <select v-model="regionFilter" class="filter-select">
            <option value="all">지역: 전체</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="강원">강원</option>
            <option value="충청">충청</option>
            <option value="전라">전라</option>
            <option value="경상">경상</option>
            <option value="제주">제주</option>
            <option value="전국">전국</option>
          </select>
          <select v-model="costFilter" class="filter-select">
            <option value="all">단가: 전체</option>
            <option value="low">2,500원 미만</option>
            <option value="normal">2,500원 ~ 3,000원</option>
            <option value="high">3,000원 초과</option>
          </select>
          <button @click="resetFilters" class="btn-reset-filters" title="필터 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            초기화
          </button>
        </div>
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="companySearch" 
            placeholder="업체명 또는 담당자 검색..."
          >
        </div>
      </div>
      <div class="table-container fixed-height">
      <table class="logistics-table">
        <thead>
          <tr>
            <th>업체명</th>
            <th>담당자 정보</th>
            <th>운송단가</th>
            <th>주력지역</th>
            <th>차량수</th>
            <th>계약 종료일</th>
            <th>상태</th>
            <th class="action-header">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in filteredCompanies" :key="company.id" :class="{ 'inactive-row': company.status === 'inactive' }">
            <td class="name-cell">{{ company.name }}</td>
            <td>
              <div class="contact-info">
                <span class="main-text">{{ company.manager }}</span>
                <span class="sub-text">{{ company.phone }}</span>
              </div>
            </td>
            <td class="cost-cell">{{ company.cost.toLocaleString() }}</td>
            <td>{{ company.region }}</td>
            <td>{{ company.vehicleCount }}대</td>
            <td>{{ company.contractEnd }}</td>
            <td>
              <span :class="['status-badge', company.status === 'active' ? 'active' : 'inactive']">
                {{ company.status === 'active' ? '활성' : '비활성' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button @click="editItem('company', company.id)" class="btn-icon-edit" title="수정">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button v-if="company.status === 'active'" @click="deleteItem('company', company.id)" class="btn-icon-delete" title="삭제">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                <button v-else @click="restoreItem('company', company.id)" class="btn-icon-restore" title="복구">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <div v-if="activeTab === 'vehicles'" class="table-section fade-in">
      <div class="filter-bar">
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">상태: 전체</option>
            <option value="active">운행가능</option>
            <option value="inactive">비활성</option>
          </select>
          <select v-model="companyFilter" class="filter-select">
            <option value="all">업체: 전체</option>
            <option v-for="company in uniqueCompanies" :key="company" :value="company">
              {{ company }}
            </option>
          </select>
          <select v-model="typeFilter" class="filter-select">
            <option value="all">종류: 전체</option>
            <option value="냉동탑차">냉동탑차</option>
            <option value="카고">카고/일반탑차</option>
            <option value="윙바디">윙바디</option>
            <option value="이륜차">이륜차</option>
          </select>
          <select v-model="tonnageFilter" class="filter-select">
            <option value="all">톤수: 전체</option>
            <option value="1t">1t</option>
            <option value="2.5t">2.5t</option>
            <option value="5t">5t</option>
            <option value="11t">11t</option>
          </select>
          <button @click="resetFilters" class="btn-reset-filters" title="필터 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            초기화
          </button>
        </div>
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            v-model="vehicleSearch" 
            placeholder="차량번호 또는 운전자 검색..."
          >
        </div>
      </div>
      <div class="table-container fixed-height">
      <table class="logistics-table">
        <thead>
          <tr>
            <th>차량 번호</th>
            <th>소속 업체</th>
            <th>종류</th>
            <th>톤수</th>
            <th>운전자 정보</th>
            <th>운행 지역</th>
            <th>상태</th>
            <th class="action-header">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vehicle in filteredVehicles" :key="vehicle.id" :class="{ 'inactive-row': vehicle.status === 'inactive' }">
            <td class="code-cell">{{ vehicle.no }}</td>
            <td>{{ vehicle.company }}</td>
            <td>{{ vehicle.type }}</td>
            <td>{{ vehicle.tonnage }}</td>
            <td>
              <div class="contact-info">
                <span class="main-text">{{ vehicle.driver }}</span>
                <span class="sub-text">{{ vehicle.phone }}</span>
              </div>
            </td>
            <td>{{ companies.find(c => c.name === vehicle.company)?.region || '전국' }}</td>
            <td>
              <span :class="['status-badge', vehicle.status === 'active' ? 'normal' : 'inactive']">
                {{ vehicle.status === 'active' ? '운행가능' : '비활성' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <button @click="editItem('vehicle', vehicle.id)" class="btn-icon-edit" title="수정">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button v-if="vehicle.status === 'active'" @click="deleteItem('vehicle', vehicle.id)" class="btn-icon-delete" title="삭제">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                <button v-else @click="restoreItem('vehicle', vehicle.id)" class="btn-icon-restore" title="복구">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <!-- 수정 모달 -->
    <LogisticsEditModal 
      :is-open="isEditModalOpen"
      :type="editType"
      :data="editData"
      @close="isEditModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LogisticsEditModal from './LogisticsEditModal.vue'

const router = useRouter()
const activeTab = ref('companies')
const statusFilter = ref('all')
const companySearch = ref('')
const vehicleSearch = ref('')
const regionFilter = ref('all')
const typeFilter = ref('all')
const tonnageFilter = ref('all')
const costFilter = ref('all')
const companyFilter = ref('all')

const uniqueCompanies = computed(() => {
  return [...new Set(vehicles.value.map(v => v.company))]
})

const companies = ref([
  { id: 1, name: 'CJ대한통운', phone: '02-123-4567', manager: '홍길동', address: '서울특별시 중구', cost: 2500, region: '전국', vehicleCount: 150, contractEnd: '2024-12-31', status: 'active' },
  { id: 2, name: '한진택배', phone: '02-987-6543', manager: '김철수', address: '서울특별시 용산구', cost: 2300, region: '수도권', vehicleCount: 80, contractEnd: '2024-10-15', status: 'active' },
  { id: 3, name: '롯데글로벌로지스', phone: '02-456-7890', manager: '이영희', address: '서울특별시 송파구', cost: 2600, region: '전국', vehicleCount: 120, contractEnd: '2025-02-20', status: 'inactive' }
])

const vehicles = ref([
  { id: 1, no: '12가 3456', company: 'CJ대한통운', type: '냉동탑차', tonnage: '1t', driver: '박철호', phone: '010-1111-2222', load: '1.2t', status: 'active' },
  { id: 2, no: '56나 7890', company: '한진택배', type: '냉동탑차', tonnage: '2.5t', driver: '최민수', phone: '010-3333-4444', load: '2.5t', status: 'active' },
  { id: 3, no: '24다 1357', company: '자체 배송팀', type: '카고', tonnage: '1t', driver: '정우성', phone: '010-5555-6666', load: '1.0t', status: 'inactive' }
])

// 수정 모달 상태
const isEditModalOpen = ref(false)
const editType = ref('company')
const editData = ref(null)

const filteredCompanies = computed(() => {
  let result = companies.value
  
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.status === statusFilter.value)
  }

  if (regionFilter.value !== 'all') {
    result = result.filter(c => c.region === regionFilter.value)
  }

  if (costFilter.value !== 'all') {
    if (costFilter.value === 'low') result = result.filter(c => c.cost < 2500)
    else if (costFilter.value === 'normal') result = result.filter(c => c.cost >= 2500 && c.cost <= 3000)
    else if (costFilter.value === 'high') result = result.filter(c => c.cost > 3000)
  }
  
  if (companySearch.value) {
    const query = companySearch.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.manager.toLowerCase().includes(query)
    )
  }
  
  return result
})

const filteredVehicles = computed(() => {
  let result = vehicles.value
  
  if (statusFilter.value !== 'all') {
    result = result.filter(v => v.status === statusFilter.value)
  }

  if (companyFilter.value !== 'all') {
    result = result.filter(v => v.company === companyFilter.value)
  }

  if (typeFilter.value !== 'all') {
    result = result.filter(v => v.type === typeFilter.value)
  }

  if (tonnageFilter.value !== 'all') {
    result = result.filter(v => v.tonnage === tonnageFilter.value)
  }
  
  if (vehicleSearch.value) {
    const query = vehicleSearch.value.toLowerCase()
    result = result.filter(v => 
      v.no.toLowerCase().includes(query) || 
      v.driver.toLowerCase().includes(query) || 
      v.company.toLowerCase().includes(query)
    )
  }
  
  return result
})

const resetFilters = () => {
  statusFilter.value = 'all'
  companySearch.value = ''
  vehicleSearch.value = ''
  regionFilter.value = 'all'
  typeFilter.value = 'all'
  tonnageFilter.value = 'all'
  costFilter.value = 'all'
  companyFilter.value = 'all'
}

const editItem = (type, id) => {
  editType.value = type
  if (type === 'company') {
    editData.value = companies.value.find(c => c.id === id)
  } else {
    editData.value = vehicles.value.find(v => v.id === id)
  }
  isEditModalOpen.value = true
}

const handleSave = ({ type, data }) => {
  if (type === 'company') {
    const idx = companies.value.findIndex(c => c.id === data.id)
    if (idx !== -1) {
      companies.value[idx] = { ...data }
    }
  } else {
    const idx = vehicles.value.findIndex(v => v.id === data.id)
    if (idx !== -1) {
      vehicles.value[idx] = { ...data }
    }
  }
  isEditModalOpen.value = false
  alert('수정되었습니다.')
}

const deleteItem = (type, id) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 비활성화하시겠습니까?`)) {
    if (type === 'company') {
      const idx = companies.value.findIndex(c => c.id === id)
      if (idx !== -1) companies.value[idx].status = 'inactive'
    } else {
      const idx = vehicles.value.findIndex(v => v.id === id)
      if (idx !== -1) vehicles.value[idx].status = 'inactive'
    }
  }
}

const restoreItem = (type, id) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 다시 활성화하시겠습니까?`)) {
    if (type === 'company') {
      const idx = companies.value.findIndex(c => c.id === id)
      if (idx !== -1) companies.value[idx].status = 'active'
    } else {
      const idx = vehicles.value.findIndex(v => v.id === id)
      if (idx !== -1) vehicles.value[idx].status = 'active'
    }
  }
}
</script>

<style scoped>
.logistics-list-container {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.list-header {
  margin-bottom: 1.25rem; /* 간격 축소 */
}

.header-left h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
.subtitle { color: #64748b; font-size: 0.95rem; }

.tab-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.tab-menu {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}
.tab-btn:hover { color: #64748b; }
.tab-btn.active { color: #0f172a; border-bottom-color: #0f172a; }

.btn-register-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem; /* 탭 선 위에 살짝 띄움 */
}
.btn-register-link:hover { background: #1e293b; transform: translateY(-1px); }

/* 테이블 영역 */
.table-section { display: flex; flex-direction: column; gap: 1.5rem; }

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  width: 100%;
  box-sizing: border-box;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.6rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #475569;
  background: white;
  outline: none;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover { border-color: #cbd5e1; }
.filter-select:focus { border-color: #0f172a; }

.btn-reset-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset-filters:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.logistics-table { 
  width: 100%; 
  border-collapse: collapse;
  table-layout: fixed; /* 레이아웃 강제 고정 */
}

.logistics-table th, .logistics-table td {
  padding: 1rem; /* 좌우 여백을 1rem으로 최적화하여 조밀하면서도 선에 붙지 않게 조정 */
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logistics-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

/* 8열 기준 완벽 대칭 레이아웃 (오른쪽 액션 칸이 붙지 않도록 비율 재조정) */
.logistics-table th:nth-child(1), .logistics-table td:nth-child(1) { width: 14%; }
.logistics-table th:nth-child(2), .logistics-table td:nth-child(2) { width: 16%; }
.logistics-table th:nth-child(3), .logistics-table td:nth-child(3) { width: 12%; }
.logistics-table th:nth-child(4), .logistics-table td:nth-child(4) { width: 11%; }
.logistics-table th:nth-child(5), .logistics-table td:nth-child(5) { width: 16%; }
.logistics-table th:nth-child(6), .logistics-table td:nth-child(6) { width: 12%; }
.logistics-table th:nth-child(7), .logistics-table td:nth-child(7) { width: 9%; }
.logistics-table th:nth-child(8), .logistics-table td:nth-child(8) { width: 10%; text-align: center; } /* 액션 너비 확대 */

.inactive-row {
  background: #fdfdfd;
  opacity: 0.7;
}

.code-cell { font-weight: 700; color: #020617; font-family: 'Courier New', Courier, monospace; }
.name-cell { font-weight: 600; color: #0f172a; }
.cost-cell { font-weight: 700; color: #1e293b; }

/* 상태 배지 */
.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.normal { background: #e0f2fe; color: #0369a1; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }

/* 액션 버튼 */
.row-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-edit, .btn-icon-delete, .btn-icon-restore {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-edit { color: #475569; }
.btn-icon-edit:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

.btn-icon-delete { color: #ef4444; }
.btn-icon-delete:hover { background: #fef2f2; border-color: #fee2e2; }

.btn-icon-restore { color: #10b981; }
.btn-icon-restore:hover { background: #ecfdf5; border-color: #d1fae5; }

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

</style>
