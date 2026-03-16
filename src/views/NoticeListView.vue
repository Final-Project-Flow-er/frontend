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
              placeholder="제목으로 검색"
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
          <button @click="resetFilters" class="btn-reset-unified">초기화</button>
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
            :class="{ 'is-important': notice.important }"
          >
            <td class="col-no">
              <span v-if="notice.important" class="badge-important">중요</span>
              <span v-else>{{ notice.id }}</span>
            </td>
            <td class="col-title">
              <div class="title-wrapper">
                <span class="title-text">{{ notice.title }}</span>
              </div>
            </td>
            <td class="col-author">{{ notice.authorName }}</td>
            <td class="col-date">{{ notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 페이징 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        :disabled="currentPage === 0" 
        @click="changePage(currentPage - 1)"
        class="page-btn prev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        이전
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="p in visiblePages" 
          :key="p"
          @click="changePage(p)"
          :class="['page-num', { active: currentPage === p }]"
        >
          {{ p + 1 }}
        </button>
      </div>

      <button 
        :disabled="currentPage === totalPages - 1" 
        @click="changePage(currentPage + 1)"
        class="page-btn next"
      >
        다음
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- 결과 없음 -->
    <div v-if="filteredNotices.length === 0" class="no-results">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <p>등록된 공지사항이 없습니다</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/index'

const router = useRouter()
const userRole = sessionStorage.getItem('userRole')
const isAdmin = computed(() => userRole === 'admin' || userRole === 'headOffice')
const filters = reactive({
  searchQuery: '',
  author: ''
})

const notices = ref([])
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

onMounted(async () => {
  await fetchNotices()
})

const fetchNotices = async (page = 0) => {
  try {
    const response = await api.get(`/notices?page=${page}&size=${pageSize}`)
    if (response.data.success) {
      const pageData = response.data.data
      notices.value = pageData.content || []
      totalPages.value = pageData.totalPages || 0
      currentPage.value = pageData.number || 0
    }
  } catch (err) {
    console.error('Failed to fetch notices:', err)
  }
}

const changePage = (newPage) => {
  if (newPage >= 0 && newPage < totalPages.value) {
    fetchNotices(newPage)
    window.scrollTo(0, 0)
  }
}

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(0, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible)
  
  if (end - start < maxVisible) {
    start = Math.max(0, end - maxVisible)
  }
  
  for (let i = start; i < end; i++) {
    pages.push(i)
  }
  return pages
})

const filteredNotices = computed(() => {
  let result = [...notices.value]
  
  // 중요 공지 우선 정렬
  result.sort((a, b) => {
    if (a.important === b.important) {
      return b.id - a.id // 최신순
    }
    return a.important ? -1 : 1
  })

  return result.filter(n => {
    const query = filters.searchQuery.toLowerCase()
    const matchesSearch = !query || 
      (n.title || '').toLowerCase().includes(query)
    
    const authorQuery = filters.author.toLowerCase()
    const matchesAuthor = !authorQuery || (n.authorName || '').toLowerCase().includes(authorQuery)
    
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

/* 페이징 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-num {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.page-num.active {
  background: #0f172a;
  border-color: #0f172a;
  color: white;
}
</style>
