<template>
  <div class="logistics-list-container">
    <div class="list-header">
      <div class="header-left">
        <h1>업체 및 차량 조회</h1>
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
      <button @click="router.push({ name: 'logistics-registration', query: { type: activeTab === 'companies' ? 'company' : 'vehicle' } })" class="btn-register-link">
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
          <select v-model="companySearchFields.status" @change="fetchCompanies" class="filter-select">
            <option :value="null">상태: 전체</option>
            <option value="ACTIVE">활성</option>
            <option value="INACTIVE">비활성</option>
          </select>
          <select v-model="companySearchFields.usableRegion" @change="fetchCompanies" class="filter-select">
            <option :value="null">지역: 전체</option>
            <option value="SEOUL">서울</option>
            <option value="GYEONGGI">경기</option>
            <option value="INCHEON">인천</option>
            <option value="GANGWON">강원</option>
            <option value="CHUNGNAM">충남</option>
            <option value="CHUNGBUK">충북</option>
            <option value="DAEJEON">대전</option>
            <option value="SEJONG">세종</option>
            <option value="JEONNAM">전남</option>
            <option value="JEONBUK">전북</option>
            <option value="GWANGJU">광주</option>
            <option value="GYEONGNAM">경남</option>
            <option value="GYEONGBUK">경북</option>
            <option value="BUSAN">부산</option>
            <option value="DAEGU">대구</option>
            <option value="ULSAN">울산</option>
            <option value="JEJU">제주</option>
          </select>
          <div class="input-with-label">
            <label>최대 단가</label>
            <input 
              type="number" 
              v-model.number="companySearchFields.unitPrice" 
              @input="fetchCompanies"
              placeholder="0 (이하)"
              class="filter-input-small"
            >
          </div>
        </div>
        <div class="filter-actions">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="companySearchFields.companyName" 
              @input="fetchCompanies"
              placeholder="업체명 검색"
            >
          </div>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="companySearchFields.manager" 
              @input="fetchCompanies"
              placeholder="담당자 검색"
            >
          </div>
          <button @click="resetFilters" class="btn-reset-filters" title="필터 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            초기화
          </button>
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
              <th>운송 단가 (원)</th>
              <th>차량수</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="company in companies" 
              :key="company.id" 
              :class="{ 'inactive-row': company.status === 'INACTIVE' }"
              @click="openDetail('company', company)"
              class="clickable-row"
            >
              <td class="name-cell">{{ company.companyName }}</td>
              <td>{{ company.manager }}</td>
              <td>{{ company.officePhone }}</td>
              <td>{{ getRegionLabel(company.usableRegion) }}</td>
              <td class="cost-cell">{{ company.unitPrice?.toLocaleString() }}</td>
              <td>{{ company.ownedVehicles }}대</td>
              <td>
                <span :class="['status-badge', getStatusClass(company.status)]">
                  {{ getStatusLabel(company.status) }}
                </span>
              </td>
              <td @click.stop>
                <div class="row-actions">
                  <button
                    v-if="!company.status || ['ACTIVE', 'active'].includes(company.status)"
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
                    v-else-if="['INACTIVE', 'inactive'].includes(company.status)"
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
                    v-if="!company.status || !['DELETED', 'deleted'].includes(company.status)"
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
          <select v-model="vehicleSearchFields.status" @change="fetchVehicles" class="filter-select">
            <option :value="null">상태: 전체</option>
            <option value="ACTIVE">운행가능</option>
            <option value="INACTIVE">비활성</option>
          </select>
          <select v-model="vehicleSearchFields.dispatchable" @change="fetchVehicles" class="filter-select">
            <option :value="null">배차: 전체</option>
            <option value="AVAILABLE">배차 가능</option>
            <option value="UNAVAILABLE">배차 불가</option>
            <option value="DISPATCHED">배차 중</option>
          </select>
          <select v-model="vehicleSearchFields.vehicleType" @change="fetchVehicles" class="filter-select">
            <option :value="null">종류: 전체</option>
            <option value="CARGO">카고</option>
            <option value="WING_BODY">윙바디</option>
            <option value="REFRIGERATED_TOP">냉동탑차</option>
            <option value="CHILLED_TOP">냉장탑차</option>
            <option value="CONTAINER">컨테이너 캐리어</option>
          </select>
          <div class="input-with-label">
            <label>최소 적재량(kg)</label>
            <input 
              type="number" 
              v-model.number="vehicleSearchFields.maxLoad" 
              @input="fetchVehicles"
              placeholder="0 (이상)"
              class="filter-input-small"
            >
          </div>
        </div>
        <div class="filter-actions">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="vehicleSearchFields.companyName" 
              @input="fetchVehicles"
              placeholder="소속 업체 검색"
            >
          </div>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="vehicleSearchFields.vehicleNumber" 
              @input="fetchVehicles"
              placeholder="차량번호 검색"
            >
          </div>
          <button @click="resetFilters" class="btn-reset-filters" title="필터 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            초기화
          </button>
        </div>
      </div>
      <div class="table-container fixed-height">
        <table class="logistics-table">
          <thead>
            <tr>
              <th>차량 번호</th>
              <th>소속 업체</th>
              <th>차량 종류</th>
              <th>최대 적재량(kg)</th>
              <th>배차 상태</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="vehicle in vehicles" 
              :key="vehicle.id" 
              :class="{ 'inactive-row': vehicle.status === 'INACTIVE' }"
              @click="openDetail('vehicle', vehicle)"
              class="clickable-row"
            >
              <td class="name-cell">{{ vehicle.vehicleNumber }}</td>
              <td>{{ getCompanyName(vehicle.transportId) }}</td>
              <td>{{ getVehicleTypeText(vehicle.vehicleType) }}</td>
              <td>{{ vehicle.maxLoad }}kg</td>
              <td>
                <span :class="['status-badge', getDispatchStatusClass(vehicle.dispatchable)]">
                  {{ getDispatchLabel(vehicle.dispatchable) }}
                </span>
              </td>
              <td>
                <span :class="['status-badge', getStatusClass(vehicle.status)]">
                  {{ getStatusLabel(vehicle.status, 'vehicle') }}
                </span>
              </td>
              <td @click.stop>
                <div class="row-actions">
                  <button
                    v-if="!vehicle.status || ['ACTIVE', 'active'].includes(vehicle.status)"
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
                    v-else-if="['INACTIVE', 'inactive'].includes(vehicle.status)"
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
                    v-if="!vehicle.status || !['DELETED', 'deleted'].includes(vehicle.status)"
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
      @delete="({ type, data }) => { confirmHardDelete(type, data); isDetailModalOpen = false; }"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LogisticsDetailModal from './LogisticsDetailModal.vue'
import api from '@/api/index'

const router = useRouter()
const route = useRoute()
const activeTab = ref('companies')

// 업체 검색 필드
const companySearchFields = reactive({
  companyName: '',
  manager: '',
  unitPrice: null,
  usableRegion: null,
  status: null
})

// 차량 검색 필드
const vehicleSearchFields = reactive({
  companyName: '',
  vehicleNumber: '',
  vehicleType: null,
  maxLoad: null,
  dispatchable: null,
  status: null
})

const companies = ref([])
const vehicles = ref([])
const allCompaniesForSelect = ref([]) // 차량 필터용 업체 목록

const getCompanyName = (transportId) => {
  const company = allCompaniesForSelect.value.find(c => c.id === transportId)
  return company ? company.companyName : '알 수 없음'
}

onMounted(async () => {
  await fetchAllCompaniesForSelect() // 필터용 데이터 먼저 로드
  await fetchCompanies()
  await fetchVehicles()
})

// 전체 업체 목록 (차량 소속 업체 필터용)
const fetchAllCompaniesForSelect = async () => {
  try {
    const res = await api.get('/transport/vendors?size=1000') // 페이징 없이 전체를 가져오고 싶지만 일단 size 크게
    if (res.data.success) {
      const rawData = res.data.data
      allCompaniesForSelect.value = rawData?.content || (Array.isArray(rawData) ? rawData : [])
    }
  } catch (err) {
    console.error(err)
  }
}

// 업체 목록 조회 (백엔드 필터링)
let companyTimeout = null
const fetchCompanies = async () => {
  if (companyTimeout) clearTimeout(companyTimeout)
  companyTimeout = setTimeout(async () => {
    try {
      const params = {}
      if (companySearchFields.companyName) params.companyName = companySearchFields.companyName
      if (companySearchFields.manager) params.manager = companySearchFields.manager
      if (companySearchFields.unitPrice) params.unitPrice = companySearchFields.unitPrice
      if (companySearchFields.usableRegion) params.usableRegion = companySearchFields.usableRegion
      if (companySearchFields.status) params.status = companySearchFields.status

      const response = await api.get('/transport/vendors', { params: { ...params, size: 1000 } })
      if (response.data.success) {
        const rawData = response.data.data
        companies.value = rawData?.content || (Array.isArray(rawData) ? rawData : [])
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err)
    }
  }, 300)
}

// 차량 목록 조회 (백엔드 필터링)
let vehicleTimeout = null
const fetchVehicles = async () => {
  if (vehicleTimeout) clearTimeout(vehicleTimeout)
  vehicleTimeout = setTimeout(async () => {
    try {
      const params = {}
      if (vehicleSearchFields.companyName) params.companyName = vehicleSearchFields.companyName
      if (vehicleSearchFields.vehicleNumber) params.vehicleNumber = vehicleSearchFields.vehicleNumber
      if (vehicleSearchFields.vehicleType) params.vehicleType = vehicleSearchFields.vehicleType
      if (vehicleSearchFields.maxLoad) params.maxLoad = vehicleSearchFields.maxLoad
      if (vehicleSearchFields.dispatchable) params.dispatchable = vehicleSearchFields.dispatchable
      if (vehicleSearchFields.status) params.status = vehicleSearchFields.status

      const response = await api.get('/transport/vehicles', { params: { ...params, size: 1000 } })
      if (response.data.success) {
        const rawData = response.data.data
        vehicles.value = rawData?.content || (Array.isArray(rawData) ? rawData : [])
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
    }
  }, 300)
}

// 상세 모달 상태
const isDetailModalOpen = ref(false)
const modalType = ref('company')
const selectedData = ref(null)

const openDetail = async (type, data) => {
  modalType.value = type
  try {
    const endpoint = type === 'company' ? `/transport/vendors/${data.id}` : `/transport/vehicles/${data.id}`
    const response = await api.get(endpoint)
    if (response.data.success) {
      let detailData = response.data.data
      if (type === 'vehicle') {
        detailData = { ...detailData, companyNameText: getCompanyName(detailData.transportId) }
      }
      selectedData.value = detailData
      isDetailModalOpen.value = true
    }
  } catch (err) {
    console.error('Failed to fetch detail:', err)
    alert('상세 정보를 불러오는 데 실패했습니다.')
  }
}

const getVehicleTypeText = (type) => {
  const types = {
    'CARGO': '카고',
    'WING_BODY': '윙바디',
    'REFRIGERATED_TOP': '냉동탑차',
    'CHILLED_TOP': '냉장탑차',
    'CONTAINER': '컨테이너 캐리어'
  }
  return types[type] || type
}

const getStatusLabel = (status, type = 'company') => {
  switch(status) {
    case 'ACTIVE': case 'active': return type === 'vehicle' ? '운행가능' : '활성'
    case 'INACTIVE': case 'inactive': return '비활성'
    case 'DELETED': case 'deleted': return '삭제'
    default: return type === 'vehicle' ? '운행가능' : '활성'
  }
}

const getRegionLabel = (region) => {
  const regions = {
    SEOUL: '서울', GYEONGGI: '경기', INCHEON: '인천', GANGWON: '강원',
    CHUNGNAM: '충남', CHUNGBUK: '충북', DAEJEON: '대전', SEJONG: '세종',
    JEONNAM: '전남', JEONBUK: '전북', GWANGJU: '광주',
    GYEONGNAM: '경남', GYEONGBUK: '경북', BUSAN: '부산',
    DAEGU: '대구', ULSAN: '울산', JEJU: '제주'
  }
  return regions[region] || region || '-'
}

const getDispatchLabel = (status) => {
  const labels = {
    'AVAILABLE': '배차 가능',
    'UNAVAILABLE': '배차 불가',
    'DISPATCHED': '배차 완료'
  }
  return labels[status] || status
}

const getDispatchStatusClass = (status) => {
  const classes = {
    'AVAILABLE': 'active',
    'UNAVAILABLE': 'inactive',
    'DISPATCHED': 'normal'
  }
  return classes[status] || ''
}
const getStatusClass = (status) => {
  switch(status) {
    case 'ACTIVE': case 'active': return 'active'
    case 'INACTIVE': case 'inactive': return 'inactive'
    case 'DELETED': case 'deleted': return 'deleted'
    default: return 'active'
  }
}

// 필터 리셋
const resetFilters = () => {
  if (activeTab.value === 'companies') {
    Object.assign(companySearchFields, {
      companyName: '',
      manager: '',
      unitPrice: null,
      usableRegion: null,
      status: null
    })
    fetchCompanies()
  } else {
    Object.assign(vehicleSearchFields, {
      companyName: '',
      vehicleNumber: '',
      vehicleType: null,
      maxLoad: null,
      dispatchable: null,
      status: null
    })
    fetchVehicles()
  }
}

const handleSave = async ({ type, data }) => {
  try {
    if (type === 'company') {
      await api.patch(`/transport/vendors/${data.id}`, data)
      await fetchCompanies()
      // 업체가 비활성화된 경우 등을 고려하여 차량 목록도 리프레시
      await fetchVehicles()
    } else {
      await api.patch(`/transport/vehicles/${data.id}`, data)
      await fetchVehicles()
    }
    isDetailModalOpen.value = false
    alert('수정이 완료되었습니다.')
  } catch (err) {
    console.error('Failed to save:', err)
    const errorMsg = err.response?.data?.message || '수정 중 오류가 발생했습니다.'
    alert(errorMsg)
  }
}

const deleteItem = async (type, id) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 비활성화하시겠습니까?`)) {
    try {
      if (type === 'company') {
        await api.patch(`/transport/vendors/${id}/status`, { status: 'INACTIVE' })
        await fetchCompanies()
        await fetchVehicles() // 업체 비활성화 시 소속 차량 상태 연동을 위해
      } else {
        await api.patch(`/transport/vehicles/${id}/status`, { status: 'INACTIVE' })
        await fetchVehicles()
      }
      alert(`${targetName}가 비활성화되었습니다.`)
    } catch (err) {
      console.error(err)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }
}

const restoreItem = async (type, id) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 다시 활성화하시겠습니까?`)) {
    try {
      if (type === 'company') {
        await api.patch(`/transport/vendors/${id}/status`, { status: 'ACTIVE' })
        await fetchCompanies()
      } else {
        await api.patch(`/transport/vehicles/${id}/status`, { status: 'ACTIVE' })
        await fetchVehicles()
      }
    } catch (err) {
      console.error('Failed to restore:', err)
      const errorMsg = err.response?.data?.message || '다시 활성화하는 중 오류가 발생했습니다.'
      alert(errorMsg)
    }
  }
}

const confirmHardDelete = async (type, item) => {
  const targetName = type === 'company' ? '운송 업체' : '차량'
  const name = type === 'company' ? item.companyName : item.vehicleNumber
  if (confirm(`'${name}' ${targetName}를 삭제하시겠습니까? 삭제된 정보는 복구할 수 없습니다.`)) {
    try {
      if (type === 'company') {
        await api.delete(`/transport/vendors/${item.id}`)
        await fetchCompanies()
      } else {
        await api.delete(`/transport/vehicles/${item.id}`)
        await fetchVehicles()
      }
      alert(`${targetName}가 삭제되었습니다.`)
    } catch (err) {
      console.error(err)
    }
  }
}

</script>

<style scoped>
.logistics-list-container {
  padding: 1.5rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.list-header {
  margin-bottom: 2rem;
}

.header-left h1 { font-size: 1.5rem; font-weight: 500; color: #0f172a; margin-bottom: 0.5rem; }
.subtitle { color: #64748b; font-size: 1rem; }

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
  background: white;
  padding: 1.25rem;
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

.filter-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.filter-select {
  height: 42px;
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
  height: 42px;
  padding: 0.6rem 1rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
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
  height: 42px;
  padding: 0.6rem 0.85rem 0.6rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
  background: white;
}

.search-box input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.input-with-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
}

.input-with-label label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.filter-input-small {
  width: 80px;
  border: none;
  padding: 0.6rem 0;
  height: 40px;
  font-size: 0.9rem;
  outline: none;
}

.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
}

.logistics-table { 
  width: 100%; 
  border-collapse: collapse;
}

.logistics-table th, .logistics-table td {
  padding: 1rem 0.75rem;
  font-size: 0.95rem;
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
  font-weight: 500;
  font-size: 0.9rem;
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
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.8rem;
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
