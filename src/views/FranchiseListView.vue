<template>
  <div class="org-list-container">
    <div class="org-list-header">
      <h1>가맹점 조회</h1>
      <p class="subtitle">전체 가맹점의 운영 현황 및 정보를 조회합니다</p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>운영 상태</label>
          <select v-model="filters.status">
            <option value="all">전체</option>
            <option value="ACTIVE">운영중</option>
            <option value="INACTIVE">운영중지</option>
          </select>
        </div>

        <div class="filter-group">
          <label>지역</label>
          <select v-model="filters.region">
            <option value="all">전체</option>
            <option value="SEOUL">서울</option>
            <option value="GYEONGGI">경기</option>
            <option value="INCHEON">인천</option>
            <option value="BUSAN">부산</option>
            <option value="DAEGU">대구</option>
            <option value="DAEJEON">대전</option>
            <option value="GWANGJU">광주</option>
            <option value="ULSAN">울산</option>
            <option value="SEJONG">세종</option>
            <option value="GANGWON">강원</option>
            <option value="CHUNGBUK">충북</option>
            <option value="CHUNGNAM">충남</option>
            <option value="JEONBUK">전북</option>
            <option value="JEONNAM">전남</option>
            <option value="GYEONGBUK">경북</option>
            <option value="GYEONGNAM">경남</option>
            <option value="JEJU">제주</option>
          </select>
        </div>

        <div class="filter-group flex-grow">
          <label>검색</label>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              v-model="filters.searchQuery" 
              placeholder="매장명, 코드 등으로 검색"
            >
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>

      <div class="filter-row secondary">
        <div class="filter-group full-width">
          <label>운영 요일 필터</label>
          <div class="days-filter">
            <label v-for="day in weekDays" :key="day.value" class="day-check-chip" :class="{ active: filters.selectedDays.includes(day.value) }">
              <input type="checkbox" :value="day.value" v-model="filters.selectedDays">
              {{ day.label }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 가맹점 목록 테이블 -->
    <div v-if="displayedOrganizations.length > 0" class="org-table-container">
      <table class="org-table">
        <thead>
          <tr>
            <th>코드</th>
            <th>가맹점명</th>
            <th>대표자</th>
            <th>지역</th>
            <th>운영 요일</th>
            <th>경고 상태</th>
            <th>상태</th>
            <th>관리</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="org in displayedOrganizations" 
            :key="org.id"
            @click="goToDetail(org)"
            class="org-row"
          >
            <td class="org-code">{{ org.code }}</td>
            <td class="org-name">{{ org.name }}</td>
            <td>{{ org.representativeName }}</td>
            <td>
              <span class="region-badge">{{ getRegionLabel(org.region) }}</span>
            </td>
            <td>
              <div class="days-pills">
                <span v-for="day in weekDays" :key="day.value" 
                      class="day-pill" 
                      :class="{ active: (org.operatingDays || '').split(',').includes(day.value) }">
                  {{ day.label }}
                </span>
              </div>
            </td>
            <td>
              <span class="warning-badge" :class="{ 'warning-blocked': org.isReturnBlocked }">
                {{ org.isReturnBlocked ? '반품 제한' : '정상' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="org.status">
                {{ getStatusLabel(org.status) }}
              </span>
            </td>
            <td class="td-actions" @click.stop>
              <div class="action-buttons-wrap">
                <button 
                  v-if="org.status === 'ACTIVE'" 
                  @click="toggleStatus(org)" 
                  class="btn-icon-action deactivate"
                  title="운영 중지"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </button>
                <button 
                  v-else-if="org.status === 'INACTIVE'"
                  @click="toggleStatus(org)" 
                  class="btn-icon-action restore"
                  title="운영 재개"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button 
                  v-if="org.status !== 'DELETED'" 
                  @click="deleteOrganization(org)" 
                  class="btn-icon-action delete"
                  title="사업장 삭제"
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
            <td>
              <button class="btn-detail" @click.stop="goToDetail(org)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 결과 없음 -->
    <div v-else class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <p>검색 결과가 없습니다</p>
    </div>

    <!-- 페이징 -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        :disabled="currentPage === 0" 
        @click="changePage(currentPage - 1)"
        class="page-btn"
      >
        이전
      </button>
      <div class="page-numbers">
        <button 
          v-for="p in totalPages" 
          :key="p" 
          @click="changePage(p - 1)"
          :class="{ active: currentPage === p - 1 }"
          class="page-number"
        >
          {{ p }}
        </button>
      </div>
      <button 
        :disabled="currentPage === totalPages - 1" 
        @click="changePage(currentPage + 1)"
        class="page-btn"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const filters = reactive({
  status: 'all',
  region: 'all',
  searchQuery: '',
  selectedDays: []
})

const weekDays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
]

// API 데이터 및 페이징 상태
const allOrganizations = ref([])
const currentPage = ref(0)
const pageSize = ref(20)

// 1. 상태, 지역, 요일, 검색어에 따른 필터링 로직
const filteredOrganizations = computed(() => {
  return allOrganizations.value.filter(org => {
    // 운영 상태 필터
    if (filters.status !== 'all' && org.status !== filters.status) return false
    
    // 지역 필터
    if (filters.region !== 'all' && org.region !== filters.region) return false
    
    // 운영 요일 필터 (선택된 요일 중 하나라도 포함되면 노출)
    if (filters.selectedDays.length > 0) {
      const orgDays = (org.operatingDays || '').split(',')
      const matchesDay = filters.selectedDays.some(day => orgDays.includes(day))
      if (!matchesDay) return false
    }
    
    // 검색어 필터 (코드, 이름, 대표자명)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const searchTarget = `${org.code} ${org.name} ${org.representativeName}`.toLowerCase()
      return searchTarget.includes(query)
    }
    
    return true
  })
})

// 2. 필터링된 결과물에 대한 전체 페이지 계산
const totalPages = computed(() => {
  return Math.ceil(filteredOrganizations.value.length / pageSize.value)
})

// 3. 현재 페이지에 표시할 데이터 슬라이싱
const displayedOrganizations = computed(() => {
  const start = currentPage.value * pageSize.value
  const end = start + pageSize.value
  return filteredOrganizations.value.slice(start, end)
})

onMounted(async () => {
  await fetchOrganizations()
})

// 필터나 검색어가 바뀔 때 첫 페이지로 이동 (데이터는 fetch할 필요 없음, 로컬 필터링이므로)
watch(() => [filters.status, filters.region, filters.selectedDays, filters.searchQuery], () => {
  currentPage.value = 0
}, { deep: true })

const fetchOrganizations = async () => {
  try {
    // 프론트엔드 필터링을 위해 데이터를 넉넉히 가져옴 (임시)
    const params = {
      page: 0,
      size: 1000 
    }
    
    const response = await api.get('/hq/business-units/FRANCHISE', { params })
    if (response.data.success) {
      allOrganizations.value = response.data.data.content
    }
  } catch (error) {
    console.error('가맹점 목록 조회 실패:', error)
  }
}

const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  filters.status = 'all'
  filters.region = 'all'
  filters.searchQuery = ''
  filters.selectedDays = []
  currentPage.value = 0
}

const goToDetail = (org) => {
  router.push(`/organization/FRANCHISE/${org.id}`)
}

const getStatusLabel = (status) => {
  const map = { ACTIVE: '운영중', INACTIVE: '운영중지', DELETED: '삭제' }
  return map[status] || '운영중'
}

const toggleStatus = async (org) => {
  const isActive = org.status === 'ACTIVE'
  const action = isActive ? '운영 중지' : '운영 재개'
  if (confirm(`'${org.name}'의 ${action}하시겠습니까?`)) {
    try {
      const newStatus = isActive ? 'INACTIVE' : 'ACTIVE'
      const response = await api.patch(`/hq/business-units/franchise/${org.id}/status`, {
        status: newStatus
      })
      if (response.data.success) {
        org.status = newStatus
        alert(`'${org.name}'의 ${action}가 처리되었습니다.`)
      }
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }
}

const deleteOrganization = async (org) => {
  if (confirm(`'${org.name}'을(를) 삭제하시겠습니까? 삭제된 사업장은 복구할 수 없습니다.`)) {
    try {
      const response = await api.delete(`/hq/business-units/franchise/${org.id}`)
      if (response.data.success) {
        alert(`'${org.name}'이(가) 삭제되었습니다.`)
        await fetchOrganizations() // Refresh list
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}

const getRegionLabel = (region) => {
  const map = {
    'SEOUL': '서울',
    'GYEONGGI': '경기',
    'INCHEON': '인천',
    'BUSAN': '부산',
    'DAEGU': '대구',
    'DAEJEON': '대전',
    'GWANGJU': '광주',
    'ULSAN': '울산',
    'SEJONG': '세종',
    'GANGWON': '강원',
    'CHUNGBUK': '충북',
    'CHUNGNAM': '충남',
    'JEONBUK': '전북',
    'JEONNAM': '전남',
    'GYEONGBUK': '경북',
    'GYEONGNAM': '경남',
    'JEJU': '제주'
  }
  return map[region] || region
}
</script>

<style scoped>
.org-list-container {
  padding: 1.5rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.org-list-header {
  margin-bottom: 2rem;
}

.org-list-header h1 {
  font-size: 1.5rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* 필터 섹션 */
.filter-section {
  background: white;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
}

.filter-row.secondary {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group.flex-grow { flex: 1; }
.filter-group.full-width { width: 100%; }

.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
}

.filter-group select,
.filter-group input {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
}

.filter-group select:focus,
.filter-group input:focus {
  border-color: #0f172a;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding-left: 2.5rem;
}

.days-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-check-chip {
  padding: 0.4rem 0.8rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  font-size: 0.85rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.day-check-chip:hover {
  background: #f1f5f9;
}

.day-check-chip.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-check-chip input { display: none; }

.btn-reset-filter {
  margin-left: auto;
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
}

.btn-reset-filter:hover {
  background: #f8fafc;
}

/* 테이블 스타일 */
.org-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
}

.org-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.org-table th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.org-table td {
  padding: 1rem 0.75rem;
  font-size: 0.95rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.org-row {
  cursor: pointer;
  transition: background 0.2s;
}

.org-row:hover {
  background: #f8fafc;
}

.org-code {
  font-family: monospace;
  color: #2563eb;
}

.org-name {
  font-weight: 600;
  color: #0f172a;
}

.region-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

.warning-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.warning-badge.warning-blocked {
  background: #fee2e2;
  color: #ef4444;
}

.days-pills {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

.day-pill {
  font-size: 0.75rem;
  color: #e2e8f0;
  font-weight: 600;
}

.day-pill.active {
  color: #0f172a;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.ACTIVE { background: #dcfce7; color: #166534; }
.status-badge.INACTIVE { background: #f1f5f9; color: #64748b; }
.status-badge.DELETED { background: #fee2e2; color: #b91c1c; }

.td-actions {
  padding: 0.5rem 1rem !important;
}

.action-buttons-wrap {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-action.deactivate {
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

.btn-icon-action.deactivate:hover {
  background: #f1f5f9;
}

.btn-icon-action.restore {
  background: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}

.btn-icon-action.delete {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-icon-action.delete:hover {
  background: #fee2e2;
}

.btn-detail {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

/* 페이징 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.2s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #64748b;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f8fafc;
}

.page-number.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

/* 결과 없음 */
.no-results {
  text-align: center;
  padding: 4rem;
  color: #94a3b8;
}

.no-results svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
