<template>
  <div class="org-list-container">
    <div class="org-list-header">
      <h1>가맹점 조회</h1>
      <p class="subtitle">전국 가맹점 현황과 경고 상태를 관리하세요</p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>운영 상태</label>
          <select v-model="filters.status">
            <option value="all">전체</option>
            <option value="active">운영중</option>
            <option value="inactive">운영중지</option>
            <option value="deleted">폐업/삭제</option>
          </select>
        </div>

        <div class="filter-group">
          <label>반품 제한 상태</label>
          <select v-model="filters.restrictionStatus">
            <option value="all">전체</option>
            <option value="normal">정상</option>
            <option value="restricted">반품 제한</option>
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
              placeholder="가맹점명, 코드, 주소 또는 대표명으로 검색"
            >
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>

      <div class="advanced-filters">
        <div class="filter-group full-width">
          <label>운영 요일 필터 (선택한 요일에 모두 운영하는 매장)</label>
          <div class="days-filter">
            <label v-for="day in weekDays" :key="day.value" class="day-checkbox">
              <input type="checkbox" :value="day.value" v-model="filters.selectedDays">
              <span>{{ day.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 가맹점 목록 테이블 -->
    <div v-if="filteredOrganizations.length > 0" class="org-table-container">
      <table class="org-table">
        <thead>
          <tr>
            <th style="width: 90px;">상태</th>
            <th style="width: 100px;">코드</th>
            <th style="width: 150px;">가맹점명</th>
            <th style="width: 100px;">대표자</th>
            <th style="width: 120px;">운영 요일</th>
            <th style="width: auto;">주소</th>
            <th style="width: 140px;">전화번호</th>
            <th style="width: 70px;">경고</th>
            <th style="width: 100px;">반품 제한</th>
            <th style="width: 90px;">관리</th>
            <th style="width: 70px;">상세</th>
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
              <span class="status-badge" :class="org.status">
                {{ getStatusLabel(org.status) }}
              </span>
            </td>
            <td class="org-code center-text">{{ org.code }}</td>
            <td class="org-name center-text">{{ org.name }}</td>
            <td class="center-text">{{ org.representative }}</td>
            <td class="center-text">
              <div class="days-pill-list">
                <span v-for="day in weekDays" :key="day.value" 
                      class="day-pill" 
                      :class="{ active: org.operatingDays.includes(day.value) }">
                  {{ day.label }}
                </span>
              </div>
            </td>
            <td class="org-address center-text">{{ org.address }}</td>
            <td class="center-text">{{ org.phone }}</td>
            <td class="center-text">
              <span class="warning-count" :class="{ 'danger': org.warningCount >= 3 }">
                {{ org.warningCount }}회
              </span>
            </td>
            <td class="center-text">
              <span class="restriction-badge" :class="org.warningCount >= 3 ? 'restricted' : 'normal'">
                {{ org.warningCount >= 3 ? '반품 제한' : '정상' }}
              </span>
            </td>
            <td class="center-text" @click.stop>
              <div class="action-buttons-center">
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
            </td>
            <td class="center-text">
              <button class="btn-detail" @click.stop="goToDetail(org.code)">
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

const filters = reactive({
  status: 'all',
  restrictionStatus: 'all',
  searchQuery: '',
  selectedDays: [],
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

// 샘플 데이터
const organizations = ref([
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
  },
  {
    code: 'SE03',
    type: 'store',
    name: '대구점',
    address: '대구광역시 수성구 동대구로 456',
    phone: '053-7777-8888',
    representative: '강감찬',
    warningCount: 0,
    status: 'inactive',
    operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  }
])

const filteredOrganizations = computed(() => {
  return organizations.value.filter(org => {
    const matchesStatus = filters.status === 'all' || org.status === filters.status
    
    // 반품 제한 필터
    const isRestricted = org.warningCount >= 3
    const matchesRestriction = filters.restrictionStatus === 'all' || 
      (filters.restrictionStatus === 'restricted' && isRestricted) ||
      (filters.restrictionStatus === 'normal' && !isRestricted)

    const query = filters.searchQuery.toLowerCase()
    const matchesSearch = !query || 
      org.name.toLowerCase().includes(query) ||
      org.code.toLowerCase().includes(query) ||
      org.address.toLowerCase().includes(query) ||
      (org.representative && org.representative.toLowerCase().includes(query))
    
    const matchesDays = filters.selectedDays.length === 0 || 
      filters.selectedDays.every(day => org.operatingDays.includes(day))

    return matchesStatus && matchesRestriction && matchesSearch && matchesDays
  })
})

const resetFilters = () => {
  filters.status = 'all'
  filters.restrictionStatus = 'all'
  filters.searchQuery = ''
  filters.selectedDays = []
}

const goToDetail = (code) => {
  router.push(`/organization/${code}`)
}

const getStatusLabel = (status) => {
  const map = { active: '운영중', inactive: '운영중지', deleted: '삭제' }
  return map[status] || '운영중'
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

.filter-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-row {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.flex-grow { flex-grow: 1; }

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
}

.filter-group select {
  height: 40px;
  padding: 0 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  min-width: 120px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  height: 40px;
  padding: 0 1rem 0 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.btn-reset-filter {
  height: 40px;
  padding: 0 1.5rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.advanced-filters {
  padding-top: 1.25rem;
  border-top: 1px dashed #e2e8f0;
}

.days-filter {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.day-checkbox:hover { background: #f8fafc; }
.day-checkbox input:checked + span { font-weight: 700; color: #0f172a; }

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

.org-table th {
  background: #f8fafc;
  padding: 1rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
}

.org-row:hover { background: #f8fafc; }

.org-table td {
  padding: 1rem 0.5rem;
  font-size: 0.85rem;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  vertical-align: middle;
}

.org-code { font-family: monospace; color: #64748b; font-weight: 600; }
.org-name { font-weight: 700; }

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 700;
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }

.days-pill-list { display: flex; gap: 3px; justify-content: center; }
.day-pill { font-size: 0.7rem; color: #cbd5e1; }
.day-pill.active { color: #0f172a; font-weight: 800; }

.org-address { color: #64748b; word-break: keep-all; line-height: 1.4; padding: 5px 10px; }

.warning-count { font-weight: 700; color: #64748b; }
.warning-count.danger { color: #ef4444; }

.restriction-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}
.restriction-badge.normal { background: #f1f5f9; color: #64748b; }
.restriction-badge.restricted { background: #fff1f2; color: #e11d48; }

.btn-detail {
  width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: white; color: #64748b; cursor: pointer; display: inline-flex;
  align-items: center; justify-content: center;
}

.action-buttons-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
}

.btn-icon-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-action.deactivate:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-icon-action.restore {
  background: #f0fdf4;
  color: #22c55e;
  border-color: #bbf7d0;
}

.btn-icon-action.restore:hover {
  background: #dcfce7;
  border-color: #86efac;
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

.no-results { text-align: center; padding: 4rem; color: #94a3b8; }
</style>
