<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Modal from '@/components/common/Modal.vue'
import api from '@/api'

const outboundBoxes = ref([])

const fetchOutboundBoxes = async () => {
  try {
    const response = await api.get('/outbounds/boxes')
    const result = response.data

    if (result?.success && result?.data) {
      console.log("API returned raw boxes:", result.data)
      outboundBoxes.value = result.data.map(box => ({
        boxCode: box.boxCode,
        orderCode: box.orderCode,
        productCode: box.productName, // 백엔드 필드 역전 현상 대응: productName -> productCode
        name: box.productCode,      // 백엔드 필드 역전 현상 대응: productCode -> name
        destination: box.franchiseName || '-',
        quantity: box.countItem || 0
      }))
    } else {
      outboundBoxes.value = []
    }
  } catch(error) {
    console.error('Error fetching outbound boxes:', error)
    outboundBoxes.value = []
  }
}

const refreshAll = async () => {
  await fetchOutboundBoxes()
  if (selectedBoxCode.value) {
    // 선택된 박스가 있으면 해당 박스의 상세 항목도 최신화
    // (기존 fetchBoxDetails는 스킵 로직이 있으므로 강제 갱신용으로 따로 호출)
    refreshBoxDetails(selectedBoxCode.value)
  }
}

const refreshBoxDetails = async (boxCode) => {
  try {
    const response = await api.get(`/outbounds/boxes/items?boxCode=${boxCode}`)
    const result = response.data
    
    if (result?.success && result?.data) {
      allBoxDetails.value[boxCode] = result.data.map(item => ({
        id: item.serialCode,
        productCode: item.productId,
        name: item.productName,
        productionDate: item.manufactureDate,
        picking: item.isPicking
      }))
    }
  } catch(e) {
    console.error('Error refreshing box details:', e)
  }
}

onMounted(() => {
  refreshAll()
  // 3초마다 목록 자동 갱신
  const interval = setInterval(refreshAll, 3000)
  onUnmounted(() => clearInterval(interval))
})

// Data for Right List (Details per box)
const allBoxDetails = ref({})

const fetchBoxDetails = async (boxCode) => {
  if (allBoxDetails.value[boxCode]) return // 이미 불러온 경우 스킵

  try {
    const response = await api.get(`/outbounds/boxes/items?boxCode=${boxCode}`)
    const result = response.data
    
    if (result?.success && result?.data) {
      console.log(`API returned items for boxCode ${boxCode}:`, result.data)
      allBoxDetails.value[boxCode] = result.data.map(item => ({
        id: item.serialCode,
        productCode: item.productId,
        name: item.productName,
        productionDate: item.manufactureDate,
        picking: item.isPicking
      }))
    } else {
      allBoxDetails.value[boxCode] = []
    }
  } catch(error) {
    console.error('Error fetching box details:', error)
    allBoxDetails.value[boxCode] = []
  }
}

const selectedBoxCode = ref(null)
const selectedBoxIds = ref(new Set())
const selectedItemIds = ref(new Set())

const selectedBoxDetails = computed(() => {
  if (!selectedBoxCode.value) return []
  return allBoxDetails.value[selectedBoxCode.value] || []
})

const selectBox = async (boxCode) => {
  selectedBoxCode.value = boxCode
  await fetchBoxDetails(boxCode)
}

// Checkbox Logic - Boxes
const toggleAllBoxes = async (e) => {
  if (e.target.checked) {
    outboundBoxes.value.forEach(box => selectedBoxIds.value.add(box.boxCode))
    
    // Fetch details for all boxes if not already loaded
    await Promise.all(outboundBoxes.value.map(box => fetchBoxDetails(box.boxCode)))
    
    outboundBoxes.value.forEach(box => {
      if (allBoxDetails.value[box.boxCode]) {
        allBoxDetails.value[box.boxCode].forEach(item => selectedItemIds.value.add(item.id))
      }
    })
  } else {
    selectedBoxIds.value.clear()
    selectedItemIds.value.clear()
  }
}

const toggleBox = async (boxCode) => {
  if (selectedBoxIds.value.has(boxCode)) {
    selectedBoxIds.value.delete(boxCode)
    // Uncheck all items in this box
    if (allBoxDetails.value[boxCode]) {
      allBoxDetails.value[boxCode].forEach(item => selectedItemIds.value.delete(item.id))
    }
  } else {
    selectedBoxIds.value.add(boxCode)
    // Check all items in this box
    await fetchBoxDetails(boxCode)
    if (allBoxDetails.value[boxCode]) {
      allBoxDetails.value[boxCode].forEach(item => selectedItemIds.value.add(item.id))
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


// Actions

const performDelete = async () => {
  try {
    // 선택된 아이템들을 박스 코드별로 그룹화
    const itemsByBox = {}
    Object.keys(allBoxDetails.value).forEach(boxCode => {
      const selectedInBox = (allBoxDetails.value[boxCode] || [])
        .filter(item => selectedItemIds.value.has(item.id))
        .map(item => item.id)
      
      if (selectedInBox.length > 0) {
        itemsByBox[boxCode] = selectedInBox
      }
    })

    // 박스별로 삭제 API 요청 병렬 통신
    const promises = Object.entries(itemsByBox).map(async ([boxCode, serialCodes]) => {
      try {
        const res = await api.patch('/outbounds/cancels', { boxCode, serialCodes })
        return { success: res.data?.success !== false }
      } catch (e) {
        return { success: false }
      }
    })

    const results = await Promise.all(promises)
    const hasError = results.some(r => !r.success)

    if (hasError) {
      console.warn("일부 응답이 성공(OK) 상태가 아닙니다. 하지만 처리는 백엔드에서 진행되었을 수 있으므로 UI를 갱신합니다.")
    }

    // 통신 성공 시 UI 상태 업데이트
    Object.entries(itemsByBox).forEach(([boxCode, serialCodes]) => {
      const items = allBoxDetails.value[boxCode] || []
      const remainingItems = items.filter(i => !serialCodes.includes(i.id))
      allBoxDetails.value[boxCode] = remainingItems
      
      const boxIndex = outboundBoxes.value.findIndex(b => b.boxCode === boxCode)
      if (boxIndex !== -1) {
        outboundBoxes.value[boxIndex].quantity = remainingItems.length
        if (remainingItems.length === 0) {
          outboundBoxes.value.splice(boxIndex, 1)
          if (selectedBoxCode.value === boxCode) selectedBoxCode.value = null
        }
      }
    })

    selectedBoxIds.value.clear()
    selectedItemIds.value.clear()
    openModal('알림', '삭제되었습니다.', null, false)
  } catch (error) {
    console.error('Error in deleting:', error)
    openModal('오류', '서버 통신 오류가 발생했습니다.', null, false)
  }
}

const deleteSelected = () => {
  const itemCount = selectedItemIds.value.size
  
  if (itemCount === 0) {
    openModal('알림', '삭제할 품목을 선택해주세요.', null, false)
    return
  }

  const msg = `정말 선택된 ${itemCount}개의 항목을 삭제(할당 취소)하시겠습니까?`
  openModal('삭제 확인', msg, performDelete)
}

const performPicking = async () => {
  try {
    const serialCodes = Array.from(selectedItemIds.value)
    if (serialCodes.length === 0) return

    // 단일 요청으로 시리얼 코드 리스트 전송
    const response = await api.patch('/outbounds/pickings', { serialCodes })
    const result = response.data

    if (result.success) {
      // Update picking status to true for selected items in UI
      Object.keys(allBoxDetails.value).forEach(boxCode => {
        allBoxDetails.value[boxCode].forEach(item => {
          if (selectedItemIds.value.has(item.id)) {
            item.picking = true
          }
        })
      })
      
      selectedItemIds.value.clear()
      openModal('알림', '피킹 완료되었습니다.', null, false)
    } else {
      openModal('오류', result.message || '피킹 처리에 실패했습니다.', null, false)
    }
  } catch (error) {
    console.error('Error in picking:', error)
    openModal('오류', '서버 통신 오류가 발생했습니다.', null, false)
  }
}

const confirmPicking = () => {
  const itemCount = selectedItemIds.value.size
  if (itemCount === 0) {
    openModal('알림', '피킹할 개별 품목을 선택해주세요.', null, false)
    return
  }

  // 박스 단위(20개) 검증
  let isValid = true
  Object.keys(allBoxDetails.value).forEach(boxCode => {
    const itemsInBox = allBoxDetails.value[boxCode] || []
    const selectedCountInBox = itemsInBox.filter(item => selectedItemIds.value.has(item.id)).length
    
    // 만약 해당 박스에서 선택된 품목이 1개라도 있다면 무조건 20개(정량)가 선택되어야만 피킹 가능
    if (selectedCountInBox > 0 && selectedCountInBox !== 20) {
      isValid = false
    }
  })

  if (!isValid) {
    openModal('알림', '피킹은 박스 단위(20개 정량)로 전체가 선택되어야만 가능합니다.', null, false)
    return
  }

  openModal('피킹 확인', '피킹을 확정지으시겠습니까?', performPicking)
}

const approveOutbound = () => {
  const itemCount = selectedItemIds.value.size
  
  if (itemCount === 0) {
    openModal('알림', '출고 승인할 품목을 선택해주세요.', null, false)
    return
  }

  // 박스 단위(20개) 검증
  let isValid = true
  Object.keys(allBoxDetails.value).forEach(boxCode => {
    const itemsInBox = allBoxDetails.value[boxCode] || []
    const selectedCountInBox = itemsInBox.filter(item => selectedItemIds.value.has(item.id)).length
    
    if (selectedCountInBox > 0 && selectedCountInBox !== 20) {
      isValid = false
    }
  })

  if (!isValid) {
    openModal('알림', '출고 승인은 박스 단위(20개 정량)로 전체가 선택되어야만 가능합니다.', null, false)
    return
  }

  // Check if any selected item is NOT picked
  let hasUnpicked = false
  Object.keys(allBoxDetails.value).forEach(boxCode => {
    allBoxDetails.value[boxCode].forEach(item => {
      if (selectedItemIds.value.has(item.id) && !item.picking) {
        hasUnpicked = true
      }
    })
  })

  if (hasUnpicked) {
    openModal('알림', '피킹이 완료(O)된 항목만 출고 승인할 수 있습니다.', null, false)
    return
  }

  const performApprove = async () => {
    // 승인 대상인 발주 코드(orderCode) 미리 수집
    const approvedOrderCodes = []
    Object.keys(allBoxDetails.value).forEach(boxCode => {
      const itemsInBox = allBoxDetails.value[boxCode] || []
      const isBoxSelected = itemsInBox.some(item => selectedItemIds.value.has(item.id))
      if (isBoxSelected) {
        const box = outboundBoxes.value.find(b => b.boxCode === boxCode)
        if (box && !approvedOrderCodes.includes(box.orderCode)) {
          approvedOrderCodes.push(box.orderCode)
        }
      }
    })

    try {
      const serialCodes = Array.from(selectedItemIds.value)
      if (serialCodes.length === 0) return

      // 1. 기존 출고 승인 API 호출 (재고 상태 변경 - 단일 요청)
      const response = await api.patch('/outbounds/confirms', { serialCodes })
      const result = response.data

      if (result?.success) {
        // 2. 배송 상태 변경 API 호출 (Internal Transport: PENDING -> IN_TRANSIT)
        if (approvedOrderCodes.length > 0) {
          try {
            await api.patch('/transport/internal/updated-deliver-status', { 
              orderCodes: approvedOrderCodes 
            })
            console.log('[운송 시스템] 배송 상태 변경 완료:', approvedOrderCodes)
          } catch (e) {
            console.error('[운송 시스템] 배송 상태 변경 실패:', e)
          }

          // 3. 외부 운송 모듈 스케줄링 API 호출 (External Transport: 10초 뒤 배송 완료 예약)
          try {
            await api.post('/external/transport/schedule', { 
              orderCodes: approvedOrderCodes 
            })
            console.log('[외부 운송 시스템] 배송 완료 예약 완료:', approvedOrderCodes)
          } catch (e) {
            console.error('[외부 운송 시스템] 배송 완료 예약 실패:', e)
          }
        }

        // Remove approved items and boxes from UI
        selectedBoxIds.value.forEach(boxCode => {
          outboundBoxes.value = outboundBoxes.value.filter(b => b.boxCode !== boxCode)
          delete allBoxDetails.value[boxCode]
          if (selectedBoxCode.value === boxCode) selectedBoxCode.value = null
        })
        
        // Remove individual items from their boxes
        Object.keys(allBoxDetails.value).forEach(boxCode => {
          const items = allBoxDetails.value[boxCode]
          const remainingItems = items.filter(i => !selectedItemIds.value.has(i.id))
          allBoxDetails.value[boxCode] = remainingItems
          
          const boxIndex = outboundBoxes.value.findIndex(b => b.boxCode === boxCode)
          if (boxIndex !== -1) {
            outboundBoxes.value[boxIndex].quantity = remainingItems.length
            if (remainingItems.length === 0) {
              outboundBoxes.value.splice(boxIndex, 1)
              if (selectedBoxCode.value === boxCode) selectedBoxCode.value = null
            }
          }
        })

        selectedBoxIds.value.clear()
        selectedItemIds.value.clear()
        openModal('알림', '출고 승인 완료되었습니다.', null, false)
      } else {
        openModal('오류', result?.message || '출고 처리에 실패했습니다.', null, false)
      }
    } catch (error) {
      console.error('Error in approving outbound:', error)
      openModal('오류', '서버 통신 오류가 발생했습니다.', null, false)
    }
  }

  openModal('출고 승인 확인', '선택된 제품들을 출고 승인하시겠습니까?', performApprove)
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
      <h2 class="page-title">출고 관리</h2>
    </div>

    <div class="main-container">
      <!-- Top Section: Box List -->
      <section class="top-panel">
        <h3 class="panel-title">박스 목록</h3>
        <div class="data-table-card">
          <div v-if="outboundBoxes.length === 0" class="empty-state box-empty">
            <p>출고 대기 항목이 없습니다.</p>
          </div>
          <div v-else class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" @change="toggleAllBoxes" :checked="outboundBoxes.length > 0 && selectedBoxIds.size === outboundBoxes.length">
                  </th>
                  <th>박스 코드</th>
                  <th>발주 번호</th>
                  <th>제품 코드</th>
                  <th>이름</th>
                  <th>가맹점</th>
                  <th>수량</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(box, index) in outboundBoxes" 
                  :key="index" 
                  @click="selectBox(box.boxCode)"
                  :class="{ active: selectedBoxCode === box.boxCode }"
                  class="clickable-row"
                >
                  <td class="checkbox-col" @click.stop>
                    <input type="checkbox" :checked="selectedBoxIds.has(box.boxCode)" @change="toggleBox(box.boxCode)">
                  </td>
                  <td class="code-cell">{{ box.boxCode }}</td>
                  <td class="code-cell">{{ box.orderCode }}</td>
                  <td class="sku-cell">{{ box.productCode }}</td>
                  <td class="name-cell">{{ box.name }}</td>
                  <td>{{ box.destination }}</td>
                  <td class="text-right">{{ box.quantity }}</td>
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
                  <th>제조일자</th>
                  <th class="text-center">피킹</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedBoxDetails" :key="item.id">
                  <td class="checkbox-col">
                     <input type="checkbox" :checked="selectedItemIds.has(item.id)" @change="toggleItem(item.id)">
                  </td>
                  <td class="code-cell">{{ item.id }}</td>
                  <td>{{ item.productionDate }}</td>
                  <td class="text-center">
                    <span :class="['status-badge', item.picking ? 'picked' : 'not-picked']">
                      {{ item.picking ? 'O' : '-' }}
                    </span>
                  </td>
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
        <button class="action-btn delete" @click="deleteSelected">삭제</button>
        <button class="action-btn pick" @click="confirmPicking">피킹</button>
        <button class="action-btn approve" @click="approveOutbound">출고 승인</button>
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
  flex: 0 0 250px; /* Increased height to show 3-4 rows comfortably */
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bottom-panel {
  flex: 1; /* Occupies the rest of the space */
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

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: normal;
  font-size: 0.8rem;
}

.status-badge.picked { background: #d1fae5; color: #065f46; } 
.status-badge.not-picked { background: #f1f5f9; color: #94a3b8; } 

.bottom-action-bar {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end; /* Moved to right */
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

/* Rollback to original muted colors */
.action-btn.delete { background-color: #d65b5b; }
.action-btn.pick { background-color: #5f9ea0; }
.action-btn.approve { background-color: #6b8abf; }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
}
.box-empty {
  min-height: 200px;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
</style>
