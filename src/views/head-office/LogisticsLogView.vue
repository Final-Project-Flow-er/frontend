<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock Data - Transport Logs
const logs = ref([
  { id: 1, time: '2026-02-12 14:30:15', status: '배송 대기', trackingNumber: 'TRK20260212001', company: '우리통상', vehicleType: '5톤 트럭', vehicleNumber: '서울 12가 3456', driverName: '홍길동', driverPhone: '010-1234-5678' },
  { id: 2, time: '2026-02-12 14:15:00', status: '배송중', trackingNumber: 'TRK20260212002', company: '대한물류', vehicleType: '1톤 탑차', vehicleNumber: '경기 88나 9999', driverName: '김철수', driverPhone: '010-2222-3333' },
  { id: 3, time: '2026-02-12 10:05:45', status: '배송 완료', trackingNumber: 'TRK20260211045', company: '에이원', vehicleType: '2.5톤 트럭', vehicleNumber: '인천 77다 1111', driverName: '이영희', driverPhone: '010-5555-6666' },
  { id: 4, time: '2026-02-12 09:20:10', status: '배송중', trackingNumber: 'TRK20260212003', company: '우리통상', vehicleType: '1톤 탑차', vehicleNumber: '서울 55라 1234', driverName: '정지훈', driverPhone: '010-8888-9999' },
  { id: 5, time: '2026-02-12 08:45:30', status: '배송 완료', trackingNumber: 'TRK20260211046', company: '대한물류', vehicleType: '5톤 트럭', vehicleNumber: '경기 22마 5678', driverName: '차유진', driverPhone: '010-4444-5555' },
  { id: 6, time: '2026-02-11 17:30:00', status: '배송 완료', trackingNumber: 'TRK20260211001', company: '우리통상', vehicleType: '5톤 트럭', vehicleNumber: '서울 12가 3456', driverName: '홍길동', driverPhone: '010-1234-5678' },
  { id: 7, time: '2026-02-11 16:15:20', status: '배송 완료', trackingNumber: 'TRK20260211002', company: '대한물류', vehicleType: '1톤 탑차', vehicleNumber: '경기 88나 9999', driverName: '김철수', driverPhone: '010-2222-3333' },
  { id: 8, time: '2026-02-11 15:40:10', status: '배송 완료', trackingNumber: 'TRK20260211003', company: '에이원', vehicleType: '2.5톤 트럭', vehicleNumber: '인천 77다 1111', driverName: '이영희', driverPhone: '010-5555-6666' },
  { id: 9, time: '2026-02-11 14:20:00', status: '배송 완료', trackingNumber: 'TRK20260211004', company: '우리통상', vehicleType: '1톤 탑차', vehicleNumber: '서울 55라 1234', driverName: '정지훈', driverPhone: '010-8888-9999' },
  { id: 10, time: '2026-02-11 13:10:45', status: '배송 완료', trackingNumber: 'TRK20260211005', company: '대한물류', vehicleType: '5톤 트럭', vehicleNumber: '경기 22마 5678', driverName: '차유진', driverPhone: '010-4444-5555' },
  { id: 11, time: '2026-02-10 18:00:00', status: '배송 완료', trackingNumber: 'TRK20260210001', company: '우리통상', vehicleType: '5톤 트럭', vehicleNumber: '서울 12가 3456', driverName: '홍길동', driverPhone: '010-1234-5678' },
  { id: 12, time: '2026-02-10 17:15:30', status: '배송 완료', trackingNumber: 'TRK20260210002', company: '대한물류', vehicleType: '1톤 탑차', vehicleNumber: '경기 88나 9999', driverName: '김철수', driverPhone: '010-2222-3333' },
  { id: 13, time: '2026-02-10 16:40:20', status: '배송 완료', trackingNumber: 'TRK20260210003', company: '에이원', vehicleType: '2.5톤 트럭', vehicleNumber: '인천 77다 1111', driverName: '이영희', driverPhone: '010-5555-6666' },
  { id: 14, time: '2026-02-10 15:20:10', status: '배송 완료', trackingNumber: 'TRK20260210004', company: '우리통상', vehicleType: '1톤 탑차', vehicleNumber: '서울 55라 1234', driverName: '정지훈', driverPhone: '010-8888-9999' },
  { id: 15, time: '2026-02-10 14:10:55', status: '배송 완료', trackingNumber: 'TRK20260210005', company: '대한물류', vehicleType: '5톤 트럭', vehicleNumber: '경기 22마 5678', driverName: '차유진', driverPhone: '010-4444-5555' },
  { id: 16, time: '2026-02-09 18:00:00', status: '배송 완료', trackingNumber: 'TRK20260209001', company: '우리통상', vehicleType: '5톤 트럭', vehicleNumber: '서울 12가 3456', driverName: '홍길동', driverPhone: '010-1234-5678' },
  { id: 17, time: '2026-02-09 17:15:30', status: '배송 완료', trackingNumber: 'TRK20260209002', company: '대한물류', vehicleType: '1톤 탑차', vehicleNumber: '경기 88나 9999', driverName: '김철수', driverPhone: '010-2222-3333' },
  { id: 18, time: '2026-02-09 16:40:20', status: '배송 완료', trackingNumber: 'TRK20260209003', company: '에이원', vehicleType: '2.5톤 트럭', vehicleNumber: '인천 77다 1111', driverName: '이영희', driverPhone: '010-5555-6666' },
  { id: 19, time: '2026-02-09 15:20:10', status: '배송 완료', trackingNumber: 'TRK20260209004', company: '우리통상', vehicleType: '1톤 탑차', vehicleNumber: '서울 55라 1234', driverName: '정지훈', driverPhone: '010-8888-9999' },
  { id: 20, time: '2026-02-09 14:10:55', status: '배송 완료', trackingNumber: 'TRK20260209005', company: '대한물류', vehicleType: '5톤 트럭', vehicleNumber: '경기 22마 5678', driverName: '차유진', driverPhone: '010-4444-5555' }
])

const filter = ref({
  date: '',
  status: '',
  company: ''
})

const companies = ['우리통상', '대한물류', '에이원']
const statuses = ['배송 대기', '배송중', '배송 완료']

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const logDate = log.time.split(' ')[0]
    return (!filter.value.date || logDate === filter.value.date) &&
           (!filter.value.status || log.status === filter.value.status) &&
           (!filter.value.company || log.company === filter.value.company)
  })
})

const goBack = () => router.back()

const getStatusClass = (status) => {
  switch (status) {
    case '배송 대기': return 'status-pending'
    case '배송중': return 'status-shipping'
    case '배송 완료': return 'status-completed'
    default: return ''
  }
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
          <input type="date" v-model="filter.date" />
        </div>
        <div class="filter-group">
          <label>배송 상태</label>
          <select v-model="filter.status">
            <option value="">전체 상태</option>
            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>운송 업체</label>
          <select v-model="filter.company">
            <option value="">전체 업체</option>
            <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="filter-group reset-group">
           <button class="reset-btn" @click="filter = { date: '', status: '', company: '' }">필터 초기화</button>
        </div>
      </div>
    </div>

    <div class="list-section card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>로그 시각</th>
              <th>배송 상태</th>
              <th>운송장 번호</th>
              <th>운송 업체</th>
              <th>운송 차량</th>
              <th>차량 번호</th>
              <th>운송 기사</th>
              <th>전화번호</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="time-cell">{{ log.time.split(' ')[1] }} <span class="date-sub">{{ log.time.split(' ')[0] }}</span></td>
              <td>
                <span class="status-badge" :class="getStatusClass(log.status)">{{ log.status }}</span>
              </td>
              <td class="code-cell">{{ log.trackingNumber }}</td>
              <td>{{ log.company }}</td>
              <td>{{ log.vehicleType }}</td>
              <td class="code-cell">{{ log.vehicleNumber }}</td>
              <td class="name-cell">{{ log.driverName }}</td>
              <td>{{ log.driverPhone }}</td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" class="empty-state">조건에 맞는 로그 내역이 없습니다.</td>
            </tr>
          </tbody>
        </table>
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
  padding: 0.85rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  z-index: 1;
}

.data-table td {
  padding: 0.85rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  color: #334155;
}

.time-cell {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.date-sub {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
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
  font-family: monospace;
  color: #64748b;
  font-weight: 600;
}

.name-cell {
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
