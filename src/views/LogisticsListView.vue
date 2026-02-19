<template>
  <div class="logistics-list-container">
    <div class="list-header">
      <div class="header-left">
        <h1>업체 및 차량 조회</h1>
        <p class="subtitle">협력 운송 업체 정보 및 배송 차량을 관리하세요</p>
      </div>
    </div>

    <!-- 탭 전환 + 신규 등록 -->
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
            <option value="deleted">삭제</option>
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
            placeholder="업체명 또는 담당자 검색"
          >
        </div>
      </div>
      <div class="table-container fixed-height">
        <table class="logistics-table">
          <thead>
            <tr>
              <th>업체명</th>
              <th>담당자명</th>
              <th>업체 연락처</th>
              <th>주력 지역</th>
              <th>운송 단가</th>
              <th>차량수</th>
              <th>계약 시작일</th>
              <th>계약 종료일</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="company in filteredCompanies" 
              :key="company.id" 
              :class="{ 'inactive-row': company.status === 'inactive' }"
              @click="openDetail('company', company)"
              class="clickable-row"
            >
              <td class="name-cell">{{ company.name }}</td>
              <td>{{ company.managerName }}</td>
              <td>{{ company.phone }}</td>
              <td>{{ company.mainRegion }}</td>
              <td class="cost-cell">{{ company.costPerKm.toLocaleString() }}</td>
              <td>{{ company.vehicleCount }}대</td>
              <td>{{ company.contractStart }}</td>
              <td>{{ company.contractEnd }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(company.status)]">
                  {{ getStatusLabel(company.status) }}
                </span>
              </td>
              <td @click.stop>
                <div class="row-actions">
                  <button
                    v-if="company.status === 'active' || !company.status"
                    @click="deleteItem('company', company.id)"
                    class="btn-icon-action deactivate"
                    title="비활성화"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </button>
                  <button
                    v-else-if="company.status === 'inactive'"
                    @click="restoreItem('company', company.id)"
                    class="btn-icon-action restore"
                    title="복구"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                  </button>
                  <button
                    v-if="company.status !== 'deleted'"
                    @click="confirmHardDelete('company', company)"
                    class="btn-icon-action delete"
                    title="삭제"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
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
            <option value="frozen">냉동탑차</option>
            <option value="normal">카고/일반탑차</option>
            <option value="wingbody">윙바디</option>
            <option value="bike">이륜차</option>
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
            placeholder="차량번호 또는 운전자 검색"
          >
        </div>
      </div>
      <div class="table-container fixed-height">
        <table class="logistics-table">
          <thead>
            <tr>
              <th>차량 번호</th>
              <th>소속 업체</th>
              <th>차량 종류</th>
              <th>최대 적재량</th>
              <th>운전자명</th>
              <th>운전자 연락처</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="vehicle in filteredVehicles" 
              :key="vehicle.id" 
              :class="{ 'inactive-row': vehicle.status === 'inactive' }"
              @click="openDetail('vehicle', vehicle)"
              class="clickable-row"
            >
              <td class="code-cell">{{ vehicle.vehicleNo }}</td>
              <td>{{ vehicle.company }}</td>
              <td>{{ getVehicleTypeText(vehicle.vehicleType) }}</td>
              <td>{{ vehicle.maxLoad }}</td>
              <td>{{ vehicle.driverName }}</td>
              <td>{{ vehicle.driverPhone }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(vehicle.status)]">
                  {{ getStatusLabel(vehicle.status, 'vehicle') }}
                </span>
              </td>
              <td @click.stop>
                <div class="row-actions">
                  <button
                    v-if="vehicle.status === 'active' || !vehicle.status"
                    @click="deleteItem('vehicle', vehicle.id)"
                    class="btn-icon-action deactivate"
                    title="비활성화"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </button>
                  <button
                    v-else-if="vehicle.status === 'inactive'"
                    @click="restoreItem('vehicle', vehicle.id)"
                    class="btn-icon-action restore"
                    title="복구"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                  </button>
                  <button
                    v-if="vehicle.status !== 'deleted'"
                    @click="confirmHardDelete('vehicle', vehicle)"
                    class="btn-icon-action delete"
                    title="삭제"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 통합 상세/수정 모달 -->
    <LogisticsDetailModal 
      :is-open="isDetailModalOpen"
      :type="modalType"
      :data="selectedData"
      @close="isDetailModalOpen = false"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LogisticsDetailModal from './LogisticsDetailModal.vue'

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
  { id: 1, name: 'CJ대한통운', phone: '02-123-4567', managerName: '홍길동', address: '서울특별시 중구', costPerKm: 2500, mainRegion: '전국', vehicleCount: 150, contractStart: '2024-01-01', contractEnd: '2024-12-31', status: 'active' },
  { id: 2, name: '한진택배', phone: '02-987-6543', managerName: '김철수', address: '서울특별시 용산구', costPerKm: 2300, mainRegion: '수도권', vehicleCount: 80, contractStart: '2024-02-15', contractEnd: '2024-10-15', status: 'active' },
  { id: 3, name: '롯데글로벌로지스', phone: '02-456-7890', managerName: '이영희', address: '서울특별시 송파구', costPerKm: 2600, mainRegion: '전국', vehicleCount: 120, contractStart: '2024-02-20', contractEnd: '2025-02-20', status: 'inactive' }
])

const vehicles = ref([
  { id: 1, vehicleNo: '12가 3456', company: 'CJ대한통운', vehicleType: 'frozen', maxLoad: '1.2t', driverName: '박철호', driverPhone: '010-1111-2222', status: 'active' },
  { id: 2, vehicleNo: '56나 7890', company: '한진택배', vehicleType: 'frozen', maxLoad: '2.5t', driverName: '최민수', driverPhone: '010-3333-4444', status: 'active' },
  { id: 3, vehicleNo: '24다 1357', company: '자체 배송팀', vehicleType: 'normal', maxLoad: '1.0t', driverName: '정우성', driverPhone: '010-5555-6666', status: 'inactive' }
])

// 상세 모달 상태
const isDetailModalOpen = ref(false)
const modalType = ref('company')
const selectedData = ref(null)

const openDetail = (type, data) => {
  modalType.value = type
  selectedData.value = data
  isDetailModalOpen.value = true
}

const getVehicleTypeText = (type) => {
  const types = {
    'frozen': '냉동탑차',
    'normal': '카고/일반탑차',
    'wingbody': '윙바디',
    'bike': '이륜차'
  }
  return types[type] || type
}

const getStatusLabel = (status, type = 'company') => {
  switch(status) {
    case 'active': return type === 'vehicle' ? '운행가능' : '활성'
    case 'inactive': return '비활성'
    case 'deleted': return '삭제'
    default: return type === 'vehicle' ? '운행가능' : '활성'
  }
}

const getStatusClass = (status) => {
  switch(status) {
    case 'active': return 'active'
    case 'inactive': return 'inactive'
    case 'deleted': return 'deleted'
    default: return 'active'
  }
}

const filteredCompanies = computed(() => {
  let result = companies.value
  
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.status === statusFilter.value)
  }

  if (regionFilter.value !== 'all') {
    result = result.filter(c => c.mainRegion === regionFilter.value)
  }

  if (costFilter.value !== 'all') {
    if (costFilter.value === 'low') result = result.filter(c => c.costPerKm < 2500)
    else if (costFilter.value === 'normal') result = result.filter(c => c.costPerKm >= 2500 && c.costPerKm <= 3000)
    else if (costFilter.value === 'high') result = result.filter(c => c.costPerKm > 3000)
  }
  
  if (companySearch.value) {
    const query = companySearch.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.managerName.toLowerCase().includes(query)
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
    result = result.filter(v => v.vehicleType === typeFilter.value)
  }

  if (tonnageFilter.value !== 'all') {
    result = result.filter(v => v.maxLoad === tonnageFilter.value)
  }
  
  if (vehicleSearch.value) {
    const query = vehicleSearch.value.toLowerCase()
    result = result.filter(v => 
      v.vehicleNo.toLowerCase().includes(query) || 
      v.driverName.toLowerCase().includes(query) || 
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
  isDetailModalOpen.value = false
  alert('수정이 완료되었습니다.')
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

const confirmHardDelete = (type, item) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  const name = type === 'company' ? item.name : item.vehicleNo
  if (confirm(`'${name}' ${targetName}를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.`)) {
    item.status = 'deleted'
    alert(`${targetName}가 삭제되었습니다.`)
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
  margin-bottom: 1.25rem;
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
  margin-bottom: 0.5rem;
}
.btn-register-link:hover { background: #1e293b; transform: translateY(-1px); }

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
}

.logistics-table th, .logistics-table td {
  padding: 1rem 0.75rem;
  font-size: 0.85rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
}

/* 첫 번째/마지막 컬럼 여백 대칭 */
.logistics-table th:first-child,
.logistics-table td:first-child {
  padding-left: 2rem;
}

.logistics-table th:last-child,
.logistics-table td:last-child {
  padding-right: 2rem;
}

.logistics-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.clickable-row { cursor: pointer; transition: background 0.1s; }
.clickable-row:hover { background: #f8fafc; }

.inactive-row {
  background: #fdfdfd;
  opacity: 0.7;
}

.code-cell { color: #020617; font-family: 'Courier New', Courier, monospace; }
.name-cell { color: #0f172a; }
.cost-cell { color: #1e293b; }

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  display: inline-block;
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.normal { background: #e0f2fe; color: #0369a1; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }
.status-badge.deleted { background: #fee2e2; color: #b91c1c; }

.row-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-icon-action.deactivate {
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

.btn-icon-action.deactivate:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-icon-action.delete {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fee2e2;
}

.btn-icon-action.delete:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

.btn-icon-action.restore {
  background: #f0fdf4;
  color: #15803d;
  border-color: #bbf7d0;
}

.btn-icon-action.restore:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
