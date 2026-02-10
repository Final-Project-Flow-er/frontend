<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = ref({
  status: '',
  orderDate: '',
  orderCode: '',
  recipientName: '',
  recipientPhone: '',
  arrivalDate: '',
  arrivalTime: '',
  productCode: ''
})

const orders = ref([
  { orderStatus: '대기', orderDate: '2023-10-25', orderCode: 'ORD-001', recipientName: '김철수', recipientPhone: '010-1234-5678', arrivalDate: '2023-10-27', arrivalTime: '14:00', productCode: 'P-001' },
  { orderStatus: '배송중', orderDate: '2023-10-24', orderCode: 'ORD-002', recipientName: '이영희', recipientPhone: '010-9876-5432', arrivalDate: '2023-10-26', arrivalTime: '10:00', productCode: 'P-002' },
  { orderStatus: '배송완료', orderDate: '2023-10-23', orderCode: 'ORD-003', recipientName: '박민수', recipientPhone: '010-5555-4444', arrivalDate: '2023-10-25', arrivalTime: '16:30', productCode: 'P-003' },
  { orderStatus: '취소', orderDate: '2023-10-22', orderCode: 'ORD-004', recipientName: '최지원', recipientPhone: '010-1111-2222', arrivalDate: '-', arrivalTime: '-', productCode: 'P-004' },
])

const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    const matchStatus = !filter.value.status || item.orderStatus === filter.value.status
    const matchOrderDate = !filter.value.orderDate || item.orderDate.includes(filter.value.orderDate)
    const matchOrderCode = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    const matchRecipientName = !filter.value.recipientName || item.recipientName.includes(filter.value.recipientName)
    const matchRecipientPhone = !filter.value.recipientPhone || item.recipientPhone.includes(filter.value.recipientPhone)
    const matchArrivalDate = !filter.value.arrivalDate || item.arrivalDate.includes(filter.value.arrivalDate)
    const matchArrivalTime = !filter.value.arrivalTime || item.arrivalTime.includes(filter.value.arrivalTime)
    const matchProductCode = !filter.value.productCode || item.productCode.includes(filter.value.productCode)
    
    return matchStatus && matchOrderDate && matchOrderCode && matchRecipientName && matchRecipientPhone && matchArrivalDate && matchArrivalTime && matchProductCode
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
  router.push({ name: 'franchise-order-detail', params: { id: item.orderCode } })
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>발주 관리</h2>
      <router-link to="/orders/create" class="add-btn">+ 발주 생성</router-link>
    </div>

    <section class="summary-section">
      <div class="summary-card"><span class="s-label">금일 발주 건수</span><p class="s-value">15건</p></div>
      <div class="summary-card"><span class="s-label">배송 준비중</span><p class="s-value">5건</p></div>
      <div class="summary-card warn"><span class="s-label">취소 요청</span><p class="s-value">1건</p></div>
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
        <input type="text" v-model="filter.orderCode" placeholder="ORD-000" />
      </div>
      <div class="filter-group">
        <label>발주일</label>
        <input type="date" v-model="filter.orderDate" />
      </div>
      <div class="filter-group">
        <label>수령인 이름</label>
        <input type="text" v-model="filter.recipientName" placeholder="이름" />
      </div>
      <div class="filter-group">
        <label>수령인 번호</label>
        <input type="text" v-model="filter.recipientPhone" placeholder="전화번호" />
      </div>
      <div class="filter-group">
        <label>도착 날짜</label>
        <input type="date" v-model="filter.arrivalDate" />
      </div>
      <div class="filter-group">
        <label>도착 시간</label>
        <input type="time" v-model="filter.arrivalTime" />
      </div>
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="P-000" />
      </div>
      <button class="search-btn">조회</button>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>발주 상태</th>
            <th>발주일</th>
            <th>발주 코드</th>
            <th>수령인 이름</th>
            <th>수령인 전화번호</th>
            <th>도착 날짜</th>
            <th>도착 시간</th>
            <th>제품 코드</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderCode">
            <td><span :class="['status-tag', getStatusClass(order.orderStatus)]">{{ order.orderStatus }}</span></td>
            <td>{{ order.orderDate }}</td>
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td class="name-cell">{{ order.recipientName }}</td>
            <td>{{ order.recipientPhone }}</td>
            <td>{{ order.arrivalDate }}</td>
            <td>{{ order.arrivalTime }}</td>
            <td>{{ order.productCode }}</td>
            <td><button class="action-btn" @click.stop="goToDetail(order)">상세</button></td>
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
.search-btn {
  background: var(--text-dark);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  height: 42px;
}

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
</style>
