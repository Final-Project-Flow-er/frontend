<template>
  <div class="log-container">
    <div class="log-header">
      <div class="header-left">
        <h1>회원 로그</h1>
        <p class="subtitle">회원 등록, 수정, 삭제 등의 상태 변동 기록을 조회합니다</p>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="filter-section">
      <div class="filter-bar">
        <div class="filter-group">
          <label>변동 기간</label>
          <div class="date-range">
            <input type="date" v-model="filters.startDate" class="filter-input">
            <span>~</span>
            <input type="date" v-model="filters.endDate" class="filter-input">
          </div>
        </div>
        
        <div class="filter-group">
          <label>변동 유형</label>
          <select v-model="filters.type" class="filter-select">
            <option value="all">전체</option>
            <option value="REGISTER">신규 등록</option>
            <option value="INFO_UPDATE">정보 수정</option>
            <option value="PASSWORD_UPDATE">비밀번호 변경</option>
            <option value="DEACTIVATE">계정 비활성화</option>
            <option value="RESTORE">계정 복구</option>
            <option value="DELETE">계정 삭제</option>
          </select>
        </div>

        <div class="filter-group search-group">
          <label>회원 검색</label>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="filters.query" 
              placeholder="이름, 아이디, 사원번호 검색"
            >
          </div>
        </div>

        <div class="filter-actions">
          <button @click="resetFilters" class="btn-reset">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            초기화
          </button>
        </div>
      </div>
    </div>

    <!-- 로그 테이블 -->
    <div class="table-container shadow-sm">
      <table class="log-table">
        <thead>
          <tr>
            <th style="width: 18%">일시</th>
            <th style="width: 12%">변동 유형</th>
            <th style="width: 9%">사원번호</th>
            <th style="width: 12%">이름</th>
            <th style="width: 8%">아이디</th>
            <th style="width: 19%">이메일</th>
            <th style="width: 12%">연락처</th>
            <th style="width: 10%">생년월일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id" class="log-row">
            <td class="date-cell">{{ log.timestamp }}</td>
            <td>
              <span :class="['type-badge', log.type]">
                {{ getTypeLabel(log.type) }}
              </span>
            </td>
            <td class="emp-no">{{ log.empNo }}</td>
            <td class="name-text">{{ log.name }}</td>
            <td>{{ log.userId }}</td>
            <td class="email-text">{{ log.email }}</td>
            <td>{{ log.phone }}</td>
            <td>{{ log.birth }}</td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="8" class="empty-row">조회된 로그가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserManagementStore } from '../stores/userManagement'

const userManagementStore = useUserManagementStore()

const filters = reactive({
  startDate: '',
  endDate: '',
  type: 'all',
  query: ''
})

const isLoading = ref(false)

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const params = {
      action: filters.type !== 'all' ? filters.type : null,
      targetUsername: filters.query || null,
      // startDate/endDate 연동은 백엔드 UserLogSearchRequest에 따라 다름 (현재는 createdAt만 있음)
      // 일단 query 검색 위주로 처리
    }
    await userManagementStore.fetchUserLogs(params)
  } catch (error) {
    alert('로그를 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLogs)

watch(() => [filters.type], fetchLogs)
watch(() => filters.query, (newVal) => {
  if (newVal.length === 0 || newVal.length >= 2) {
    fetchLogs()
  }
})

// 백엔드 데이터를 UI 형식에 맞게 가공
const formattedLogs = computed(() => {
  return userManagementStore.userLogs.map(log => ({
    id: log.logId,
    timestamp: formatDate(log.createdAt),
    type: log.action,
    empNo: log.employeeNumber,
    name: log.targetUsername,
    userId: log.email.split('@')[0], // 아이디 예시로 이메일 앞자리 사용 (로그에 아이디 필드가 부족함)
    email: log.email,
    phone: log.phone,
    birth: log.birthDate
  }))
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getTypeLabel = (type) => {
  const labels = {
    REGISTER: '신규 등록',
    INFO_UPDATE: '정보 수정',
    PASSWORD_UPDATE: '비밀번호 변경',
    DEACTIVATE: '계정 비활성화',
    RESTORE: '계정 복구',
    DELETE: '계정 삭제'
  }
  return labels[type] || type
}

const resetFilters = () => {
  filters.startDate = ''
  filters.endDate = ''
  filters.type = 'all'
  filters.query = ''
  fetchLogs()
}

const filteredLogs = computed(() => {
  // Since fetchLogs already applies filters via API, we just return the formatted logs.
  // Frontend date filtering is removed as per instruction comment.
  return formattedLogs.value
})
</script>

<style scoped>
.log-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.log-header {
  margin-bottom: 1.25rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.filter-section {
  background: #f8fafc;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.filter-bar {
  display: flex;
  gap: 1.5rem;
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

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
}

.filter-input, .filter-select {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  background: white;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
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
}

.search-box input:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}

.table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 1000px;
}

.log-table th {
  background: #f8fafc;
  color: #475569;
  padding: 1.1rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.log-table td {
  padding: 1.1rem 0.75rem;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  word-break: break-all;
  white-space: normal;
}

.log-row:hover {
  background: #f8fafc;
}

.date-cell {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
}

.emp-no {
  font-weight: 400;
  color: #1e293b;
}

.name-text {
  font-weight: 500;
}

.type-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge.REGISTER { background: #dcfce7; color: #166534; }
.type-badge.INFO_UPDATE { background: #e0f2fe; color: #0369a1; }
.type-badge.PASSWORD_UPDATE { background: #e0f2fe; color: #0369a1; }
.type-badge.DEACTIVATE { background: #f1f5f9; color: #64748b; }
.type-badge.RESTORE { background: #fef3c7; color: #92400e; }
.type-badge.DELETE { background: #fee2e2; color: #991b1b; }

.empty-row {
  text-align: center;
  padding: 4rem !important;
  color: #94a3b8;
}
</style>
