<template>
  <header class="header">
    <div class="page-title"><h2>재고 관리 현황</h2></div>

    <div class="header-tools">
      <div class="notification" @click="$router.push('/notice')">
        <img src="@/assets/notification.png" alt="알림" class="notif-img">
        <span class="dot"></span>
      </div>

      <div class="user-card" @click="$router.push('/mypage')">
        <div class="user-avatar">
        </div>

        <div class="user-detail">
          <p class="u-name">유저</p>
          <p class="u-role">가맹점주</p>
        </div>

        <div class="divider"></div>

        <button class="logout-icon-btn" @click.stop="handleLogout" title="로그아웃">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps(['modelValue'])
defineEmits(['update:modelValue'])

const router = useRouter()

const handleLogout = () => {
  if(confirm('로그아웃 하시겠습니까?')) {
    sessionStorage.removeItem('isLoggedIn')
    router.push('/login')
  }
}
</script>

<style scoped>
.header { height: var(--header-h); background: var(--white); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; flex-shrink: 0; }
.page-title h2 { font-size: 1.25rem; font-weight: 700; margin: 0; }

.header-tools { display: flex; align-items: center; gap: 1rem; }

.notification { position: relative; cursor: pointer; display: flex; align-items: center; }
.notif-img { height: 28px; width: auto; }
.notification .dot { position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; }

.user-card {
  padding: 0.5rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.user-card:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.user-avatar {
  width: 35px;
  height: 35px;
  background-color: #475569;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid #ddd;
}

.user-detail .u-name { margin: 0; font-weight: 600; font-size: 0.85rem; color: #1e293b; }
.user-detail .u-role { margin: 0; font-size: 0.7rem; color: #94a3b8; }

.divider {
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
  margin: 0 4px;
}

.logout-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-icon-btn:hover {
  background-color: #fff1f2;
  color: #ef4444;
  transform: scale(1.1);
}

</style>