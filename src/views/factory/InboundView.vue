<script setup>
import { ref, computed } from 'vue'
import Modal from '@/components/common/Modal.vue'

// Mock Data - Flattened Inbound Items
const inboundItems = ref([
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `SE01-FA01-A1-OR0101-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'OR0101',
    name: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    productionDate: '2026-02-01',
    expiryDate: '2026-02-15'
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `SE01-FA01-A1-MA0301-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'MA0301',
    name: '마라 떡볶이 밀키트 매운맛 1,2인분',
    productionDate: '2026-02-02',
    expiryDate: '2026-02-16'
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `SE01-FA01-A1-RO0201-001-${String(i + 1).padStart(2, '0')}`,
    productCode: 'RO0201',
    name: '로제 떡볶이 밀키트 기본맛 1,2인분',
    productionDate: '2026-02-03',
    expiryDate: '2026-02-17'
  })),
])

const selectedItemIds = ref(new Set())

const isAllSelected = computed(() => {
  return inboundItems.value.length > 0 && selectedItemIds.value.size === inboundItems.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItemIds.value.clear()
  } else {
    selectedItemIds.value = new Set(inboundItems.value.map(item => item.id))
  }
}

const toggleSelectItem = (id) => {
  if (selectedItemIds.value.has(id)) {
    selectedItemIds.value.delete(id)
  } else {
    selectedItemIds.value.add(id)
  }
}

const approveInbound = () => {
  if (selectedItemIds.value.size === 0) {
    openModal('알림', '입고 승인할 항목을 선택해주세요.', null, false)
    return
  }
  openModal(
    '입고 승인 확인', 
    `선택한 ${selectedItemIds.value.size}개의 항목을 입고 승인하시겠습니까?`, 
    performApprove
  )
}

const performApprove = () => {
  // Remove the approved items from the list
  inboundItems.value = inboundItems.value.filter(item => !selectedItemIds.value.has(item.id))
  // Clear selection
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
      <h2 class="page-title">입고 관리 (공장)</h2>
    </div>

    <div class="main-container">
      <section class="full-panel">
        <h3 class="panel-title">상세 품목 목록</h3>
        <div class="data-table-card">
          <div class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                  </th>
                  <th>제품 식별 코드</th>
                  <th>제품 코드</th>
                  <th>제품명</th>
                  <th>생산일</th>
                  <th>유통기한</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in inboundItems" :key="item.id">
                  <td class="checkbox-col">
                    <input type="checkbox" :checked="selectedItemIds.has(item.id)" @change="toggleSelectItem(item.id)" />
                  </td>
                  <td class="code-cell">{{ item.id }}</td>
                  <td>{{ item.productCode }}</td>
                  <td class="name-cell">{{ item.name }}</td>
                  <td>{{ item.productionDate }}</td>
                  <td>{{ item.expiryDate }}</td>
                </tr>
                <tr v-if="inboundItems.length === 0">
                  <td colspan="6" class="empty-state">입고 대기 항목이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-bar">
          <div class="selected-count" v-if="selectedItemIds.size > 0">
            선택된 항목: <strong>{{ selectedItemIds.size }}</strong>개
          </div>
          <button class="approve-btn" @click="approveInbound" :disabled="selectedItemIds.size === 0">
            입고 승인
          </button>
        </div>
      </section>
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
  min-height: 0;
}

.full-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  padding: 1rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
  color: #334155;
  white-space: nowrap;
}

.checkbox-col {
  width: 50px;
  text-align: center;
}

.code-cell {
  font-family: 'JetBrains Mono', monospace;
  color: #64748b;
}

.name-cell {
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #94a3b8;
}

.action-bar {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.selected-count {
  font-size: 1rem;
  color: #64748b;
}

.approve-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.approve-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.approve-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
