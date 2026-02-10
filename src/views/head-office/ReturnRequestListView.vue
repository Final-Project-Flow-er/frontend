<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock Data
const returns = ref([
  { 
    id: 1, franchiseCode: 'SE01', requestDate: '2023-11-05', boxCode: 'SE01FA0120231105OR0101001', 
    productIdCode: 'SE01FA01AOR0101B001', reason: '파손', recipientName: '김가맹', recipientPhone: '010-1234-5678',
    productCode: 'OR0101', orderCode: 'SE0120231101001', returnCode: 'RESE0120231101001',
    status: '대기', quantity: 5, amount: 50000
  },
  { 
    id: 2, franchiseCode: 'SE02', requestDate: '2023-11-06', boxCode: 'SE02FA0120231106RO0201005', 
    productIdCode: 'SE02FA01ARO0201B005', reason: '오발주', recipientName: '이점주', recipientPhone: '010-9876-5432',
    productCode: 'RO0201', orderCode: 'SE0220231102005', returnCode: 'RESE0220231102005',
    status: '접수', quantity: 2, amount: 24000
  },
  { 
    id: 3, franchiseCode: 'SE03', requestDate: '2023-11-04', boxCode: 'SE03FA0120231104MA0303001', 
    productIdCode: 'SE03FA01AMA0303B020', reason: '상품 하자', recipientName: '박센터', recipientPhone: '010-5555-4444',
    productCode: 'MA0303', orderCode: 'SE0320231030020', returnCode: 'RESE0320231030020',
    status: '배송 완료', quantity: 2, amount: 60000
  }
])

const filter = ref({
  franchiseCode: '',
  requestDate: '',
  boxCode: '',
  productIdCode: '',
  reason: '',
  recipientName: '',
  recipientPhone: '',
  productCode: '',
  orderCode: '',
  returnCode: '',
  status: ''
})

const statuses = [
  '대기', '접수', '배송 대기', '배송중', '배송 완료', '검수', '대금 차감 완료', '대금 차감 거절'
]

const filteredReturns = computed(() => {
  return returns.value.filter(item => {
    return (!filter.value.franchiseCode || item.franchiseCode.includes(filter.value.franchiseCode)) &&
           (!filter.value.requestDate || item.requestDate === filter.value.requestDate) &&
           (!filter.value.boxCode || item.boxCode.includes(filter.value.boxCode)) &&
           (!filter.value.productIdCode || item.productIdCode.includes(filter.value.productIdCode)) &&
           (!filter.value.reason || item.reason.includes(filter.value.reason)) &&
           (!filter.value.recipientName || item.recipientName.includes(filter.value.recipientName)) &&
           (!filter.value.recipientPhone || item.recipientPhone.includes(filter.value.recipientPhone)) &&
           (!filter.value.productCode || item.productCode.includes(filter.value.productCode)) &&
           (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
           (!filter.value.returnCode || item.returnCode.includes(filter.value.returnCode)) &&
           (!filter.value.status || item.status === filter.value.status)
  })
})

const formatNumber = (val) => new Intl.NumberFormat('ko-KR').format(val)

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || 'status-default')

const goToDetail = (item) => {
  router.push({ name: 'head-office-return-detail', params: { id: item.returnCode } })
}

</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 반품 요청 관리</h2>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-grid">
        <div class="filter-group">
          <label>가맹점 코드</label>
          <input type="text" v-model="filter.franchiseCode" placeholder="SE01" />
        </div>
        <div class="filter-group">
          <label>요청 일자</label>
          <input type="date" v-model="filter.requestDate" />
        </div>
        <div class="filter-group">
          <label>박스 코드</label>
          <input type="text" v-model="filter.boxCode" />
        </div>
        <div class="filter-group">
          <label>제품 식별코드</label>
          <input type="text" v-model="filter.productIdCode" />
        </div>
        <div class="filter-group">
          <label>반품 사유</label>
          <input type="text" v-model="filter.reason" />
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
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" />
        </div>
        <div class="filter-group">
          <label>발주 코드</label>
          <input type="text" v-model="filter.orderCode" />
        </div>
        <div class="filter-group">
          <label>반품 코드</label>
          <input type="text" v-model="filter.returnCode" />
        </div>
        <div class="filter-group">
          <label>반품 요청 상태</label>
          <select v-model="filter.status">
            <option value="">전체</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>가맹점 코드</th>
            <th>요청 일자</th>
            <th>반품 코드</th>
            <th>상태</th>
            <th>제품 코드</th>
            <th>반품 사유</th>
            <th>수량</th>
            <th>반품 금액</th>
            <th>수령인</th>
            <th>연락처</th>
            <th>박스 코드</th>
            <th>제품 식별코드</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredReturns" :key="item.id" @click="goToDetail(item)" class="clickable-row">
            <td class="code-cell">{{ item.franchiseCode }}</td>
            <td>{{ item.requestDate }}</td>
            <td class="code-cell">{{ item.returnCode }}</td>
            <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
            <td>{{ item.productCode }}</td>
            <td>{{ item.reason }}</td>
            <td>{{ formatNumber(item.quantity) }}</td>
            <td>{{ formatNumber(item.amount) }}</td>
            <td>{{ item.recipientName }}</td>
            <td>{{ item.recipientPhone }}</td>
            <td>{{ item.boxCode }}</td>
            <td><small>{{ item.productIdCode }}</small></td>
          </tr>
          <tr v-if="filteredReturns.length === 0">
            <td colspan="12" class="empty-cell">조회된 반품 요청이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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

.clickable-row { cursor: pointer; transition: background 0.2s; }
.clickable-row:hover { background-color: #f8fafc; }

.code-cell { font-weight: 600; color: var(--primary); }
.num-cell { text-align: right; font-family: 'JetBrains Mono', monospace; }
.highlight-num { font-weight: 700; color: var(--text-dark); }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-default { background: #f3f4f6; color: #4b5563; }

.empty-cell { text-align: center; padding: 3rem; color: var(--text-light); }
</style>
