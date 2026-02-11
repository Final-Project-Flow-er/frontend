<script setup>
import { ref, computed } from 'vue'

// Mock Data for Left List (Outbound Boxes)
const outboundBoxes = ref([
  { boxCode: 'BX-OUT-20260210-001', productCode: 'OR0101', name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 20 },
  { boxCode: 'BX-OUT-20260210-002', productCode: 'MA0301', name: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 15 },
  { boxCode: 'BX-OUT-20260210-003', productCode: 'RO0201', name: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 10 },
  { boxCode: 'BX-OUT-20260210-004', productCode: 'OR0103', name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', quantity: 5 },
])

// Mock Data for Right List (Details per box)
const allBoxDetails = ref({
  'BX-OUT-20260210-001': Array.from({ length: 20 }, (_, i) => ({
    id: `ITEM-OR0101-${1000 + i}`,
    productCode: 'OR0101',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    expiryDate: '2026-02-15',
    picking: false // false = X, true = O
  })),
  'BX-OUT-20260210-002': Array.from({ length: 15 }, (_, i) => ({
    id: `ITEM-MA0301-${2000 + i}`,
    productCode: 'MA0301',
    name: '마라 떡볶이 밀키트 매운맛 1,2인분',
    expiryDate: '2026-02-16',
    picking: false
  })),
  'BX-OUT-20260210-003': Array.from({ length: 10 }, (_, i) => ({
    id: `ITEM-RO0201-${3000 + i}`,
    productCode: 'RO0201',
    name: '로제 떡볶이 밀키트 기본맛 1,2인분',
    expiryDate: '2026-02-17',
    picking: false
  })),
  'BX-OUT-20260210-004': Array.from({ length: 5 }, (_, i) => ({
    id: `ITEM-OR0103-${4000 + i}`,
    productCode: 'OR0103',
    name: '오리지널 떡볶이 밀키트 순한맛 3,4인분',
    expiryDate: '2026-02-18',
    picking: false
  })),
})

const selectedBoxCode = ref(null)
const selectedBoxIds = ref(new Set())
const selectedItemIds = ref(new Set())

const selectedBoxDetails = computed(() => {
  if (!selectedBoxCode.value) return []
  return allBoxDetails.value[selectedBoxCode.value] || []
})

const selectBox = (boxCode) => {
  selectedBoxCode.value = boxCode
  // Clear item selection when switching boxes? 
  // Requirement allows individual item selection, likely per loaded view.
  // For simplicity, let's keep item selection state but maybe user wants to multi-select items across boxes?
  // Usually detail view shows only one box. Let's clear item selection to avoid confusion.
  // Or better, filter selectedItemIds to only those in current box if we only show one box's details at a time.
  // But wait, "일괄적으로 삭제" implies global checkboxes? 
  // With split view, usually right side shows ONLY selected box. 
  // Let's reset item selection when box changes to simplicity.
  selectedItemIds.value.clear()
}

// Checkbox Logic - Boxes
const toggleAllBoxes = (e) => {
  if (e.target.checked) {
    outboundBoxes.value.forEach(box => selectedBoxIds.value.add(box.boxCode))
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


// Actions
const deleteSelected = () => {
  const boxCount = selectedBoxIds.value.size
  const itemCount = selectedItemIds.value.size
  
  if (boxCount === 0 && itemCount === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  // Determine what to delete based on active context or combined?
  // Requirement: "박스나 개별 목록들에서... 일괄적으로 삭제"
  // "버튼은 체크가 된 항목들이 버튼을 누르면 공통으로 적용"
  // So if boxes AND items are selected, we try to delete both?
  
  const msg = `정말 ${boxCount + itemCount}개의 항목을 삭제하시겠습니까?`
  if (!confirm(msg)) return

  // Delete Boxes
  if (boxCount > 0) {
    outboundBoxes.value = outboundBoxes.value.filter(b => !selectedBoxIds.value.has(b.boxCode))
    selectedBoxIds.value.forEach(code => {
      delete allBoxDetails.value[code]
      if (selectedBoxCode.value === code) selectedBoxCode.value = null
    })
    selectedBoxIds.value.clear()
  }

  // Delete Items (from current details)
  if (itemCount > 0 && selectedBoxCode.value) {
     const currentItems = allBoxDetails.value[selectedBoxCode.value]
     // Filter out deleted items
     const remainingItems = currentItems.filter(item => !selectedItemIds.value.has(item.id))
     allBoxDetails.value[selectedBoxCode.value] = remainingItems
     
     // Update Box Quantity
     const boxIndex = outboundBoxes.value.findIndex(b => b.boxCode === selectedBoxCode.value)
     if (boxIndex !== -1) {
       outboundBoxes.value[boxIndex].quantity = remainingItems.length
       // Remove box if empty
       if (remainingItems.length === 0) {
         outboundBoxes.value.splice(boxIndex, 1)
         selectedBoxCode.value = null
       }
     }
     
     selectedItemIds.value.clear()
  }
  
  alert('삭제되었습니다.')
}

const confirmPicking = () => {
  const itemCount = selectedItemIds.value.size
  if (itemCount === 0) {
    alert('피킹할 개별 품목을 선택해주세요.')
    return
  }

  if (!confirm('피킹을 확정지으시겠습니까?')) return

  // Update picking status to true for selected items
  const items = allBoxDetails.value[selectedBoxCode.value]
  items.forEach(item => {
    if (selectedItemIds.value.has(item.id)) {
      item.picking = true
    }
  })
  
  // Also clear selection?
  selectedItemIds.value.clear()
  alert('피킹 완료되었습니다.')
}

const approveOutbound = () => {
   const itemCount = selectedItemIds.value.size
  if (itemCount === 0) {
    alert('출고 승인할 품목을 선택해주세요.')
    return
  }

  // Check if any selected item is NOT picked
  const items = allBoxDetails.value[selectedBoxCode.value]
  const selectedItems = items.filter(i => selectedItemIds.value.has(i.id))
  const unpicked = selectedItems.filter(i => !i.picking)

  if (unpicked.length > 0) {
    alert('피킹이 완료(O)된 항목만 출고 승인할 수 있습니다.')
    return
  }

  if (!confirm('선택된 제품들을 출고 승인하시겠습니까?')) return

  // Remove approved items
  const remainingItems = items.filter(i => !selectedItemIds.value.has(i.id))
  allBoxDetails.value[selectedBoxCode.value] = remainingItems
  
  // Update Box Quantity
  const boxIndex = outboundBoxes.value.findIndex(b => b.boxCode === selectedBoxCode.value)
  if (boxIndex !== -1) {
    outboundBoxes.value[boxIndex].quantity = remainingItems.length
    // Remove box if empty
    if (remainingItems.length === 0) {
       outboundBoxes.value.splice(boxIndex, 1)
       selectedBoxCode.value = null
    }
  }

  selectedItemIds.value.clear()
  
  alert('출고 승인 완료되었습니다.') 
}

</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <h2 class="page-title">출고 관리 (공장)</h2>
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
                    <input type="checkbox" @change="toggleAllBoxes" :checked="outboundBoxes.length > 0 && selectedBoxIds.size === outboundBoxes.length">
                  </th>
                  <th>박스 코드</th>
                  <th>제품 코드</th>
                  <th>이름</th>
                  <th>수량</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="box in outboundBoxes" 
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
                    <input type="checkbox" @change="toggleAllItems" :checked="selectedBoxDetails.length > 0 && selectedItemIds.size === selectedBoxDetails.length">
                  </th>
                  <th>제품 식별 코드</th>
                  <th>제품 코드</th>
                  <th>제품명</th>
                  <th>유통기한</th>
                  <th class="text-center">피킹</th>
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
                  <td>{{ item.expiryDate }}</td>
                  <td class="text-center">
                    <span :class="['status-badge', item.picking ? 'picked' : 'not-picked']">
                      {{ item.picking ? 'O' : 'X' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-action-bar">
      <button class="action-btn delete" @click="deleteSelected">삭제</button>
      <button class="action-btn pick" @click="confirmPicking">피킹</button>
      <button class="action-btn approve" @click="approveOutbound">출고 승인</button>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { 
  max-width: 100%;
  height: 100%;
  padding: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark, #1e293b);
  margin: 0;
}

.bottom-action-bar {
  display: flex;
  justify-content: flex-end; /* Aligned right */
  gap: 0.75rem;
  margin-top: 1rem;
  flex-shrink: 0;
}

.action-btn {
  padding: 0.75rem 2rem; 
  border-radius: 8px; 
  font-weight: 600; 
  cursor: pointer; 
  border: none;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 1rem;
}

.action-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.action-btn:active { transform: translateY(0); }

/* Muted Colors (Lower Saturation) */
.action-btn.delete { background-color: #d65b5b; } /* Muted Red */
.action-btn.pick { background-color: #5f9ea0; } /* Muted Teal (CadetBlue) */
.action-btn.approve { background-color: #6b8abf; } /* Muted Blue */

.split-container {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.left-panel {
  flex: 3.5;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.right-panel {
  flex: 6.5;
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
  width: max-content;
  min-width: 100%;
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
  padding: 0.75rem 1rem;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #334155;
  white-space: nowrap;
}

.checkbox-col {
  width: 40px;
  text-align: center;
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

.name-cell { font-weight: 500; }
.text-right { text-align: right; }
.text-center { text-align: center; }

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
}

.status-badge.picked { background: #d1fae5; color: #065f46; } 
.status-badge.not-picked { background: #fee2e2; color: #991b1b; } 

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}
</style>
