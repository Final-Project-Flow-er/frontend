<template>
  <div class="notice-list-container">
    <div class="notice-header">
      <div class="header-left">
        <h1>공지사항</h1>
        <p class="subtitle">시스템 알림 및 주요 소식을 확인하세요</p>
      </div>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group search-group">
          <label>검색</label>
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              :value="filters.searchQuery" 
              @input="e => filters.searchQuery = e.target.value"
              placeholder="제목 또는 내용 검색"
            >
          </div>
        </div>

        <div class="filter-group author-group">
          <label>작성자</label>
          <div class="author-box">
            <input 
              type="text" 
              :value="filters.author" 
              @input="e => filters.author = e.target.value"
              placeholder="작성자명 검색"
              class="author-input"
            >
          </div>
        </div>

        <div class="filter-actions">
          <button @click="resetFilters" class="btn-reset">초기화</button>
          <button v-if="isAdmin" @click="goToRegister" class="btn-register">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            공지 등록
          </button>
        </div>
      </div>
    </div>

    <!-- 공지사항 목록 -->
    <div v-if="filteredNotices.length > 0" class="notice-table-container">
      <table class="notice-table">
        <thead>
          <tr>
            <th class="col-no">NO</th>
            <th class="col-title">제목</th>
            <th class="col-author">작성자</th>
            <th class="col-date">등록일</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="notice in filteredNotices" 
            :key="notice.id"
            @click="goToDetail(notice.id)"
            class="notice-row"
            :class="{ 'is-important': notice.isImportant }"
          >
            <td class="col-no">
              <span v-if="notice.isImportant" class="badge-important">중요</span>
              <span v-else>{{ notice.id }}</span>
            </td>
            <td class="col-title">
              <div class="title-wrapper">
                <span class="title-text">{{ notice.title }}</span>
                <svg v-if="notice.hasAttachment" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-clip">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              </div>
            </td>
            <td class="col-author">{{ notice.author }}</td>
            <td class="col-date">{{ notice.createdAt }}</td>
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
      <p>등록된 공지사항이 없습니다</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userRole = sessionStorage.getItem('userRole')
const isAdmin = computed(() => userRole === 'admin' || userRole === 'headOffice')
const filters = reactive({
  searchQuery: '',
  author: ''
})

const notices = ref([
  {
    id: 3,
    title: '[긴급] 시스템 점검 안내 (02/15)',
    author: '본사 관리자',
    content: '원활한 서비스 제공을 위해 아래와 같이 시스템 점검을 진행할 예정입니다.',
    createdAt: '2026-02-10',
    views: 125,
    isImportant: true,
    hasAttachment: false
  },
  {
    id: 2,
    title: '신규 상품 입고 및 주문 가이드 안내',
    author: '영업기획팀',
    content: '안녕하세요. 본사 관리자입니다. 2026년 상반기 신규 상품 라인업이 확정되었습니다.',
    createdAt: '2026-02-08',
    views: 450,
    isImportant: false,
    hasAttachment: true
  },
  {
    id: 1,
    title: '개인정보 처리방침 개정 안내',
    author: '법무지원부',
    content: '회사의 개인정보 처리방침이 다음과 같이 개정될 예정임을 안내 드립니다.',
    createdAt: '2026-02-01',
    views: 890,
    isImportant: false,
    hasAttachment: false
  }
])

const filteredNotices = computed(() => {
  return notices.value.filter(n => {
    const query = filters.searchQuery.toLowerCase()
    const matchesSearch = !query || 
      n.title.toLowerCase().includes(query) || 
      n.content.toLowerCase().includes(query)
    
    const authorQuery = filters.author.toLowerCase()
    const matchesAuthor = !authorQuery || n.author.toLowerCase().includes(authorQuery)
    
    return matchesSearch && matchesAuthor
  })
})

const resetFilters = () => {
  filters.searchQuery = ''
  filters.author = ''
}

const goToRegister = () => {
  router.push('/notice/register')
}

const goToDetail = (id) => {
  router.push(`/notice/${id}`)
}
</script>

<style scoped>
.notice-list-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.notice-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-register:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

/* 검색 및 필터 */
.filter-section {
  background: white;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
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
  color: #64748b;
}

.search-group {
  flex: 1;
  min-width: 250px;
}

.search-box {
  position: relative;
}

.search-box svg {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}

.author-inputs {
  display: flex;
  align-items: center;
}

.author-input {
  padding: 0.6rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-reset {
  padding: 0.6rem 1rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.btn-register {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

/* 테이블 */
.notice-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.notice-table {
  width: 100%;
  border-collapse: collapse;
}

.notice-table th {
  background: #f8fafc;
  padding: 1.25rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.notice-table th.col-no,
.notice-table th.col-author,
.notice-table th.col-date {
  text-align: center;
}

.notice-table td {
  padding: 1.25rem 1rem;
  font-size: 0.95rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
}

.col-no { width: 80px; text-align: center !important; }
.col-author { width: 120px; color: #475569; text-align: center !important; }
.col-date { width: 140px; color: #64748b !important; text-align: center !important; }

.notice-row {
  cursor: pointer;
  transition: background 0.2s;
}

.notice-row:hover {
  background: #f8fafc;
}

.notice-row.is-important {
  background: #fffbeb;
}

.notice-row.is-important:hover {
  background: #fef3c7;
}

.badge-important {
  background: #ef4444;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-text {
  font-weight: 500;
}

.is-important .title-text {
  font-weight: 700;
  color: #0f172a;
}

.icon-clip {
  color: #94a3b8;
}

.no-results {
  text-align: center;
  padding: 5rem;
  color: #94a3b8;
}

.no-results svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
