<template>
  <div class="notice-detail-container">
    <div class="detail-header">
      <button @click="goBack" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        목록으로
      </button>
      <div v-if="isAdmin" class="admin-actions">
        <button @click="goToEdit" class="btn-edit">수정</button>
        <button @click="confirmDelete" class="btn-delete">삭제</button>
      </div>
    </div>

    <div v-if="notice" class="notice-card">
      <div class="card-header">
        <div class="title-section">
          <span v-if="notice.important" class="badge-important">중요</span>
          <h1>{{ notice.title }}</h1>
        </div>
        <div class="meta-info">
          <div class="meta-row">
            <div class="meta-item">
              <span class="label">작성자</span>
              <span class="value">{{ notice.authorName }}</span>
            </div>
            <div class="divider"></div>
            <div class="meta-item">
              <span class="label">등록일</span>
              <span class="value">{{ formatDate(notice.createdAt) }}</span>
            </div>
            <template v-if="notice.updaterName && notice.updatedAt && notice.createdAt !== notice.updatedAt">
              <div class="divider"></div>
              <div class="meta-item modifier">
                <span class="label">최종 수정</span>
                <span class="value">{{ notice.updaterName }} ({{ formatDate(notice.updatedAt) }})</span>
              </div>
            </template>
            <template v-if="isAdmin && notice.important && notice.importantUntil">
              <div class="divider"></div>
              <div class="meta-item expiration">
                <span class="label">상단 고정 종료</span>
                <span class="value">{{ formatDate(notice.importantUntil) }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="content">
          {{ notice.content }}
        </div>

        <!-- 이미지 갤러리 -->
        <div v-if="notice.images && notice.images.length > 0" class="image-gallery">
          <div v-for="(img, index) in notice.images" :key="index" class="image-item">
            <img :src="img.url" :alt="img.originName" class="notice-image">
          </div>
        </div>

        <!-- 첨부파일 목록 -->
        <div v-if="notice.attachments && notice.attachments.length > 0" class="attachment-box">
          <div class="attachment-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            <span>첨부파일 ({{ notice.attachments.length }})</span>
          </div>
          <div class="attachment-list">
            <a v-for="(file, index) in notice.attachments" :key="index" :href="file.url" class="file-link" download>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="file-name">{{ file.originName }}</span>
              <span class="file-size">({{ formatSize(file.size) }})</span>
            </a>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <button @click="goBack" class="btn-list">목록 페이지로 이동</button>
      </div>
    </div>

    <!-- 이전글/다음글 -->
    <div v-if="notice" class="navigation-links">
      <div 
        class="nav-item prev" 
        :class="{ 'is-disabled': !notice.prevNotice }"
        @click="notice.prevNotice && goToNotice(notice.prevNotice.id)"
      >
        <span class="nav-label">이전글</span>
        <span class="nav-title">{{ notice.prevNotice ? notice.prevNotice.title : '이전글이 없습니다' }}</span>
      </div>
      <div 
        class="nav-item next" 
        :class="{ 'is-disabled': !notice.nextNotice }"
        @click="notice.nextNotice && goToNotice(notice.nextNotice.id)"
      >
        <span class="nav-label">다음글</span>
        <span class="nav-title">{{ notice.nextNotice ? notice.nextNotice.title : '다음글이 없습니다' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api/index'

const router = useRouter()
const route = useRoute()
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
const userRole = computed(() => authStore.userRole?.toLowerCase())
const isAdmin = computed(() => ['admin', 'headoffice', 'hq'].includes(userRole.value))

const notice = ref(null)

const loadNoticeDetail = async (id) => {
  try {
    const response = await api.get(`/notices/${id}`)
    if (response.data.success) {
      notice.value = response.data.data
      window.scrollTo(0, 0)
    }
  } catch (err) {
    console.error('Failed to fetch notice detail:', err)
    alert('공지사항을 불러오는 데 실패했습니다.')
    router.push('/notice')
  }
}

onMounted(async () => {
  await loadNoticeDetail(route.params.id)
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadNoticeDetail(newId)
  }
})

const goBack = () => {
  router.push('/notice')
}

const goToNotice = (id) => {
  router.push(`/notice/${id}`)
}

const goToEdit = () => {
  router.push(`/notice/edit/${notice.value.id}`)
}

const confirmDelete = async () => {
  if (confirm('이 공지사항을 삭제하시겠습니까?')) {
    try {
      await api.delete(`/notices/${notice.value.id}`)
      alert('공지사항이 삭제되었습니다.')
      router.push('/notice')
    } catch (err) {
      console.error('Failed to delete notice:', err)
      alert('공지사항 삭제 중 오류가 발생했습니다.')
    }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.meta-item.expiration {
  color: #ef4444;
}
.meta-item.expiration .label {
  color: #f87171;
}
.meta-item.expiration .value {
  color: #ef4444;
}

.notice-detail-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.admin-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit {
  padding: 0.5rem 1.25rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}

.btn-delete {
  padding: 0.5rem 1.25rem;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
}

/* 카드 */
.notice-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 2.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.badge-important {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
}

.title-section h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.meta-info {
  display: flex;
  align-items: center;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.divider {
  width: 1.5px;
  height: 14px;
  background-color: #e2e8f0;
}

.meta-item .label { 
  color: #94a3b8; 
  font-weight: 500;
}

.meta-item .value { 
  color: #475569; 
  font-weight: 600; 
}

.meta-item.expiration .label {
  color: #f87171;
}

.meta-item.expiration .value {
  color: #ef4444;
}

.modifier {
  font-size: 0.85rem;
}

.card-body {
  padding: 2.5rem;
}

.content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
  margin-bottom: 2rem;
}

.image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.image-item {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.notice-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.attachment-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
}

.attachment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 1rem;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #2563eb;
  font-size: 0.95rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.file-link:hover {
  background: rgba(37, 99, 235, 0.05);
  text-decoration: underline;
}

.file-size {
  color: #94a3b8;
  font-size: 0.85rem;
}

.card-footer {
  padding: 2rem;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  border-top: 1px solid #f1f5f9;
}

.btn-list {
  padding: 0.75rem 2.5rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-list:hover {
  background: #f1f5f9;
}

/* 네비게이션 */
.navigation-links {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nav-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item.is-disabled {
  cursor: default;
  opacity: 0.5;
  filter: grayscale(1);
}

.nav-item:not(.is-disabled):hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.nav-title {
  font-size: 0.95rem;
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
