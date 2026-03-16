<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { updateOrderStatus, getRequestedOrders } from '@/api/hqOrders.js'

const router = useRouter()

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

// 1. Central Inventory (재고 API 미연동 — 추후 연동 필요)
const centralStock = ref({})

// 2. Orders (실제 API 로드)
const orders = ref([])

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchOrders = async () => {
  try {
    const pageData = await getRequestedOrders(true, { page: currentPage.value, size: pageSize.value })
    const data = pageData?.content || []
    totalPages.value = pageData?.totalPages || 0
    // 평탄화된 응답을 orderCode 기준으로 그룹화
    const orderMap = {}
    data.forEach(item => {
      if (!orderMap[item.orderCode]) {
        orderMap[item.orderCode] = {
          id: item.orderCode,
          orderCode: item.orderCode,
          franchiseCode: item.franchiseCode,
          recipientName: item.receiver,
          recipientPhone: '-',
          orderDate: '-',
          arrivalDate: formatDate(item.deliveryDate),
          status: item.status,
          products: []
        }
      }
      orderMap[item.orderCode].products.push({
        productCode: item.productCode,
        quantity: item.quantity,
        amount: 0,
        status: item.status
      })
    })
    orders.value = Object.values(orderMap)
  } catch (e) {
    orders.value = []
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

// 3. Filter
const filter = ref({
  orderCode: '',
  productCode: ''
})

// 4. Selection
const selectedRowKeys = ref([])
const selectionMode = ref(null)

// Core Logic 1: Flattening
const flattenedRows = computed(() => {
  return orders.value.flatMap(order => {
    return order.products.map((product, index) => ({
      rowKey: `${order.id}-${index}`,
      orderId: order.id,
      orderCode: order.orderCode,
      franchiseCode: order.franchiseCode,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      orderDate: order.orderDate,
      arrivalDate: order.arrivalDate,
      productIndex: index,
      productCode: product.productCode,
      quantity: product.quantity,
      unitAmount: product.amount,
      totalAmount: product.quantity * product.amount,
      status: product.status
    }))
  })
})

// Core Logic 2: Filtering
const filteredRows = computed(() => {
  return flattenedRows.value.filter(row => {
    const matchOrder = !filter.value.orderCode || row.orderCode.includes(filter.value.orderCode)
    const matchProduct = !filter.value.productCode || row.productCode.includes(filter.value.productCode)
    return matchOrder && matchProduct
  })
})

// Core Logic 3: Stock Reservation
const currentReservedStock = computed(() => {
  const reservation = {}
  selectedRowKeys.value.forEach(key => {
    const row = flattenedRows.value.find(r => r.rowKey === key)
    if (row) {
      reservation[row.productCode] = (reservation[row.productCode] || 0) + row.quantity
    }
  })
  return reservation
})

const getRowAvailability = (row) => {
  if (row.status !== 'PENDING') return null
  const stock = centralStock.value[row.productCode] || 0
  const reservedTotal = currentReservedStock.value[row.productCode] || 0
  const isSelected = selectedRowKeys.value.includes(row.rowKey)
  const required = isSelected ? reservedTotal : (reservedTotal + row.quantity)

  if (stock >= required) return 'possible'
  if (stock > 0) return 'partial'
  return 'impossible'
}

// Core Logic 4: Actions
const updateParentOrderStatus = (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (!order) return
  const statuses = order.products.map(p => p.status)
  if (statuses.every(s => s === 'ACCEPTED')) order.status = 'ACCEPTED'
  else if (statuses.every(s => s === 'REJECTED')) order.status = 'REJECTED'
  else if (statuses.every(s => s === 'PENDING')) order.status = 'PENDING'
  else order.status = 'PARTIAL'
}

const confirmAccept = async () => {
  if (selectedRowKeys.value.length === 0) {
    alert('접수할 항목을 선택해주세요.')
    return
  }
  const impossible = selectedRowKeys.value.find(key => {
    const row = flattenedRows.value.find(r => r.rowKey === key)
    return getRowAvailability(row) === 'impossible'
  })
  if (impossible) {
    alert('재고가 부족한 항목이 포함되어 있습니다.')
    return
  }

  const orderCodes = [...new Set(selectedRowKeys.value.map(key => {
    const row = flattenedRows.value.find(r => r.rowKey === key)
    return row?.orderCode
  }).filter(Boolean))]

  try {
    await updateOrderStatus({ orderCodes, isAccepted: true })
    selectedRowKeys.value.forEach(key => {
      const row = flattenedRows.value.find(r => r.rowKey === key)
      if (row) {
        if (centralStock.value[row.productCode] >= row.quantity) {
          centralStock.value[row.productCode] -= row.quantity
        }
        const order = orders.value.find(o => o.id === row.orderId)
        if (order) {
          order.products[row.productIndex].status = 'ACCEPTED'
          updateParentOrderStatus(order.id)
        }
      }
    })
    alert('선택한 항목이 접수되었습니다.')
    cancelSelection()
  } catch (e) {
    alert(e.message || '접수 처리에 실패했습니다.')
  }
}

const confirmReject = async () => {
  if (selectedRowKeys.value.length === 0) {
    alert('반려할 항목을 선택해주세요.')
    return
  }
  if (!confirm('선택한 항목을 반려하시겠습니까?')) return

  const orderCodes = [...new Set(selectedRowKeys.value.map(key => {
    const row = flattenedRows.value.find(r => r.rowKey === key)
    return row?.orderCode
  }).filter(Boolean))]

  try {
    await updateOrderStatus({ orderCodes, isAccepted: false })
    selectedRowKeys.value.forEach(key => {
      const row = flattenedRows.value.find(r => r.rowKey === key)
      if (row) {
        const order = orders.value.find(o => o.id === row.orderId)
        if (order) {
          order.products[row.productIndex].status = 'REJECTED'
          updateParentOrderStatus(order.id)
        }
      }
    })
    alert('선택한 항목이 반려되었습니다.')
    cancelSelection()
  } catch (e) {
    alert(e.message || '반려 처리에 실패했습니다.')
  }
}

// UI Helpers
const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)
const enterAcceptMode = () => { selectionMode.value = 'accept'; selectedRowKeys.value = [] }
const enterRejectMode = () => { selectionMode.value = 'reject'; selectedRowKeys.value = [] }
const cancelSelection = () => { selectionMode.value = null; selectedRowKeys.value = [] }
const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedRowKeys.value = filteredRows.value.filter(r => r.status === 'PENDING').map(r => r.rowKey)
  } else {
    selectedRowKeys.value = []
  }
}
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

const getStatusClass = (status) => {
  switch (status) {
    case 'ACCEPTED': return 'status-ok'
    case 'PARTIAL': return 'status-primary'
    case 'REJECTED': case 'CANCELED': return 'status-danger'
    default: return 'status-warning'
  }
}

// [NEW] 상세 페이지 이동
const goToDetail = (row) => {
  router.push({
    name: 'OrderReceptionDetail',params: { orderCode: row.orderCode }
  })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 요청 접수</h2>
      <div class="top-actions">
        <template v-if="selectionMode === null">
          <button @click="enterAcceptMode" class="accept-btn">접수</button>
          <button @click="enterRejectMode" class="reject-btn">반려</button>
        </template>
        <template v-else-if="selectionMode === 'accept'">
          <button @click="confirmAccept" class="save-btn">선택 접수 완료</button>
          <button @click="cancelSelection" class="cancel-btn">취소</button>
        </template>
        <template v-else-if="selectionMode === 'reject'">
          <button @click="confirmReject" class="reject-complete-btn">선택 반려 완료</button>
          <button @click="cancelSelection" class="cancel-btn">취소</button>
        </template>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>발주 코드</label>
          <input type="text" v-model="filter.orderCode" placeholder="검색..." />
        </div>
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="검색..." />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
        <tr>
          <th v-if="selectionMode" style="width: 40px;">
            <input type="checkbox" @change="toggleSelectAll" />
          </th>
          <th>발주 코드</th>
          <th>가맹점</th>
          <th>수령인</th>
          <th>제품 코드</th>
          <th>제품 상태</th>
          <th>수량</th>
          <th>현재고</th>
          <th>가불 여부</th>
          <th>도착 예정일</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="row in filteredRows" :key="row.rowKey"
            :class="{ 'selected-row': selectedRowKeys.includes(row.rowKey) }"
            @click="goToDetail(row)"
            style="cursor: pointer;">

          <td v-if="selectionMode" @click.stop>
            <input type="checkbox"
                   :value="row.rowKey"
                   v-model="selectedRowKeys"
                   :disabled="row.status !== 'PENDING'" />
          </td>

          <td class="sku-cell">{{ row.orderCode }}</td>
          <td>{{ row.franchiseCode }}</td>
          <td>{{ row.recipientName }}</td>

          <!-- 여기 .sku-cell 클래스가 파란색을 적용합니다 -->
          <td class="sku-cell">{{ row.productCode }}</td>

          <td>
            <span :class="['status-tag', getStatusClass(row.status)]">{{ toStatusLabel(row.status) }}</span>
          </td>
          <td class="text-right">{{ row.quantity }}</td>
          <td class="text-right">
              <span :class="{ 'low-stock': (centralStock[row.productCode] || 0) < 10 }">
                {{ centralStock[row.productCode] || 0 }}
              </span>
          </td>
          <td>
            <template v-if="row.status === 'PENDING'">
              <span v-if="getRowAvailability(row) === 'possible'" class="status-tag status-ok">가능</span>
              <span v-else-if="getRowAvailability(row) === 'partial'" class="status-tag status-warning">부족</span>
              <span v-else class="status-tag status-danger">불가</span>
            </template>
            <span v-else class="text-muted">-</span>
          </td>
          <td>{{ row.arrivalDate }}</td>
        </tr>
        <tr v-if="filteredRows.length === 0">
          <td :colspan="selectionMode ? 11 : 10" class="empty-cell">데이터가 없습니다.</td>
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
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1600px; margin: 0 auto; padding-bottom: 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.top-actions { display: flex; gap: 0.5rem; }

/* Buttons */
button { cursor: pointer; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; transition: opacity 0.2s; }
.accept-btn { background: var(--primary, #059669); color: white; }
.reject-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.save-btn { background: var(--primary, #059669); color: white; }
.cancel-btn { background: white; border: 1px solid #e5e7eb; color: #374151; }
.reject-complete-btn { background: #ef4444; color: white; }
button:hover { opacity: 0.9; }

/* Filter */
.filter-section { background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 1rem; }
.filter-grid { display: flex; gap: 1rem; }
.filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
.filter-group input { padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; }

/* Table */
.data-table-card { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.data-table th { background: #f9fafb; padding: 0.75rem 1rem; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; color: #1f2937; vertical-align: middle; }
.data-table tr:hover { background-color: #f9fafb; }

.selected-row { background-color: #f0fdf4 !important; }

/* [수정] !important를 추가하여 강제 적용 */
.sku-cell {
  font-weight: 600;
  color: #2563eb !important; /* 파란색 강제 적용 */
}

.text-right { text-align: right; }
.text-muted { color: #9ca3af; }
.low-stock { color: #dc2626; font-weight: bold; }
.empty-cell { text-align: center; padding: 2rem; color: #9ca3af; }

/* Tags */
.status-tag { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-primary { background: #dbeafe; color: #1e40af; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #1f2937; transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: #1f2937; transition: all 0.2s; }
.page-num-btn:hover { border-color: #2563eb; color: #2563eb; }
.page-num-btn.active { background: #1f2937; color: white; border-color: #1f2937; }
</style>
