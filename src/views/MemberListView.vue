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

        <div class="filter-group org-group">
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
    <div v-if="members.length > 0" class="member-table-container">
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
            v-for="member in members" 
            :key="member.userId || member.id || member.loginId"
            @click="goToDetail(member)"
            class="member-row"
          >
            <td class="emp-number">{{ member.employeeNumber }}</td>
            <td class="emp-name">{{ member.username }}</td>
            <td>{{ member.loginId }}</td>
            <td>
              <span class="role-badge" :class="member.role ? member.role.toLowerCase() : ''">
                {{ getRoleDisplay(member) }}
              </span>
            </td>
            <td>{{ member.businessUnitName || '-' }}</td>
            <td>{{ member.email }}</td>
            <td>{{ member.phone }}</td>
            <td>
                <span class="status-badge" :class="member.status ? member.status.toLowerCase() : 'active'">
                  {{ getStatusLabel(member.status) }}
                </span>
            </td>
            <td class="td-actions" @click.stop>
              <div class="action-buttons-wrap">
                <button
                  v-if="member.status === 'ACTIVE' || !member.status"
                  @click="toggleMemberStatus(member)"
                  class="btn-icon-action deactivate"
                  title="계정 비활성화"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </button>
                <button
                  v-else-if="member.status === 'INACTIVE'"
                  @click="toggleMemberStatus(member)"
                  class="btn-icon-action restore"
                  title="계정 복구"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button
                  v-if="member.status !== 'DELETED'"
                  @click="deleteMember(member)"
                  class="btn-icon-action delete"
                  title="계정 삭제"
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
              <button @click.stop="goToDetail(member)" class="btn-detail">
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManagementStore } from '../stores/userManagement'

const router = useRouter()
const userManagementStore = useUserManagementStore()

// 필터
const filters = reactive({
  role: 'all',
  status: 'all',
  searchQuery: '',
  orgName: '' // 백엔드 요약 정보에는 소속명이 없으므로 일단 검색 대상에서 제외될 수 있음
})

// 세부 역할 라벨 (백엔드 UserPosition 매핑)
const POSITION_LABELS = {
  HR_MANAGER: '인사 관리자',
  FINANCE_MANAGER: '정산 관리자',
  LOGISTICS_MANAGER: '물류 관리자',
  SYSTEM_MANAGER: '시스템 관리자',
  OWNER: '점주',
  STORE_MANAGER: '매니저',
  STAFF: '직원',
  PRODUCTION_MANAGER: '생산 관리자',
  FACTORY_LOGISTICS_MANAGER: '공장 물류 관리자',
  FACTORY_MANAGER: '공장 관리자'
}

const isLoading = ref(false)

const fetchMembers = async () => {
  isLoading.value = true
  try {
    const params = {
      role: filters.role !== 'all' ? filters.role.toUpperCase() : null,
      status: filters.status !== 'all' ? filters.status.toUpperCase() : null,
      username: filters.searchQuery || null
    }
    await userManagementStore.fetchUsers(params)
  } catch (error) {
    alert('회원 목록을 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchMembers)

// 필터 변경 시 자동 재조회
watch(() => [filters.role, filters.status], fetchMembers)

// 검색어는 엔터나 버튼 클릭 시 조회하도록 하거나, 디바운스 적용 가능
// 여기서는 일단 수동 조회 버튼이 없으므로 엔터 키 대응 등을 추가할 수 있으나
// 기존 코드 흐름에 따라 computed 대신 실시간 조회를 원한다면 watch를 searchQuery에도 걸어줍니다.
watch(() => filters.searchQuery, (newVal) => {
  if (newVal.length === 0 || newVal.length >= 2) {
    fetchMembers()
  }
})

const members = computed(() => userManagementStore.users)

const getRoleLabel = (role) => {
  switch(role) {
    case 'HQ': return '본사'
    case 'FRANCHISE': return '가맹점'
    case 'FACTORY': return '공장'
    default: return role
  }
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'ACTIVE': return '활성'
    case 'INACTIVE': return '비활성'
    case 'DELETED': return '삭제'
    default: return '활성'
  }
}

const getRoleDisplay = (member) => {
  const typeLabel = getRoleLabel(member.role)
  const detailLabel = member.position ? POSITION_LABELS[member.position] : null
  return detailLabel ? `${typeLabel} · ${detailLabel}` : typeLabel
}

const resetFilters = () => {
  filters.role = 'all'
  filters.status = 'all'
  filters.searchQuery = ''
  filters.orgName = ''
  fetchMembers()
}

const toggleMemberStatus = async (member) => {
  const isActive = member.status === 'ACTIVE'
  const targetStatus = isActive ? 'INACTIVE' : 'ACTIVE'
  const action = isActive ? '비활성화' : '복구'
  const memberId = member.userId || member.id
  
  if (confirm(`'${member.username}' 회원을 ${action}하시겠습니까?`)) {
    try {
      if (!memberId) {
        alert('회원 식별자를 찾을 수 없습니다.')
        return
      }
      await userManagementStore.updateUserStatus(memberId, targetStatus)
      alert(`'${member.username}' 회원이 ${action}되었습니다.`)
      fetchMembers()
    } catch (error) {
      alert(`${action} 요청이 실패했습니다.`)
    }
  }
}

const deleteMember = async (member) => {
  const memberId = member.userId || member.id
  if (confirm(`'${member.username}' 회원을 삭제하시겠습니까? 삭제된 회원은 복구할 수 없습니다.`)) {
    try {
      if (!memberId) {
        alert('회원 식별자를 찾을 수 없습니다.')
        return
      }
      await userManagementStore.deleteUser(memberId)
      alert('회원이 삭제되었습니다.')
      fetchMembers()
    } catch (error) {
       alert('삭제 요청 중 오류가 발생했습니다.')
    }
  }
}

const goToDetail = (member) => {
  const idValue = member.userId || member.id
  
  if (!idValue) {
    console.warn('Member object missing ID:', member)
    alert('회원 식별자(ID)를 찾을 수 없습니다.')
    return
  }
  
  // 백엔드(Long id)는 숫자만 받을 수 있습니다. hq2026... 같은 문자열이 넘어가면 400 에러가 납니다.
  if (isNaN(Number(idValue))) {
    console.error('Invalid ID type for backend:', idValue)
    alert('회원 상세 조회를 위한 올바른 숫자형 식별자가 없습니다.')
    return
  }
  
  router.push(`/admin/members/${idValue}`)
}
</script>

<style scoped>
.member-list-container {
  padding: 1.5rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
}

.member-list-header {
  margin-bottom: 2rem;
}

.member-list-header h1 {
  font-size: 1.5rem; /* Consistently resized */
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

.org-group {
  flex: 1;
}

.org-group input {
  width: 100%;
}

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

/* 테이블 스테일 */
.member-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto; /* allow scrolling */
}

.member-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.member-table th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500; /* Medium instead of semi-bold */
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.member-table td {
  padding: 1rem 0.75rem;
  font-size: 0.95rem; /* Slightly larger for consistency */
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  white-space: normal; /* Prevent cutting */
  word-break: break-all;
}

/* 첫 번째 컬럼(사원번호) 좌측 여유 */
.member-table th:first-child,
.member-table td:first-child {
  padding-left: 2rem;
}

/* 마지막 컬럼(상세) 우측 여유 */
.member-table th:last-child,
.member-table td:last-child {
  padding-right: 2rem;
}

.member-row {
  cursor: pointer;
  transition: background 0.2s;
}

.member-row:hover {
  background: #f8fafc;
}

.emp-number {
  font-weight: normal;
  color: #2563eb;
}

.name-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
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
  font-size: 0.8rem;
  font-weight: 500; /* Regular instead of bold */
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

.td-actions {
  padding: 0.5rem 1rem !important;
  vertical-align: middle;
}
.action-buttons-wrap {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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
  border-color: #fca5a5;
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
