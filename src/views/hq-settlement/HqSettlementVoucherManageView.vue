<script setup>
import { ref, onMounted, watch } from 'vue'
import { settlementsApi } from '@/api/settlements.js'

/* ── 가맹점 선택 ── */
const storeOptions = ref([])

/* ── 폼 ── */
const form = ref({
  storeId: '',
  type: 'ADJUST',
  description: '',
  amount: '',
  isDeduction: false,
  date: new Date().toISOString().split('T')[0],
})

const typeOptions = [
  { key: 'ADJUST', label: '기타 조정' },
  { key: 'SALES_ADJUST', label: '판매 대금 보정' },
  { key: 'ORDER_ADJUST', label: '발주 대금 보정' },
  { key: 'SHIPPING_ADJUST', label: '배송비 보정' },
  { key: 'COMMISSION_ADJUST', label: '수수료 보정' },
  { key: 'REFUND_ADJUST', label: '반품 환급 보정' },
  { key: 'LOSS_ADJUST', label: '손실 보정' },
]

/* ── 기등록 전표 상태 ── */
const registeredVouchers = ref([])
const totalCount = ref(0)
const isLoading = ref(false)

const fetchData = async () => {
    isLoading.value = true
    try {
        // 1. 가맹점 목록 (드롭다운용)
        const stores = await settlementsApi.getAdjustmentFranchises()
        storeOptions.value = stores

        // 2. 조정 전표 목록 (현재 달 기준)
        const today = new Date()
        const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
        const res = await settlementsApi.getAdjustments({ month: monthStr, size: 50 })
        registeredVouchers.value = res.content
        totalCount.value = res.totalElements
    } catch (err) {
        console.error('Failed to fetch adjustments:', err)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n))

/* ── 등록 ── */
const submitVoucher = async () => {
  if (!form.value.storeId) { alert('가맹점을 선택해주세요.'); return }
  if (!form.value.description) { alert('내역을 입력해주세요.'); return }
  if (!form.value.amount || isNaN(form.value.amount)) { alert('금액을 입력해주세요.'); return }

  try {
      await settlementsApi.createAdjustment({
          franchiseId: form.value.storeId,
          type: form.value.type,
          occurredAt: form.value.date + 'T00:00:00',
          amount: Number(form.value.amount),
          isMinus: form.value.isDeduction,
          reason: form.value.description
      })
      
      alert('조정 전표가 등록되었습니다.')
      
      // 초기화 및 리프레시
      form.value = { storeId: '', type: 'ADJUST', description: '', amount: '', isDeduction: false, date: new Date().toISOString().split('T')[0] }
      fetchData()
  } catch (err) {
      alert('전표 등록에 실패했습니다: ' + err.message)
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
          <h1 class="page-title">조정 전표 관리</h1>
          <p class="page-desc">오류 또는 보정이 필요한 경우 조정 전표를 등록합니다.</p>
        </div>
      </div>
    </div>

    <!-- 등록 폼 -->
    <div class="form-card">
      <h3 class="form-title">새 조정 전표 등록</h3>
      <div class="form-grid">
        <div class="form-group">
          <label>가맹점 <span class="required">*</span></label>
          <select v-model="form.storeId" class="form-select">
            <option value="" disabled>선택하세요</option>
            <option v-for="s in storeOptions" :key="s.franchiseId" :value="s.franchiseId">{{ s.franchiseName }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>전표 유형</label>
          <select v-model="form.type" class="form-select">
            <option v-for="t in typeOptions" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>발생일</label>
          <input type="date" v-model="form.date" class="form-input" />
        </div>
        <div class="form-group">
          <label>금액 (원) <span class="required">*</span></label>
          <input type="number" v-model="form.amount" class="form-input" placeholder="0" />
        </div>
        <div class="form-group wide">
          <label>내역 <span class="required">*</span></label>
          <input type="text" v-model="form.description" class="form-input" placeholder="조정 사유를 입력하세요" />
        </div>
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.isDeduction" />
            <span>차감 처리 (마이너스)</span>
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button class="submit-btn" @click="submitVoucher">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          전표 등록
        </button>
      </div>
    </div>

    <!-- 안내 -->
    <div class="notice-bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>조정 전표 등록 시 감사 로그가 자동으로 저장됩니다.</span>
    </div>

    <!-- 기등록 전표 목록 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>등록된 조정 전표</h3>
        <span class="badge">{{ registeredVouchers.length }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>전표번호</th><th>가맹점</th><th>유형</th><th>내역</th><th class="text-right">금액</th><th>발생일</th><th>등록자</th></tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="7" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="registeredVouchers.length === 0">
            <td colspan="7" class="text-center" style="padding: 2rem;">등록된 조정 전표가 없습니다.</td>
          </tr>
          <tr v-for="v in registeredVouchers" :key="v.adjustmentId" v-else>
            <td class="id-cell">#{{ v.adjustmentId }}</td>
            <td class="fw600">{{ v.franchiseName }}</td>
            <td><span class="type-tag">{{ v.type }}</span></td>
            <td>{{ v.reason }}</td>
            <td class="text-right" :class="v.amount < 0 ? 'negative' : 'positive'">
              {{ v.amount < 0 ? '−' : '+' }}₩ {{ fmt(v.amount) }}
            </td>
            <td class="time-cell">{{ v.occurredAt }}</td>
            <td>관리자</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 1200px; margin: 0 auto; }

.page-header { margin-bottom: 1.5rem; }
.header-left { display: flex; align-items: center; gap: 0.75rem; }
.back-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-color); background: white; cursor: pointer; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary); color: var(--primary); background: #f5f3ff; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text-dark); margin: 0 0 0.25rem; }
.page-desc { color: var(--text-light); font-size: 0.9rem; margin: 0; }

.form-card { background: white; border: 1px solid var(--border-color); border-radius: 16px; padding: 1.75rem 2rem; margin-bottom: 1rem; }
.form-title { margin: 0 0 1.25rem; font-size: 1.1rem; font-weight: 700; }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem 1.25rem; margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-dark); margin-bottom: 0.35rem; }
.form-group.wide { grid-column: 1 / -1; }
.required { color: #ef4444; }
.form-select, .form-input { width: 100%; padding: 0.6rem 0.9rem; border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.9rem; color: var(--text-dark); background: white; outline: none; }
.form-select:focus, .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.checkbox-group { display: flex; align-items: flex-end; }
.checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; color: var(--text-dark); }
.checkbox-label input { width: 16px; height: 16px; accent-color: var(--primary); }
.form-actions { display: flex; justify-content: flex-end; }
.submit-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.7rem 1.5rem; border-radius: 10px; border: none; background: var(--primary); color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
.submit-btn:hover { background: #4f46e5; transform: translateY(-1px); }

.notice-bar { display: flex; align-items: center; gap: 0.5rem; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 0.75rem 1.25rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1.5rem; }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.9rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
.data-table tbody tr:hover { background: #f8fafc; }
.text-right { text-align: right; }
.id-cell { color: var(--primary); font-weight: 600; font-size: 0.8rem; }
.fw600 { font-weight: 600; }
.time-cell { color: var(--text-light); font-size: 0.85rem; }
.type-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: #f1f5f9; color: #475569; }
.negative { color: #ef4444; font-weight: 700; }
.positive { color: #3b82f6; font-weight: 700; }
</style>
