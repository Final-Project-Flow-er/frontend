<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 현재 보고 있는 화면 모드 ('order' | 'return')
const viewMode = ref('order')

const filter = ref({
  // 공통 & 발주용
  status: '',
  orderDate: '',
  orderCode: '',
  recipientName: '',
  recipientPhone: '',
  arrivalDate: '',
  arrivalTime: '',
  productCode: '',

  // 반품 전용
  returnCode: '',
  boxCode: '',
  idCode: '',
  productName: '',
  quantity: '',
  amount: '',
  totalAmount: ''
})

// [데이터 1] 발주 데이터
const orders = ref([
  {
    orderStatus: '대기',
    orderDate: '2023-10-25',
    orderCode: 'SE0120231025001',
    recipientName: '김철수',
    recipientPhone: '010-1234-5678',
    arrivalDate: '2023-10-27',
    arrivalTime: '14:00',
    products: [
      { productCode: 'OR0101', quantity: 50, amount: 5000 },
      { productCode: 'RO0201', quantity: 10, amount: 7000 }
    ]
  },
  {
    orderStatus: '배송중',
    orderDate: '2023-10-24',
    orderCode: 'SE0120231024002',
    recipientName: '이영희',
    recipientPhone: '010-9876-5432',
    arrivalDate: '2023-10-26',
    arrivalTime: '10:00',
    products: [
      { productCode: 'RO0201', quantity: 30, amount: 7000 }
    ]
  },
  {
    orderStatus: '배송완료',
    orderDate: '2023-10-23',
    orderCode: 'SE0120231023003',
    recipientName: '박민수',
    recipientPhone: '010-5555-4444',
    arrivalDate: '2023-10-25',
    arrivalTime: '16:30',
    products: [
      { productCode: 'MA0301', quantity: 20, amount: 7000 },
      { productCode: 'OR0403', quantity: 5, amount: 13000 }
    ]
  },
  {
    orderStatus: '취소',
    orderDate: '2023-10-22',
    orderCode: 'SE0120231022004',
    recipientName: '최지원',
    recipientPhone: '010-1111-2222',
    arrivalDate: '-',
    arrivalTime: '-',
    products: [
      { productCode: 'OR0403', quantity: 10, amount: 13000 }
    ]
  },
])

const filteredFlatOrders = computed(() => {
  let flatList = []
  orders.value.forEach(order => {
    const orderTotalAmount = order.products.reduce((acc, p) => acc + (p.quantity * p.amount), 0)
    order.products.forEach(product => {
      flatList.push({
        orderCode: order.orderCode,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        arrivalDate: order.arrivalDate,
        arrivalTime: order.arrivalTime,
        orderTotalAmount: orderTotalAmount,
        productCode: product.productCode,
        quantity: product.quantity,
        unitPrice: product.amount,
        lineTotalAmount: product.quantity * product.amount
      })
    })
  })
  return flatList.filter(item => {
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

// [데이터 2] 반품 데이터
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
    const matchQty = !filter.value.quantity || String(item.quantity).includes(filter.value.quantity)
    const matchAmount = !filter.value.amount || String(item.amount).includes(filter.value.amount)
    const matchTotal = !filter.value.totalAmount || String(item.totalAmount).includes(filter.value.totalAmount)

    return matchOrder && matchReturn && matchBox && matchId && matchProductCode && matchProductName && matchQty && matchAmount && matchTotal
  })
})

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송완료': 'status-ok',
  '배송 완료': 'status-ok',
  '취소': 'status-danger',
  '반려': 'status-danger',
  '검수': 'status-primary',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || '')

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num)

const goToDetail = (item) => {
  if (viewMode.value === 'order') {
    router.push({ name: 'franchise-order-detail', params: { id: item.orderCode } })
  } else {
    router.push(`/franchise/returns/${item.returnCode}`)
  }
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 헤더 섹션: 제목 + 뷰모드 버튼 -->
    <div class="header-row">
      <div class="title-group">
        <h2>가맹점 발주/반품 관리</h2>

        <!-- [변경] 뷰 모드 컨트롤: 제목 바로 오른쪽으로 이동 -->
        <div class="view-mode-control">
          <label :class="{ active: viewMode === 'order' }">
            <input type="radio" v-model="viewMode" value="order"> 발주 내역
          </label>
          <label :class="{ active: viewMode === 'return' }">
            <input type="radio" v-model="viewMode" value="return"> 반품 내역
          </label>
        </div>
      </div>

      <!-- 우측 버튼 -->
      <router-link
          v-if="viewMode === 'order'"
          :to="{ name: 'franchise-order-create' }"
          class="add-btn"
      >+ 발주 생성</router-link>
      <router-link
          v-else
          :to="{ name: 'franchise-return-create' }"
          class="add-btn"
      >+ 반품 요청</router-link>
    </div>

    <!-- Summary Section -->
    <section class="summary-section">
      <div class="summary-card">
        <span class="s-label">금일 {{ viewMode === 'order' ? '발주' : '반품' }} 건수</span>
        <p class="s-value">1건</p>
      </div>
      <div class="summary-card">
        <span class="s-label">{{ viewMode === 'order' ? '배송 준비중' : '처리 대기중' }}</span>
        <p class="s-value">1건</p>
      </div>
    </section>

    <!-- Filter Section -->
    <div class="filter-section">
      <!-- [공통] 발주 코드 -->
      <div class="filter-group">
        <label>발주 코드</label>
        <input type="text" v-model="filter.orderCode" placeholder="SE01..." />
      </div>

      <!-- [모드별 분기] -->
      <template v-if="viewMode === 'order'">
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
          <label>발주일</label>
          <input type="date" v-model="filter.orderDate" />
        </div>
        <div class="filter-group">
          <label>도착 날짜</label>
          <input type="date" v-model="filter.arrivalDate" />
        </div>
      </template>

      <template v-else>
        <!-- [변경] 반품 전용 필터에 placeholder 추가 -->
        <div class="filter-group">
          <label>반품 코드</label>
          <input type="text" v-model="filter.returnCode" placeholder="RESE01..." />
        </div>
        <div class="filter-group">
          <label>박스 코드</label>
          <input type="text" v-model="filter.boxCode" placeholder="BOX..." />
        </div>
        <div class="filter-group">
          <label>식별 코드</label>
          <input type="text" v-model="filter.idCode" placeholder="ID..." />
        </div>
        <div class="filter-group">
          <label>제품명</label>
          <input type="text" v-model="filter.productName" placeholder="떡볶이..." />
        </div>
      </template>

      <!-- [공통] 제품/수량 등 -->
      <div class="filter-group">
        <label>제품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="OR0101" />
      </div>
      <div class="filter-group">
        <label>{{ viewMode === 'order' ? '수령인' : '요청자' }}</label>
        <input type="text" v-model="filter.recipientName" placeholder="홍길동" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-card">
      <!-- 1. 발주 테이블 -->
      <table v-if="viewMode === 'order'" class="data-table">
        <thead>
        <tr>
          <th>발주 코드</th>
          <th>상태</th>
          <th>제품 코드</th>
          <th class="text-right">단가</th>
          <th class="text-right">수량</th>
          <th class="text-right">금액</th>
          <th class="text-right">발주 총액</th>
          <th>발주일</th>
          <th>수령인</th>
          <th>도착일시</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, index) in filteredFlatOrders"
            :key="item.orderCode + item.productCode + index"
            @click="goToDetail(item)"
            class="clickable-row"
        >
          <td class="sku-cell">{{ item.orderCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.orderStatus)]">{{ item.orderStatus }}</span></td>
          <td class="sku-cell small">{{ item.productCode }}</td>
          <td class="text-right">{{ formatNumber(item.unitPrice) }}</td>
          <td class="text-right">{{ formatNumber(item.quantity) }}</td>
          <td class="text-right font-bold-slate">{{ formatNumber(item.lineTotalAmount) }}</td>
          <td class="text-right">{{ formatNumber(item.orderTotalAmount) }}</td>
          <td>{{ item.orderDate }}</td>
          <td class="name-cell">{{ item.recipientName }}</td>
          <td>{{ item.arrivalDate }} {{ item.arrivalTime }}</td>
        </tr>
        </tbody>
      </table>

      <!-- 2. 반품 테이블 -->
      <table v-else class="data-table">
        <thead>
        <tr>
          <th>반품 코드</th>
          <th>상태</th>
          <th>발주 코드</th>
          <th>제품 코드</th>
          <th>제품명</th>
          <th class="text-right">단가</th>
          <th class="text-right">수량</th>
          <th class="text-right">총 금액</th>
          <th>반품 사유</th>
          <th>요청일자</th>
          <th>박스/식별코드</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="item in filteredReturns"
            :key="item.returnCode"
            @click="goToDetail(item)"
            class="clickable-row"
        >
          <td class="sku-cell">{{ item.returnCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
          <td>{{ item.orderCode }}</td>
          <td class="sku-cell small">{{ item.productCode }}</td>
          <td style="min-width: 150px; white-space: normal;">{{ item.productName }}</td>
          <td class="text-right">{{ formatNumber(item.amount) }}</td>
          <td class="text-right">{{ formatNumber(item.quantity) }}</td>
          <td class="text-right font-bold-slate">{{ formatNumber(item.totalAmount) }}</td>
          <td>{{ item.reason }}</td>
          <td>{{ item.date }}</td>
          <td style="font-size: 0.8rem; color: #64748b;">
            <div>{{ item.boxCode }}</div>
            <div>{{ item.idCode }}</div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* [변경] 헤더 레이아웃 조정: Flexbox gap 활용 */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

/* 제목과 라디오 버튼을 묶는 그룹 */
.title-group {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* 제목과 버튼 사이 간격 */
}

.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }

.content-wrapper { max-width: 1600px; margin: 0 auto; }
.add-btn { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }

/* 뷰 모드 컨트롤 스타일 */
.view-mode-control {
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 8px;
  display: flex;
  gap: 0.25rem;
}
.view-mode-control label {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}
.view-mode-control label:hover { background: #e2e8f0; }
.view-mode-control label.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.view-mode-control input { display: none; }

/* 기타 섹션 스타일 (기존 유지) */
.summary-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.summary-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); }
.s-label { font-size: 0.9rem; color: var(--text-light); }
.s-value { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }

.filter-section {
  background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);
  margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select {
  padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; min-width: 140px;
}

.data-table-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}
.data-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
.data-table th { text-align: left; padding: 0.75rem 1rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; white-space: nowrap; vertical-align: middle; }

.sku-cell { color: var(--primary); font-weight: 600; }
.sku-cell.small { font-size: 0.9rem; }
.name-cell { font-weight: 500; }
.text-right { text-align: right; }
.font-bold-slate { font-weight: 600; color: #334155; }
.order-total-header { border-left: 1px dashed #e2e8f0; color: var(--text-dark); font-weight: 600; }
.total-cell-bold { font-weight: 700; color: var(--text-dark); border-left: 1px dashed #e2e8f0; }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f8fafc; }

:root {
  --primary: #4f46e5;
  --text-light: #64748b;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
}
</style>
