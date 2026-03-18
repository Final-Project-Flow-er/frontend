<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReturnList, acceptReturns } from '@/api/hqReturns.js'

const router = useRouter()

const TYPE_LABEL = { MISORDER: '오발주', PRODUCT_DEFECT: '상품 하자' }
const STATUS_LABEL = {
  PENDING: '대기',
  ACCEPTED: '접수',
  SHIPPING_PENDING: '배송 대기',
  SHIPPING: '배송중',
  COMPLETED: '배송 완료',
  INSPECTING: '검수 중',
  DEDUCTION_COMPLETED: '대금 차감 완료',
  DEDUCTION_REJECTED: '대금 차감 거절',
  CANCELED: '취소'
}
const formatDate = (iso) => iso ? iso.replace('T', ' ').substring(0, 10) : ''

const returns = ref([])

// 페이지네이션 상태
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)

const fetchReturns = async () => {
  try {
    const pageData = await getReturnList(true, { page: currentPage.value, size: pageSize.value })
    const data = pageData?.content || []
    totalPages.value = pageData?.totalPages || 0
    returns.value = data.map(item => ({
      id: item.returnCode,
      franchiseCode: item.franchiseCode,
      requestDate: formatDate(item.requestedDate),
      boxCode: '',
      productIdCode: '',
      reason: TYPE_LABEL[item.type] || item.type,
      recipientName: item.receiver || '',
      recipientPhone: item.phoneNumber || '',
      productCode: '',
      orderCode: '',
      returnCode: item.returnCode,
      status: STATUS_LABEL[item.status] || item.status,
      quantity: item.quantity,
      amount: Number(item.totalPrice || 0)
    }))
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
  '대기', '접수', '배송 대기', '배송중', '배송 완료', '검수 중', '대금 차감 완료', '대금 차감 거절'
]

// [NEW] Selection State
const selectionMode = ref(false) // true: 접수 모드
const selectedIds = ref([])

const filteredReturns = computed(() => {
  return returns.value.filter(item => {
    // [NEW] 접수 모드일 때는 '대기' 상태만 필터링
    if (selectionMode.value && item.status !== '대기') {
      return false
    }

    return (!filter.value.franchiseCode || item.franchiseCode.includes(filter.value.franchiseCode)) &&
        (!filter.value.requestDate || item.requestDate === filter.value.requestDate) &&
        (!filter.value.boxCode || item.boxCode.includes(filter.value.boxCode)) &&
        (!filter.value.productIdCode || item.productIdCode.includes(filter.value.productIdCode)) &&
        (!filter.value.reason || item.reason.includes(filter.value.reason)) &&
        (!filter.value.recipientName || item.recipientName.includes(filter.value.recipientName)) &&
        (!filter.value.productCode || item.productCode.includes(filter.value.productCode)) &&
        (!filter.value.orderCode || item.orderCode.includes(filter.value.orderCode)) &&
        (!filter.value.returnCode || item.returnCode.includes(filter.value.returnCode)) &&
        (!filter.value.status || item.status === filter.value.status)
  })
})

const returnCodeToneMap = computed(() => {
  const toneMap = {}
  let useGray = false

  filteredReturns.value.forEach((item) => {
    const code = item.returnCode || '__EMPTY__'
    if (!(code in toneMap)) {
      toneMap[code] = useGray ? 'row-tone-gray' : 'row-tone-white'
      useGray = !useGray
    }
  })

  return toneMap
})

const getRowToneClass = (item) => {
  const code = item.returnCode || '__EMPTY__'
  return returnCodeToneMap.value[code] || 'row-tone-white'
}

const formatNumber = (val) => new Intl.NumberFormat('ko-KR').format(val)

const getStatusClass = (s) => ({
  '대기': 'status-warning',
  '접수': 'status-info',
  '배송중': 'status-primary',
  '배송 완료': 'status-ok',
  '검수 중': 'status-primary',
  '대금 차감 완료': 'status-ok',
  '대금 차감 거절': 'status-danger'
}[s] || 'status-default')

const goToDetail = (item) => {
  // 접수 모드일 때는 클릭 시 체크박스 토글 (상세 이동 막음)
  if (selectionMode.value) {
    toggleSelection(item.id)
  } else {
    router.push({ name: 'head-office-return-detail', params: { id: item.returnCode } })
  }
}

// [NEW] Actions
const enterSelectionMode = () => {
  selectionMode.value = true
  selectedIds.value = []
  // 필터 초기화 (대기 상태만 보기 위해)
  filter.value.status = ''
}

const cancelSelectionMode = () => {
  selectionMode.value = false
  selectedIds.value = []
}

const confirmSelection = async () => {
  if (selectedIds.value.length === 0) {
    alert('접수할 항목을 선택해주세요.')
    return
  }

  if (!confirm(`선택한 ${selectedIds.value.length}건을 접수 처리하시겠습니까?`)) return

  try {
    await acceptReturns(selectedIds.value)
    returns.value.forEach(item => {
      if (selectedIds.value.includes(item.id)) {
        item.status = '접수'
      }
    })
    alert('접수 처리되었습니다.')
    cancelSelectionMode()
  } catch (e) {
    alert(e.message || '접수 처리에 실패했습니다.')
  }
}

const toggleSelection = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedIds.value = filteredReturns.value.map(item => item.id)
  } else {
    selectedIds.value = []
  }
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
          <select v-model="filter.status" :disabled="selectionMode">
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
          <!-- [NEW] 체크박스 컬럼 -->
          <th v-if="selectionMode" style="width: 40px; text-align: center;">
            <input type="checkbox" @change="toggleSelectAll"
                   :checked="selectedIds.length > 0 && selectedIds.length === filteredReturns.length" />
          </th>
          <th>가맹점 코드</th>
          <th>요청 일자</th>
          <th>반품 코드</th>
          <th>상태</th>
          <th>제품 코드</th>
          <th>반품 사유</th>
          <th>수량</th>
          <th>반품 금액</th>
          <th>수령인</th>
          <th>박스 코드</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredReturns" :key="item.id"
            @click="goToDetail(item)"
            :class="['clickable-row', getRowToneClass(item), { 'selected-row': selectedIds.includes(item.id) }]">

          <!-- [NEW] 체크박스 셀 -->
          <td v-if="selectionMode" style="text-align: center;" @click.stop>
            <input type="checkbox" :value="item.id" v-model="selectedIds" />
          </td>

          <td class="code-cell">{{ item.franchiseCode }}</td>
          <td>{{ item.requestDate }}</td>
          <td class="code-cell code-return">{{ item.returnCode }}</td>
          <td><span :class="['status-tag', getStatusClass(item.status)]">{{ item.status }}</span></td>
          <td class="sku-cell">{{ item.productCode }}</td>
          <td>{{ item.reason }}</td>
          <td>{{ formatNumber(item.quantity) }}</td>
          <td>{{ formatNumber(item.amount) }}</td>
          <td>{{ item.recipientName }}</td>
          <td>{{ item.recipientPhone }}</td>
          <td>{{ item.boxCode }}</td>
        </tr>
        <tr v-if="filteredReturns.length === 0">
          <td :colspan="selectionMode ? 12 : 11" class="empty-cell">
            {{ selectionMode ? '처리 대기 중인 반품 요청이 없습니다.' : '조회된 반품 요청이 없습니다.' }}
          </td>
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
.content-wrapper { max-width: 1600px; margin: 0 auto; padding-bottom: 2rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; }
.header-actions { display: flex; gap: 0.8rem; }

/* Buttons */
.primary-btn { background: var(--primary, #059669); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.primary-btn:hover { opacity: 0.9; }
.secondary-btn { background: white; border: 1px solid #d1d5db; color: #374151; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.secondary-btn:hover { background: #f3f4f6; }

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
.selected-row { background-color: #f0fdf4 !important; }
.row-tone-white { background-color: #ffffff; }
.row-tone-gray { background-color: #f6f7f9; }

.code-cell { font-weight: 600; color: var(--primary); }
.num-cell { text-align: right; font-family: 'JetBrains Mono', monospace; }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; display: inline-block; }
.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-info { background: #dbeafe; color: #1e40af; }
.status-primary { background: #e0e7ff; color: #3730a3; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-default { background: #f3f4f6; color: #4b5563; }

.empty-cell { text-align: center; padding: 3rem; color: var(--text-light); }

.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; margin-bottom: 1.5rem; }
.page-nav-btn { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.5rem; }
.page-num-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-dark); transition: all 0.2s; }
.page-num-btn:hover { border-color: var(--primary); color: var(--primary); }
.page-num-btn.active { background: var(--text-dark); color: white; border-color: var(--text-dark); }
</style>
