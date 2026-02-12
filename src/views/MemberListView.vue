<template>
  <div class="member-list-container">
    <div class="member-list-header">
      <h1>회원 조회</h1>
      <p class="subtitle">등록된 전체 회원을 조회하고 관리합니다</p>
    </div>

    <!-- 필터 및 검색 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>역할</label>
          <select v-model="filters.role">
            <option value="all">전체</option>
            <option value="hq">본사</option>
            <option value="franchise">가맹점</option>
            <option value="factory">공장</option>
          </select>
        </div>

        <div class="filter-group">
          <label>회원 상태</label>
          <select v-model="filters.status">
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
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
              placeholder="이름, 아이디, 이메일, 사원번호 검색"
            >
          </div>
        </div>

        <div class="filter-group">
          <label>소속</label>
          <input 
            type="text" 
            v-model="filters.orgName" 
            placeholder="가맹점/공장명 검색..."
          >
        </div>

        <button @click="resetFilters" class="btn-reset-filter">
          초기화
        </button>
      </div>
    </div>

    <!-- 회원 목록 테이블 -->
    <div v-if="filteredMembers.length > 0" class="member-table-container">
      <table class="member-table">
        <thead>
          <tr>
            <th>사원번호</th>
            <th>이름</th>
            <th>아이디</th>
            <th>역할</th>
            <th>소속</th>
            <th>이메일</th>
            <th>연락처</th>
            <th>회원 상태</th>
            <th>관리</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="member in filteredMembers" 
            :key="member.employeeNumber"
            @click="goToDetail(member.employeeNumber)"
            class="member-row"
          >
            <td class="emp-number">{{ member.employeeNumber }}</td>
            <td class="emp-name">
              <div class="name-cell">
                <img v-if="member.photoUrl" :src="member.photoUrl" class="mini-photo">
                <div v-else class="mini-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                {{ member.name }}
              </div>
            </td>
            <td>{{ member.id }}</td>
            <td>
              <span class="role-badge" :class="member.role">
                {{ getRoleDisplay(member) }}
              </span>
            </td>
            <td>{{ member.orgName || '-' }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.phone }}</td>
            <td>
              <span class="status-badge" :class="member.status || 'active'">
                {{ (member.status === 'active' || !member.status) ? '활성' : '비활성' }}
              </span>
            </td>
            <td class="td-actions" @click.stop>
              <div class="action-buttons-wrap">
                <button
                  v-if="member.status === 'active' || !member.status"
                  @click="toggleMemberStatus(member)"
                  class="btn-icon-action delete"
                  title="계정 비활성화"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
                <button
                  v-else
                  @click="toggleMemberStatus(member)"
                  class="btn-icon-action restore"
                  title="계정 복구"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
              </div>
            </td>
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
  role: 'all',
  status: 'all',
  searchQuery: '',
  orgName: ''
})

// 세부 역할 라벨 (권한별 역할 표시용)
const ROLE_DETAIL_LABELS = {
  hq_hr: '인사 관리자',
  hq_settlement: '정산 관리자',
  hq_logistics: '물류 관리자',
  hq_system: '시스템 관리자',
  fr_owner: '점주',
  fr_manager: '매니저',
  fr_staff: '직원',
  fa_production: '생산 관리자',
  fa_logistics: '물류 관리자',
  fa_factory: '공장 관리자'
}

// 샘플 회원 데이터
const members = ref([
  {
    employeeNumber: '10001',
    name: '본사유저',
    id: 'hq_admin',
    role: 'hq',
    roleDetail: 'hq_hr',
    orgName: '본사',
    email: 'admin@company.com',
    phone: '010-1111-2222',
    photoUrl: '',
    status: 'active'
  },
  {
    employeeNumber: '20001',
    name: '가맹점유저',
    id: 'admin123',
    role: 'franchise',
    roleDetail: 'fr_owner',
    orgName: '서울본점',
    email: 'admin@example.com',
    phone: '010-1234-5678',
    photoUrl: '',
    status: 'active'
  },
  {
    employeeNumber: '30001',
    name: '공장유저',
    id: 'factory_mgr',
    role: 'factory',
    roleDetail: 'fa_factory',
    orgName: '경기공장',
    email: 'factory@factory.com',
    phone: '010-5555-6666',
    photoUrl: '',
    status: 'inactive'
  }
])

const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const roleMatch = filters.role === 'all' || member.role === filters.role
    const statusMatch = filters.status === 'all' || (member.status || 'active') === filters.status
    const query = filters.searchQuery.toLowerCase()
    const searchMatch = !query || 
      member.name.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.employeeNumber.includes(query)
    const orgMatch = !filters.orgName || (member.orgName && member.orgName.toLowerCase().includes(filters.orgName.toLowerCase()))
    
    return roleMatch && statusMatch && searchMatch && orgMatch
  })
})

const getRoleLabel = (role) => {
  switch(role) {
    case 'hq': return '본사'
    case 'franchise': return '가맹점'
    case 'factory': return '공장'
    default: return role
  }
}

const getRoleDisplay = (member) => {
  const typeLabel = getRoleLabel(member.role)
  const detailLabel = member.roleDetail ? ROLE_DETAIL_LABELS[member.roleDetail] : null
  return detailLabel ? `${typeLabel} · ${detailLabel}` : typeLabel
}

const resetFilters = () => {
  filters.role = 'all'
  filters.status = 'all'
  filters.searchQuery = ''
  filters.orgName = ''
}

const toggleMemberStatus = (member) => {
  const isActive = member.status === 'active' || !member.status
  const action = isActive ? '비활성화' : '복구'
  const name = member.name
  if (confirm(`'${name}' 회원을 ${action}하시겠습니까?`)) {
    member.status = isActive ? 'inactive' : 'active'
  }
}

const goToDetail = (empNum) => {
  router.push(`/admin/members/${empNum}`)
}
</script>

<style scoped>
.member-list-container {
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.member-list-header {
  margin-bottom: 2rem;
}

.member-list-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
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
}

.filter-row {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
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
  width: 400px;
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

.btn-reset-filter {
  margin-left: auto;
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.btn-reset-filter:hover {
  background: #f8fafc;
}

/* 테이블 스테일 */
.member-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.member-table th {
  background: #f8fafc;
  padding: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.member-table td {
  padding: 1rem;
  font-size: 0.9rem;
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
}

.member-row {
  cursor: pointer;
  transition: background 0.2s;
}

.member-row:hover {
  background: #f8fafc;
}

.emp-number {
  font-family: monospace;
  font-weight: normal;
  color: #2563eb;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: normal;
}

.mini-photo,
.mini-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.mini-placeholder {
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: normal;
}

.role-badge.hq { background: #e0f2fe; color: #0369a1; }
.role-badge.franchise { background: #fef3c7; color: #b45309; }
.role-badge.factory { background: #dcfce7; color: #15803d; }

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.active {
  background: #dcfce7;
  color: #166534;
}
.status-badge.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.td-actions {
  padding: 0.5rem 1rem !important;
  vertical-align: middle;
}
.action-buttons-wrap {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  align-items: center;
}
.btn-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-icon-action.delete {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
}
.btn-icon-action.delete:hover {
  background: #fee2e2;
  border-color: #fecaca;
}
.btn-icon-action.restore {
  background: #f0fdf4;
  color: #15803d;
  border-color: #86efac;
}
.btn-icon-action.restore:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.btn-detail {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
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
