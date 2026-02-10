<template>
  <aside class="sidebar">
    <div class="logo-area" @click="goHome" role="button" aria-label="홈으로 이동">
      <p class="logo-barcode">CHAIN-G</p>
    </div>

    <nav class="menu">
      <template v-for="category in sidebarItems" :key="category.name">
        <div class="menu-group">{{ category.name }}</div>
        <ul>
          <li
            v-for="item in category.children"
            :key="item.routeName"
          >
            <router-link :to="{ name: item.routeName }" active-class="active">
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mainMenus = ['대시보드', '재고 관리', '재고 현황', '입출고 관리', '가맹점 정산', '본사 정산', '분석 리포트']
const systemMenus = ['직원 관리', '환경 설정']

const goHome = () => {
  router.push({ path: '/' })
}
// Updated sidebar items
const sidebarItems = ref([
  {
    name: '본사',
    children: [
      { name: '발주 관리', routeName: 'head-office-order-list' },
      { name: '발주 요청 접수', routeName: 'head-office-order-reception' },
      { name: '발주 요청 관리', routeName: 'head-office-order-request' },
      { name: '반품 요청 관리', routeName: 'head-office-return-list' },
      { name: '정산 관리', routeName: 'hq-settlement-list' },
    ]
  },
  {
    name: '가맹점',
    children: [
      { name: '입고 관리', routeName: 'franchise-inbound' },
      { name: '발주 관리', routeName: 'franchise-order-list' },
      { name: '반품 관리', routeName: 'franchise-return-list' },
      { name: '판매 관리', routeName: 'franchise-product-sell' },
      { name: '재고 관리', routeName: 'store-inventory' },
      { name: '정산 관리', routeName: 'store-settlement-summary' },
    ]
  },
  {
    name: '공장',
    children: [
      { name: '입고 관리', routeName: 'factory-inbound' },
      { name: '출고 관리', routeName: 'factory-outbound' },
      { name: '발주 요청 접수', routeName: 'factory-order-list' },
      { name: '발주 요청 관리', routeName: 'factory-order-request' },
    ]
  }
])
const activeMenu = ref('대시보드')

const setActive = (menuName) => {
  activeMenu.value = menuName
  if (menuName === '재고 관리') {
    router.push('/store/inventory')
  } else if (menuName === '가맹점 정산') {
    router.push('/store/settlement')
  } else if (menuName === '본사 정산') {
    router.push('/hq/settlement')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.sidebar {
  width: var(--sidebar-w);
  height: 100%;
  background-color: #1e293b;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding-bottom: 2.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.logo-area {
  padding: 40px 20px;
  text-align: center;
  background: #0f172a;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  overflow: hidden;
}

.logo-area:hover {
  background: #1e293b;
}

.logo-area:hover .logo-barcode {
  transform: scale(1.05);
  color: #ffffff;
}

.logo-area:active {
  transform: scale(0.95);
  filter: brightness(0.8);
}

.logo-barcode {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 48px;
  color: #ffffff;
  margin: 0;
  line-height: 1;
  transition: all 0.2s ease;
}

.menu {
  flex: 1;
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: hidden;
}

/* Custom scrollbar for sidebar */
.menu::-webkit-scrollbar {
  width: 4px;
}
.menu::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}
.menu::-webkit-scrollbar-track {
  background: transparent;
}

.menu-group { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 0 1.5rem 0.5rem; margin-top: 1.5rem; }

.menu ul { list-style: none; padding: 0; margin: 0; }

.menu li {
  display: flex;
  align-items: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.menu li:hover a {
  color: #ffffff;
}

.menu li a {
  color: inherit;
  text-decoration: none;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  padding: 0.8rem 1.5rem;
}

.menu li a.active {
  background-color: #334155;
  color: white;
  padding-left: 1.8rem;
}

.menu li a.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 4px;
  background-color: var(--primary, #94a3b8);
  border-radius: 0 4px 4px 0;
}
</style>