<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

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

const orders = ref([
  { 
    orderStatus: '대기', 
    orderDate: '2023-10-25', 
    orderCode: 'HEAD20231025001', 
    products: [
      { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 50, amount: 10000 },
      { productCode: 'OR0103', productName: '오리지널 떡볶이 밀키트 순한맛 3,4인분', quantity: 20, amount: 18000 }
    ],
    totalAmount: 860000, 
    managerName: '김민기', 
    managerPhone: '010-1111-2222', 
    stockInDate: '2023-10-27', 
    arrivalDate: '2023-10-27', 
    arrivalTime: '10:00' 
  },
  { 
    orderStatus: '배송중', 
    orderDate: '2023-10-24', 
    orderCode: 'HEAD20231024005', 
    products: [
      { productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분', quantity: 30, amount: 12000 },
      { productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', quantity: 10, amount: 12000 }
    ],
    totalAmount: 480000, 
    managerName: '송지은', 
    managerPhone: '010-3333-4444', 
    stockInDate: '2023-10-26', 
    arrivalDate: '2023-10-26', 
    arrivalTime: '14:30' 
  },
  { 
    orderStatus: '배송완료', 
    orderDate: '2023-10-23', 
    orderCode: 'HEAD20231023020', 
    products: [
      { productCode: 'MA0303', productName: '마라 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 200, amount: 22000 },
      { productCode: 'RO0103', productName: '로제 떡볶이 밀키트 순한맛 3,4인분', quantity: 50, amount: 22000 }
    ],
    totalAmount: 5500000, 
    managerName: '박원규', 
    managerPhone: '010-5555-6666', 
    stockInDate: '2023-10-25', 
    arrivalDate: '2023-10-25', 
    arrivalTime: '09:00' 
  },
  { 
    orderStatus: '취소', 
    orderDate: '2023-10-22', 
    orderCode: 'HEAD20231022030', 
    products: [
      { productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', quantity: 30, amount: 18000 },
      { productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', quantity: 10, amount: 10000 }
    ],
    totalAmount: 640000, 
    managerName: '김민수', 
    managerPhone: '010-7777-8888', 
    stockInDate: '-', 
    arrivalDate: '2023-10-24', 
    arrivalTime: '11:00' 
  },
])

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

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '부분 접수': 'status-info',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger'
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
          <option value="대기">대기</option>
          <option value="접수">접수</option>
          <option value="부분 접수">부분 접수</option>
          <option value="배송중">배송중</option>
          <option value="배송완료">배송완료</option>
          <option value="취소">취소</option>
          <option value="반려">반려</option>
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
      <div class="filter-group">
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
            <th>단위 금액</th>
            <th>단위 총 금액</th>
            <th>총 금액</th>
            <th>발주일</th>
            <th>담당자 이름</th>
            <th>담당자 전화번호</th>
            <th>입고 날짜</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderCode" @click="goToDetail(order)" class="clickable-row">
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td><span :class="['status-tag', getStatusClass(order.orderStatus)]">{{ order.orderStatus }}</span></td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode" class="sku-cell small">
                  {{ p.productCode }}
                </span>
              </div>
            </td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode">
                  {{ p.quantity }}
                </span>
              </div>
            </td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode">
                  {{ p.amount.toLocaleString() }}
                </span>
              </div>
            </td>
            <td>
              <div class="multi-line-cell">
                <span v-for="p in order.products" :key="p.productCode">
                  {{ (p.quantity * p.amount).toLocaleString() }}
                </span>
              </div>
            </td>
            <td>{{ order.totalAmount.toLocaleString() }}</td>
            <td>{{ order.orderDate }}</td>
            <td>{{ order.managerName }}</td>
            <td>{{ order.managerPhone }}</td>
            <td>{{ order.stockInDate }}</td>
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
.date-range { display: flex; align-items: center; gap: 8px; }
.date-range input { min-width: 140px; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.75rem 0.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; white-space: nowrap; }
.sku-cell { color: var(--primary); font-weight: 600; }
.status-tag { padding: 4px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }
.action-btn { background: white; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; }

.product-codes, .multi-line-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sku-cell.small {
  font-size: 0.8rem;
}

.clickable-row { cursor: pointer; transition: background-color 0.2s ease; }
.clickable-row:hover { background-color: #f8fafc; }
</style>
