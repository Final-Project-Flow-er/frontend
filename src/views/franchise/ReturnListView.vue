<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filter = ref({
  orderCode: '',
  returnCode: '',
  boxCode: '',
  idCode: '', // 제품 식별코드
  productCode: '',
  productName: '',
  quantity: '',
  amount: '', // 제품 별 금액
  totalAmount: '' // 총 금액
})

const returns = ref([
  { 
    orderCode: 'SE0120231026001', 
    returnCode: 'RESE0120231026001',
    boxCode: 'SE01FA0120231026OR0101001', 
    idCode: 'SE01FA01AOR0101B001', 
    productCode: 'OR0101', 
    productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
    quantity: 1, 
    amount: 5000,
    totalAmount: 5000,
    recipientName: '김철수', 
    recipientPhone: '010-1234-5678', 
    franchiseCode: 'SE01', 
    details: '박스 파손 심함',
    reason: '상품 하자', 
    date: '2023-10-26', 
    status: '대기'
  },
  { 
    orderCode: 'SE0120231025005', 
    returnCode: 'RESE0120231025005',
    boxCode: 'SE01FA0120231025RO0201005', 
    idCode: 'SE01FA01ARO0201B005', 
    productCode: 'RO0201', 
    productName: '로제 떡볶이 밀키트 기본맛 1,2인분',
    quantity: 2, 
    amount: 7000,
    totalAmount: 14000,
    recipientName: '이영희', 
    recipientPhone: '010-9876-5432', 
    franchiseCode: 'SE01', 
    details: '고객 반품 요청',
    reason: '오발주', 
    date: '2023-10-25', 
    status: '접수'
  },
  {
    orderCode: 'SE0120231024010',
    returnCode: 'RESE0120231024010',
    boxCode: 'SE01FA0120231024MA0301010',
    idCode: 'SE01FA01AMA0301B010',
    productCode: 'MA0301',
    productName: '마라 떡볶이 밀키트 매운맛 1,2인분',
    quantity: 1,
    amount: 7000,
    totalAmount: 7000,
    recipientName: '박민수',
    recipientPhone: '010-5555-4444',
    franchiseCode: 'SE01',
    details: '오배송 확인됨',
    reason: '오발주', 
    date: '2023-10-24', 
    status: '배송중'
  }
])

const filteredReturns = computed(() => {
  return returns.value.filter(item => {
    const matchOrder = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    const matchReturn = !filter.value.returnCode || item.returnCode.includes(filter.value.returnCode)
    const matchBox = !filter.value.boxCode || item.boxCode.includes(filter.value.boxCode)
    const matchId = !filter.value.idCode || item.idCode.includes(filter.value.idCode)
    const matchProductCode = !filter.value.productCode || item.productCode.includes(filter.value.productCode)
    const matchProductName = !filter.value.productName || item.productName.includes(filter.value.productName)
    // For numbers, exact match or simple includes if string
    const matchQty = !filter.value.quantity || String(item.quantity).includes(filter.value.quantity)
    const matchAmount = !filter.value.amount || String(item.amount).includes(filter.value.amount)
    const matchTotal = !filter.value.totalAmount || String(item.totalAmount).includes(filter.value.totalAmount)

    return matchOrder && matchReturn && matchBox && matchId && matchProductCode && matchProductName && matchQty && matchAmount && matchTotal
  })
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송 대기': 'status-info',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '검수': 'status-primary',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || '')

const formatPrice = (p) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(p)

const goToDetail = (item) => {
  router.push(`/franchise/returns/${item.returnCode}`)
}
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>가맹점 반품 관리</h2>
      <router-link :to="{ name: 'franchise-return-create' }" class="add-btn">+ 반품 요청</router-link>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="SE0120260210001" />
      </div>
      <div class="filter-group">
        <label>반품 코드</label>
        <input type="text" v-model="filter.returnCode" placeholder="RESE0120260210001" />
      </div>
      <div class="filter-group">
        <label>박스 코드</label>
        <input type="text" v-model="filter.boxCode" placeholder="SE01FA0120260210OR0101001" />
      </div>
      <div class="filter-group">
        <label>제품 식별코드</label>
        <input type="text" v-model="filter.idCode" placeholder="SE01FA01AOR0101B001" />
      </div>
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="OR0101" />
      </div>
      <div class="filter-group">
        <label>제품명</label>
        <input type="text" v-model="filter.productName" placeholder="제품명" />
      </div>
      <div class="filter-group">
        <label>수량</label>
        <input type="number" v-model="filter.quantity" />
      </div>
      <div class="filter-group">
        <label>제품 별 금액</label>
        <input type="number" v-model="filter.amount" />
      </div>
      <div class="filter-group">
        <label>총 금액</label>
        <input type="number" v-model="filter.totalAmount" />
      </div>
    </div>

    <div class="data-table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>발주 코드</th>
            <th>반품 코드</th>
            <th>박스 코드</th>
            <th>제품 식별코드</th>
            <th>제품 코드</th>
            <th>제품명</th>
            <th>수량</th>
            <th>제품 별 금액</th>
            <th>총 금액</th>
            <th>수령인 이름</th>
            <th>수령인 전화번호</th>
            <th>가맹점 코드</th>
            <th>세부사항</th>
            <th>반품 사유</th>
            <th>반품 요청 일자</th>
            <th>반품 요청 상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredReturns" :key="item.returnCode" @click="goToDetail(item)" class="clickable-row">
            <td>{{ item.orderCode }}</td>
            <td class="sku-cell">{{ item.returnCode }}</td>
            <td>{{ item.boxCode }}</td>
            <td>{{ item.idCode }}</td>
            <td>{{ item.productCode }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.amount }}</td>
            <td>{{ item.totalAmount }}</td>
            <td>{{ item.recipientName }}</td>
            <td>{{ item.recipientPhone }}</td>
            <td>{{ item.franchiseCode }}</td>
            <td>{{ item.details }}</td>
            <td>{{ item.reason }}</td>
            <td>{{ item.date }}</td>
            <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.content-wrapper { max-width: 1600px; margin: 0 auto; } /* Increased width for many columns */
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

/* Filter Styles */
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
  padding: 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 120px;
}

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
.data-table th { text-align: left; padding: 0.75rem 0.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; white-space: nowrap; }
.name-cell { color: var(--text-dark); }
.sku-cell { color: var(--primary); font-weight: 600; }
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f8fafc; }
</style>
