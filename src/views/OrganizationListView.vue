<template>
  <div class="org-list-container">
    <div class="org-list-header">
      <h1>사업장 조회</h1>
      <p class="subtitle">등록된 가맹점 및 공장을 조회하세요</p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>사업장 유형</label>
          <select v-model="filters.type">
            <option value="all">전체</option>
            <option value="headOffice">본사</option>
            <option value="store">가맹점</option>
            <option value="factory">공장</option>
          </select>
        </div>

        <div class="filter-group">
          <label>상태</label>
          <select v-model="filters.status">
            <option value="all">전체</option>
            <option value="active">운영중</option>
            <option value="inactive">운영중지</option>
            <option value="deleted">폐업/삭제</option>
          </select>
        </div>

        <div class="filter-group">
          <label>검색</label>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              v-model="filters.searchQuery" 
              placeholder="이름, 코드, 주소로 검색"
            >
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>

      <!-- 추가 필터 (가맹점 전용) -->
      <div v-if="filters.type === 'all' || filters.type === 'store'" class="advanced-filters">


        <div class="filter-group full-width">
          <label>운영 요일 (모두 포함)</label>
          <div class="days-filter">
            <label v-for="day in weekDays" :key="day.value" class="day-checkbox-small">
              <input type="checkbox" :value="day.value" v-model="filters.selectedDays">
              <span>{{ day.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 조직 목록 테이블 -->
    <div v-if="filteredOrganizations.length > 0" class="org-table-container">
      <table class="org-table">
        <thead>
          <tr>
            <th>유형</th>
            <th>상태</th>
            <th>코드</th>
            <th>이름</th>
            <th>대표자</th>
            <th>운영 요일</th>
            <th>주소</th>
            <th>전화번호</th>
            <th>경고</th>
            <th>반품 제한</th>
            <th>관리</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="org in filteredOrganizations" 
            :key="org.code"
            @click="goToDetail(org.code)"
            class="org-row"
          >
            <td class="center-text">
              <span class="org-type-badge" :class="org.type">
                {{ getTypeLabel(org.type) }}
              </span>
            </td>
            <td class="center-text">
              <span class="status-badge" :class="org.status || 'active'">
                {{ getStatusLabel(org.status) }}
              </span>
            </td>
            <td class="org-code center-text">{{ org.code }}</td>
            <td class="org-name center-text">{{ org.name }}</td>
            <td class="center-text">{{ org.representative || '-' }}</td>
            <td class="center-text">
              <div v-if="org.type === 'store'" class="days-pill-list">
                <span v-for="day in weekDays" :key="day.value" 
                      class="day-pill" 
                      :class="{ active: org.operatingDays.includes(day.value) }">
                  {{ day.label }}
                </span>
              </div>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="org-address center-text">{{ org.address }}</td>
            <td class="center-text">{{ org.phone }}</td>
            <td class="center-text">
              <span v-if="org.type === 'store'" class="warning-count" :class="{ 'danger': org.warningCount >= 3 }">
                {{ org.warningCount || 0 }}회
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="center-text">
              <span v-if="org.type === 'store'" class="restriction-badge" :class="org.warningCount >= 3 ? 'restricted' : 'normal'">
                {{ org.warningCount >= 3 ? '반품 제한' : '정상' }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="center-text" @click.stop>
                <div v-if="org.type !== 'headOffice'" class="action-buttons-center">
                  <button 
                    v-if="org.status === 'active' || !org.status" 
                    @click.stop="toggleStatus(org)" 
                    class="btn-icon-action deactivate"
                    title="운영 중지"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </button>
                  <button 
                    v-else-if="org.status === 'inactive'"
                    @click.stop="toggleStatus(org)" 
                    class="btn-icon-action restore"
                    title="운영 재개"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                  </button>
                  <button 
                    v-if="org.status !== 'deleted'" 
                    @click.stop="deleteOrganization(org)" 
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
                <span v-else class="text-muted">-</span>
            </td>
            <td class="center-text">
              <button class="btn-detail">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 필터
const filters = reactive({
  type: 'all',
  status: 'all',
  searchQuery: '',
  selectedDays: [],
})

// 요일 목록
const weekDays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
]

// 샘플 데이터 (실제로는 API에서 가져와야 함)
const organizations = ref([
  {
    code: 'HQ01',
    type: 'headOffice',
    name: '본사',
    address: '서울특별시 강남구 테헤란로 1',
    phone: '02-0000-0000',
    representative: '김본사',
    status: 'active',
    operatingDays: [],
    openTime: '09:00',
    closeTime: '18:00',
    photoUrl: ''
  },
  {
    code: 'SE01',
    type: 'store',
    name: '서울점',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    representative: '홍길동',
    warningCount: 1,
    status: 'active',
    operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    openTime: '09:00',
    closeTime: '22:00',
    photoUrl: ''
  },
  {
    code: 'SE02',
    type: 'store',
    name: '부산점',
    address: '부산광역시 해운대구 센텀중앙로 78',
    phone: '051-9876-5432',
    representative: '이순신',
    warningCount: 3,
    status: 'active',
    operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    openTime: '10:00',
    closeTime: '21:00',
    photoUrl: ''
  },
  {
    code: 'FA01',
    type: 'factory',
    name: '중앙 생산 공장',
    address: '경기도 화성시 동탄산업1로 45',
    phone: '031-5555-6666',
    representative: '김철수',
    region: 'GG01',
    status: 'active',
    lineCount: 5
  },
  {
    code: 'SE03',
    type: 'store',
    name: '대구점',
    address: '대구광역시 수성구 동대구로 456',
    phone: '053-7777-8888',
    representative: '강감찬',
    warningCount: 0,
    operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    openTime: '08:00',
    closeTime: '23:00',
    status: 'inactive',
    photoUrl: ''
  }
])

// 필터링된 조직 목록
const filteredOrganizations = computed(() => {
  let result = organizations.value

  // 타입 필터
  if (filters.type !== 'all') {
    result = result.filter(org => org.type === filters.type)
  }

  // 상태 필터
  if (filters.status !== 'all') {
    result = result.filter(org => org.status === filters.status)
  }

  // 검색 필터
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase()
    result = result.filter(org => 
      org.name.toLowerCase().includes(query) ||
      org.code.toLowerCase().includes(query) ||
      org.address.toLowerCase().includes(query) ||
      (org.representative && org.representative.toLowerCase().includes(query))
    )
  }


  // 운영 요일 필터 (가맹점만 해당)
  if (filters.selectedDays.length > 0) {
    result = result.filter(org => {
      if (org.type !== 'store') return true
      return filters.selectedDays.every(day => org.operatingDays.includes(day))
    })
  }


  return result
})

// 필터 초기화
const resetFilters = () => {
  filters.type = 'all'
  filters.status = 'all'
  filters.searchQuery = ''
  filters.selectedDays = []
}

// 상세 페이지로 이동
const goToDetail = (code) => {
  router.push(`/organization/${code}`)
}

const getTypeLabel = (type) => {
  const map = {
    headOffice: '본사',
    store: '가맹점',
    factory: '공장'
  }
  return map[type] || type
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'active': return '운영중'
    case 'inactive': return '운영중지'
    case 'deleted': return '삭제'
    default: return '운영중'
  }
}

const getDayLabel = (value) => {
  const day = weekDays.find(d => d.value === value)
  return day ? day.label : value
}

const toggleStatus = (org) => {
  const isActive = org.status === 'active' || !org.status
  const action = isActive ? '운영 중지' : '운영 재개'
  if (confirm(`'${org.name}'의 ${action}하시겠습니까?`)) {
    org.status = isActive ? 'inactive' : 'active'
    alert(`'${org.name}'의 ${action}가 처리되었습니다.`)
  }
}

const deleteOrganization = (org) => {
  if (confirm(`'${org.name}'을(를) 삭제하시겠습니까? 삭제된 사업장은 복구할 수 없습니다.`)) {
    org.status = 'deleted'
    alert(`'${org.name}'이(가) 삭제되었습니다.`)
  }
}
</script>

<style scoped>
.org-list-container {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.org-list-header {
  margin-bottom: 2rem;
}

.org-list-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* 필터 섹션 */
.filter-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.advanced-filters {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px dashed #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem; 
  flex: 1;
  min-width: 120px;
}

.filter-group label {
  font-size: 0.8rem; /* Reduced from 0.85rem */
  font-weight: 700;
  color: #64748b; /* Slightly lighter/consistent */
}

.filter-group.full-width {
  flex: 0 0 100%;
}

.filter-group select,
.filter-group input {
  padding: 0.45rem 0.65rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  background: white;
  transition: all 0.2s;
  height: 36px;
  box-sizing: border-box;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.days-filter {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap; /* Force one line */
  overflow-x: auto; /* Allow scrolling if too narrow */
  padding-bottom: 0.25rem;
}

.day-checkbox-small {
  display: flex;
  align-items: center;
  gap: 0.3rem; 
  padding: 0.25rem 0.45rem; 
  border: 1.2px solid #e2e8f0;
  border-radius: 4px; 
  cursor: pointer;
  font-size: 0.75rem; 
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

.day-checkbox-small input[type="checkbox"] {
  width: 12px;
  height: 12px;
}

.day-checkbox-small:hover {
  background: #f8fafc;
}

.day-checkbox-small input:checked + span {
  font-weight: 700;
  color: #0f172a;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 0.75rem; /* Reduced from 1rem */
  color: #94a3b8;
  width: 16px; /* Reduced from default */
  height: 16px;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem; /* Compact padding */
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.btn-reset-filter {
  padding: 0.5rem 1rem; /* Reduced from 0.75rem 1.5rem */
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px; /* Reduced from 8px */
  font-size: 0.85rem; /* Reduced from 0.9rem */
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  height: fit-content;
}

.btn-reset-filter:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 조직 테이블 */
.org-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.org-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.org-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.org-table th {
  padding: 1rem 0.6rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  background: #f8fafc;
  border-bottom: 2.5px solid #e2e8f0;
  white-space: nowrap;
}

/* 열 너비 고정 */
.org-table th:nth-child(1) { width: 90px; }  /* 유형 */
.org-table th:nth-child(2) { width: 95px; }  /* 상태 */
.org-table th:nth-child(3) { width: 100px; } /* 코드 */
.org-table th:nth-child(4) { width: 140px; } /* 이름 */
.org-table th:nth-child(5) { width: 90px; }  /* 대표자 */
.org-table th:nth-child(6) { width: 140px; } /* 운영 요일 */
.org-table th:nth-child(7) { width: auto; }  /* 주소 (공간에 맞춰 조절) */
.org-table th:nth-child(8) { width: 140px; } /* 전화번호 */
.org-table th:nth-child(9) { width: 60px; }  /* 경고 */
.org-table th:nth-child(10) { width: 100px; } /* 반품 제한 */
.org-table th:nth-child(11) { width: 100px; } /* 관리 */
.org-table th:nth-child(12) { width: 70px; }  /* 상세 */

.org-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.org-table tbody tr:last-child {
  border-bottom: none;
}

.org-table tbody tr:hover {
  background: #f8fafc;
}

.org-table td {
  padding: 1rem 0.5rem;
  font-size: 0.85rem;
  color: #0f172a;
  vertical-align: middle;
  text-align: center;
}

.center-text {
  text-align: center;
  font-size: 0.85rem;
  color: #0f172a;
}

.org-type-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.org-type-badge.store {
  background: #dbeafe;
  color: #1e40af;
}

.org-type-badge.factory {
  background: #fef3c7;
  background: #fef3c7;
  color: #92400e;
}

.org-type-badge.headOffice {
  background: #dcfce7;
  color: #166534;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.deleted {
  background: #fee2e2;
  color: #b91c1c;
}

.warning-count {
  font-weight: 700;
  color: #64748b;
}

.warning-count.danger {
  color: #ef4444;
}

.restriction-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.restriction-badge.normal {
  background: #f1f5f9;
  color: #64748b;
}

.restriction-badge.restricted {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fee2e2;
}

.org-code {
  font-weight: 500;
  color: #64748b;
  font-family: monospace;
}

.org-name {
  font-weight: 500;
  color: #0f172a;
}

.org-address {
  color: #64748b;
  width: 100%;
  padding: 5px 10px;
  text-align: center;
  word-break: keep-all;
  white-space: normal; /* 주소가 잘리지 않도록 줄바꿈 허용 */
  line-height: 1.4;
  margin: 0 auto;
}

.days-pill-list {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.day-pill {
  font-size: 0.75rem;
  color: #cbd5e1;
  font-weight: 500;
}

.day-pill.active {
  color: #0f172a;
  font-weight: 800;
}

.text-muted {
  color: #cbd5e1;
}

.action-buttons-center {
  display: flex;
  justify-content: center;
  align-items: center;
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

.btn-detail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.btn-detail:hover {
  background: #0f172a;
  border-color: #0f172a;
  color: white;
}

/* 결과 없음 */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

.no-results svg {
  margin-bottom: 1rem;
}

.no-results p {
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .org-table-container {
    overflow-x: auto;
  }
  
  .org-table {
    min-width: 800px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
}
</style>
