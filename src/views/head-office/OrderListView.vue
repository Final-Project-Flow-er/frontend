<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '@/api/hqOrders.js'

const router = useRouter()

const filter = ref({
  status: '',
  orderDate: '',
  orderCode: '',
  managerName: '',
  managerPhone: '',
  productCode: '',
  arrivalDate: '',
  arrivalTime: ''
})

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

const orders = ref([])

onMounted(async () => {
    const data = await getOrderList()
    // Group by orderCode
    const map = {}
    ;(data || []).forEach(item => {
      if (!map[item.orderCode]) {
        map[item.orderCode] = {
          orderCode: item.orderCode,
          orderStatus: item.status,
          orderDate: formatDate(item.requestedDate),
          managerName: item.username || '',
          managerPhone: item.phoneNumber || '',
          stockInDate: item.storedDate || '',
          arrivalDate: '',
          arrivalTime: '',
          totalAmount: 0,
          products: []
        }
      }
      map[item.orderCode].products.push({
        productCode: item.productCode,
        productName: '',
        quantity: item.quantity,
        amount: 0
      })
    })
    orders.value = Object.values(map)
})

const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    const matchStatus = !filter.value.status || item.orderStatus === filter.value.status
    const matchOrderDate = !filter.value.orderDate || item.orderDate.includes(filter.value.orderDate)
    const matchOrderCode = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    const matchManagerName = !filter.value.managerName || item.managerName.includes(filter.value.managerName)
    const matchManagerPhone = !filter.value.managerPhone || item.managerPhone.includes(filter.value.managerPhone)
    const matchProductCode = !filter.value.productCode || item.products.some(p => p.productCode.includes(filter.value.productCode))
    const matchArrivalDate = !filter.value.arrivalDate || item.arrivalDate.includes(filter.value.arrivalDate)
    const matchArrivalTime = !filter.value.arrivalTime || item.arrivalTime.includes(filter.value.arrivalTime)
    
    return matchStatus && matchOrderDate && matchOrderCode && matchManagerName && matchManagerPhone && matchProductCode && matchArrivalDate && matchArrivalTime
  })
})

const flattenedOrders = computed(() => {
  const flattened = []
  filteredOrders.value.forEach(order => {
    order.products.forEach((product, index) => {
      flattened.push({
        ...order,
        product,
        isFirstProduct: index === 0,
        productCount: order.products.length
      })
    })
  })
  return flattened
})

const HQ_ORDER_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  CANCELED: '취소',
  REJECTED: '반려'
}
const toStatusLabel = (s) => HQ_ORDER_STATUS_LABEL[s] || s

const getStatusClass = (s) => ({
  PENDING: 'status-warning',
  ACCEPTED: 'status-info',
  CANCELED: 'status-danger',
  REJECTED: 'status-danger'
}[s] || '')

const goToDetail = (item) => {
  router.push({ name: 'head-office-order-detail', params: { id: item.orderCode } })
}

const goToEdit = (item) => {
  router.push({ name: 'head-office-order-edit', params: { id: item.orderCode } })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 발주 관리</h2>
      <button class="add-btn" @click="router.push({ name: 'head-office-order-create' })">발주 생성</button>
    </div>

    <section class="summary-section">
      <div class="summary-card"><span class="s-label">금일 발주 건수</span><p class="s-value">1건</p></div>
      <div class="summary-card"><span class="s-label">배송 준비중</span><p class="s-value">1건</p></div>
      
    </section>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>발주 상태</label>
        <select v-model="filter.status">
          <option value="">전체</option>
          <option v-for="(label, key) in HQ_ORDER_STATUS_LABEL" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="HEAD20260210001" />
      </div>
      <div class="filter-group">
        <label>발주일</label>
        <input type="date" v-model="filter.orderDate" />
      </div>
      <div class="filter-group">
        <label>담당자 이름</label>
        <input type="text" v-model="filter.managerName" placeholder="이름" />
      </div>
      <div class="filter-group">
        <label>담당자 번호</label>
        <input type="text" v-model="filter.managerPhone" placeholder="전화번호" />
      </div>
      <div class="filter-group smaller">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="OR0101" />
      </div>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>발주 코드</th>
            <th>발주 상태</th>
            <th>제품 코드</th>
            <th>수량</th>
            <th>발주일</th>
            <th>담당자 이름</th>
            <th>담당자 전화번호</th>
            <th>입고 날짜</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, idx) in flattenedOrders" 
            :key="`${row.orderCode}-${row.product.productCode}`" 
            @click="goToDetail(row)" 
            :class="['clickable-row', { 'first-product-row': row.isFirstProduct, 'grouped-row': !row.isFirstProduct }]"
          >
            <td class="sku-cell code-order">{{ row.orderCode }}</td>
            <td><span :class="['status-tag', getStatusClass(row.orderStatus)]">{{ toStatusLabel(row.orderStatus) }}</span></td>
            <td class="sku-cell small">{{ row.product.productCode }}</td>
            <td>{{ row.product.quantity }}</td>
            <td>{{ row.orderDate }}</td>
            <td>{{ row.managerName }}</td>
            <td>{{ row.managerPhone }}</td>
            <td>{{ row.stockInDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.content-wrapper { max-width: 1400px; margin: 0 auto; }
.summary-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.s-label { font-size: 0.9rem; color: var(--text-light); }
.s-value { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
.summary-card.warn .s-value { color: #ef4444; }
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

/* Filter Styles */
.filter-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap; /* Handle smaller screens better */
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  min-width: 200px;
}
.filter-group.smaller input {
  min-width: 120px;
}
.date-range { display: flex; align-items: center; gap: 8px; }
.date-range input { min-width: 140px; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.05rem 0.8rem !important; height: 58px !important; background: #f8fafc; color: var(--text-light); font-size: 0.9rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 1.05rem 0.8rem !important; height: 58px !important; border-bottom: 1px solid var(--border-color); font-size: 0.95rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; line-height: 1.35 !important; white-space: nowrap; }
.sku-cell { color: #1d4ed8; font-weight: 600; }
.status-tag { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }
.action-btn { background: white; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

.sku-cell.small {
  font-size: 0.95rem;
}

.clickable-row { cursor: pointer; transition: background-color 0.2s ease; }
.clickable-row:hover { background-color: #f8fafc; }

.first-product-row {
  border-top: 2px solid var(--border-color);
}

.grouped-row td {
  border-top: 1px dashed #e2e8f0;
}
</style>
