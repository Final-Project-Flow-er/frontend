<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderList } from '@/api/franchiseOrders.js'
import { getReturnList } from '@/api/franchiseReturns.js'

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

const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''
const formatDateTime = (iso) => iso ? iso.replace('T', ' ').substring(0, 16) : ''
const formatTime = (iso) => iso ? iso.replace('T', ' ').substring(11, 16) : ''

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }

// 백엔드 영문 상태 → 한글 표시 매핑
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

const RETURN_STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  SHIPPING_PENDING: '배송대기',
  SHIPPING: '배송중',
  COMPLETED: '배송완료',
  INSPECTING: '검수중',
  DEDUCTION_COMPLETED: '대금 차감 완료',
  DEDUCTION_REJECTED: '대금 차감 거절',
  CANCELED: '취소'
}

const toOrderStatusLabel = (s) => ORDER_STATUS_LABEL[s] || s
const toReturnStatusLabel = (s) => RETURN_STATUS_LABEL[s] || s

// [데이터 1] 발주 데이터 (flat from API)
const rawOrders = ref([])
const loading = ref(false)
const error = ref(null)

// 페이지네이션 상태 — 발주
const orderPage = ref(0)
const orderSize = ref(20)
const orderTotalPages = ref(0)

// 페이지네이션 상태 — 반품
const returnPage = ref(0)
const returnSize = ref(20)
const returnTotalPages = ref(0)

// 슬라이딩 윈도우 페이지 번호 계산 (최대 5개 표시, 현재 페이지 중앙)
const visiblePages = (current, total, maxVisible = 5) => {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i)
  let start = Math.max(0, current - Math.floor(maxVisible / 2))
  let end = start + maxVisible
  if (end > total) { end = total; start = end - maxVisible }
  return Array.from({ length: end - start }, (_, i) => start + i)
}
const orderVisiblePages = computed(() => visiblePages(orderPage.value, orderTotalPages.value))
const returnVisiblePages = computed(() => visiblePages(returnPage.value, returnTotalPages.value))

const fetchOrders = async () => {
  loading.value = true
  error.value = null
  try {
    const pageData = (await getOrderList({ page: orderPage.value, size: orderSize.value })) || {}
    rawOrders.value = pageData.content || []
    orderTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('발주 조회 실패:', e)
    error.value = e.message || '발주 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchReturns = async () => {
  loading.value = true
  error.value = null
  try {
    const pageData = (await getReturnList({ page: returnPage.value, size: returnSize.value })) || {}
    rawReturns.value = pageData.content || []
    returnTotalPages.value = pageData.totalPages || 0
  } catch (e) {
    console.error('반품 조회 실패:', e)
    error.value = e.message || '반품 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

const changeOrderPage = async (page) => {
  orderPage.value = page
  await fetchOrders()
}

const changeReturnPage = async (page) => {
  returnPage.value = page
  await fetchReturns()
}

// 탭 전환 시 해당 API 호출
watch(viewMode, (mode) => {
  if (mode === 'order') fetchOrders()
  else fetchReturns()
})

// 초기 로드: 발주 내역
onMounted(() => fetchOrders())

const filteredFlatOrders = computed(() => {
  // 같은 orderCode를 하나의 행으로 그룹화
  const grouped = new Map()
  rawOrders.value.forEach(item => {
    if (!grouped.has(item.orderCode)) {
      grouped.set(item.orderCode, {
        orderCode: item.orderCode,
        orderStatus: item.orderStatus,
        orderDate: formatDate(item.requestedDate),
        requestedDate: formatDate(item.requestedDate),
        totalQuantity: 0,
        orderTotalAmount: Number(item.totalPrice || 0),
        deliveryDate: formatDate(item.deliveryDate)
      })
    }
    const group = grouped.get(item.orderCode)
    group.totalQuantity += Number(item.quantity || 0)
  })
  return Array.from(grouped.values()).filter(item => {
    const matchStatus = !filter.value.status || item.orderStatus === filter.value.status
    const matchOrderDate = !filter.value.orderDate || item.orderDate.includes(filter.value.orderDate)
    const matchOrderCode = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    return matchStatus && matchOrderDate && matchOrderCode
  })
})

// [데이터 2] 반품 데이터
const rawReturns = ref([])

const filteredReturns = computed(() => {
  return rawReturns.value.map(item => ({
    returnCode: item.returnCode,
    status: item.status,
    orderCode: item.orderCode,
    productCode: item.productCode,
    productName: item.productName,
    amount: Number(item.unitPrice || 0),
    quantity: item.quantity,
    totalAmount: Number(item.totalPrice || 0),
    reason: TYPE_LABEL[item.type] || item.type,
    date: formatDate(item.requestedDate),
    boxCode: '',
    idCode: ''
  })).filter(item => {
    const matchOrder = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    const matchReturn = !filter.value.returnCode || item.returnCode.includes(filter.value.returnCode)
    const matchProductCode = !filter.value.productCode || item.productCode.includes(filter.value.productCode)
    const matchProductName = !filter.value.productName || item.productName.includes(filter.value.productName)
    const matchQty = !filter.value.quantity || String(item.quantity).includes(filter.value.quantity)
    const matchAmount = !filter.value.amount || String(item.amount).includes(filter.value.amount)
    const matchTotal = !filter.value.totalAmount || String(item.totalAmount).includes(filter.value.totalAmount)
    return matchOrder && matchReturn && matchProductCode && matchProductName && matchQty && matchAmount && matchTotal
  })
})

const getStatusClass = (s) => {
  const label = ORDER_STATUS_LABEL[s] || RETURN_STATUS_LABEL[s] || s
  return {
    '대기': 'status-warning',
    '접수': 'status-info',
    '부분 접수': 'status-info',
    '배송 대기': 'status-warning',
    '배송대기': 'status-warning',
    '배송중': 'status-primary',
    '배송 완료': 'status-ok',
    '배송완료': 'status-ok',
    '취소': 'status-danger',
    '반려': 'status-danger',
    '검수중': 'status-primary',
    '대금 차감 완료': 'status-ok',
    '대금 차감 거절': 'status-danger'
  }[label] || ''
}

const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num)

const goToDetail = (item) => {
  if (viewMode.value === 'order') {
    router.push({ name: 'franchise-order-detail', params: { id: item.orderCode } })
  } else {
    router.push({ name: 'franchise-return-detail', params: { id: item.returnCode } })
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
            <option value="PENDING">대기</option>
            <option value="ACCEPTED">접수</option>
            <option value="PARTIAL">부분 접수</option>
            <option value="SHIPPING_PENDING">배송 대기</option>
            <option value="SHIPPING">배송중</option>
            <option value="COMPLETED">배송 완료</option>
            <option value="CANCELED">취소</option>
            <option value="REJECTED">반려</option>
          </select>
        </div>
        <div class="filter-group">
          <label>발주일</label>
          <input type="date" v-model="filter.orderDate" />
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

      <!-- [반품 전용] 제품 코드 / 요청자 -->
      <template v-if="viewMode === 'return'">
        <div class="filter-group">
          <label>제품 코드</label>
          <input type="text" v-model="filter.productCode" placeholder="OR0101" />
        </div>
        <div class="filter-group">
          <label>요청자</label>
          <input type="text" v-model="filter.recipientName" placeholder="홍길동" />
        </div>
      </template>
    </div>

    <!-- 로딩/에러 표시 -->
    <div v-if="loading" class="status-message">데이터를 불러오는 중...</div>

    <!-- Data Table -->
    <div class="data-table-card">
      <!-- 1. 발주 테이블 -->
      <table v-if="viewMode === 'order'" class="data-table">
        <thead>
        <tr>
          <th>발주 코드</th>
          <th>상태</th>
          <th class="text-right">수량</th>
          <th class="text-right">금액</th>
          <th>발주 생성일</th>
          <th>배송 요청일</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, index) in filteredFlatOrders"
            :key="item.orderCode + index"
            @click="goToDetail(item)"
            class="clickable-row"
        >
          <td class="sku-cell code-order">{{ item.orderCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.orderStatus)]">{{ toOrderStatusLabel(item.orderStatus) }}</span></td>
          <td class="text-right">{{ formatNumber(item.totalQuantity) }}</td>
          <td class="text-right font-bold-slate">{{ formatNumber(item.orderTotalAmount) }}</td>
          <td>{{ item.requestedDate }}</td>
          <td>{{ item.deliveryDate }}</td>
        </tr>
        </tbody>
      </table>

      <!-- 발주 페이지네이션 -->
      <div class="pagination" v-if="viewMode === 'order' && orderTotalPages > 1">
        <button class="page-nav-btn" :disabled="orderPage === 0" @click="changeOrderPage(orderPage - 1)">이전</button>
        <div class="page-numbers">
          <button
            v-for="p in orderVisiblePages"
            :key="p"
            @click="changeOrderPage(p)"
            :class="{ active: orderPage === p }"
            class="page-num-btn"
          >{{ p + 1 }}</button>
        </div>
        <button class="page-nav-btn" :disabled="orderPage === orderTotalPages - 1" @click="changeOrderPage(orderPage + 1)">다음</button>
      </div>

      <!-- 2. 반품 테이블 -->
      <table v-if="viewMode === 'return'" class="data-table">
        <thead>
        <tr>
          <th>반품 코드</th>
          <th>발주 코드</th>
          <th>상태</th>
          <th class="text-right">수량</th>
          <th class="text-right">총 금액</th>
          <th>반품 사유</th>
          <th>요청 일자</th>
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
          <td>{{ item.orderCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.status)]">{{ toReturnStatusLabel(item.status) }}</span></td>
          <td class="text-right">{{ formatNumber(item.quantity) }}</td>
          <td class="text-right font-bold-slate">{{ formatNumber(item.totalAmount) }}</td>
          <td>{{ item.reason }}</td>
          <td>{{ item.date }}</td>
        </tr>
        </tbody>
      </table>

      <!-- 반품 페이지네이션 -->
      <div class="pagination" v-if="viewMode === 'return' && returnTotalPages > 1">
        <button class="page-nav-btn" :disabled="returnPage === 0" @click="changeReturnPage(returnPage - 1)">이전</button>
        <div class="page-numbers">
          <button
            v-for="p in returnVisiblePages"
            :key="p"
            @click="changeReturnPage(p)"
            :class="{ active: returnPage === p }"
            class="page-num-btn"
          >{{ p + 1 }}</button>
        </div>
        <button class="page-nav-btn" :disabled="returnPage === returnTotalPages - 1" @click="changeReturnPage(returnPage + 1)">다음</button>
      </div>
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
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 1.05rem 0.8rem !important; height: 58px !important; background: #f8fafc; color: var(--text-light); font-size: 0.9rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 1.05rem 0.8rem !important; height: 58px !important; border-bottom: 1px solid var(--border-color); font-size: 0.95rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; white-space: nowrap; vertical-align: middle; }

.sku-cell { color: #1d4ed8; font-weight: 600; white-space: nowrap; min-width: 200px; }
.sku-cell.small { font-size: 0.9rem; }
.name-cell { font-weight: 500; }
.text-right { text-align: center; }
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

.status-message { text-align: center; padding: 1rem; font-size: 0.95rem; color: var(--text-light); }
.error-message { color: #991b1b; background: #fee2e2; border-radius: 8px; border: 1px solid #fecaca; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }

:root {
  --primary: #4f46e5;
  --text-light: #64748b;
  --text-dark: #1e293b;
  --border-color: #e2e8f0;
}
</style>
