<template>
  <aside class="sidebar">
    <div class="logo-area" @click="goHome" role="button" aria-label="홈으로 이동">
      <p class="logo-barcode">CHAIN-G</p>
    </div>

    <nav class="menu">
      <div class="menu-group">메인 메뉴</div>
      <ul>
        <li
            v-for="item in mainMenus"
            :key="item"
            :class="{ active: activeMenu === item }"
            @click="setActive(item)"
        >
          {{ item }}
        </li>
      </ul>

      <div class="menu-group">시스템</div>
      <ul>
        <li
            v-for="item in systemMenus"
            :key="item"
            :class="{ active: activeMenu === item }"
            @click="setActive(item)"
        >
          {{ item }}
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mainMenus = ['대시보드', '재고 관리', '재고 현황', '입출고 관리', '분석 리포트']
const systemMenus = ['직원 관리', '환경 설정']

const activeMenu = ref('대시보드')

const setActive = (menuName) => {
  activeMenu.value = menuName
  if (menuName === '재고 관리') {
    router.push('/store/inventory')
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
  transition: all 0.2s ease; /* 텍스트 변화도 부드럽게 */
}

.menu { flex: 1; }
.menu-group { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; padding: 0 1.5rem 0.5rem; margin-top: 1.5rem; }

.menu ul { list-style: none; padding: 0; margin: 0; }

.menu li {
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.menu li.active {
  background-color: #334155;
  color: white;
  padding-left: 1.8rem;
}

.menu li.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 4px;
  background-color: #94a3b8;
  border-radius: 0 4px 4px 0;
}
</style>