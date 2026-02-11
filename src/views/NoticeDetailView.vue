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
          <span v-if="notice.isImportant" class="badge-important">중요</span>
          <h1>{{ notice.title }}</h1>
        </div>
        <div class="meta-info">
          <div class="meta-item">
            <span class="label">등록일</span>
            <span class="value">{{ notice.createdAt }}</span>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="content">
          {{ notice.content }}
        </div>

        <div v-if="notice.hasAttachment" class="attachment-box">
          <div class="attachment-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            <span>첨부파일 (1)</span>
          </div>
          <a href="#" class="file-link" @click.prevent>
            <span class="file-name">2026_신규상품_가이드라인.pdf</span>
            <span class="file-size">(2.4 MB)</span>
          </a>
        </div>
      </div>

      <div class="card-footer">
        <button @click="goBack" class="btn-list">목록 페이지로 이동</button>
      </div>
    </div>

    <!-- 다음/이전글 (선택적) -->
    <div class="navigation-links">
      <div class="nav-item prev">
        <span class="nav-label">이전글</span>
        <span class="nav-title">개인정보 처리방침 개정 안내</span>
      </div>
      <div class="nav-item next">
        <span class="nav-label">다음글</span>
        <span class="nav-title">다음글이 없습니다</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isAdmin = ref(true) // 실제로는 유저 역할에 따라 설정

const notice = ref(null)

onMounted(() => {
  const noticeId = route.params.id
  // 실제로는 API 호출
  // 목 데이터 매칭
  if (noticeId === '3') {
    notice.value = {
      id: 3,
      title: '[긴급] 시스템 점검 안내 (02/15)',
      content: '원활한 서비스 제공을 위해 아래와 같이 시스템 점검을 진행할 예정입니다.\n\n[점검 일시]\n2026년 2월 15일(일) 02:00 ~ 04:00 (약 2시간)\n\n[점검 내용]\n데이터베이스 최적화 및 보안 패치 적용\n\n점검 시간 동안에는 서비스 접속이 일시적으로 제한될 수 있으니 양해 부탁드립니다.',
      createdAt: '2026-02-10',
      views: 125,
      isImportant: true,
      hasAttachment: false
    }
  } else {
    // 기본 샘플
    notice.value = {
      id: 2,
      title: '신규 상품 입고 및 주문 가이드 안내',
      content: '안녕하세요. 본사 관리자입니다.\n\n2026년 상반기 신규 상품 라인업이 확정되어 안내 드립니다.\n첨부된 가이드 파일을 확인하시어 주문 및 판매에 참고 부탁드립니다.\n\n궁금하신 사항은 영업담당자에게 문의 바랍니다.',
      createdAt: '2026-02-08',
      views: 450,
      isImportant: false,
      hasAttachment: true
    }
  }
})

const goBack = () => {
  router.push('/notice')
}

const goToEdit = () => {
  router.push(`/notice/edit/${notice.value.id}`)
}

const confirmDelete = () => {
  if (confirm('이 공지사항을 삭제하시겠습니까?')) {
    alert('공지사항이 삭제되었습니다.')
    router.push('/notice')
  }
}
</script>

<style scoped>
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
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.meta-item .label { color: #94a3b8; }
.meta-item .value { color: #475569; font-weight: 500; }

.divider {
  width: 1px;
  height: 12px;
  background: #e2e8f0;
}

.card-body {
  padding: 2.5rem;
}

.content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #334155;
  white-space: pre-wrap;
  margin-bottom: 3rem;
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
  margin-bottom: 0.75rem;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #2563eb;
  font-size: 0.95rem;
}

.file-link:hover {
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

.nav-item:hover {
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
