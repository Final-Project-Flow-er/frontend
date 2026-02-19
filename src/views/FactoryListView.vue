<template>
  <div class="org-list-container">
    <div class="org-list-header">
      <h1>공장 조회</h1>
      <p class="subtitle">생산 공장의 가동 라인 및 지역별 현황을 관리하세요</p>
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
            <option value="deleted">삭제</option>
          </select>
        </div>

        <div class="filter-group">
          <label>지역</label>
          <select v-model="filters.region">
            <option value="all">전체</option>
            <option value="GG01">경기도</option>
            <option value="UL01">울산광역시</option>
            <option value="SE01">서울특별시</option>
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
              placeholder="공장명, 코드, 주소 또는 대표명으로 검색"
            >
          </div>
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>
    </div>

    <!-- 공장 목록 테이블 -->
    <div v-if="filteredOrganizations.length > 0" class="org-table-container">
      <table class="org-table">
        <thead>
          <tr>
            <th style="width: 100px;">상태</th>
            <th style="width: 120px;">공장 코드</th>
            <th style="width: 180px;">공장명</th>
            <th style="width: 120px;">대표자</th>
            <th style="width: 120px;">지역</th>
            <th style="width: 100px;">생산 라인</th>
            <th style="width: auto;">주소</th>
            <th style="width: 160px;">전화번호</th>
            <th style="width: 90px;">관리</th>
            <th style="width: 80px;">상세</th>
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
              <span class="region-badge">{{ getRegionLabel(org.region) }}</span>
            </td>
            <td class="center-text">
              <span class="line-count">{{ org.lineCount }}개</span>
            </td>
            <td class="org-address center-text">{{ org.address }}</td>
            <td class="center-text">{{ org.phone }}</td>
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
  region: 'all',
  searchQuery: '',
})

// 샘플 데이터
const organizations = ref([
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
  }
])

const filteredOrganizations = computed(() => {
  return organizations.value.filter(org => {
    const matchesStatus = filters.status === 'all' || org.status === filters.status
    const matchesRegion = filters.region === 'all' || org.region === filters.region
    const query = filters.searchQuery.toLowerCase()
    const matchesSearch = !query || 
      org.name.toLowerCase().includes(query) ||
      org.code.toLowerCase().includes(query) ||
      org.address.toLowerCase().includes(query) ||
      (org.representative && org.representative.toLowerCase().includes(query))
    
    return matchesStatus && matchesRegion && matchesSearch
  })
})

const resetFilters = () => {
  filters.status = 'all'
  filters.region = 'all'
  filters.searchQuery = ''
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

const getRegionLabel = (region) => {
  const map = {
    'GG01': '경기도',
    'UL01': '울산광역시',
    'SE01': '서울특별시'
  }
  return map[region] || region
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

.region-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.line-count {
  font-weight: 700;
  color: #1e40af;
}

.org-address { color: #64748b; word-break: keep-all; line-height: 1.4; padding: 5px 10px; }

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
