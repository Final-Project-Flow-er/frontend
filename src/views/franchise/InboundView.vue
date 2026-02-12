<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()

// Mock Data for Left List (Inbound Boxes)
const inboundBoxes = ref([
  { boxCode: 'SE01-FA01-A1-OR0101-001', orderCode: 'SE0120231026001', recipient: '김갑자', productCode: 'OR0101', name: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 20 },
  { boxCode: 'SE01-FA01-A1-MA0301-001', orderCode: 'SE0120231026001', recipient: '김갑자', productCode: 'MA0301', name: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 15 },
  { boxCode: 'SE01-FA01-A1-RO0201-001', orderCode: 'SE0120231025005', recipient: '김갑자', productCode: 'RO0201', name: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 10 },
  { boxCode: 'SE01-FA01-A1-OR0103-001', orderCode: 'SE0120231025005', recipient: '김갑자', productCode: 'OR0103', name: '오리지널 떡볶이 밀키트 순한맛 3,4인분', quantity: 5 },
])

// Mock Data for Right List (Details per box)
const allBoxDetails = {
  'SE01-FA01-A1-OR0101-001': Array.from({ length: 20 }, (_, i) => ({
    id: `SE01-FA01-A1-OR0101-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'OR0101',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    productionDate: '2026-02-01',
    expiryDate: '2026-02-15',
    unitPrice: 12000
  })),
  'SE01-FA01-A1-MA0301-001': Array.from({ length: 15 }, (_, i) => ({
    id: `SE01-FA01-A1-MA0301-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'MA0301',
    name: '마라 떡볶이 밀키트 매운맛 1,2인분',
    productionDate: '2026-02-02',
    expiryDate: '2026-02-16',
    unitPrice: 12000
  })),
  'SE01-FA01-A1-RO0201-001': Array.from({ length: 10 }, (_, i) => ({
    id: `SE01-FA01-A1-RO0201-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'RO0201',
    name: '로제 떡볶이 밀키트 기본맛 1,2인분',
    productionDate: '2026-02-03',
    expiryDate: '2026-02-17',
    unitPrice: 12000
  })),
  'SE01-FA01-A1-OR0103-001': Array.from({ length: 5 }, (_, i) => ({
    id: `SE01-FA01-A1-OR0103-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'OR0103',
    name: '오리지널 떡볶이 밀키트 순한맛 3,4인분',
    productionDate: '2026-02-04',
    expiryDate: '2026-02-18',
    unitPrice: 12000
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
}

// Checkbox Logic - Boxes
const toggleAllBoxes = (e) => {
  if (e.target.checked) {
    inboundBoxes.value.forEach(box => {
      selectedBoxIds.value.add(box.boxCode)
      // Automatically check all items in selected boxes
      if (allBoxDetails[box.boxCode]) {
        allBoxDetails[box.boxCode].forEach(item => selectedItemIds.value.add(item.id))
      }
    })
  } else {
    selectedBoxIds.value.clear()
    selectedItemIds.value.clear()
  }
}

const toggleBox = (boxCode) => {
  if (selectedBoxIds.value.has(boxCode)) {
    selectedBoxIds.value.delete(boxCode)
    // Uncheck all items in this box
    if (allBoxDetails[boxCode]) {
      allBoxDetails[boxCode].forEach(item => selectedItemIds.value.delete(item.id))
    }
  } else {
    selectedBoxIds.value.add(boxCode)
    // Check all items in this box
    if (allBoxDetails[boxCode]) {
      allBoxDetails[boxCode].forEach(item => selectedItemIds.value.add(item.id))
    }
  }
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
  const boxCount = selectedBoxIds.value.size
  if (boxCount === 0) {
    openModal('알림', '반품 요청은 박스 단위로만 가능합니다.', null, false)
    return
  }
  
  openModal(
    '반품 요청 확인', 
    `선택된 ${boxCount}개의 박스에 대해 반품 요청하시겠습니까?`, 
    performReturnRequest
  )
}

const performReturnRequest = () => {
    const selectedBoxes = inboundBoxes.value.filter(b => selectedBoxIds.value.has(b.boxCode))
    
    const returnItems = selectedBoxes.map(box => ({
        boxCode: box.boxCode,
        orderCode: box.orderCode,
        productCode: box.productCode,
        productName: box.name,
        quantity: 1, // 1 Box unit 
        amount: 12000 * box.quantity, 
        totalAmount: 12000 * box.quantity 
    }))

    router.push({ 
        name: 'franchise-return-create', 
        state: { 
            returnItems: returnItems,
            origin: 'InboundView'
        } 
    })
}

const approveInbound = () => {
  const boxCount = selectedBoxIds.value.size
  const itemCount = selectedItemIds.value.size

  if (boxCount === 0 && itemCount === 0) {
    openModal('알림', '입고 승인할 항목을 선택해주세요.', null, false)
    return
  }

  const msg = boxCount > 0 ? `선택된 ${boxCount}개의 박스를 입고 승인하시겠습니까?` : `선택된 ${itemCount}개의 항목을 입고 승인하시겠습니까?`
  openModal('입고 승인 확인', msg, performApprove)
}

const performApprove = () => {
  // Remove approved boxes
  selectedBoxIds.value.forEach(boxCode => {
    inboundBoxes.value = inboundBoxes.value.filter(b => b.boxCode !== boxCode)
    if (selectedBoxCode.value === boxCode) selectedBoxCode.value = null
  })

  // Remove individual items if any selected that aren't part of the selected boxes above
  // Note: simplified for standard behavior where usually box selection handles it.
  
  selectedBoxIds.value.clear()
  selectedItemIds.value.clear()
  openModal('알림', '입고 승인 되었습니다.', null, false)
}

// Modal State
const modalVisible = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmCallback = ref(null)
const modalShowCancel = ref(true)

const openModal = (title, message, callback, showCancel = true) => {
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmCallback.value = callback
  modalShowCancel.value = showCancel
  modalVisible.value = true
}

const handleModalConfirm = () => {
  const callback = modalConfirmCallback.value
  modalVisible.value = false
  if (callback) callback()
}

const handleModalClose = () => {
  modalVisible.value = false
}
</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <h2 class="page-title">입고 관리</h2>
    </div>

    <div class="main-container">
      <!-- Top Section: Box List -->
      <section class="top-panel">
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
                  <th>발주 번호</th>
                  <th>수령인</th>
                  <th>제품 코드</th>
                  <th>이름</th>
                  <th>수량</th>
                  <th>총 금액</th>
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
                  <td class="code-cell">{{ box.orderCode }}</td>
                  <td>{{ box.recipient }}</td>
                  <td>{{ box.productCode }}</td>
                  <td class="name-cell">{{ box.name }}</td>
                  <td class="text-right">{{ box.quantity }}</td>
                  <td class="text-right">{{ (box.quantity * 12000).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Bottom Section: Detail List -->
      <section class="bottom-panel">
        <h3 class="panel-title">상세 품목 목록</h3>
        <div class="data-table-card detail-card">
          <div v-if="!selectedBoxCode" class="empty-state">
            <p>위 목록에서 박스를 선택하여 상세 품목을 확인하세요.</p>
          </div>
          <div v-else class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" @change="toggleAllItems" :checked="selectedBoxDetails.length > 0 && selectedItemIds.size === selectedBoxDetails.length">
                  </th>
                  <th>제품 식별 코드</th>
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
                  <td>{{ item.productionDate }}</td>
                  <td>{{ item.expiryDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <!-- Action Bar -->
    <div class="bottom-action-bar">
      <div class="selected-summary" v-if="selectedBoxIds.size > 0 || selectedItemIds.size > 0">
        선택됨: 박스 <strong>{{ selectedBoxIds.size }}</strong>개, 품목 <strong>{{ selectedItemIds.size }}</strong>개
      </div>
      <div class="btn-group">
        <button class="action-btn return-btn" @click="goToReturnRequest">
          반품 요청
        </button>
        <button class="action-btn approve-btn" @click="approveInbound">
          입고 승인
        </button>
      </div>
    </div>

    <Modal
      :isOpen="modalVisible"
      :title="modalTitle"
      :message="modalMessage"
      :showCancel="modalShowCancel"
      @close="handleModalClose"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
.content-wrapper { 
  max-width: 100%;
  height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8fafc;
}

.page-header {
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
}

.top-panel {
  flex: 0 0 250px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bottom-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #475569;
}

.data-table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.data-table-scroll-wrapper {
  flex: 1;
  overflow: auto;
}

.data-table {
  width: 100%;
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
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
  white-space: nowrap;
}

.checkbox-col { width: 50px; text-align: center; }

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.clickable-row:hover { background-color: #f1f5f9; }
.clickable-row.active { background-color: #e0f2fe; border-left: 3px solid #acddf5; }

.code-cell {
  font-family: monospace;
  color: #475569;
}

.bottom-action-bar {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.selected-summary { color: #64748b; font-size: 0.9rem; }
.btn-group { display: flex; gap: 0.75rem; }

.action-btn {
  padding: 0.75rem 2rem; 
  border-radius: 8px; 
  font-weight: normal; 
  cursor: pointer; 
  border: none;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 1rem;
}

.action-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.approve-btn { background-color: #6b8abf; }
.return-btn { background-color: #d65b5b; }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}

.text-right { text-align: right; }
</style>
