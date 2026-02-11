<template>
  <div class="org-list-container">
    <div class="org-list-header">
      <h1>조직 조회</h1>
      <p class="subtitle">등록된 가맹점 및 공장을 조회하세요</p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>조직 유형</label>
          <select v-model="filters.type">
            <option value="all">전체</option>
            <option value="store">가맹점</option>
            <option value="factory">공장</option>
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
              placeholder="이름, 코드, 주소로 검색..."
            >
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>

      <!-- 추가 필터 (가맹점 전용) -->
      <div v-if="filters.type === 'all' || filters.type === 'store'" class="advanced-filters">
        <div class="filter-group">
          <label>최소 면적 (㎡)</label>
          <input type="number" v-model.number="filters.minArea" placeholder="0">
        </div>

        <div class="filter-group">
          <label>운영 시간 (이후 개점)</label>
          <input type="time" v-model="filters.openTimeAfter">
        </div>

        <div class="filter-group">
          <label>운영 시간 (이전 폐점)</label>
          <input type="time" v-model="filters.closeTimeBefore">
        </div>

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
            <th>코드</th>
            <th>이름</th>
            <th>주소</th>
            <th>전화번호</th>
            <th>면적</th>
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
            <td>
              <span class="org-type-badge" :class="org.type">
                {{ org.type === 'store' ? '가맹점' : '공장' }}
              </span>
            </td>
            <td class="org-code">{{ org.code }}</td>
            <td class="org-name">{{ org.name }}</td>
            <td class="org-address">{{ org.address }}</td>
            <td>{{ org.phone }}</td>
            <td>{{ org.type === 'store' ? org.area + '㎡' : '-' }}</td>
            <td>
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
  searchQuery: '',
  minArea: null,
  selectedDays: [],
  openTimeAfter: '',
  closeTimeBefore: ''
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
    code: 'SE01',
    type: 'store',
    name: '서울점',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    area: 150,
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
    area: 180,
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
    phone: '031-5555-6666'
  },
  {
    code: 'SE03',
    type: 'store',
    name: '대구점',
    address: '대구광역시 수성구 동대구로 456',
    phone: '053-7777-8888',
    area: 120,
    operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    openTime: '08:00',
    closeTime: '23:00',
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

  // 검색 필터
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase()
    result = result.filter(org => 
      org.name.toLowerCase().includes(query) ||
      org.code.toLowerCase().includes(query) ||
      org.address.toLowerCase().includes(query)
    )
  }

  // 면적 필터 (가맹점만 해당)
  if (filters.minArea !== null && filters.minArea > 0) {
    result = result.filter(org => org.type !== 'store' || org.area >= filters.minArea)
  }

  // 운영 요일 필터 (가맹점만 해당)
  if (filters.selectedDays.length > 0) {
    result = result.filter(org => {
      if (org.type !== 'store') return true
      return filters.selectedDays.every(day => org.operatingDays.includes(day))
    })
  }

  // 운영 시간 필터 (가맹점만 해당)
  if (filters.openTimeAfter) {
    result = result.filter(org => org.type !== 'store' || org.openTime >= filters.openTimeAfter)
  }
  if (filters.closeTimeBefore) {
    result = result.filter(org => org.type !== 'store' || org.closeTime <= filters.closeTimeBefore)
  }

  return result
})

// 필터 초기화
const resetFilters = () => {
  filters.type = 'all'
  filters.searchQuery = ''
  filters.minArea = null
  filters.selectedDays = []
  filters.openTimeAfter = ''
  filters.closeTimeBefore = ''
}

// 상세 페이지로 이동
const goToDetail = (code) => {
  router.push(`/organization/${code}`)
}
</script>

<style scoped>
.org-list-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.org-list-header {
  margin-bottom: 2rem;
}

.org-list-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
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
  border-radius: 12px;
  padding: 1.5rem; /* Reduced from 1.5rem */
  margin-bottom: 1.5rem; /* Reduced from 2rem */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Reduced from 1.5rem */
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.advanced-filters {
  display: flex;
  gap: 0.75rem; /* Reduced from 1rem */
  align-items: flex-end;
  flex-wrap: wrap;
  padding-top: 1rem; /* Reduced from 1.5rem */
  border-top: 1px dashed #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem; /* Reduced from 0.5rem */
  flex: 1;
  min-width: 140px; /* Slightly reduced */
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
  padding: 0.5rem 0.75rem; /* Reduced from 0.75rem 1rem */
  border: 1.5px solid #e2e8f0;
  border-radius: 6px; /* Reduced from 8px */
  font-size: 0.9rem; /* Reduced from 0.95rem */
  background: white;
  transition: all 0.2s;
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
  gap: 0.3rem; /* Reduced from 0.35rem */
  padding: 0.3rem 0.5rem; /* Reduced from 0.4rem 0.6rem */
  border: 1.5px solid #e2e8f0;
  border-radius: 4px; /* Reduced from 6px */
  cursor: pointer;
  font-size: 0.8rem; /* Reduced from 0.85rem */
  transition: all 0.2s;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
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
}

.org-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.org-table th {
  padding: 0.75rem 1.25rem;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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
  padding: 0.85rem 1.25rem;
  font-size: 0.9rem;
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
  color: #92400e;
}

.org-code {
  font-weight: 700;
  color: #64748b;
  font-family: monospace;
}

.org-name {
  font-weight: 600;
  color: #0f172a;
}

.org-address {
  color: #64748b;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
