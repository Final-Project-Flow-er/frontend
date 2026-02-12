<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()

// Mock Data - Vehicles
const vehicles = ref([
  { company: '우리통상', driver: '홍길동', phone: '010-1234-5678', type: '5톤 트럭', number: '서울 12가 3456', maxWeight: 5000, orderWeight: 1200, returnWeight: 0 },
  { company: '대한물류', driver: '김철수', phone: '010-2222-3333', type: '1톤 탑차', number: '경기 88나 9999', maxWeight: 1000, orderWeight: 0, returnWeight: 0 },
  { company: '에이원', driver: '이영희', phone: '010-5555-6666', type: '2.5톤 트럭', number: '인천 77다 1111', maxWeight: 2500, orderWeight: 500, returnWeight: 0 },
  { company: '우리통상', driver: '정지훈', phone: '010-8888-9999', type: '1톤 탑차', number: '서울 55라 1234', maxWeight: 1000, orderWeight: 0, returnWeight: 0 },
  { company: '대한물류', driver: '차유진', phone: '010-4444-5555', type: '5톤 트럭', number: '경기 22마 5678', maxWeight: 5000, orderWeight: 0, returnWeight: 0 },
])

// Mock Data - Unassigned Return Requests
const unassignedReturns = ref([
  { returnCode: 'RESE0120260209001', franchise: '강남점', address: '서울 강남구 역삼동 123-45', product: '오리지널 떡볶이 밀키트', recipient: '본사 창고', contact: '02-123-4567', requestDate: '2026-02-09', weight: 300, transportCost: 30000 },
  { returnCode: 'RESE0220260209002', franchise: '홍대점', address: '서울 마포구 서교동 456-78', product: '마라 떡볶이 밀키트', recipient: '본사 창고', contact: '02-123-4567', requestDate: '2026-02-09', weight: 500, transportCost: 40000 },
  { returnCode: 'RESE0320260210001', franchise: '잠실점', address: '서울 송파구 신천동 789-01', product: '로제 떡볶이 밀키트', recipient: '본사 창고', contact: '02-123-4567', requestDate: '2026-02-10', weight: 200, transportCost: 25000 },
  { returnCode: 'RESE0420260211001', franchise: '신촌점', address: '서울 서대문구 창천동 111-22', product: '오리지널 떡볶이 밀키트', recipient: '본사 창고', contact: '02-123-4567', requestDate: '2026-02-11', weight: 800, transportCost: 55000 },
])

const vehicleFilter = ref({
  company: '',
  type: '',
  maxWeight: '',
  number: ''
})

const returnFilter = ref({
  search: ''
})

const companies = ['우리통상', '대한물류', '에이원']
const vehicleTypes = ['1톤 탑차', '2.5톤 트럭', '5톤 트럭']
const weightOptions = [1000, 2500, 5000]

const filteredVehicles = computed(() => {
  return vehicles.value.filter(v => {
    return (!vehicleFilter.value.company || v.company === vehicleFilter.value.company) &&
           (!vehicleFilter.value.type || v.type === vehicleFilter.value.type) &&
           (!vehicleFilter.value.maxWeight || v.maxWeight >= parseInt(vehicleFilter.value.maxWeight)) &&
           (!vehicleFilter.value.number || v.number.includes(vehicleFilter.value.number))
  })
})

const filteredReturns = computed(() => {
  return unassignedReturns.value.filter(r => {
    const keyword = returnFilter.value.search.toLowerCase()
    return !keyword || r.returnCode.toLowerCase().includes(keyword) || r.franchise.toLowerCase().includes(keyword)
  })
})

const selectedVehicle = ref(null)
const selectedReturnCodes = ref(new Set())

const selectVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
  selectedReturnCodes.value.clear()
}

const toggleReturn = (returnCode) => {
  if (selectedReturnCodes.value.has(returnCode)) {
    selectedReturnCodes.value.delete(returnCode)
  } else {
    selectedReturnCodes.value.add(returnCode)
  }
}

const canCheckReturn = (ret) => {
  if (!selectedVehicle.value) return false
  
  let totalWeightInVehicle = selectedVehicle.value.orderWeight + selectedVehicle.value.returnWeight
  unassignedReturns.value.forEach(r => {
    if (selectedReturnCodes.value.has(r.returnCode) && r.returnCode !== ret.returnCode) {
      totalWeightInVehicle += r.weight
    }
  })
  
  if (selectedReturnCodes.value.has(ret.returnCode)) return true
  
  return (totalWeightInVehicle + ret.weight) <= selectedVehicle.value.maxWeight
}

const assignVehicle = () => {
  if (!selectedVehicle.value || selectedReturnCodes.value.size === 0) return
  
  let weightToAdd = 0
  unassignedReturns.value.forEach(r => {
    if (selectedReturnCodes.value.has(r.returnCode)) {
      weightToAdd += r.weight
    }
  })

  openModal('배정 확인', `${selectedVehicle.value.number} 차량에 ${selectedReturnCodes.value.size}건의 반품을 배정하시겠습니까?`, () => {
    const vehicleIdx = vehicles.value.findIndex(v => v.number === selectedVehicle.value.number)
    if (vehicleIdx !== -1) {
        vehicles.value[vehicleIdx].returnWeight += weightToAdd
        selectedVehicle.value = vehicles.value[vehicleIdx]
    }

    unassignedReturns.value = unassignedReturns.value.filter(r => !selectedReturnCodes.value.has(r.returnCode))
    selectedReturnCodes.value.clear()
    openModal('알림', '반품 차량 배정이 완료되었습니다.', null, false)
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
        <h2 class="page-title">반품 차량 배정 관리</h2>
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
              <label>차량 종류</label>
              <select v-model="vehicleFilter.type">
                <option value="">전체</option>
                <option v-for="t in vehicleTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>최대 적재량(≥)</label>
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
                  <th>차종</th>
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
                  <td>{{ v.type }}</td>
                  <td class="code-cell">{{ v.number }}</td>
                  <td class="text-right weight-cell">
                    <div class="weight-details">
                      <span class="weight-item order">발: {{ v.orderWeight.toLocaleString() }}</span>
                      <span class="weight-item return">반: {{ v.returnWeight.toLocaleString() }}</span>
                    </div>
                    <div class="weight-total">
                      <span :class="{ 'overload': (v.orderWeight + v.returnWeight) >= v.maxWeight }">
                        {{ (v.orderWeight + v.returnWeight).toLocaleString() }}
                      </span>
                      <span class="divider">/</span>
                      <span class="max-weight">{{ v.maxWeight.toLocaleString() }}kg</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredVehicles.length === 0">
                  <td colspan="6" class="empty-state">조건에 맞는 차량이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Unassigned Returns (Full Width) -->
      <div class="bottom-content">
        <div class="order-list-section card">
          <div class="section-header">
            <div class="header-left-group">
              <h3 class="section-title">차량 미배정 반품 목록</h3>
              <div class="order-search-filter">
                <input type="text" v-model="returnFilter.search" placeholder="반품코드 및 가맹점 검색" class="large-search" />
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
                  <th>반품 코드</th>
                  <th>가맹점</th>
                  <th>주소</th>
                  <th>제품</th>
                  <th>수령인</th>
                  <th>연락처</th>
                  <th>중량</th>
                  <th>운송비</th>
                  <th>반품 요청일</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filteredReturns" :key="r.returnCode">
                  <td class="checkbox-col">
                    <input 
                      type="checkbox" 
                      :checked="selectedReturnCodes.has(r.returnCode)" 
                      :disabled="!canCheckReturn(r)"
                      @change="toggleReturn(r.returnCode)"
                    />
                  </td>
                  <td class="code-cell">{{ r.returnCode }}</td>
                  <td>{{ r.franchise }}</td>
                  <td class="address-cell" :title="r.address">{{ r.address }}</td>
                  <td class="name-cell">{{ r.product }}</td>
                  <td>{{ r.recipient }}</td>
                  <td>{{ r.contact }}</td>
                  <td class="text-right">{{ r.weight.toLocaleString() }}kg</td>
                  <td class="text-right cost-cell">{{ r.transportCost.toLocaleString() }}원</td>
                  <td>{{ r.requestDate }}</td>
                </tr>
                <tr v-if="filteredReturns.length === 0">
                   <td colspan="10" class="empty-state">미배정 반품 내역이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bottom-action-bar">
          <div class="capacity-indicator" v-if="selectedVehicle">
             배정 수량: <strong>{{ selectedReturnCodes.size }}건</strong>
          </div>
          <button 
            class="action-btn assign-btn" 
            :disabled="!selectedVehicle || selectedReturnCodes.size === 0"
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
  height: 240px;
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
  flex: 1;
  min-height: 400px;
}

.table-wrapper {
  flex: 1;
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
  padding: 0.5rem 0.75rem !important;
}

.weight-details {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.weight-item {
  padding: 1px 4px;
  border-radius: 4px;
}

.weight-item.order {
  background: #f1f5f9;
  color: #64748b;
}

.weight-item.return {
  background: #f0f9ff;
  color: #0369a1;
  font-weight: 600;
}

.weight-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
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
