<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTransportLogList } from '@/api/internalTransport'

const router = useRouter()

// Transport Logs from API
const logs = ref([])
const currentPage = ref(1)
const itemsPerPage = 15

const fetchLogs = async () => {
  try {
    const data = await getTransportLogList()
    logs.value = data
  } catch (error) {
    console.error('Failed to fetch transport logs:', error)
  }
}

onMounted(() => {
  fetchLogs()
})

const filter = ref({
  date: '',
  status: '',
  company: '',
  vehicleType: ''
})

const companies = computed(() => {
  const names = logs.value.map(log => log.franchiseName)
  return [...new Set(names)].filter(Boolean)
})

const statuses = [
  { value: 'PENDING', label: '배송 대기' },
  { value: 'IN_TRANSIT', label: '배송중' },
  { value: 'DELIVERED', label: '배송 완료' }
]

const vehicleTypes = [
  { value: 'CARGO', label: '카고' },
  { value: 'WING_BODY', label: '윙바디' },
  { value: 'REFRIGERATED_TOP', label: '냉동탑차' },
  { value: 'CHILLED_TOP', label: '냉장탑차' },
  { value: 'CONTAINER', label: '컨테이너 캐리어' }
]

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const logDate = log.createAt ? log.createAt.split('T')[0] : ''
    return (!filter.value.date || logDate === filter.value.date) &&
           (!filter.value.status || log.deliverStatus === filter.value.status) &&
           (!filter.value.company || log.franchiseName === filter.value.company) &&
           (!filter.value.vehicleType || log.vehicleType === filter.value.vehicleType)
  })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goBack = () => router.back()

const getStatusLabel = (status) => {
  const s = statuses.find(item => item.value === status)
  return s ? s.label : status
}

const getStatusClass = (status) => {
  switch (status) {
    case 'PENDING': return 'status-pending'
    case 'IN_TRANSIT': return 'status-shipping'
    case 'DELIVERED': return 'status-completed'
    default: return ''
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return {
    date: `${y}-${m}-${d}`,
    time: `${h}:${min}:${s}`
  }
}

const getVehicleTypeLabel = (type) => {
  const types = {
    'CARGO': '카고',
    'WING_BODY': '윙바디',
    'REFRIGERATED_TOP': '냉동탑차',
    'CHILLED_TOP': '냉장탑차',
    'CONTAINER': '컨테이너 캐리어'
  }
  return types[type] || type
}

</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h2 class="page-title">운송 로그 관리</h2>
      </div>
    </div>

    <div class="filter-section card">
      <div class="filter-grid">
        <div class="filter-group">
          <label>날짜 선택</label>
          <input type="date" v-model="filter.date" @change="currentPage = 1" />
        </div>
        <div class="filter-group">
          <label>배송 상태</label>
          <select v-model="filter.status" @change="currentPage = 1">
            <option value="">전체 상태</option>
            <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>가맹점명</label>
          <select v-model="filter.company" @change="currentPage = 1">
            <option value="">전체 가맹점</option>
            <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>차량 종류</label>
          <select v-model="filter.vehicleType" @change="currentPage = 1">
            <option value="">전체 차량</option>
            <option v-for="v in vehicleTypes" :key="v.value" :value="v.value">{{ v.label }}</option>
          </select>
        </div>
        <div class="filter-group reset-group">
           <button class="reset-btn" @click="filter = { date: '', status: '', company: '', vehicleType: '' }; currentPage = 1">필터 초기화</button>
        </div>
      </div>
    </div>

    <div class="list-section card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>로그 시각</th>
              <th>가맹점명</th>
              <th>일시</th>
              <th>배송 상태</th>
              <th>발주 번호</th>
              <th>반품 번호</th>
              <th>운송장 번호</th>
              <th>차량 종류</th>
              <th>차량 번호</th>
              <th>운송 기사</th>
              <th>무게 (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in paginatedLogs" :key="log.transportLogId">
              <td class="time-cell">
                {{ formatDate(log.createAt).time }}
                <span class="date-sub">{{ formatDate(log.createAt).date }}</span>
              </td>
              <td class="name-cell">{{ log.franchiseName }}</td>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="time-cell">{{ log.time }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(log.deliverStatus)">
                  {{ getStatusLabel(log.deliverStatus) }}
                </span>
              </td>
              <td class="code-cell">{{ log.orderCode || '-' }}</td>
              <td class="code-cell">{{ log.returnCode || '-' }}</td>
              <td class="code-cell">{{ log.trackingNumber || '-' }}</td>
              <td>{{ getVehicleTypeLabel(log.vehicleType) }}</td>
              <td class="code-cell code-tracking">{{ log.trackingNumber }}</td>
              <td>{{ log.company }}</td>
              <td>{{ log.vehicleType }}</td>
              <td class="code-cell">{{ log.vehicleNumber }}</td>
              <td class="name-cell">{{ log.driverName }}</td>
              <td>{{ (log.weight || 0).toLocaleString() }}</td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="10" class="empty-state">조건에 맞는 로그 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="pagination" v-if="totalPages > 0">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >이전</button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >다음</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.content-wrapper {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  margin-bottom: 0.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
}

.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.filter-group input, .filter-group select {
  padding: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #334155;
}

.reset-btn {
  padding: 0.6rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #e2e8f0;
}

.list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrapper {
  overflow: auto;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  text-align: center;
  font-size: 0.9rem !important;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  z-index: 1;
}

.data-table td {
  padding: 1.05rem 0.8rem !important;
  height: 58px !important;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.95rem !important;
  line-height: 1.35 !important;
  text-align: center;
  color: #334155;
  font-weight: 400;
}

.time-cell {
  font-weight: 400;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-pending { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
.status-shipping { background: #f0f9ff; color: #0369a1; border: 1px solid #e0f2fe; }
.status-completed { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }

.code-cell {
  color: #64748b;
  font-weight: 400;
}

.code-cell.code-tracking {
  color: inherit;
  font-weight: 400;
}

.name-cell {
  font-weight: 400;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
  border-top: 1px solid #f1f5f9;
}

.page-btn {
  padding: 0.5rem 0.85rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
