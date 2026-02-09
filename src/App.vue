<script setup>
import { ref } from 'vue'

const menuItems = [
  { name: '대시보드', code: 'DB01' },
  { name: '주문 관리', code: 'OR01' },
  { name: '입/출고 관리', code: 'WH01' },
  { name: '반품/교환', code: 'RT01' },
  { name: '재고 현황', code: 'ST01' },
  { name: '가맹점 관리', code: 'MS01' }
]

const activeMenu = ref('대시보드')

const stats = ref([
  { label: '금일 미처리 주문', value: '124', unit: '건', color: '#d63031' },
  { label: '공장 가동률', value: '85.2', unit: '%', color: '#2d3436' },
  { label: '긴급 발주건', value: '12', unit: '건', color: '#e17055' },
  { label: '품절 임박 품목', value: '5', unit: '종', color: '#636e72' }
])
</script>

<template>
  <div class="scm-system">
    <aside class="sidebar">
      <div class="logo-area">
        <p class="logo-barcode">CHAIN-G</p>
        <span class="system-ver">v1.2.0-stable</span>
      </div>
      
      <nav class="nav-container">
        <div 
          v-for="item in menuItems" 
          :key="item.name"
          :class="['nav-link', { active: activeMenu === item.name }]"
          @click="activeMenu = item.name"
        >
          <span class="menu-code">{{ item.code }}</span>
          {{ item.name }}
        </div>
      </nav>

      <div class="sidebar-footer">
        <p>SYSTEM SERVER: ONLINE</p>
      </div>
    </aside>

    <main class="viewport">
      <header class="global-header">
        <div class="breadcrumb">
          <span class="root">SYSTEM</span> / <span class="current">{{ activeMenu }}</span>
        </div>
        
        <div class="admin-info">
          <span class="server-time">2026-02-06 17:15:00</span>
          
          <div class="header-tools">
            <div class="tool-chip noti">
              <span class="chip-label">NOTIFICATIONS</span>
              <span class="chip-count">3</span>
            </div>

            <div class="tool-chip my-page">
              <span class="chip-label">MY PAGE</span>
            </div>
          </div>

          <div class="user-profile">
            <div class="user-tag">
              <span class="tag-role">SYSTEM ADMIN</span>
              <span class="tag-name">홍길동</span>
            </div>
            <button class="action-btn">LOGOUT</button>
          </div>
        </div>
      </header>

      <div class="scroll-area">
        <section class="summary-grid">
          <div v-for="stat in stats" :key="stat.label" class="summary-card">
            <div class="card-head">{{ stat.label }}</div>
            <div class="card-body">
              <span class="num" :style="{ color: stat.color }">{{ stat.value }}</span>
              <span class="unit">{{ stat.unit }}</span>
            </div>
          </div>
        </section>

        <section class="data-wrapper">
          <div class="section-title">
            <h4>[ 최근 주문 처리 내역 ]</h4>
            <div class="table-actions">
              <button class="sub-btn">EXCEL 다운로드</button>
              <button class="sub-btn">새로고침</button>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>주문번호</th>
                <th>거래처</th>
                <th>품목명</th>
                <th>수량</th>
                <th>등록일시</th>
                <th>진행상태</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td class="code">ORD-2026-001</td>
                <td>가맹점(강남점)</td>
                <td>오리지널 떡볶이 밀키트 외 2건</td>
                <td class="right">50</td>
                <td>2026-02-06 10:22</td>
                <td><span class="state in-progress">운송중</span></td>
              </tr>
              <tr>
                <td>2</td>
                <td class="code">ORD-2026-002</td>
                <td>가맹점(판교점)</td>
                <td>마라 떡볶이 밀키트</td>
                <td class="right">30</td>
                <td>2026-02-06 11:45</td>
                <td><span class="state hold">승인대기</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.scm-system {
  display: flex;
  height: 100vh;
  font-family: 'Pretendard', -apple-system, sans-serif;
  background-color: #ebedf0;
  color: #2d3436;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 220px;
  background-color: #1e272e;
  color: #d2dae2;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #000;
}

.logo-area {
  padding: 30px 15px;
  text-align: center;
  background: #0f1418;
}

.logo-barcode {
  font-family: 'Libre Barcode 39 Text', cursive;
  font-size: 38px;
  color: #fff;
  margin: 0;
}

.system-ver {
  font-size: 10px;
  color: #576574;
  letter-spacing: 1px;
}

.nav-link {
  padding: 12px 20px;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 1px solid #2d3436;
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-code {
  font-size: 11px;
  color: #576574;
  font-family: monospace;
}

.nav-link:hover { background: #2f3542; color: #fff; }
.nav-link.active { background: #0984e3; color: #fff; }

/* --- HEADER & ADMIN INFO --- */
.viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.global-header {
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #b2bec3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.breadcrumb {
  font-size: 12px;
  font-weight: bold;
  color: #636e72;
}

.admin-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.server-time {
  font-size: 11px;
  color: #b2bec3;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
}

.header-tools {
  display: flex;
  gap: 8px;
}

/* 리뉴얼된 도구 버튼 (칩 스타일) */
.tool-chip {
  display: flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #ced4da;
  background: #fff;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
}

.tool-chip:hover {
  border-color: #2d3436;
  background: #f8f9fa;
  box-shadow: 2px 2px 0px #2d3436; /* 각진 입체감 */
  transform: translate(-1px, -1px);
}

.chip-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #636e72;
}

.tool-chip:hover .chip-label { color: #2d3436; }

.chip-count {
  margin-left: 6px;
  background: #d63031;
  color: #fff;
  padding: 0 4px;
  font-size: 9px;
  font-family: monospace;
  font-weight: bold;
  border-radius: 1px;
}

/* 프로필 영역 */
.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-left: 20px;
  border-left: 1px solid #dfe6e9;
}

.user-tag {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.tag-role {
  font-size: 9px;
  font-weight: 900;
  color: #0984e3;
}

.tag-name {
  font-size: 13px;
  font-weight: 700;
  color: #2d3436;
}

.action-btn {
  background: #2d3436;
  color: #fff;
  border: none;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.action-btn:hover { background: #000; }

/* --- MAIN CONTENT --- */
.scroll-area { padding: 20px; overflow-y: auto; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.summary-card {
  background: #fff;
  border: 1px solid #b2bec3;
  padding: 15px;
}

.card-head {
  font-size: 12px;
  color: #636e72;
  font-weight: bold;
  border-left: 3px solid #2d3436;
  padding-left: 8px;
  margin-bottom: 10px;
}

.card-body { text-align: right; }
.num { font-size: 24px; font-weight: 800; font-family: 'Tahoma', sans-serif; }
.unit { font-size: 13px; margin-left: 5px; color: #2d3436; }

.data-wrapper {
  background: #fff;
  border: 1px solid #b2bec3;
  padding: 20px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #f1f2f6;
  border: 1px solid #ced4da;
  padding: 10px;
  text-align: center;
}

.data-table td { border: 1px solid #ced4da; padding: 10px; }
.data-table tr:nth-child(even) { background: #f8f9fa; }
.code { font-family: monospace; font-weight: bold; color: #0984e3; }
.right { text-align: right; }

.state {
  display: block;
  text-align: center;
  padding: 2px 0;
  font-size: 11px;
  border-radius: 2px;
  color: white;
}

.in-progress { background: #0984e3; }
.hold { background: #636e72; }

.sub-btn {
  padding: 5px 10px;
  font-size: 12px;
  background: #fff;
  border: 1px solid #b2bec3;
  cursor: pointer;
  margin-left: 5px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 15px;
  font-size: 10px;
  color: #2f3542;
  border-top: 1px solid #2d3436;
}
</style>