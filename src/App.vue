<script setup>
import { ref, computed } from 'vue'

const userName = ref('관리자')
const projectTitle = ref('CHAIN-G')

// 테스트용 재고 데이터
const inventoryItems = ref([
  { id: 'MK-001', name: '오리지널 떡볶이 밀키트', category: '밀키트', stock: 150, price: 12900, status: '정상' },
  { id: 'MK-002', name: '마라 떡볶이 밀키트', category: '밀키트', stock: 85, price: 14900, status: '정상' },
  { id: 'MK-003', name: '로제 떡볶이 밀키트', category: '밀키트', stock: 42, price: 13900, status: '정상' },
  { id: 'MK-004', name: '오리지널 떡볶이 (대용량)', category: '밀키트', stock: 12, price: 22000, status: '정상' },
])

const searchQuery = ref('')
const selectedCategory = ref('전체')
const categories = ['전체', '밀키트']

// 필터링 된 아이템
const filteredItems = computed(() => {
  return inventoryItems.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === '전체' || item.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
}

const getStatusClass = (status) => {
  switch (status) {
    case '정상': return 'status-ok'
    case '품절임박': return 'status-warning'
    case '품절': return 'status-danger'
    default: return ''
  }
}
</script>

<template>
  <div class="chain-g-app-root">
    <!-- 왼쪽 사이드바 -->
    <aside class="sidebar">
      <div class="brand">
        <div class="barcode-container">
          <!-- 이미지와 유사한 바코드 라인들 -->
          <div class="barcode-visual">
            <div class="b-line thick"></div>
            <div class="b-line thin"></div>
            <div class="b-line mid"></div>
            <div class="b-line thick"></div>
            <div class="b-line thin"></div>
            <div class="b-line mid"></div>
            <div class="b-line thin"></div>
            <div class="b-line thick"></div>
            <div class="b-line thin"></div>
            <div class="b-line mid"></div>
            <div class="b-line thick"></div>
            <div class="b-line thin"></div>
            <div class="b-line mid"></div>
            <div class="b-line thick"></div>
          </div>
          <div class="barcode-text">C H A I N - G</div>
        </div>
      </div>
      
      <nav class="menu">
        <div class="menu-group">메인 메뉴</div>
        <ul>
          <li class="active"><span class="icon">📊</span> 대시보드</li>
          <li><span class="icon">📦</span> 재고 현황</li>
          <li><span class="icon">🚚</span> 입출고 관리</li>
          <li><span class="icon">📈</span> 분석 리포트</li>
        </ul>
        
        <div class="menu-group">시스템</div>
        <ul>
          <li><span class="icon">👥</span> 직원 관리</li>
          <li><span class="icon">⚙️</span> 환경 설정</li>
        </ul>
      </nav>

      <div class="user-card">
        <div class="user-avatar"></div>
        <div class="user-detail">
          <p class="u-name">{{ userName }}</p>
          <p class="u-role">System Admin</p>
        </div>
      </div>
    </aside>

    <!-- 오른쪽 메인 영역 -->
    <div class="main-container">
      <!-- 상단 헤더 -->
      <header class="header">
        <div class="page-title">
          <h2>재고 관리 현황</h2>
        </div>
        
        <div class="header-tools">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" v-model="searchQuery" placeholder="SKU ID 또는 상품명으로 검색...">
          </div>
          <div class="notification">
            <span class="bell">🔔</span>
            <span class="dot"></span>
          </div>
        </div>
      </header>

      <!-- 실제 컨텐츠 영역 (스크롤 가능) -->
      <main class="content-scroll">
        <div class="content-wrapper">
          
          <!-- 요약 대시보드 -->
          <section class="summary-section">
            <div class="summary-card">
              <span class="s-label">총 재고 액 (전체 건 기준)</span>
              <p class="s-value">₩ 5,280,000</p>
              <span class="s-trend up">↑ 8% vs 지난주</span>
            </div>
            <div class="summary-card">
              <span class="s-label">전체 SKU</span>
              <p class="s-value">{{ inventoryItems.length }}건</p>
              <span class="s-trend">현재 등록 기준</span>
            </div>
            <div class="summary-card warn">
              <span class="s-label">품절/부족</span>
              <p class="s-value">2건</p>
              <span class="s-trend">즉시 확인 필요</span>
            </div>
          </section>

          <!-- 컨트롤 바 -->
          <div class="control-bar">
            <div class="filter-tabs">
              <button 
                v-for="cat in categories" 
                :key="cat"
                :class="{ active: selectedCategory === cat }"
                @click="selectedCategory = cat"
              >
                {{ cat }}
              </button>
            </div>
            <button class="add-btn">+ 신규 품목 등록</button>
          </div>

          <!-- 테이블 데이터 -->
          <div class="data-table-card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU 번호</th>
                  <th>상품 명칭</th>
                  <th>카테고리</th>
                  <th>현재 재고</th>
                  <th>단가</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredItems" :key="item.id">
                  <td class="sku-cell">{{ item.id }}</td>
                  <td class="name-cell">{{ item.name }}</td>
                  <td>{{ item.category }}</td>
                  <td :class="{ 'text-danger': item.stock < 5 }"><strong>{{ item.stock }}</strong> 개</td>
                  <td>{{ formatPrice(item.price) }}</td>
                  <td>
                    <span :class="['status-tag', getStatusClass(item.status)]">
                      {{ item.status }}
                    </span>
                  </td>
                  <td>
                    <button class="action-btn edit">관리</button>
                  </td>
                </tr>
                <tr v-if="filteredItems.length === 0">
                  <td colspan="7" class="no-data">조건에 맞는 검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<style>
/* 
  Reset & Force Layout 
  기존 프로젝트의 main.css에서 설정된 #app 스타일을 강제로 덮어씁니다.
*/
#app {
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  width: 100% !important;
  height: 100% !important;
}

body {
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  overflow: hidden !important;
}

:root {
  --sidebar-w: 260px;
  --header-h: 70px;
  --primary: #6366f1;
  --bg-main: #f1f5f9;
  --border-color: #e2e8f0;
  --text-dark: #0f172a;
  --text-light: #64748b;
  --white: #ffffff;
}

* {
  box-sizing: border-box;
}

.chain-g-app-root {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-main);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-dark);
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-w);
  height: 100%;
  background-color: #1e293b;
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 0;
  flex-shrink: 0;
}

.brand {
  padding: 0 1.5rem 3rem;
  display: flex;
  justify-content: center;
}

.barcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px;
  width: 100%;
}

.barcode-visual {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
}

.b-line {
  background-color: var(--primary); /* 테마 색상 적용 */
  height: 100%;
}

.b-line.thick { width: 5px; }
.b-line.mid { width: 2.5px; }
.b-line.thin { width: 1px; }

.barcode-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.05rem;
  font-weight: 800;
  color: white; /* 어두운 배경에 잘 보이도록 흰색 적용 */
  letter-spacing: 5px;
  margin-top: 4px;
  white-space: nowrap; /* 글자가 밑으로 튀어나오지 않게 고정 */
}

.menu {
  flex: 1;
}

.menu-group {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 1.5rem 0.5rem;
  margin-top: 1.5rem;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  padding: 0.8rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.menu li:hover {
  background-color: #334155;
  color: white;
}

.menu li.active {
  background-color: #334155;
  color: white;
  border-left: 4px solid var(--primary);
  padding-left: calc(1.5rem - 4px);
}

.user-card {
  margin: 0 1.5rem;
  padding: 1rem;
  background-color: #334155;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background-color: #475569;
  border-radius: 50%;
}

.user-detail .u-name {
  margin: 0;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-detail .u-role {
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Main Container */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  height: var(--header-h);
  background: var(--white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  flex-shrink: 0;
}

.page-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-light);
}

.search-wrapper input {
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  width: 320px;
  font-size: 0.9rem;
  background-color: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
}

.search-wrapper input:focus {
  border-color: var(--primary);
}

.notification {
  position: relative;
  font-size: 1.2rem;
  cursor: pointer;
}

.notification .dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

/* Content Area */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* Summary Section */
.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.s-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.75rem;
}

.s-value {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.s-trend {
  font-size: 0.8rem;
  color: var(--text-light);
}

.s-trend.up { color: #10b981; font-weight: 600; }
.summary-card.warn .s-value { color: #ef4444; }

/* Control Bar */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tabs button {
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-light);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-tabs button.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.add-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

/* Table */
.data-table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  color: var(--text-light);
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
}

.data-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.95rem;
}

.sku-cell {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--primary);
}

.name-cell {
  font-weight: 700;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-ok { background-color: #d1fae5; color: #065f46; }
.status-warning { background-color: #fef3c7; color: #92400e; }
.status-danger { background-color: #fee2e2; color: #991b1b; }

.text-danger { color: #ef4444; }

.action-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.action-btn:hover {
  background-color: var(--bg-main);
}

.no-data {
  text-align: center;
  padding: 4rem !important;
  color: var(--text-light);
}

/* Custom Scrollbar */
.content-scroll::-webkit-scrollbar {
  width: 8px;
}
.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.content-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
