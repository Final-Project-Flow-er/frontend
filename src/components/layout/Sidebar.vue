<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isActive = (path) => computed(() => route.path.startsWith(path)).value

const navigate = (path) => {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="logo-area">
      <p class="logo-barcode">CHAIN-G</p>
    </div>
    <nav class="menu">
      <div class="menu-group">판매/발주</div>
      <ul>
        <!-- 판매(상품) 관리 -->
        <li :class="{ active: isActive('/products') }" @click="navigate('/products')">
          <span class="icon">📦</span> 판매 관리
        </li>
        <!-- 발주 관리 -->
        <li :class="{ active: isActive('/orders') }" @click="navigate('/orders')">
           <span class="icon">🚚</span> 발주 관리
        </li>
      </ul>

      <div class="menu-group">물류/재고</div>
      <ul>
        <li :class="{ active: isActive('/inventory') }" @click="navigate('/inventory')">
          <span class="icon">📊</span> 재고 조회
        </li>
         <!-- 반품 관리 -->
        <li :class="{ active: isActive('/returns') }" @click="navigate('/returns')">
          <span class="icon">↩️</span> 반품 관리
        </li>
      </ul>
    </nav>
    <div class="user-card">
      <div class="user-avatar"></div>
      <div class="user-detail">
        <p class="u-name">관리자</p>
        <p class="u-role">System Admin</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.sidebar { width: var(--sidebar-w); height: 100%; background-color: #1e293b; color: #f8fafc; display: flex; flex-direction: column; padding-bottom: 2.5rem; flex-shrink: 0; }
.logo-area { padding: 40px 20px; text-align: center; background: #0f172a; margin-bottom: 10px; }
.logo-barcode { font-family: 'Libre Barcode 39 Text', system-ui; font-size: 48px; color: #ffffff; margin: 0; line-height: 1; }
.menu { flex: 1; }
.menu-group { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 0 1.5rem 0.5rem; margin-top: 1.5rem; }
.menu ul { list-style: none; padding: 0; margin: 0; }
.menu li { padding: 0.8rem 1.5rem; display: flex; align-items: center; gap: 12px; color: #94a3b8; cursor: pointer; transition: all 0.2s; font-weight: 500; }
.menu li.active { background-color: #334155; color: white; border-left: 4px solid var(--primary); padding-left: calc(1.5rem - 4px); }
.user-card { margin: 0 1.5rem; padding: 1rem; background-color: #334155; border-radius: 12px; display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 40px; height: 40px; background-color: #475569; border-radius: 50%; }
.user-detail .u-name { margin: 0; font-weight: 600; font-size: 0.9rem; }
.user-detail .u-role { margin: 0; font-size: 0.75rem; color: #94a3b8; }
</style>