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
            <option value="register">신규 등록</option>
            <option value="edit">정보 수정</option>
            <option value="deactivate">계정 비활성화</option>
            <option value="restore">계정 복구</option>
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
            <th style="width: 22%">일시</th>
            <th style="width: 12%" class="text-center">변동 유형</th>
            <th style="width: 9%" class="text-center">사원번호</th>
            <th style="width: 8%">이름</th>
            <th style="width: 8%">아이디</th>
            <th style="width: 19%">이메일</th>
            <th style="width: 12%">연락처</th>
            <th style="width: 10%" class="text-center">생년월일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id" class="log-row">
            <td class="date-cell">{{ log.timestamp }}</td>
            <td class="text-center">
              <span :class="['type-badge', log.type]">
                {{ getTypeLabel(log.type) }}
              </span>
            </td>
            <td class="emp-no text-center">{{ log.empNo }}</td>
            <td class="name-text">{{ log.name }}</td>
            <td>{{ log.userId }}</td>
            <td class="email-text">{{ log.email }}</td>
            <td>{{ log.phone }}</td>
            <td class="text-center">{{ log.birth }}</td>
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
import { ref, reactive, computed } from 'vue'

const filters = reactive({
  startDate: '',
  endDate: '',
  type: 'all',
  query: ''
})

const logs = ref([
  { id: 1, timestamp: '2026-02-10 16:45:22', type: 'register', empNo: '20001', name: '홍길동', userId: 'hong123', email: 'hong@email.com', phone: '010-1234-5678', birth: '1995-05-15' },
  { id: 2, timestamp: '2026-02-10 15:30:10', type: 'edit', empNo: '30001', name: '김철수', userId: 'chulsoo', email: 'kim@email.com', phone: '010-9876-5432', birth: '1992-12-01' },
  { id: 3, timestamp: '2026-02-09 10:20:05', type: 'deactivate', empNo: '20002', name: '이영희', userId: 'yhlee', email: 'lee@email.com', phone: '010-5555-6666', birth: '1998-02-28' },
  { id: 4, timestamp: '2026-02-08 14:12:44', type: 'restore', empNo: '20002', name: '이영희', userId: 'yhlee', email: 'lee@email.com', phone: '010-5555-6666', birth: '1998-02-28' },
  { id: 5, timestamp: '2026-02-08 09:05:12', type: 'register', empNo: '20003', name: '박지민', userId: 'jiminP', email: 'park@email.com', phone: '010-2222-3333', birth: '1994-11-20' },
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const typeMatch = filters.type === 'all' || log.type === filters.type
    const searchMatch = !filters.query || 
      log.name.includes(filters.query) || 
      log.userId.includes(filters.query) || 
      log.empNo.includes(filters.query)
    
    let dateMatch = true
    if (filters.startDate) dateMatch = dateMatch && log.timestamp >= filters.startDate
    if (filters.endDate) dateMatch = dateMatch && log.timestamp <= filters.endDate + ' 23:59:59'

    return typeMatch && searchMatch && dateMatch
  })
})

const getTypeLabel = (type) => {
  const labels = {
    register: '신규 등록',
    edit: '정보 수정',
    deactivate: '계정 비활성화',
    restore: '계정 복구'
  }
  return labels[type] || type
}

const resetFilters = () => {
  filters.startDate = ''
  filters.endDate = ''
  filters.type = 'all'
  filters.query = ''
}
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
  font-size: 1.75rem;
  font-weight: 700;
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
  font-size: 0.85rem;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.log-table th.text-center {
  text-align: center;
}

.log-table td {
  padding: 1.1rem 0.75rem;
  font-size: 0.9rem;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-table td.text-center {
  text-align: center;
}

.log-row:hover {
  background: #f8fafc;
}

.date-cell {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1e293b;
}

.emp-no {
  font-weight: 700;
  color: #1e293b;
}

.name-text {
  font-weight: 600;
}

.type-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.type-badge.register { background: #dcfce7; color: #166534; }
.type-badge.edit { background: #e0f2fe; color: #0369a1; }
.type-badge.deactivate { background: #fee2e2; color: #991b1b; }
.type-badge.restore { background: #fef3c7; color: #92400e; }

.empty-row {
  text-align: center;
  padding: 4rem !important;
  color: #94a3b8;
}
</style>
