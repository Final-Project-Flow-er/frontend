<template>
  <aside class="sidebar">
    <div class="logo-area" @click="goHome" role="button" aria-label="홈으로 이동">
      <p class="logo-barcode">CHAIN-G</p>
    </div>

    <nav class="menu">
      <template v-for="(group, index) in filteredMenuGroups" :key="index">
        <div class="menu-group">{{ group.title }}</div>
        <ul>
          <li
              v-for="item in group.items"
              :key="item.name"
              :class="{
                  active: activeMenu === item.name || (item.children && item.children.some(c => c.path === currentPath)),
                  'has-children': item.children
              }"
          >
            <div class="menu-item-row" @click="toggleItem(item)">
              <div class="icon-container">
                <span v-if="item.children" class="arrow-icon" :class="{ open: item.isOpen }">▶</span>
              </div>
              <span>{{ item.name }}</span>
            </div>

            <!-- Children -->
            <ul v-if="item.children && item.isOpen" class="submenu">
              <li
                  v-for="child in item.children"
                  :key="child.name"
                  :class="{ active: currentPath === child.path, 'submenu-item': true }"
                  @click.stop="navigateTo(child.path)"
              >
                {{ child.name }}
              </li>
            </ul>
          </li>
        </ul>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuGroups = ref([
  {
    role: ['admin', 'headOffice'],
    title: '본사',
    items: [
      {
        name: '조직 관리',
        isOpen: false,
        children: [
          { name: '조직 등록', path: '/registration' },
          { name: '조직 조회', path: '/organizations' }
        ]
      },
      {
        name: '회원 관리',
        isOpen: false,
        children: [
          { name: '회원 등록', path: '/admin/member-registration' },
          { name: '회원 조회', path: '/admin/members' },
          { name: '회원 로그', path: '/admin/member-logs' }
        ]
      },
      {
        name: '운송 관리',
        isOpen: false,
        children: [
          { name: '업체 및 차량 등록', path: '/admin/logistics-registration' },
          { name: '업체 및 차량 조회', path: '/admin/logistics' }
        ]
      },
      {
        name: '재고 관리',
        isOpen: false,
        children: [
          { name: '공장 재고관리', path: '/hq/inventory/factory' },
          { name: '가맹점 재고관리', path: '/hq/inventory/franchise' }
        ]
      },
      { name: '상품 관리', path: '/hq/products/manage' },
      {
        name: '로그 관리',
        isOpen: false,
        children: [
          { name: '본사 로그', path: '/hq/inventory/logs/hq' },
          { name: '가맹점 로그', path: '/hq/inventory/logs/franchise' },
          { name: '공장 로그', path: '/hq/inventory/logs/factory' }
        ]
      },
      {
        name: '발주 관리',
        isOpen: false,
        children: [
          { name: '발주 관리', path: '/head-office/orders' },
          { name: '발주 요청 접수', path: '/head-office/orders/reception' },
          { name: '발주 요청 관리', path: '/head-office/orders/request' },
          { name: '차량 배정', path: '/factory/orders/vehicle-assignment' }
        ]
      },
      // [수정] 반품 관리 하위에 '차량 배정' 추가
      {
        name: '반품 관리',
        isOpen: false,
        children: [
          { name: '반품 요청 접수', path: '/head-office/returns/reception' },
          { name: '반품 요청 관리', path: '/head-office/returns' },
          { name: '차량 배정', path: '/head-office/returns/vehicle-assignment' }
        ]
      },
      { name: '정산 관리', path: '/hq/settlement' }
    ]
  },
  {
    role: ['admin', 'franchise'],
    title: '가맹점',
    items: [
      { name: '재고 관리', path: '/store/inventory' },
      { name: '상품 정보', path: '/products/manage' },
      { name: '로그 관리', path: '/inventory/logs' },
      { name: '입고 관리', path: '/franchise/inbound' },
      { name: '발주/반품 관리', path: '/franchise/orders' },
      { name: '반품 관리', path: '/franchise/returns' },
      { name: '판매 관리', path: '/franchise/products' },
      { name: '정산 관리', path: '/store/settlement' }
    ]
  },
  {
    role: ['admin', 'factory'],
    title: '공장',
    items: [
      { name: '입고 관리', path: '/factory/inbound' },
      { name: '출고 관리', path: '/factory/outbound' },
      {
        name: '발주 관리',
        isOpen: false,
        children: [
          { name: '발주 요청 접수', path: '/factory/orders' },
          { name: '발주 요청 관리', path: '/factory/orders/request' }
        ]
      },
      { name: '로그 관리', path: '/hq/inventory/logs/factory' }
    ]
  }
])

const userRole = sessionStorage.getItem('userRole')
const filteredMenuGroups = ref(menuGroups.value.filter(group => group.role.includes(userRole)))

const goHome = () => {
  router.push({ path: '/' })
}
const activeMenu = ref('대시보드')
const currentPath = ref(window.location.pathname)

watch(() => route.path, (newPath) => {
  currentPath.value = newPath
  filteredMenuGroups.value.forEach(group => {
    group.items.forEach(item => {
      if (item.children && item.children.some(c => c.path === newPath)) {
        item.isOpen = true
      }
    })
  })
})

const toggleItem = (item) => {
  if (item.children) {
    item.isOpen = !item.isOpen
  } else if (item.path) {
    router.push(item.path)
  }
}

const navigateTo = (path) => {
  router.push(path)
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
  flex-shrink: 0;
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
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar */
.menu::-webkit-scrollbar {
  width: 6px;
}
.menu::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
.menu::-webkit-scrollbar-track {
  background: transparent;
}
.menu::-webkit-scrollbar-thumb:hover {
  background: #475569;
}


.menu-group { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 0 1.5rem 0.5rem; margin-top: 1.5rem; }

.menu ul { list-style: none; padding: 0; margin: 0; }

.menu li {
  padding: 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
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

.menu-item-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 0.8rem 1.5rem;
  width: 100%;
}

.icon-container {
  width: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.arrow-icon {
  font-size: 0.7rem;
  display: inline-block;
  transition: transform 0.2s;
}
.arrow-icon.open {
  transform: rotate(90deg);
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

/* Submenu */
.submenu {
  width: 100%;
  background: rgba(0,0,0,0.2);
  padding-left: 0;
}

.submenu-item {
  font-size: 0.9rem;
  padding: 0.8rem 1.5rem 0.8rem 3.5rem !important;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.submenu-item:hover { background: rgba(255, 255, 255, 0.05) !important; color: white !important; }
.submenu-item.active { color: #60a5fa !important; background: rgba(59, 130, 246, 0.1) !important; }
</style>
