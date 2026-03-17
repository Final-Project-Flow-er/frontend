<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReturnList } from '@/api/franchiseReturns.js'

const router = useRouter()

const filter = ref({
  orderCode: '',
  returnCode: '',
  boxCode: '',
  idCode: '',
  productCode: '',
  productName: '',
  quantity: '',
  amount: '',
  totalAmount: ''
})

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }
const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

const rawReturns = ref([])

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchReturns = async () => {
  try {
    const pageData = (await getReturnList({ page: currentPage.value, size: pageSize.value })) || {}
    rawReturns.value = pageData.content || []
    totalPages.value = pageData.totalPages || 0
  } catch (e) {
    alert(e.message)
  }
}

const changePage = async (page) => {
  currentPage.value = page
  await fetchReturns()
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

onMounted(() => fetchReturns())

const returns = computed(() =>
  rawReturns.value.map(item => ({
    orderCode: item.orderCode,
    returnCode: item.returnCode,
    boxCode: '',
    idCode: '',
    productCode: item.productCode,
    productName: item.productName,
    quantity: item.quantity,
    amount: Number(item.unitPrice || 0),
    totalAmount: Number(item.totalPrice || 0),
    reason: TYPE_LABEL[item.type] || item.type,
    date: formatDate(item.requestedDate),
    status: item.status
  }))
)

const filteredReturns = computed(() => {
  return returns.value.filter(item => {
    const matchOrder = !filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)
    const matchReturn = !filter.value.returnCode || item.returnCode.includes(filter.value.returnCode)
    const matchBox = !filter.value.boxCode || (item.boxCode || '').includes(filter.value.boxCode)
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
const toStatusLabel = (s) => RETURN_STATUS_LABEL[s] || s

const getStatusClass = (s) => {
  const label = RETURN_STATUS_LABEL[s] || s
  return {
    '대기': 'status-warning',
    '접수': 'status-info',
    '배송대기': 'status-info',
    '배송중': 'status-primary',
    '배송완료': 'status-ok',
    '검수중': 'status-primary',
    '대금 차감 완료': 'status-ok',
    '대금 차감 거절': 'status-danger',
    '취소': 'status-danger'
  }[label] || ''
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

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
            <td class="sku-cell small">{{ item.productCode }}</td>
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
            <td><span :class="['status-tag', getStatusClass(item.status)]">{{ toStatusLabel(item.status) }}</span></td>
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
.data-table th { text-align: left; padding: 1.05rem 0.8rem !important; height: 58px !important; background: #f8fafc; color: var(--text-light); font-size: 0.9rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
.data-table td { padding: 1.05rem 0.8rem !important; height: 58px !important; border-bottom: 1px solid var(--border-color); font-size: 0.95rem !important; font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important; line-height: 1.35 !important; white-space: nowrap; }
.name-cell { color: var(--text-dark); }
.sku-cell { color: #1d4ed8; font-weight: 600; }
.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }

.clickable-row { cursor: pointer; transition: background-color 0.2s; }
.clickable-row:hover { background-color: #f8fafc; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }
</style>
