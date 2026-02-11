<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock Data for Left List (Inbound Boxes)
const inboundBoxes = ref([
  { boxCode: 'BX-20260210-001', productCode: 'OR0101', name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 20 },
  { boxCode: 'BX-20260210-002', productCode: 'MA0301', name: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 15 },
  { boxCode: 'BX-20260210-003', productCode: 'RO0201', name: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 10 },
  { boxCode: 'BX-20260210-004', productCode: 'OR0103', name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', quantity: 5 },
])

// Mock Data for Right List (Details per box)
const allBoxDetails = {
  'BX-20260210-001': Array.from({ length: 20 }, (_, i) => ({
    id: `ITEM-OR0101-${1000 + i}`,
    productCode: 'OR0101',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    productionDate: '2026-02-01',
    expiryDate: '2026-02-15'
  })),
  'BX-20260210-002': Array.from({ length: 15 }, (_, i) => ({
    id: `ITEM-MA0301-${2000 + i}`,
    productCode: 'MA0301',
    name: '마라 떡볶이 밀키트 매운맛 1,2인분',
    productionDate: '2026-02-02',
    expiryDate: '2026-02-16'
  })),
  'BX-20260210-003': Array.from({ length: 10 }, (_, i) => ({
    id: `ITEM-RO0201-${3000 + i}`,
    productCode: 'RO0201',
    name: '로제 떡볶이 밀키트 기본맛 1,2인분',
    productionDate: '2026-02-03',
    expiryDate: '2026-02-17'
  })),
  'BX-20260210-004': Array.from({ length: 5 }, (_, i) => ({
    id: `ITEM-OR0103-${4000 + i}`,
    productCode: 'OR0103',
    name: '오리지널 떡볶이 밀키트 순한맛 3,4인분',
    productionDate: '2026-02-04',
    expiryDate: '2026-02-18'
  })),
}

const selectedBoxCode = ref(null)
const selectedBoxIds = ref(new Set())
const selectedItemIds = ref(new Set())

const selectedBoxDetails = computed(() => {
  if (!selectedBoxCode.value) return []
  return allBoxDetails[selectedBoxCode.value] || []
})

const selectBox = (boxCode) => {
  selectedBoxCode.value = boxCode
  selectedItemIds.value.clear()
}

// Checkbox Logic - Boxes
const toggleAllBoxes = (e) => {
  if (e.target.checked) {
    inboundBoxes.value.forEach(box => selectedBoxIds.value.add(box.boxCode))
  } else {
    selectedBoxIds.value.clear()
  }
}
const toggleBox = (boxCode) => {
  if (selectedBoxIds.value.has(boxCode)) selectedBoxIds.value.delete(boxCode)
  else selectedBoxIds.value.add(boxCode)
}

// Checkbox Logic - Items
const toggleAllItems = (e) => {
  if (e.target.checked) {
    selectedBoxDetails.value.forEach(item => selectedItemIds.value.add(item.id))
  } else {
    selectedItemIds.value.clear()
  }
}
const toggleItem = (itemId) => {
  if (selectedItemIds.value.has(itemId)) selectedItemIds.value.delete(itemId)
  else selectedItemIds.value.add(itemId)
}

const goToReturnRequest = () => {
    // Navigate to Return Management Page
    router.push({ name: 'franchise-return-list' })
}

const approveInbound = () => {
  if (!selectedBoxCode.value) {
    alert('입고 승인할 박스를 선택해주세요.')
    return
  }
  const confirmResult = confirm(`${selectedBoxCode.value} 박스를 입고 승인하시겠습니까?`)
  if (confirmResult) {
    // Remove the approved box from the list
    inboundBoxes.value = inboundBoxes.value.filter(box => box.boxCode !== selectedBoxCode.value)
    // Clear selection or select next? Clearing for now.
    selectedBoxCode.value = null
    alert('입고 승인 되었습니다.')
  }
}
</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <h2 class="page-title">입고 관리</h2>
    </div>

    <div class="split-container">
      <!-- Left Panel: Box List -->
      <section class="left-panel">
        <h3 class="panel-title">박스 목록</h3>
        <div class="data-table-card">
          <div class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" @change="toggleAllBoxes" :checked="inboundBoxes.length > 0 && selectedBoxIds.size === inboundBoxes.length">
                  </th>
                  <th>박스 코드</th>
                  <th>제품 코드</th>
                  <th>이름</th>
                  <th>수량</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="box in inboundBoxes" 
                  :key="box.boxCode" 
                  @click="selectBox(box.boxCode)"
                  :class="{ active: selectedBoxCode === box.boxCode }"
                  class="clickable-row"
                >
                  <td class="checkbox-col" @click.stop>
                    <input type="checkbox" :checked="selectedBoxIds.has(box.boxCode)" @change="toggleBox(box.boxCode)">
                  </td>
                  <td class="code-cell">{{ box.boxCode }}</td>
                  <td>{{ box.productCode }}</td>
                  <td class="name-cell">{{ box.name }}</td>
                  <td class="text-right">{{ box.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Spacer to align with right panel's button area -->
        <div class="action-bar spacer"></div>
      </section>

      <!-- Right Panel: Detail List -->
      <section class="right-panel">
        <h3 class="panel-title">상세 품목 목록</h3>
        <div class="data-table-card detail-card">
          <div v-if="!selectedBoxCode" class="empty-state">
            <p>좌측에서 박스를 선택해주세요.</p>
          </div>
          <div v-else class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" @change="toggleAllItems" :checked="selectedBoxDetails.value && selectedBoxDetails.value.length > 0 && selectedItemIds.size === selectedBoxDetails.value.length">
                  </th>
                  <th>제품 식별 코드</th>
                  <th>제품 코드</th>
                  <th>제품명</th>
                  <th>생산일</th>
                  <th>유통기한</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedBoxDetails" :key="item.id">
                  <td class="checkbox-col">
                     <input type="checkbox" :checked="selectedItemIds.has(item.id)" @change="toggleItem(item.id)">
                  </td>
                  <td class="code-cell">{{ item.id }}</td>
                  <td>{{ item.productCode }}</td>
                  <td class="name-cell">{{ item.name }}</td>
                  <td>{{ item.productionDate }}</td>
                  <td>{{ item.expiryDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-bar">
          <button class="action-btn return-btn" @click="goToReturnRequest">
            반품 요청
          </button>
          <button class="action-btn approve-btn" @click="approveInbound" :disabled="!selectedBoxCode">
            입고 승인
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { 
  max-width: 100%;
  height: 100%;
  padding: 0 0 1rem 0; /* Minimal padding */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevent page scroll */
}

.page-header {
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark, #1e293b);
  margin: 0;
}

.split-container {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden; /* Prevent full page scroll */
  min-height: 0; /* Crucial for flex nested scrolling */
}

/* Left Panel */
.left-panel {
  flex: 3.5; /* Narrower width (approx 35%) */
  display: flex;
  flex-direction: column;
  min-width: 0; /* Allow shrinking for scroll overlap if needed, though flex-basis handles it */
  min-height: 0;
}

/* Right Panel */
.right-panel {
  flex: 6.5; /* Wider width (approx 65%) */
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-dark, #334155);
  flex-shrink: 0;
}

.data-table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  min-height: 0;
}

.data-table-scroll-wrapper {
  flex: 1;
  overflow: auto;
  width: 100%;
}

.data-table {
  width: max-content; /* Allow table to expand */
  min-width: 100%; /* At least fill the container */
  border-collapse: collapse;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 10;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #334155;
  white-space: nowrap;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.clickable-row:hover {
  background-color: #f1f5f9;
}

.clickable-row.active {
  background-color: #e0f2fe;
  border-left: 3px solid #0ea5e9;
}

.code-cell {
  font-family: monospace;
  font-weight: 600;
  color: #475569;
}

.name-cell {
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 1rem;
}

.action-bar {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  height: 48px; /* Fixed height for alignment */
}

.action-bar.spacer {
  visibility: hidden; /* Invisible spacer */
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: white;
  margin-left: 0.75rem;
}

.action-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.approve-btn {
  background: var(--primary, #2563eb);
}

.return-btn {
  background: #ef4444; /* Red for return */
}

.checkbox-col {
  width: 40px;
  text-align: center;
}
</style>
