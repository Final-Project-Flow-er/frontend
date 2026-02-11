<script setup>
import { ref, computed } from 'vue'

// Mock Data
const orders = ref([
  { 
    id: 1, orderCode: 'HEAD20231101001', status: '대기', productCode: 'OR0101', productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', 
    quantity: 100, unitPrice: 10000, totalAmount: 1000000, 
    managerName: '이지은', managerPhone: '010-1111-2222', employeeId: '30001', 
    orderDate: '2023-11-01', inboundDate: '2023-11-05', type: '정기'
  },
  { 
    id: 2, orderCode: 'HEAD20231101005', status: '접수', productCode: 'RO0201', productName: '로제 떡볶이 밀키트 기본맛 1,2인분', 
    quantity: 50, unitPrice: 12000, totalAmount: 600000, 
    managerName: '박서준', managerPhone: '010-3333-4444', employeeId: '30002', 
    orderDate: '2023-11-01', inboundDate: '2023-11-06', type: '비정기'
  },
  { 
    id: 3, orderCode: 'HEAD20231102010', status: '입고 완료', productCode: 'MA0301', productName: '마라 떡볶이 밀키트 매운맛 1,2인분', 
    quantity: 200, unitPrice: 12000, totalAmount: 2400000, 
    managerName: '최유리', managerPhone: '010-5555-6666', employeeId: '30003', 
    orderDate: '2023-11-02', inboundDate: '2023-11-04', type: '정기'
  },
  { 
    id: 4, orderCode: 'HEAD20231103015', status: '반려', productCode: 'OR0403', productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분', 
    quantity: 30, unitPrice: 18000, totalAmount: 540000, 
    managerName: '김도현', managerPhone: '010-7777-8888', employeeId: '30004', 
    orderDate: '2023-11-03', inboundDate: '2023-11-08', type: '비정기'
  }
])

const filter = ref({
  orderCode: '',
  status: '',
  productCode: '',
  productName: '',
  managerName: '',
  managerPhone: '',
  employeeId: '',
  orderDate: '',
  inboundDate: '',
  type: ''
})

const statuses = ['대기', '접수', '입고 완료', '반려']
const orderTypes = ['정기', '비정기']

// Filtering Logic
const filteredOrders = computed(() => {
  return orders.value.filter(item => {
    return (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
           (!filter.value.status || item.status === filter.value.status) &&
           (!filter.value.productCode || item.productCode.includes(filter.value.productCode)) &&
           (!filter.value.productName || item.productName.includes(filter.value.productName)) &&
           (!filter.value.managerName || item.managerName.includes(filter.value.managerName)) &&
           (!filter.value.managerPhone || item.managerPhone.includes(filter.value.managerPhone)) &&
           (!filter.value.employeeId || item.employeeId.includes(filter.value.employeeId)) &&
           (!filter.value.orderDate || item.orderDate === filter.value.orderDate) &&
           (!filter.value.inboundDate || item.inboundDate === filter.value.inboundDate) &&
           (!filter.value.type || item.type === filter.value.type)
  })
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num)
}

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '입고 완료': 'status-ok',
  '반려': 'status-danger'
}[s] || '')

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>공장 발주 요청 관리</h2>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>발주 코드</label>
          <input type="text" v-model="filter.orderCode" placeholder="HEAD20260210001" />
        </div>
        <div class="filter-group">
          <label>발주 상태</label>
          <select v-model="filter.status">
            <option value="">전체</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="OR0101" />
        </div>
        <div class="filter-group">
          <label>제품명</label>
          <input type="text" v-model="filter.productName" />
        </div>
        <div class="filter-group">
          <label>담당자 이름</label>
          <input type="text" v-model="filter.managerName" />
        </div>
        <div class="filter-group">
          <label>담당자 전화번호</label>
          <input type="text" v-model="filter.managerPhone" />
        </div>
        <div class="filter-group">
          <label>사원번호</label>
          <input type="text" v-model="filter.employeeId" />
        </div>
        <div class="filter-group">
          <label>발주일</label>
          <input type="date" v-model="filter.orderDate" />
        </div>
        <div class="filter-group">
          <label>입고일</label>
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
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>발주 코드</th>
            <th>상태</th>
            <th>구분</th>
            <th>제품 코드</th>
            <th>제품명</th>
            <th>수량</th>
            <th>단위 금액</th>
            <th>총 금액</th>
            <th>담당자</th>
            <th>연락처</th>
            <th>사원번호</th>
            <th>발주일</th>
            <th>입고일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="sku-cell">{{ order.orderCode }}</td>
            <td><span :class="['status-tag', getStatusClass(order.status)]">{{ order.status }}</span></td>
            <td>
              <span :class="['type-tag', order.type === '정기' ? 'type-regular' : 'type-irregular']">
                {{ order.type }}
              </span>
            </td>
            <td class="sku-cell">{{ order.productCode }}</td>
            <td>{{ order.productName }}</td>
            <td>{{ formatNumber(order.quantity) }}</td>
            <td>{{ formatNumber(order.unitPrice) }}</td>
            <td>{{ formatNumber(order.totalAmount) }}</td>
            <td>{{ order.managerName }}</td>
            <td>{{ order.managerPhone }}</td>
            <td>{{ order.employeeId }}</td>
            <td>{{ order.orderDate }}</td>
            <td>{{ order.inboundDate }}</td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="13" class="empty-cell">조회된 발주 요청이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-action-bar">
      <button class="action-btn vehicle-btn" @click="$router.push({ name: 'factory-vehicle-assignment' })">
        차량 배정
      </button>
    </div>
  </div>
</template>

<style scoped>
.bottom-action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.action-btn {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 1rem;
}

.vehicle-btn {
  background-color: #6b8abf;
}

.vehicle-btn:hover { opacity: 0.9; }
.content-wrapper { max-width: 1600px; margin: 0 auto; padding-bottom: 2rem; }
.header-row { margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }

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
.data-table th { text-align: left; padding: 0.75rem 0.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; vertical-align: middle; white-space: nowrap; }

.sku-cell { font-weight: 600; color: var(--primary); }
.num-cell { text-align: right; font-family: 'JetBrains Mono', monospace; }
.highlight-num { font-weight: 700; color: var(--text-dark); }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-danger { background: #fee2e2; color: #991b1b; }

.type-tag { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.type-regular { background: #e0f2fe; color: #0369a1; }
.type-irregular { background: #f3f4f6; color: #4b5563; }

.empty-cell { text-align: center; padding: 3rem; color: var(--text-light); }
</style>
