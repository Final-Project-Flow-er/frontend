<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/common/Modal.vue'
import { getAvailableVehicles, getUnassignedOrders, assignVehicle as assignVehicleAPI } from '@/api/internalTransport.js'
import { updateOrderShippingPending } from '@/api/hqOrders.js'

const router = useRouter()

const vehicles = ref([])
const unassignedOrders = ref([])

onMounted(async () => {
  try {
    const data = await getAvailableVehicles()
    vehicles.value = (data || []).map(v => ({
      vehicleId: v.vehicleId,
      company: v.transportName,
      driver: v.driverName,
      phone: v.driverPhoneNumber,
      number: v.vehicleNumber,
      maxWeight: v.maxLoad || 0,
      currentWeight: v.currentLoad || 0
    }))
  } catch (error) {
    console.error('차량 목록을 불러오는 중 오류 발생:', error)
  }

  try {
    const orderData = await getUnassignedOrders()
    unassignedOrders.value = (orderData || []).map(o => ({
      orderId: o.orderId,
      orderCode: o.orderCode,
      franchise: o.franchiseName,
      address: o.address,
      recipient: o.representativeName,
      orderDate: o.orderCreatedAt ? o.orderCreatedAt.split('T')[0] : '',
      arrivalDate: o.deliveryDate ? o.deliveryDate.split('T')[0] : '',
      weight: o.weight || 0
    }))
  } catch (error) {
    console.error('미배정 발주 목록을 불러오는 중 오류 발생:', error)
  }
})

const vehicleFilter = ref({
  company: '',
  maxWeight: '',
  number: ''
})

const orderFilter = ref({
  search: ''
})

const companies = computed(() => {
  const companySet = new Set(vehicles.value.map(v => v.company).filter(Boolean))
  return Array.from(companySet).sort()
})
const weightOptions = [1000, 2500, 5000]

const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    return (!vehicleFilter.value.company || v.company === vehicleFilter.value.company) &&
           (!vehicleFilter.value.maxWeight || v.maxWeight >= parseInt(vehicleFilter.value.maxWeight)) &&
           (!vehicleFilter.value.number || v.number.includes(vehicleFilter.value.number))
  })
})

const filteredOrders = computed(() => {
  return unassignedOrders.value.filter(o => {
    const keyword = orderFilter.value.search.toLowerCase()
    return !keyword || o.orderCode.toLowerCase().includes(keyword) || o.franchise.toLowerCase().includes(keyword)
  })
})

const selectedVehicle = ref(null)
const selectedOrderCodes = ref(new Set())

const selectVehicle = (vehicle) => {
  // Sync selectedVehicle with the ref from vehicles array to maintain reactivity if we update vehicles.value
  selectedVehicle.value = vehicle
  selectedOrderCodes.value.clear() // Reset orders when vehicle changes
}

const toggleOrder = (orderCode) => {
  if (selectedOrderCodes.value.has(orderCode)) {
    selectedOrderCodes.value.delete(orderCode)
  } else {
    selectedOrderCodes.value.add(orderCode)
  }
}

// Logic: Check if adding an order exceeds capacity
const canCheckOrder = (order) => {
  if (!selectedVehicle.value) return false
  
  // Weights already on the vehicle + checked orders (excluding this one if already checked)
  let totalWeightInVehicle = selectedVehicle.value.currentWeight
  unassignedOrders.value.forEach(o => {
    if (selectedOrderCodes.value.has(o.orderCode) && o.orderCode !== order.orderCode) {
      totalWeightInVehicle += o.weight
    }
  })
  
  // If removing, it's always allowed
  if (selectedOrderCodes.value.has(order.orderCode)) return true
  
  // If adding, check against max weight
  return (totalWeightInVehicle + order.weight) <= selectedVehicle.value.maxWeight
}

const totalSelectedWeight = computed(() => {
  let weight = 0
  unassignedOrders.value.forEach(o => {
    if (selectedOrderCodes.value.has(o.orderCode)) {
      weight += o.weight
    }
  })
  return weight
})

const isOverloadBtn = computed(() => {
  if (!selectedVehicle.value) return false
  return (selectedVehicle.value.currentWeight + totalSelectedWeight.value) > selectedVehicle.value.maxWeight
})

const assignVehicle = () => {
  if (!selectedVehicle.value || selectedOrderCodes.value.size === 0) return
  if (isOverloadBtn.value) {
    alert('차량의 최대 적재량을 초과하여 배정할 수 없습니다.')
    return
  }
  
  openModal('배정 확인', `${selectedVehicle.value.number} 차량에 ${selectedOrderCodes.value.size}건의 발주를 배정하시겠습니까?`, async () => {
    try {
      const orderIds = Array.from(selectedOrderCodes.value)
        .map(code => unassignedOrders.value.find(o => o.orderCode === code)?.orderId)
        .filter(id => id !== undefined)

      const payload = {
        vehicleId: selectedVehicle.value.vehicleId,
        selectedIds: orderIds
      }
      await assignVehicleAPI(payload)
      
      // 차량 배정 후 발주 상태를 배송 대기로 업데이트
      const shippingPendingPayload = Array.from(selectedOrderCodes.value).map(code => ({ orderCode: code }))
      await updateOrderShippingPending(shippingPendingPayload)

      openModal('알림', '배정이 완료되었습니다.', null, false)
      
      const vehicleIdx = vehicles.value.findIndex(v => v.number === selectedVehicle.value.number)
      if (vehicleIdx !== -1) {
          vehicles.value[vehicleIdx].currentWeight += totalSelectedWeight.value
          selectedVehicle.value = vehicles.value[vehicleIdx]
      }
      unassignedOrders.value = unassignedOrders.value.filter(o => !selectedOrderCodes.value.has(o.orderCode))
      selectedOrderCodes.value.clear()
    } catch (e) {
      console.error(e)
      alert(e.response?.data?.message || '차량 배정에 실패했습니다.')
    }
  })
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

const goBack = () => router.back()

</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h2 class="page-title">차량 배정 관리</h2>
      </div>
    </div>

    <div class="main-layout">
      <!-- Top Section: Filter + Vehicle List (Side by Side) -->
      <div class="top-content">
        <div class="filter-section card">
          <h3 class="section-title">차량 검색 필터</h3>
          <div class="filter-grid">
            <div class="filter-group">
              <label>운송 업체</label>
              <select v-model="vehicleFilter.company">
                <option value="">전체</option>
                <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>적재 가능 중량(≥)</label>
              <select v-model="vehicleFilter.maxWeight">
                <option value="">전체</option>
                <option v-for="w in weightOptions" :key="w" :value="w">{{ w.toLocaleString() }}kg</option>
              </select>
            </div>
            <div class="filter-group">
              <label>차량 번호</label>
              <input type="text" v-model="vehicleFilter.number" placeholder="차량 번호 입력" />
            </div>
          </div>
        </div>

        <div class="vehicle-list-section card">
          <h3 class="section-title">운송 가능 차량 리스트</h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>운송 업체</th>
                  <th>운전자</th>
                  <th>운전자 번호</th>
                  <th>차량 번호</th>
                  <th>중량(적재/최대)</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="v in filteredVehicles" 
                  :key="v.number" 
                  :class="{ active: selectedVehicle?.number === v.number }"
                  @click="selectVehicle(v)"
                  class="clickable-row"
                >
                  <td>{{ v.company }}</td>
                  <td>{{ v.driver }}</td>
                  <td>{{ v.phone }}</td>
                  <td class="code-cell">{{ v.number }}</td>
                  <td class="text-right weight-cell">
                    <span :class="{ 'overload': v.currentWeight >= v.maxWeight }">{{ v.currentWeight.toLocaleString() }}</span>
                    <span class="divider">/</span>
                    <span class="max-weight">{{ v.maxWeight.toLocaleString() }}kg</span>
                  </td>
                </tr>
                <tr v-if="filteredVehicles.length === 0">
                  <td colspan="5" class="empty-state">조건에 맞는 차량이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Unassigned Orders (Full Width) -->
      <div class="bottom-content">
        <div class="order-list-section card">
          <div class="section-header">
            <div class="header-left-group">
              <h3 class="section-title">차량 미배정 발주 목록</h3>
              <div class="order-search-filter">
                <input type="text" v-model="orderFilter.search" placeholder="발주코드 및 가맹점 검색" class="large-search" />
              </div>
            </div>
            <div v-if="selectedVehicle" class="info-badge">
              선택 차량: <strong>{{ selectedVehicle.number }}</strong> (최대 {{ selectedVehicle.maxWeight.toLocaleString() }}kg)
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col"></th>
                  <th>발주 코드</th>
                  <th>가맹점</th>
                  <th>주소</th>
                  <th>수령인</th>
                  <th>중량</th>
                  <th>발주일</th>
                  <th>도착일</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in filteredOrders" :key="o.orderCode">
                  <td class="checkbox-col">
                    <input 
                      type="checkbox" 
                      :checked="selectedOrderCodes.has(o.orderCode)" 
                      :disabled="!canCheckOrder(o)"
                      @change="toggleOrder(o.orderCode)"
                    />
                  </td>
                  <td class="code-cell">{{ o.orderCode }}</td>
                  <td>{{ o.franchise }}</td>
                  <td class="address-cell" :title="o.address">{{ o.address }}</td>
                  <td>{{ o.recipient }}</td>
                  <td class="text-right">{{ o.weight.toLocaleString() }}kg</td>
                  <td>{{ o.orderDate }}</td>
                  <td>{{ o.arrivalDate }}</td>
                </tr>
                <tr v-if="filteredOrders.length === 0">
                   <td colspan="8" class="empty-state">미배정 발주 내역이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bottom-action-bar">
          <div class="capacity-indicator" v-if="selectedVehicle">
             배정 수량: <strong>{{ selectedOrderCodes.size }}건</strong>
          </div>
          <button 
            class="action-btn assign-btn" 
            :disabled="!selectedVehicle || selectedOrderCodes.size === 0 || isOverloadBtn"
            @click="assignVehicle"
          >
            차량 배정
          </button>
        </div>
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  background-color: #f8fafc;
}

.page-header {
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.main-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
}

.top-content {
  display: flex;
  gap: 1.5rem;
  height: 240px; /* 컴팩트한 높이로 조정 */
  flex-shrink: 0;
}

.bottom-content {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.filter-group input, .filter-group select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.filter-section {
  flex: 4;
  height: 100%;
}

.vehicle-list-section {
  flex: 6;
  height: 100%;
}

.order-list-section {
  flex: 1; /* 다시 flex: 1로 설정하여 남은 공간 차지 */
  min-height: 400px; /* 5줄 이상 확실히 보장 */
}

.table-wrapper {
  flex: 1; /* 카드 내에서 가로 공간을 채우도록 */
  overflow: auto;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  background: white;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  z-index: 1;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  color: #334155;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s;
}

.clickable-row:hover { background-color: #f1f5f9; }
.clickable-row.active { background-color: #e0f2fe; }

.checkbox-col { width: 40px; text-align: center; }
.weight-cell {
  font-family: inherit;
}
.weight-cell .divider {
  margin: 0 4px;
  color: #94a3b8;
}
.weight-cell .max-weight {
  color: #64748b;
  font-size: 0.8rem;
}
.weight-cell .overload {
  color: #ef4444;
  font-weight: 700;
}
.code-cell { font-family: monospace; font-weight: 600; color: #64748b; }
.address-cell { 
  max-width: 180px; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
  color: #64748b;
  font-size: 0.8rem;
}
.name-cell { font-weight: 500; }
.cost-cell { font-weight: 600; color: #0f172a; }
.text-right { text-align: right; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.order-search-filter {
  display: flex;
  gap: 0.5rem;
}

.order-search-filter input.large-search {
  padding: 0.4rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  width: 250px;
}

.info-badge {
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid #bae6fd;
}

.bottom-action-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.capacity-indicator {
  font-size: 0.95rem;
  color: #475569;
}

.action-btn {
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.assign-btn { background-color: #2563eb; }
.assign-btn:hover:not(:disabled) { background-color: #1d4ed8; }
.assign-btn:disabled { background-color: #cbd5e1; cursor: not-allowed; box-shadow: none; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}
</style>
