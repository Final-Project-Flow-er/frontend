<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRequestedOrders, cancelFranchiseOrder } from '@/api/hqOrders.js'

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

const orders = ref([])

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchOrders = async () => {
  try {
    const pageData = (await getRequestedOrders(false, { page: currentPage.value, size: pageSize.value })) || {}
    orders.value = (pageData.content || []).map(item => ({
      orderCode: item.orderCode,
      status: item.status,
      franchiseCode: item.franchiseCode,
      receiver: item.receiver,
      productCode: item.productCode,
      quantity: item.quantity,
      deliveryDate: formatDate(item.deliveryDate),
    }))
    totalPages.value = pageData.totalPages || 0
  } catch (e) {
    alert(e.message)
  }
}

const changePage = async (page) => {
  currentPage.value = page
  await fetchOrders()
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxVisible = 5
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(maxVisible / 2))
  let end = start + maxVisible
  if (end > total) { end = total; start = end - maxVisible }
  return Array.from({ length: end - start }, (_, i) => start + i)
})

onMounted(() => fetchOrders())

const filter = ref({
  orderCode: '',
  status: '',
  franchiseCode: '',
  receiver: '',
  productCode: '',
  deliveryDate: '',
})

const selectedCodes = ref([])
const isSelectionMode = ref(false)
const isCancelModalOpen = ref(false)
const cancelReason = ref('')

const ORDER_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  PARTIAL: '부분 접수',
  SHIPPING_PENDING: '배송 대기',
  SHIPPING: '배송중',
  COMPLETED: '배송 완료',
  CANCELED: '취소',
  REJECTED: '반려'
}
const toStatusLabel = (s) => ORDER_STATUS_LABEL[s] || s
const statuses = Object.keys(ORDER_STATUS_LABEL)

const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    return (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
           (!filter.value.status || item.status === filter.value.status) &&
           (!filter.value.franchiseCode || item.franchiseCode.includes(filter.value.franchiseCode)) &&
           (!filter.value.receiver || item.receiver.includes(filter.value.receiver)) &&
           (!filter.value.productCode || item.productCode.includes(filter.value.productCode)) &&
           (!filter.value.deliveryDate || item.deliveryDate === filter.value.deliveryDate)
  })
})

const isCancellable = (status) => ['PENDING', 'ACCEPTED', 'PARTIAL'].includes(status)

const enterSelectionMode = () => {
  isSelectionMode.value = true
  selectedCodes.value = []
}

const cancelSelectionMode = () => {
  isSelectionMode.value = false
  selectedCodes.value = []
}

const openCancelModal = () => {
  if (selectedCodes.value.length === 0) {
    alert('취소할 발주 요청을 선택해주세요.')
    return
  }

  const unCancellableSelected = selectedCodes.value.some(code => {
    const order = orders.value.find(o => o.orderCode === code)
    return !isCancellable(order.status)
  })

  if (unCancellableSelected) {
    alert('취소 불가 상태의 발주가 포함되어 있습니다.')
    return
  }

  isCancelModalOpen.value = true
}

const confirmCancel = async () => {
  if (!cancelReason.value.trim()) {
    alert('취소 사유를 입력해주세요.')
    return
  }

  try {
    await cancelFranchiseOrder(selectedCodes.value.map(code => ({
      orderCode: code,
      canceledReason: cancelReason.value.trim()
    })))
    orders.value = orders.value.map(o => {
      if (selectedCodes.value.includes(o.orderCode)) {
        return { ...o, status: 'CANCELED' }
      }
      return o
    })
    alert('발주 접수 취소가 완료되었습니다.')
    closeModal()
  } catch (e) {
    alert(e.message || '접수 취소 처리에 실패했습니다.')
  }
}

const closeModal = () => {
  isCancelModalOpen.value = false
  cancelReason.value = ''
  selectedCodes.value = []
  isSelectionMode.value = false
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedCodes.value = filteredOrders.value
      .filter(o => isCancellable(o.status))
      .map(o => o.orderCode)
  } else {
    selectedCodes.value = []
  }
}

const getStatusClass = (s) => ({
  PENDING: 'status-warning',
  ACCEPTED: 'status-info',
  PARTIAL: 'status-info',
  SHIPPING_PENDING: 'status-warning',
  SHIPPING: 'status-primary',
  COMPLETED: 'status-ok',
  CANCELED: 'status-danger',
  REJECTED: 'status-danger'
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

    <!-- Filter Section -->
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
            <option v-for="s in statuses" :key="s" :value="s">{{ toStatusLabel(s) }}</option>
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
          <input type="text" v-model="filter.receiver" />
        </div>
        <div class="filter-group">
          <label>배송 일자</label>
          <input type="date" v-model="filter.deliveryDate" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th v-if="isSelectionMode">
              <input type="checkbox" @change="toggleSelectAll" :checked="selectedCodes.length > 0 && selectedCodes.length === filteredOrders.filter(o => isCancellable(o.status)).length" />
            </th>
            <th>발주 코드</th>
            <th>상태</th>
            <th>가맹점</th>
            <th>제품 코드</th>
            <th>수령인</th>
            <th>수량</th>
            <th>배송 일자</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderCode" :class="{ 'selected-row': selectedCodes.includes(order.orderCode) }">
            <td v-if="isSelectionMode">
              <input type="checkbox" :value="order.orderCode" v-model="selectedCodes" :disabled="!isCancellable(order.status)" />
            </td>
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td><span :class="['status-tag', getStatusClass(order.status)]">{{ toStatusLabel(order.status) }}</span></td>
            <td>{{ order.franchiseCode }}</td>
            <td class="sku-cell">{{ order.productCode }}</td>
            <td>{{ order.receiver }}</td>
            <td>{{ order.quantity }}</td>
            <td>{{ order.deliveryDate }}</td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td :colspan="isSelectionMode ? 9 : 8" class="empty-cell">조회된 발주 요청이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-nav-btn" :disabled="currentPage === 0" @click="changePage(currentPage - 1)">이전</button>
        <div class="page-numbers">
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="changePage(p)"
            :class="{ active: currentPage === p }"
            class="page-num-btn"
          >{{ p + 1 }}</button>
        </div>
        <button class="page-nav-btn" :disabled="currentPage === totalPages - 1" @click="changePage(currentPage + 1)">다음</button>
      </div>
    </div>

    <!-- Cancellation Modal -->
    <Teleport to="body">
      <div v-if="isCancelModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h3>발주 접수 취소</h3>
          <p class="modal-desc">선택한 {{ selectedCodes.length }}건의 발주 요청을 취소하시겠습니까?</p>
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
.content-wrapper { max-width: 1400px; margin: 0 auto; padding-bottom: 2rem; }
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

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }
</style>
