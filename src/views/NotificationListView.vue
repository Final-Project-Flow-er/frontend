<template>
  <div class="notification-container">
    <div class="header-section">
      <div class="title-area">
        <h1>알림 목록</h1>
        <p class="subtitle">시스템 공지 및 재고 알림을 한곳에서 확인하세요</p>
      </div>
      <div class="header-actions">
        <button @click="markAllAsRead" class="btn-read-all">
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
        @click="activeTab = tab.id"
        :class="['tab-item', { active: activeTab === tab.id }]"
      >
        {{ tab.name }}
        <span v-if="getUnreadCount(tab.id) > 0" class="unread-badge">{{ getUnreadCount(tab.id) }}</span>
      </button>
    </div>

    <!-- 알림 목록 -->
    <div class="notification-list">
      <div v-if="filteredNotifications.length > 0">
        <div 
          v-for="notif in filteredNotifications" 
          :key="notif.id"
          :class="['notif-item', { unread: !notif.isRead }]"
          @click="handleNotifClick(notif)"
        >
          <div class="notif-icon-box" :class="notif.type">
            <template v-if="notif.type === 'notice'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path>
                <path d="M15 14h.01"></path>
                <path d="M11 14h.01"></path>
                <path d="M7 14h.01"></path>
              </svg>
            </template>
            <template v-else-if="notif.type === 'inventory'">
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
              <span class="notif-time">{{ notif.time }}</span>
            </div>
            <h3 class="notif-title">{{ notif.title }}</h3>
            <p class="notif-message">{{ notif.message }}</p>
          </div>

          <div class="notif-action">
            <div v-if="!notif.isRead" class="unread-dot"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('all')

const tabs = [
  { id: 'all', name: '전체' },
  { id: 'notice', name: '공지사항' },
  { id: 'inventory', name: '재고 알림' },
  { id: 'system', name: '시스템' }
]

const notifications = ref([
  {
    id: 1,
    type: 'notice',
    title: '시스템 점검 안내',
    message: '금일 자정부터 2시간 동안 시스템 고도화 작업을 위한 점검이 진행될 예정입니다.',
    time: '방금 전',
    isRead: false,
    isImportant: true,
    link: '/notice/3'
  },
  {
    id: 2,
    type: 'inventory',
    title: '재고 위험 알림 (마라 떡볶이)',
    message: '마라 떡볶이 밀키트(순한맛, 1~2인분) 재고가 임계치 이하로 떨어졌습니다. 발주를 권장합니다.',
    time: '2시간 전',
    isRead: false,
    isImportant: true,
    link: '/store/inventory'
  },
  {
    id: 3,
    type: 'notice',
    title: '신규 상품 입고 가이드 업데이트',
    message: '2026년 상반기 신규 상품들의 주문 및 판매 가이드가 업데이트 되었습니다.',
    time: '5시간 전',
    isRead: true,
    isImportant: false,
    link: '/notice/2'
  },
  {
    id: 4,
    type: 'system',
    title: '비밀번호 변경 권장',
    message: '개인정보 보호를 위해 3개월마다 비밀번호를 변경해 주세요.',
    time: '어제',
    isRead: true,
    isImportant: false,
    link: '/mypage'
  },
  {
    id: 5,
    type: 'inventory',
    title: '입고 완료 안내',
    message: '요청하신 오리지널 떡볶이 밀키트 100개가 창고에 입고 완료되었습니다.',
    time: '2일 전',
    isRead: true,
    isImportant: false,
    link: '/franchise/inbound'
  }
])

const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notifications.value
  return notifications.value.filter(n => n.type === activeTab.value)
})

const getUnreadCount = (tabId) => {
  if (tabId === 'all') return notifications.value.filter(n => !n.isRead).length
  return notifications.value.filter(n => n.type === tabId && !n.isRead).length
}

const getTypeText = (type) => {
  const mapping = {
    notice: '공지사항',
    inventory: '재고 알림',
    system: '시스템'
  }
  return mapping[type] || '알림'
}

const handleNotifClick = (notif) => {
  notif.isRead = true
  if (notif.link) {
    router.push(notif.link)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
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
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  min-width: 1.2rem;
  text-align: center;
}

/* 알림 목록 */
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem;
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
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon-box.notice { background: #eff6ff; color: #3b82f6; }
.notif-icon-box.inventory { background: #fff1f2; color: #ef4444; }
.notif-icon-box.system { background: #f8fafc; color: #64748b; }

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
</style>
