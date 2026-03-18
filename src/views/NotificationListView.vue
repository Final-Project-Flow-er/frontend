<template>
  <div class="notification-container">
    <div class="header-section">
      <div class="title-area">
        <h1>알림 목록</h1>
        <p class="subtitle">시스템 공지 및 재고 알림을 한곳에서 확인하세요</p>
      </div>
      <div class="header-actions">
        <button @click="notificationStore.markAllAsRead" class="btn-read-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
          전체 읽음 처리
        </button>
      </div>
    </div>

    <!-- 알림 필터 -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="changeTab(tab.id)"
        :class="['tab-item', { active: activeTab === tab.id }]"
      >
        {{ tab.name }}
        <span v-if="getTabUnreadCount(tab.id) > 0" class="unread-badge">
          {{ getTabUnreadCount(tab.id) }}
        </span>
      </button>
    </div>

    <!-- 알림 목록 -->
    <div class="notification-list">
      <div v-if="filteredNotifications.length > 0">
        <div 
          v-for="notif in filteredNotifications" 
          :key="notif.notificationId"
          :class="['notif-item', { unread: !notif.read }]"
          @click="handleNotifClick(notif)"
        >
          <div class="notif-icon-box" :class="notif.type.toLowerCase()">
            <template v-if="notif.type === 'NOTICE'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path>
                <path d="M15 14h.01"></path>
                <path d="M11 14h.01"></path>
                <path d="M7 14h.01"></path>
              </svg>
            </template>
            <template v-else-if="notif.type === 'STOCK'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21 21-4.3-4.3"></path>
                <circle cx="10" cy="10" r="7"></circle>
                <path d="M10 7v6"></path>
                <path d="M7 10h6"></path>
              </svg>
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 17V7h5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-5"></path>
              </svg>
            </template>
          </div>

          <div class="notif-content">
            <div class="notif-header">
              <span class="notif-type-label">{{ getTypeText(notif.type) }}</span>
              <span class="notif-time">{{ formatTime(notif.createdAt) }}</span>
            </div>
            <p class="notif-message">{{ notif.message }}</p>
          </div>

          <div class="notif-action">
            <div v-if="!notif.read" class="unread-dot"></div>
            <button class="btn-delete-notif" @click.stop="confirmDelete(notif.notificationId)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination" v-if="notificationStore.totalPages > 1">
          <button 
            class="page-btn" 
            :disabled="notificationStore.currentPage === 0"
            @click="goToPage(notificationStore.currentPage - 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          
          <div class="page-numbers">
            <button 
              v-for="p in visiblePages" 
              :key="p"
              @click="goToPage(p - 1)"
              :class="['page-num', { active: notificationStore.currentPage === p - 1 }]"
            >
              {{ p }}
            </button>
          </div>

          <button 
            class="page-btn" 
            :disabled="notificationStore.currentPage + 1 >= notificationStore.totalPages"
            @click="goToPage(notificationStore.currentPage + 1)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="empty-notif">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <p>새로운 알림이 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()
const activeTab = computed(() => notificationStore.activeTab)
const uiRole = sessionStorage.getItem('userRole')

const FACTORY_STOCK_ALERT_TARGET_BASE = 2000000000
const FRANCHISE_STOCK_ALERT_TARGET_BASE = 3000000000

const tabs = [
  { id: 'all', name: '전체' },
  { id: 'NOTICE', name: '공지사항' },
  { id: 'STOCK', name: '재고 알림' },
  { id: 'SYSTEM', name: '시스템' }
]

onMounted(() => {
  notificationStore.fetchNotifications()
})

const filteredNotifications = computed(() => notificationStore.notifications)

const changeTab = (tabId) => {
  notificationStore.fetchNotifications(0, 10, tabId)
}

const goToPage = (page) => {
  notificationStore.fetchNotifications(page, 10, activeTab.value)
}

const visiblePages = computed(() => {
  const total = notificationStore.totalPages
  const current = notificationStore.currentPage + 1
  const pages = []
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const confirmDelete = (id) => {
  if (confirm('이 알림을 삭제하시겠습니까?')) {
    notificationStore.deleteNotification(id)
  }
}

const getTabUnreadCount = (tabId) => {
  return notificationStore.unreadCounts[tabId]?.unread || 0
}

const getTypeText = (type) => {
  const mapping = {
    NOTICE: '공지사항',
    STOCK: '재고 알림',
    SYSTEM: '시스템'
  }
  return mapping[type] || '알림'
}

const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const min = 60 * 1000
  const hour = 60 * min
  const day = 24 * hour
  
  if (diff < min) return '방금 전'
  if (diff < hour) return `${Math.floor(diff / min)}분 전`
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`
  return date.toLocaleDateString()
}

const resolveStockNotificationRoute = (notif) => {
  const targetId = Number(notif?.targetId || 0)

  if (uiRole === 'franchise') {
    return '/store/inventory'
  }

  if (uiRole === 'headOffice') {
    if (targetId >= FRANCHISE_STOCK_ALERT_TARGET_BASE) {
      return '/hq/inventory/franchise'
    }
    return '/hq/inventory/factory'
  }

  if (uiRole === 'factory') {
    return '/hq/inventory/factory'
  }

  if (targetId >= FRANCHISE_STOCK_ALERT_TARGET_BASE) {
    return '/hq/inventory/franchise'
  }

  if (targetId >= FACTORY_STOCK_ALERT_TARGET_BASE) {
    return '/hq/inventory/factory'
  }

  return '/store/inventory'
}

const handleNotifClick = async (notif) => {
  if (!notif.read) {
    await notificationStore.readNotification(notif.notificationId)
  }
  
  // 타입별 이동 경로 설정
  if (notif.type === 'NOTICE') {
    router.push(`/notice/${notif.targetId}`)
  } else if (notif.type === 'STOCK') {
    router.push(resolveStockNotificationRoute(notif))
  } else if (notif.type === 'SYSTEM') {
    router.push('/mypage')
  }
}
</script>

<style scoped>
.notification-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.title-area h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

.btn-read-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-read-all:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 필터 탭 */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
}

.tab-item {
  padding: 0.5rem 1.25rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-item.active {
  background: #0f172a;
  color: white;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 0.1rem 0.45rem;
  border-radius: 20px;
  min-width: 1.4rem;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

/* 알림 목록 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.15rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.notif-item:hover {
  border-color: #94a3b8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.notif-item.unread {
  background: #f8fafc;
}


.notif-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon-box.notice { background: #eff6ff; color: #3b82f6; }
.notif-icon-box.stock { background: #fff1f2; color: #ef4444; }
.notif-icon-box.system { background: #f8fafc; color: #64748b; }

.btn-delete-notif {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
}

.notif-item:hover .btn-delete-notif {
  opacity: 1;
}

.btn-delete-notif:hover {
  background: #fee2e2;
  color: #ef4444;
}

.notif-content {
  flex: 1;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.notif-type-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.notif-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.notif-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.4rem;
}

.notif-message {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
}

.notif-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  align-self: center;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}

.arrow {
  color: #cbd5e1;
}

.empty-notif {
  text-align: center;
  padding: 5rem;
  color: #94a3b8;
}

.empty-notif svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 페이지네이션 스타일 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-bottom: 2rem;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #94a3b8;
  color: #0f172a;
  background: #f8fafc;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.page-num:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.page-num.active {
  background: #0f172a;
  color: white;
}
</style>
