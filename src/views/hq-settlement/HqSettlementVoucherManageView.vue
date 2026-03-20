<script setup>
import { ref, onMounted, watch } from 'vue'
import { settlementsApi } from '@/api/settlements.js'

/* ── 가맹점 선택 ── */
const storeOptions = ref([])

/* ── 폼 ── */
const form = ref({
  storeId: '',
  type: 'ADJUSTMENT',
  description: '',
  amount: '',
  direction: 'INCREASE', // ⭐️ 변경: isDeduction 대신 direction
  returnType: '', // ⭐️ 추가: 반품 사유
  date: new Date().toISOString().split('T')[0],
  settlementMonth: new Date().toISOString().substring(0, 7), // ⭐️ 추가: 현재 월을 기본값으로
})

const typeOptions = [
  { value: 'ADJUSTMENT', label: '기타 조정' },
  { value: 'RETURN', label: '반품' }, // ⭐️ 추가: 반품 유형
  { value: 'SALES', label: '판매 대금 보정' },
  { value: 'ORDER', label: '발주 대금 보정' },
  { value: 'DELIVERY', label: '배송비 보정' },
  { value: 'COMMISSION', label: '수수료 보정' },
  { value: 'REFUND', label: '반품 환급 보정' },
  { value: 'LOSS', label: '손실 보정' },
]

/* ── 반품 사유 옵션 ── */
const returnTypeOptions = [
  { value: 'MISORDER', label: '오배송 (가맹점 차감)' },
  { value: 'PRODUCT_DEFECT', label: '상품하자 (본사 보전)' },
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

// ⭐️ 전표 유형이나 반품 사유 변경 시 처리 방식 자동 매핑
watch(() => [form.value.type, form.value.returnType], ([type, returnType]) => {
  if (type === 'RETURN') {
    if (returnType === 'MISORDER') {
      form.value.direction = 'DECREASE'
    } else if (returnType === 'PRODUCT_DEFECT') {
      form.value.direction = 'INCREASE'
    }
  }
})

/* ── 등록 ── */
const submitVoucher = async () => {
  if (!form.value.storeId) { alert('가맹점을 선택해주세요.'); return }
  if (!form.value.description) { alert('내역을 입력해주세요.'); return }
  if (!form.value.amount || isNaN(form.value.amount)) { alert('금액을 입력해주세요.'); return }
  if (form.value.type === 'RETURN' && !form.value.returnType) { alert('반품 사유를 선택해주세요.'); return }


  try {
      await settlementsApi.createAdjustment({
          franchiseId: form.value.storeId,
          type: form.value.type,
          occurredAt: form.value.date, // ⭐️ 수정: 시간 정보 제거 (LocalDate 규격)
          amount: Number(form.value.amount),
          direction: form.value.direction,
          returnType: form.value.type === 'RETURN' ? form.value.returnType : null,
          reason: form.value.description,
          settlementMonth: form.value.settlementMonth
      })
      
      alert('조정 전표가 등록되었습니다.')
      
      // 초기화 및 리프레시
      form.value = { 
        storeId: '', type: 'ADJUSTMENT', description: '', amount: '', 
        direction: 'INCREASE', // ⭐️ 변경: isDeduction 대신 direction
        returnType: '', // ⭐️ 추가: 반품 사유 초기화
        date: new Date().toISOString().split('T')[0],
        settlementMonth: new Date().toISOString().substring(0, 7)
      }
      fetchData()
  } catch (err) {
      // ⭐️ 상세 에러 메시지 표시 (백엔드 INVALID_INPUT 등)
      const errorMsg = err.response?.data?.message || err.message
      alert('전표 등록에 실패했습니다: ' + errorMsg)
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
          <label>전표 유형 <span class="required">*</span></label>
          <select v-model="form.type" class="form-select">
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div v-if="form.type && form.type.includes('RETURN')" class="form-group">
          <label>반품 사유 <span class="required">*</span></label>
          <select v-model="form.returnType" class="form-select">
            <option value="">사유를 선택하세요</option>
            <option v-for="opt in returnTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>발생일</label>
          <input type="date" v-model="form.date" class="form-input" />
        </div>
        <div class="form-group">
          <label>반영 정산월 <span class="required">*</span></label>
          <input type="month" v-model="form.settlementMonth" class="form-input" />
        </div>
        <div class="form-group">
          <label>금액 (원) <span class="required">*</span></label>
          <input type="number" v-model="form.amount" class="form-input" placeholder="0" />
        </div>
        <div class="form-group wide">
          <label>내역 (상세 사유) <span class="required">*</span></label>
          <input type="text" v-model="form.description" class="form-input" placeholder="조정 사유를 입력하세요" />
        </div>
        <div class="form-group wide">
          <label>처리 방식 <span class="required">*</span></label>
          <div class="radio-group" :class="{ 'disabled-overlay': form.type === 'RETURN' }">
            <label class="radio-label">
              <input type="radio" v-model="form.direction" value="INCREASE" :disabled="form.type === 'RETURN'" />
              <span class="radio-text">증가 (+)</span>
            </label>
            <label class="radio-label">
              <input type="radio" v-model="form.direction" value="DECREASE" :disabled="form.type === 'RETURN'" />
              <span class="radio-text">차감 (-)</span>
            </label>
          </div>
          <p v-if="form.type === 'RETURN'" class="helper-text"> 반품 사유에 따라 자동 설정됩니다. </p>
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
          <tr><th>전표번호</th><th>가맹점</th><th>유형</th><th>사유</th><th>내역</th><th class="text-right">금액</th><th>발생일</th><th>정산월</th><th>등록자</th></tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td colspan="9" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="registeredVouchers.length === 0">
            <td colspan="9" class="text-center" style="padding: 2rem;">등록된 조정 전표가 없습니다.</td>
          </tr>
          <tr v-for="v in registeredVouchers" :key="v.adjustmentId" v-else>
            <td class="id-cell">#{{ v.adjustmentId }}</td>
            <td class="fw600">{{ v.franchiseName }}</td>
            <td>
              <span class="type-tag">{{ v.type === 'RETURN' ? '반품' : '조정' }}</span>
            </td>
            <td>
              <span v-if="v.returnType" class="reason-tag" :class="v.returnType">{{ v.returnType === 'PRODUCT_DEFECT' ? '상품하자' : '오배송' }}</span>
              <span v-else>-</span>
            </td>
            <td class="text-left fw600">{{ v.reason }}</td>
            <td class="text-right" :class="v.direction === 'DECREASE' ? 'negative' : 'positive'">
              {{ v.direction === 'DECREASE' ? '−' : '+' }}₩ {{ fmt(v.amount) }}
            </td>
            <td class="time-cell">{{ v.occurredAt }}</td>
            <td class="month-cell">{{ v.settlementMonth }}</td>
            <td> 관리자 </td>
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

.radio-group { display: flex; gap: 1.5rem; padding-top: 0.3rem; }
.radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
.radio-label input { width: 18px; height: 18px; accent-color: var(--primary); }
.radio-text { font-size: 0.95rem; font-weight: 600; color: var(--text-dark); }
.disabled-overlay { opacity: 0.6; pointer-events: none; }
.helper-text { font-size: 0.8rem; color: var(--primary); margin-top: 4px; font-weight: 500; }

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
.text-left { text-align: left; } /* Added for reason column */
.id-cell { color: var(--primary); font-weight: 600; font-size: 0.8rem; }
.fw600 { font-weight: 600; }
.time-cell { color: var(--text-light); font-size: 0.85rem; }
.type-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: #f1f5f9; color: #475569; }
.month-cell { font-family: monospace; font-weight: 600; color: var(--primary); }
.negative { color: #ef4444; font-weight: 700; }
.positive { color: #3b82f6; font-weight: 700; }

.reason-tag { padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.reason-tag.PRODUCT_DEFECT { background: #dcfce7; color: #166534; }
.reason-tag.MISORDER { background: #fee2e2; color: #991b1b; }
</style>
```
