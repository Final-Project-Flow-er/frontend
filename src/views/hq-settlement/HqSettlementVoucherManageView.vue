<script setup>
import { ref } from 'vue'

/* ── 가맹점 선택 ── */
const storeOptions = [
  { id: 'S001', name: '강남점' }, { id: 'S002', name: '홍대점' }, { id: 'S003', name: '신촌점' },
  { id: 'S004', name: '이태원점' }, { id: 'S005', name: '잠실점' }, { id: 'S006', name: '명동점' },
  { id: 'S007', name: '건대점' }, { id: 'S008', name: '서울대점' }, { id: 'S009', name: '합정점' }, { id: 'S010', name: '성수점' },
]

/* ── 폼 ── */
const form = ref({
  storeId: '',
  type: 'adjust',
  description: '',
  amount: '',
  isDeduction: false,
  date: new Date().toISOString().split('T')[0],
})

const typeOptions = [
  { key: 'adjust', label: '기타 조정' },
  { key: 'sales', label: '판매 대금 보정' },
  { key: 'order', label: '발주 대금 보정' },
  { key: 'shipping', label: '배송비 보정' },
  { key: 'commission', label: '수수료 보정' },
  { key: 'refund', label: '반품 환급 보정' },
  { key: 'loss', label: '손실 보정' },
]

/* ── 기등록 전표 Mock ── */
const registeredVouchers = ref([
  { id: 'AD-001', store: '강남점', type: '기타 조정', desc: '본사 프로모션 보전금', amount: 50000, isDeduction: false, date: '2026-02-08', registrant: '정산관리자' },
  { id: 'AD-002', store: '홍대점', type: '손실 보정', desc: '배송 파손 보상', amount: -25000, isDeduction: true, date: '2026-02-07', registrant: '정산관리자' },
  { id: 'AD-003', store: '명동점', type: '기타 조정', desc: '이벤트 추가 정산', amount: 30000, isDeduction: false, date: '2026-02-05', registrant: '정산관리자' },
])

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(Math.abs(n))

/* ── 등록 ── */
const submitVoucher = () => {
  if (!form.value.storeId) { alert('가맹점을 선택해주세요.'); return }
  if (!form.value.description) { alert('내역을 입력해주세요.'); return }
  if (!form.value.amount || isNaN(form.value.amount)) { alert('금액을 입력해주세요.'); return }

  const store = storeOptions.find(s => s.id === form.value.storeId)
  const amt = form.value.isDeduction ? -Math.abs(Number(form.value.amount)) : Math.abs(Number(form.value.amount))

  registeredVouchers.value.unshift({
    id: `AD-${String(registeredVouchers.value.length + 1).padStart(3, '0')}`,
    store: store.name,
    type: typeOptions.find(t => t.key === form.value.type).label,
    desc: form.value.description,
    amount: amt,
    isDeduction: form.value.isDeduction,
    date: form.value.date,
    registrant: '정산관리자',
  })

  alert(`조정 전표가 등록되었습니다.\n가맹점: ${store.name}\n금액: ${amt < 0 ? '−' : '+'}₩ ${fmt(amt)}`)

  // 초기화
  form.value = { storeId: '', type: 'adjust', description: '', amount: '', isDeduction: false, date: new Date().toISOString().split('T')[0] }
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
            <option v-for="s in storeOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
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
          <tr v-for="v in registeredVouchers" :key="v.id">
            <td class="id-cell">{{ v.id }}</td>
            <td class="fw600">{{ v.store }}</td>
            <td><span class="type-tag">{{ v.type }}</span></td>
            <td>{{ v.desc }}</td>
            <td class="text-right" :class="v.amount < 0 ? 'negative' : 'positive'">
              {{ v.amount < 0 ? '−' : '+' }}₩ {{ fmt(v.amount) }}
            </td>
            <td class="time-cell">{{ v.date }}</td>
            <td>{{ v.registrant }}</td>
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
