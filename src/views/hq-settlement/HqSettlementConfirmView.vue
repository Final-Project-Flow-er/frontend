<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { settlementsApi } from '@/api/settlements.js'

/* ── 월 선택 ── */
const today = new Date()
const pad = (n) => String(n).padStart(2, '0')
const selectedMonth = ref(`${today.getFullYear()}-${pad(today.getMonth() + 1)}`)

/* ── 데이터 상태 ── */
const isLoading = ref(false)
const stores = ref([])
const statusCounts = ref({
  draftCount: 0,
  requestedCount: 0,
  confirmedCount: 0
})

const fetchData = async () => {
  isLoading.value = true
  try {
    const [countsRes, listRes] = await Promise.all([
      settlementsApi.getConfirmStatusCounts(selectedMonth.value),
      settlementsApi.getConfirmFranchises({ month: selectedMonth.value, size: 100 })
    ])
    statusCounts.value = countsRes
    stores.value = listRes.content
  } catch (error) {
    console.error('Failed to fetch confirm data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)
watch(selectedMonth, fetchData)

/* ── 포맷 ── */
const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n || 0)
const formatMonth = (d) => { if(!d) return ''; const [y,m] = d.split('-'); return `${y}년 ${m}월` }

const monthRef = ref(null)
const openMonthPicker = () => { monthRef.value?.showPicker() }

/* ── 상태 라벨/태그 매핑 ── */
const statusLabel = { 
  'CALCULATED': '작성중', 
  'CONFIRM_REQUESTED': '확정요청', 
  'CONFIRMED': '최종확정' 
}
const statusTagClass = { 
  'CALCULATED': 'tag-draft', 
  'CONFIRM_REQUESTED': 'tag-requested', 
  'CONFIRMED': 'tag-confirmed' 
}

/* ── 확정 요청 (작성중 → 확정요청) ── */
const requestConfirm = async (store) => {
  if (confirm(`${store.franchiseName}의 정산을 확정 요청하시겠습니까?\n최종 정산 금액: ₩ ${fmt(store.finalSettlementAmount)}`)) {
    try {
      await settlementsApi.requestConfirm(store.franchiseId, selectedMonth.value)
      fetchData()
    } catch (err) {
      alert('확정 요청에 실패했습니다.')
    }
  }
}

/* ── 최종 확정 (확정요청 → 최종확정) ── */
const finalConfirm = async (store) => {
  if (confirm(`${store.franchiseName}의 정산을 최종 확정하시겠습니까?\n최종 정산 금액: ₩ ${fmt(store.finalSettlementAmount)}`)) {
    try {
      await settlementsApi.finalConfirm(store.franchiseId, selectedMonth.value)
      fetchData()
    } catch (err) {
      alert('최종 확정하에 실패했습니다.')
    }
  }
}

/* ── 수정 (확정요청 → 작성중) ── */
const revertToDraft = async (store) => {
  if (confirm(`${store.franchiseName}의 확정 요청을 취소하고 작성중으로 되돌리시겠습니까?`)) {
    try {
      await settlementsApi.rollbackConfirm(store.franchiseId, selectedMonth.value)
      fetchData()
    } catch (err) {
      alert('되돌리기에 실패했습니다.')
    }
  }
}

/* ── 전체 최종 확정 ── */
const confirmAll = async () => {
  if (statusCounts.value.requestedCount === 0) {
    alert('확정 요청 상태인 가맹점이 없습니다.')
    return
  }
  if (confirm(`확정 요청 중인 ${statusCounts.value.requestedCount}개 가맹점을 일괄 최종 확정하시겠습니까?`)) {
    try {
      await settlementsApi.finalConfirmAll(selectedMonth.value)
      fetchData()
    } catch (err) {
      alert('일괄 확정에 실패했습니다.')
    }
  }
}
</script>

<template>
  <div class="content-wrapper">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/hq/settlement')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 class="page-title">정산 확정</h1>
          <p class="page-desc">월별 가맹점 정산을 확정 처리합니다.</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="date-wrapper" @click="openMonthPicker">
          <span class="date-label">{{ formatMonth(selectedMonth) }}</span>
          <input ref="monthRef" type="month" v-model="selectedMonth" class="date-input-hidden" />
        </div>
        <button class="confirm-all-btn" @click="confirmAll">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          전체 확정
        </button>
      </div>
    </div>

    <!-- 상태 카드 -->
    <section class="status-grid" v-if="!isLoading">
      <div class="stat-card">
        <span class="stat-label">작성중</span>
        <p class="stat-num">{{ statusCounts.draftCount }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-label">확정 요청</span>
        <p class="stat-num">{{ statusCounts.requestedCount }}</p>
      </div>
      <div class="stat-card">
        <span class="stat-label">최종 확정</span>
        <p class="stat-num">{{ statusCounts.confirmedCount }}</p>
      </div>
    </section>

    <!-- 안내 -->
    <div class="notice-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>정산은 작성중 → 확정요청 → 최종확정 순으로 진행됩니다.<br>확정요청 단계에서만 수정이 가능합니다.</span>
    </div>

    <!-- 가맹점 목록 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>{{ formatMonth(selectedMonth) }} 정산 확정 현황</h3>
      </div>
      <table class="data-table">
        <colgroup>
          <col style="width: 22%">
          <col style="width: 28%">
          <col style="width: 20%">
          <col style="width: 30%">
        </colgroup>
        <thead>
          <tr>
            <th>가맹점</th>
            <th>최종 정산 금액</th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="4" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="stores.length === 0">
            <td colspan="4" class="text-center" style="padding: 2rem;">정산 데이터가 없습니다.</td>
          </tr>
          <tr v-for="s in stores" :key="s.franchiseId" :class="'row-' + s.status" v-else>
            <td class="store-cell">{{ s.franchiseName }}</td>
            <td class="amount-cell">₩ {{ fmt(s.finalSettlementAmount) }}</td>
            <td>
              <span :class="['status-tag', statusTagClass[s.status]]">
                {{ statusLabel[s.status] }}
              </span>
            </td>
            <td>
              <template v-if="s.status === 'CALCULATED'">
                <button class="btn-request" @click="requestConfirm(s)">확정 요청</button>
              </template>
              <template v-else-if="s.status === 'CONFIRM_REQUESTED'">
                <button class="btn-confirm" @click="finalConfirm(s)">최종 확정</button>
                <button class="btn-revert" @click="revertToDraft(s)">수정</button>
              </template>
              <template v-else>
                <span class="no-action">-</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 0.75rem; }
.date-wrapper { position: relative; display: inline-flex; align-items: center; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.55rem 1.2rem; background: white; cursor: pointer; min-width: 140px; }
.date-wrapper:hover { border-color: var(--primary); }
.date-label { font-size: 1rem; font-weight: 600; color: var(--text-dark); pointer-events: none; white-space: nowrap; }
.date-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; border: none; }
.confirm-all-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.2rem; border-radius: 10px; border: none; background: #10b981; color: white; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
.confirm-all-btn:hover { background: #059669; transform: translateY(-1px); }

.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: white; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.15rem 1.4rem; }
.stat-label { font-size: 0.85rem; color: var(--text-light); display: block; margin-bottom: 0.3rem; }
.stat-num { font-size: 1.4rem; font-weight: 700; margin: 0; color: #1e293b; text-align: right; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; margin-bottom: 1.5rem; }
.table-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.9rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
.data-table tbody tr { background: white; }
.data-table tbody tr:hover { background: #fafafa; }
.row-CALCULATED { background: #f8fafc !important; }
.row-CALCULATED:hover { background: #f1f5f9 !important; }
.row-CONFIRM_REQUESTED { background: #fffbeb !important; }
.row-CONFIRM_REQUESTED:hover { background: #fef3c7 !important; }
.row-CONFIRMED { background: white !important; }

.store-cell { font-weight: 700; }
.amount-cell { font-weight: 700; color: #6366f1; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.tag-draft { background: #f1f5f9; color: #64748b; }
.tag-requested { background: #fef3c7; color: #92400e; }
.tag-confirmed { background: #d1fae5; color: #065f46; }

.btn-request { padding: 0.35rem 1rem; border-radius: 8px; border: 1px solid #6366f1; background: white; color: #6366f1; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
.btn-request:hover { background: #f5f3ff; }
.btn-confirm { padding: 0.35rem 1rem; border-radius: 8px; border: none; background: #10b981; color: white; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; margin-right: 0.5rem; }
.btn-confirm:hover { background: #059669; }
.btn-revert { padding: 0.35rem 1rem; border-radius: 8px; border: 1px solid #94a3b8; background: white; color: #64748b; font-weight: 600; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
.btn-revert:hover { background: #f8fafc; }
.no-action { color: #cbd5e1; font-weight: 600; }
.text-center { text-align: center; }

.notice-bar { display: flex; align-items: flex-start; gap: 0.5rem; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 0.75rem 1.25rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.5rem; }
.notice-bar svg { flex-shrink: 0; margin-top: 2px; }
</style>
