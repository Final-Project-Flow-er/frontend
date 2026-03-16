<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrderList, updateOrders } from '@/api/factoryOrders.js'

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

const STATUS_MAP = {
  PENDING: '대기',
  ACCEPTED: '접수',
  AWAITING: '배송 대기',
  SHIPPING: '배송중',
  COMPLETED: '배송완료',
  CANCELED: '취소',
  REJECTED: '반려'
}

const orders = ref([])

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchOrders = async () => {
  try {
    const pageData = (await getOrderList(false, { page: currentPage.value, size: pageSize.value })) || {}
    totalPages.value = pageData.totalPages || 0
    // Group by orderCode
    const map = {}
    ;(pageData.content || []).forEach(item => {
      if (!map[item.orderCode]) {
        map[item.orderCode] = {
          id: item.orderCode,
          orderCode: item.orderCode,
          status: STATUS_MAP[item.status] || item.status,
          managerName: item.username || '',
          managerPhone: item.phoneNumber || '',
          employeeId: '',
          orderDate: formatDate(item.requestedDate),
          inboundDate: formatDate(item.storedDate),
          type: item.isRegular ? '정기' : '비정기',
          products: []
        }
      }
      map[item.orderCode].products.push({
        productCode: item.productCode,
        productName: '',
        quantity: item.quantity,
        unitPrice: 0,
        totalAmount: 0
      })
    })
    orders.value = Object.values(map)
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
  productCode: '',
  productName: '',
  quantity: '',
  unitPrice: '',
  totalAmount: '',
  managerName: '',
  managerPhone: '',
  employeeId: '',
  orderDate: '',
  inboundDate: '',
  type: ''
})

const selectionMode = ref(null)
const selectedOrderIds = ref([])
const orderTypes = ['정기', '비정기']

const filteredFlatOrders = computed(() => {
  let flatList = []

  orders.value.forEach(order => {
    if (order.status !== '대기') return

    const matchOrderInfo =
        (!filter.value.orderCode || order.orderCode.includes(filter.value.orderCode)) &&
        (!filter.value.managerName || order.managerName.includes(filter.value.managerName)) &&
        (!filter.value.managerPhone || order.managerPhone.includes(filter.value.managerPhone)) &&
        (!filter.value.employeeId || order.employeeId.includes(filter.value.employeeId)) &&
        (!filter.value.orderDate || order.orderDate === filter.value.orderDate) &&
        (!filter.value.inboundDate || order.inboundDate === filter.value.inboundDate) &&
        (!filter.value.type || order.type === filter.value.type)

    if (!matchOrderInfo) return

    order.products.forEach((product, index) => {
      const matchProductInfo =
          (!filter.value.productCode || product.productCode.includes(filter.value.productCode)) &&
          (!filter.value.productName || product.productName.includes(filter.value.productName)) &&
          (!filter.value.quantity || product.quantity.toString().includes(filter.value.quantity)) &&
          (!filter.value.unitPrice || product.unitPrice.toString().includes(filter.value.unitPrice)) &&
          (!filter.value.totalAmount || product.totalAmount.toString().includes(filter.value.totalAmount))

      if (matchProductInfo) {
        flatList.push({
          orderId: order.id,
          orderCode: order.orderCode,
          status: order.status,
          type: order.type,
          managerName: order.managerName,
          managerPhone: order.managerPhone,
          employeeId: order.employeeId,
          orderDate: order.orderDate,
          inboundDate: order.inboundDate,

          productCode: product.productCode,
          productName: product.productName,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          totalAmount: product.totalAmount,

          uniqueKey: `${order.id}-${product.productCode}`
        })
      }
    })
  })
  return flatList
})

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num)

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '입고 완료': 'status-ok',
  '반려': 'status-danger'
}[s] || '')

const enterAcceptMode = () => { selectionMode.value = 'accept'; selectedOrderIds.value = [] }
const enterRejectMode = () => { selectionMode.value = 'reject'; selectedOrderIds.value = [] }
const cancelSelection = () => { selectionMode.value = null; selectedOrderIds.value = [] }

const confirmAccept = async () => {
  if (selectedOrderIds.value.length === 0) { alert('접수할 발주 요청을 선택해주세요.'); return }
  try {
    await updateOrders({ isAccept: true, orderCodes: selectedOrderIds.value })
    orders.value = orders.value.map(o => {
      if (selectedOrderIds.value.includes(o.id)) return { ...o, status: '접수' }
      return o
    })
    alert(`${selectedOrderIds.value.length}건의 발주 요청이 접수되었습니다.`)
    cancelSelection()
  } catch (e) {
    alert(e.message || '접수 처리에 실패했습니다.')
  }
}

const confirmReject = async () => {
  if (selectedOrderIds.value.length === 0) { alert('반려할 발주 요청을 선택해주세요.'); return }
  try {
    await updateOrders({ isAccept: false, orderCodes: selectedOrderIds.value })
    orders.value = orders.value.map(o => {
      if (selectedOrderIds.value.includes(o.id)) return { ...o, status: '반려' }
      return o
    })
    alert(`${selectedOrderIds.value.length}건의 발주 요청이 반려되었습니다.`)
    cancelSelection()
  } catch (e) {
    alert(e.message || '반려 처리에 실패했습니다.')
  }
}

const toggleOrderSelection = (orderId) => {
  const index = selectedOrderIds.value.indexOf(orderId)
  if (index === -1) selectedOrderIds.value.push(orderId)
  else selectedOrderIds.value.splice(index, 1)
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    const visibleOrderIds = [...new Set(filteredFlatOrders.value.map(item => item.orderId))]
    selectedOrderIds.value = visibleOrderIds
  } else {
    selectedOrderIds.value = []
  }
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>공장 발주 요청 접수</h2>
      <div class="header-actions">
        <template v-if="selectionMode === null">
          <button @click="enterAcceptMode" class="btn-primary">접수</button>
          <button @click="enterRejectMode" class="btn-danger">반려</button>
        </template>
        <template v-else-if="selectionMode === 'accept'">
          <button @click="confirmAccept" class="btn-success">선택 접수 완료</button>
          <button @click="cancelSelection" class="btn-secondary">취소</button>
        </template>
        <template v-else-if="selectionMode === 'reject'">
          <button @click="confirmReject" class="btn-danger-complete">선택 반려 완료</button>
          <button @click="cancelSelection" class="btn-secondary">취소</button>
        </template>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="HEAD..." />
      </div>
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" />
      </div>
      <div class="filter-group">
        <label>제품명</label>
        <input type="text" v-model="filter.productName" />
      </div>
      <div class="filter-group">
        <label>담당자</label>
        <input type="text" v-model="filter.managerName" />
      </div>
      <div class="filter-group">
        <label>발주일</label>
        <input type="date" v-model="filter.orderDate" />
      </div>
      <div class="filter-group">
        <label>입고 예정일</label>
        <input type="date" v-model="filter.inboundDate" />
      </div>
      <div class="filter-group">
        <label>정기/비정기</label>
        <select v-model="filter.type">
          <option value="">전체</option>
          <option v-for="t in orderTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
        <tr>
          <th v-if="selectionMode" class="text-center" style="width: 40px;">
            <input type="checkbox" @change="toggleSelectAll" />
          </th>
          <th>발주 코드</th>
          <th>상태</th>
          <th>구분</th>
          <th>제품 코드</th>
          <th>제품명</th>
          <th class="text-right">수량</th>
          <th class="text-right">단가</th>
          <th class="text-right">총 금액</th>
          <th>담당자</th>
          <th>연락처</th>
          <th>발주일</th>
          <th>입고 예정일</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in filteredFlatOrders"
            :key="item.uniqueKey"
            :class="{ 'selected-row': selectedOrderIds.includes(item.orderId) }"
        >
          <!-- 1. 체크박스 -->
          <td v-if="selectionMode" class="text-center">
            <input
                type="checkbox"
                :checked="selectedOrderIds.includes(item.orderId)"
                @change="toggleOrderSelection(item.orderId)"
            />
          </td>

          <!-- 2. 주문 정보 (모든 행에 표시) -->
          <td class="order-code-text">{{ item.orderCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
          <td><span :class="['type-tag', item.type === '정기' ? 'type-regular' : 'type-irregular']">{{ item.type }}</span></td>

          <!-- 3. 상품 정보 -->
          <td class="sku-cell">{{ item.productCode }}</td>
          <td class="name-cell">{{ item.productName }}</td>
          <td class="text-right">{{ formatNumber(item.quantity) }}</td>
          <td class="text-right">{{ formatNumber(item.unitPrice) }}</td>
          <td class="text-right font-bold-slate">{{ formatNumber(item.totalAmount) }}</td>

          <!-- 4. 담당자 정보 (모든 행에 표시) -->
          <td>{{ item.managerName }}</td>
          <td>{{ item.managerPhone }}</td>
          <td>{{ item.orderDate }}</td>
          <td>{{ item.inboundDate }}</td>
        </tr>

        <tr v-if="filteredFlatOrders.length === 0">
          <td colspan="14" class="empty-cell">조회된 발주 요청이 없습니다.</td>
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
/* 1. 기본 레이아웃 */
.content-wrapper { max-width: 1600px; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.header-actions { display: flex; gap: 0.75rem; }

/* 2. 필터 섹션 */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 140px;
}

/* 3. 테이블 스타일 */
.data-table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
.data-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
.data-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  color: var(--text-light);
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}
.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  vertical-align: middle;
  white-space: nowrap;
}

/* 4. 유틸리티 */
.text-center { text-align: center; }
.text-right { text-align: right; }
.order-code-text { font-weight: 600; color: var(--text-dark); }
.sku-cell { color: var(--primary); font-weight: 600; }
.name-cell { color: var(--text-dark); max-width: 300px; white-space: normal; }
.font-bold-slate { font-weight: 600; color: #334155; }

/* 상태/타입 태그 */
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-danger { background: #fee2e2; color: #991b1b; }

.type-tag { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.type-regular { background: #e0f2fe; color: #0369a1; }
.type-irregular { background: #f3f4f6; color: #4b5563; }

.selected-row { background-color: #f0f7ff; }
.empty-cell { text-align: center; padding: 3rem; color: var(--text-light); }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }

/* 버튼 */
.btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-success { background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-secondary { background: white; border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-danger-complete { background: #ef4444; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

:root {
  --primary: #4f46e5;
  --text-light: #64748b;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
}
</style>
