<script setup>
import { ref, computed } from 'vue'

// Mock Data
const orders = ref([
  { 
    id: 1, orderCode: 'SE0120231101001', status: '대기', franchiseCode: 'SE01', productCode: 'OR0101', 
    recipientName: '김철수', recipientPhone: '010-1111-2222', orderDate: '2023-11-01', arrivalDate: '2023-11-05',
    carrier: '-', driverName: '-', driverPhone: '-', carType: '-', carNumber: '-', maxWeight: '-'
  },
  { 
    id: 2, orderCode: 'SE0220231101005', status: '접수', franchiseCode: 'SE02', productCode: 'RO0201', 
    recipientName: '이영희', recipientPhone: '010-3333-4444', orderDate: '2023-11-01', arrivalDate: '2023-11-06',
    carrier: '-', driverName: '-', driverPhone: '-', carType: '-', carNumber: '-', maxWeight: '-'
  },
  { 
    id: 3, orderCode: 'SE0320231102020', status: '운송 업체 지정', franchiseCode: 'SE03', productCode: 'MA0301', 
    recipientName: '박민수', recipientPhone: '010-5555-6666', orderDate: '2023-11-02', arrivalDate: '2023-11-07',
    carrier: 'CJ대한통운', driverName: '최기사', driverPhone: '010-9999-8888', carType: '1톤 탑차', carNumber: '서울 12가 3456', maxWeight: '1000kg'
  },
  { 
    id: 4, orderCode: 'SE0120231102010', status: '피킹', franchiseCode: 'SE01', productCode: 'OR0403', 
    recipientName: '김철수', recipientPhone: '010-1111-2222', orderDate: '2023-11-02', arrivalDate: '2023-11-07',
    carrier: '한진택배', driverName: '이기사', driverPhone: '010-7777-6666', carType: '2.5톤 탑차', carNumber: '경기 34나 7890', maxWeight: '2500kg'
  }
])

const filter = ref({
  orderCode: '',
  status: '',
  franchiseCode: '',
  productCode: '',
  recipientName: '',
  recipientPhone: '',
  orderDate: '',
  arrivalDate: '',
  carrier: '',
  driverName: '',
  driverPhone: '',
  carType: '',
  carNumber: '',
  maxWeight: ''
})

const selectedIds = ref([])
const isSelectionMode = ref(false)
const isCancelModalOpen = ref(false)
const cancelReason = ref('')

const statuses = ['대기', '접수', '부분 접수', '운송 업체 지정', '피킹', '출고', '배송중', '배송 완료', '취소', '반려']

// Filtering Logic
const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    return (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
           (!filter.value.status || item.status === filter.value.status) &&
           (!filter.value.franchiseCode || item.franchiseCode.includes(filter.value.franchiseCode)) &&
           (!filter.value.productCode || item.productCode.includes(filter.value.productCode)) &&
           (!filter.value.recipientName || item.recipientName.includes(filter.value.recipientName)) &&
           (!filter.value.recipientPhone || item.recipientPhone.includes(filter.value.recipientPhone)) &&
           (!filter.value.orderDate || item.orderDate === filter.value.orderDate) &&
           (!filter.value.arrivalDate || item.arrivalDate === filter.value.arrivalDate) &&
           (!filter.value.carrier || item.carrier.includes(filter.value.carrier)) &&
           (!filter.value.driverName || item.driverName.includes(filter.value.driverName)) &&
           (!filter.value.driverPhone || item.driverPhone.includes(filter.value.driverPhone)) &&
           (!filter.value.carType || item.carType.includes(filter.value.carType)) &&
           (!filter.value.carNumber || item.carNumber.includes(filter.value.carNumber)) &&
           (!filter.value.maxWeight || item.maxWeight.includes(filter.value.maxWeight))
  })
})

const isCancellable = (status) => ['대기', '접수', '부분 접수'].includes(status)

const enterSelectionMode = () => {
  isSelectionMode.value = true
  selectedIds.value = []
}

const cancelSelectionMode = () => {
  isSelectionMode.value = false
  selectedIds.value = []
}

const openCancelModal = () => {
  if (selectedIds.value.length === 0) {
    alert('취소할 발주 요청을 선택해주세요.')
    return
  }
  
  const unCancellableSelected = selectedIds.value.some(id => {
      const order = orders.value.find(o => o.id === id)
      return !isCancellable(order.status)
  })

  if (unCancellableSelected) {
      alert('운송 업체 지정 이후 단계의 발주는 취소할 수 없습니다.')
      return
  }

  isCancelModalOpen.value = true
}

const confirmCancel = () => {
  if (!cancelReason.value.trim()) {
    alert('취소 사유를 입력해주세요.')
    return
  }

  orders.value = orders.value.map(o => {
    if (selectedIds.value.includes(o.id)) {
      return { ...o, status: '취소', cancelReason: cancelReason.value }
    }
    return o
  })

  alert('발주 접수 취소가 완료되었습니다.')
  closeModal()
}

const closeModal = () => {
  isCancelModalOpen.value = false
  cancelReason.value = ''
  selectedIds.value = []
  isSelectionMode.value = false
}

const toggleSelectAll = (event) => {
    if (event.target.checked) {
        selectedIds.value = filteredOrders.value
            .filter(o => isCancellable(o.status))
            .map(o => o.id)
    } else {
        selectedIds.value = []
    }
}

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '부분 접수': 'status-info',
  '운송 업체 지정': 'status-primary',
  '피킹': 'status-primary',
  '출고': 'status-primary',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
}[s] || '')

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 요청 관리</h2>
      <div class="header-actions">
        <template v-if="!isSelectionMode">
          <button @click="enterSelectionMode" class="cancel-btn">접수 취소</button>
        </template>
        <template v-else>
          <button @click="openCancelModal" class="danger-btn">선택 취소 완료</button>
          <button @click="cancelSelectionMode" class="secondary-btn">취소</button>
        </template>
      </div>
    </div>

    <!-- Filter Section (Large) -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>발주 코드</label>
          <input type="text" v-model="filter.orderCode" placeholder="SE0120260210001" />
        </div>
        <div class="filter-group">
          <label>발주 요청 상태</label>
          <select v-model="filter.status">
            <option value="">전체</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>가맹점 코드</label>
          <input type="text" v-model="filter.franchiseCode" placeholder="SE01" />
        </div>
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="OR0101" />
        </div>
        <div class="filter-group">
          <label>수령인 이름</label>
          <input type="text" v-model="filter.recipientName" />
        </div>
        <div class="filter-group">
          <label>수령인 전화번호</label>
          <input type="text" v-model="filter.recipientPhone" />
        </div>
        <div class="filter-group">
          <label>발주일</label>
          <input type="date" v-model="filter.orderDate" />
        </div>
        <div class="filter-group">
          <label>도착 일자</label>
          <input type="date" v-model="filter.arrivalDate" />
        </div>
        <div class="filter-group">
          <label>운송 업체</label>
          <input type="text" v-model="filter.carrier" />
        </div>
        <div class="filter-group">
          <label>운전자 이름</label>
          <input type="text" v-model="filter.driverName" />
        </div>
        <div class="filter-group">
          <label>운전자 번호</label>
          <input type="text" v-model="filter.driverPhone" />
        </div>
        <div class="filter-group">
          <label>차종</label>
          <input type="text" v-model="filter.carType" />
        </div>
        <div class="filter-group">
          <label>차량 번호</label>
          <input type="text" v-model="filter.carNumber" />
        </div>
        <div class="filter-group">
          <label>최대 허용 중량</label>
          <input type="text" v-model="filter.maxWeight" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="isSelectionMode">
                <input type="checkbox" @change="toggleSelectAll" :checked="selectedIds.length > 0 && selectedIds.length === filteredOrders.filter(o => isCancellable(o.status)).length" />
            </th>
            <th>발주 코드</th>
            <th>상태</th>
            <th>가맹점</th>
            <th>제품</th>
            <th>수령인</th>
            <th>연락처</th>
            <th>발주일</th>
            <th>도착일</th>
            <th>운송 업체</th>
            <th>운전자</th>
            <th>운전자 번호</th>
            <th>차종</th>
            <th>차량 번호</th>
            <th>최대 중량</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :class="{ 'selected-row': selectedIds.includes(order.id) }">
            <td v-if="isSelectionMode">
                <input type="checkbox" :value="order.id" v-model="selectedIds" :disabled="!isCancellable(order.status)" />
            </td>
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td><span :class="['status-tag', getStatusClass(order.status)]">{{ order.status }}</span></td>
            <td>{{ order.franchiseCode }}</td>
            <td class="sku-cell">{{ order.productCode }}</td>
            <td>{{ order.recipientName }}</td>
            <td>{{ order.recipientPhone }}</td>
            <td>{{ order.orderDate }}</td>
            <td>{{ order.arrivalDate }}</td>
            <td>{{ order.carrier }}</td>
            <td>{{ order.driverName }}</td>
            <td>{{ order.driverPhone }}</td>
            <td>{{ order.carType }}</td>
            <td>{{ order.carNumber }}</td>
            <td>{{ order.maxWeight }}</td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
              <td colspan="15" class="empty-cell">조회된 발주 요청이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="bottom-actions">
        <button class="primary-btn wide" @click="$router.push({ name: 'factory-vehicle-assignment' })">차량 배정</button>
    </div>

    <!-- Cancellation Modal -->
    <Teleport to="body">
      <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>발주 접수 취소</h3>
          <p class="modal-desc">선택한 {{ selectedIds.length }}건의 발주 요청을 취소하시겠습니까?</p>
          <div class="form-group">
            <label>취소 사유</label>
            <textarea v-model="cancelReason" placeholder="취소 사유를 입력해주세요." rows="4"></textarea>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" class="secondary-btn">닫기</button>
            <button @click="confirmCancel" class="danger-btn">접수 취소</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1700px; margin: 0 auto; padding-bottom: 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }

.cancel-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cancel-btn:hover { background: #fecaca; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.2rem;
  margin-bottom: 1rem;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.data-table th { text-align: left; padding: 1rem; background: #f8fafc; color: var(--text-light); font-size: 0.85rem; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; vertical-align: middle; }

.sku-cell { font-weight: 600; color: var(--primary); }
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.selected-row { background-color: #f0f7ff; }
.empty-cell { text-align: center; padding: 3rem; color: var(--text-light); }

input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
input[type="checkbox"]:disabled { cursor: not-allowed; opacity: 0.5; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.modal-content {
  background: white; padding: 2rem; border-radius: 16px;
  width: 100%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.modal-content h3 { margin-top: 0; font-size: 1.25rem; }
.modal-desc { color: var(--text-light); margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
.form-group label { font-weight: 600; }
.form-group textarea { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; resize: none; font-family: inherit; }
.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; }

.secondary-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
.danger-btn { background: #ef4444; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; }

.bottom-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
.primary-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.primary-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.primary-btn.wide { min-width: 200px; font-size: 1.1rem; }
</style>
