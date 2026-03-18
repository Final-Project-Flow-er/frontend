<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()

const inboundBoxes = ref([])

const fetchInboundBoxes = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch('/api/v1/inbounds/boxes', {
      headers: headers
    })
    
    let result = null
    try {
      result = await response.json()
    } catch (e) {
      console.warn("Non-JSON response received:", e)
    }

    if (response.ok && result?.success && result?.data) {
      console.log("Inbound Box API raw data:", result.data)
      inboundBoxes.value = result.data.map(box => ({
        boxCode: box.boxCode,
        orderCode: box.orderCode,
        recipient: '', // API가 제공하지 않으므로 공백
        productCode: box.productCode,
        name: box.productName,
        quantity: box.countItem
      }))
    } else {
      inboundBoxes.value = []
    }
  } catch (error) {
    console.error('Error fetching inbound boxes:', error)
    inboundBoxes.value = [] // 팝업 안 띄우고 무조건 빈 배열로 랜더링
  }
}

const refreshAll = async () => {
  await fetchInboundBoxes()
  if (selectedBoxCode.value) {
    refreshBoxDetails(selectedBoxCode.value)
  }
}

const refreshBoxDetails = async (boxCode) => {
  try {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(`/api/v1/inbounds/boxes/${boxCode}`, { headers })
    let result = null
    try { result = await response.json() } catch (e) {}

    if (response.ok && result?.success && result?.data) {
      allBoxDetails.value[boxCode] = result.data.map(item => {
        let expiry = '-'
        if (item.manufactureDate) {
          const d = new Date(item.manufactureDate)
          d.setDate(d.getDate() + 14)
          expiry = d.toISOString().split('T')[0]
        }
        return {
          id: item.serialCode,
          productCode: item.productCode || item.productId,
          name: item.productName,
          productionDate: item.manufactureDate,
          expiryDate: expiry,
          unitPrice: 12000
        }
      })
    }
  } catch (error) {
    console.error('Error refreshing box details:', error)
  }
}

onMounted(() => {
  refreshAll()
  // 3초마다 자동 갱신
  const interval = setInterval(refreshAll, 3000)
  onUnmounted(() => clearInterval(interval))
})

const allBoxDetails = ref({})

const fetchBoxDetails = async (boxCode) => {
  if (allBoxDetails.value[boxCode]) return
  
  try {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`/api/v1/inbounds/boxes/${boxCode}`, { headers })
    let result = null
    try {
      result = await response.json()
    } catch (e) {
      console.warn("Non-JSON", e)
    }

    if (response.ok && result?.success && result?.data) {
      allBoxDetails.value[boxCode] = result.data.map(item => {
        let expiry = '-'
        if (item.manufactureDate) {
          const d = new Date(item.manufactureDate)
          d.setDate(d.getDate() + 14)
          expiry = d.toISOString().split('T')[0]
        }
        return {
          id: item.serialCode,
          productCode: item.productCode || item.productId,
          name: item.productName,
          productionDate: item.manufactureDate,
          expiryDate: expiry,
          unitPrice: 12000
        }
      })
    } else {
      allBoxDetails.value[boxCode] = []
    }
  } catch (error) {
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
    const promises = inboundBoxes.value.map(box => fetchBoxDetails(box.boxCode))
    await Promise.all(promises)

    inboundBoxes.value.forEach(box => {
      selectedBoxIds.value.add(box.boxCode)
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
    if (allBoxDetails.value[boxCode]) {
      allBoxDetails.value[boxCode].forEach(item => selectedItemIds.value.delete(item.id))
    }
  } else {
    selectedBoxIds.value.add(boxCode)
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

const goToReturnRequest = () => {
  const boxCount = selectedBoxIds.value.size
  if (boxCount === 0) {
    openModal('알림', '반품 요청할 박스를 선택해주세요. (반품은 박스 단위로만 가능합니다)', null, false)
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

  if (boxCount === 0) {
    openModal('알림', '입고 승인할 박스를 선택해주세요. (승인은 박스 단위로만 가능합니다)', null, false)
    return
  }

  let expectedItemCount = 0
  for (const boxCode of selectedBoxIds.value) {
    if (allBoxDetails.value[boxCode]) {
      expectedItemCount += allBoxDetails.value[boxCode].length
    }
  }

  if (selectedItemIds.value.size !== expectedItemCount || expectedItemCount === 0) {
    openModal('알림', '입고 승인은 박스 단위로 일괄 처리되어야 합니다. 박스의 모든 항목이 선택되어 있는지 확인해주세요.', null, false)
    return
  }

  const msg = `선택된 ${boxCount}개의 박스(총 ${expectedItemCount}개 품목)를 입고 승인하시겠습니까?`
  openModal('입고 승인 확인', msg, performApprove)
}

const performApprove = async () => {
  try {
    const token = localStorage.getItem('accessToken')
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const serialCodes = Array.from(selectedItemIds.value)
    const response = await fetch('/api/v1/inbounds/confirm', {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify({ serialCodes })
    })

    if (response.status === 401 || response.status === 403) {
      openModal('오류', '권한이 없습니다 (액세스 토큰 확인 필요).', null, false)
      return
    }

    let result = null
    try {
      result = await response.json()
    } catch (e) {}

    if (response.ok && result?.success) {
      await fetchInboundBoxes()
      selectedBoxCode.value = null
      selectedBoxIds.value.clear()
      selectedItemIds.value.clear()
      openModal('알림', '입고 승인 되었습니다.', null, false)
    } else {
      openModal('오류', result?.message || '입고 승인에 실패했습니다.', null, false)
    }
  } catch (error) {
    console.error('Error confirming inbound:', error)
    openModal('오류', '서버 통신 오류가 발생했습니다.', null, false)
  }
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
                  <td class="sku-cell">{{ box.productCode }}</td>
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
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  color: #64748b;
  font-size: 0.9rem !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  line-height: 1.35 !important;
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
