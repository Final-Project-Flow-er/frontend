<script setup>
import { ref, computed } from 'vue'

/* ── 필터 ── */
const filterType = ref('all')
const filterTypes = [
  { key: 'all', label: '전체' },
  { key: 'confirm', label: '정산 확정' },
  { key: 'document', label: '문서 생성' },
  { key: 'adjust', label: '조정 전표' },
  { key: 'cancel', label: '취소' },
]

/* ── 로그 Mock ── */
const allLogs = ref([
  { id: 1, type: 'confirm', typeName: '정산 확정', store: '강남점', desc: '2026년 1월 정산 확정', user: '김관리', date: '2026-02-01 10:30:22' },
  { id: 2, type: 'confirm', typeName: '정산 확정', store: '홍대점', desc: '2026년 1월 정산 확정', user: '김관리', date: '2026-02-01 10:31:05' },
  { id: 3, type: 'document', typeName: '문서 생성', store: '강남점', desc: '2026년 1월 정산서 PDF 생성', user: '김관리', date: '2026-02-01 10:35:10' },
  { id: 4, type: 'adjust', typeName: '조정 전표', store: '명동점', desc: '본사 프로모션 보전금 +₩30,000 등록', user: '정산관리자', date: '2026-02-05 14:20:33' },
  { id: 5, type: 'adjust', typeName: '조정 전표', store: '홍대점', desc: '배송 파손 보상 −₩25,000 등록', user: '정산관리자', date: '2026-02-07 09:15:41' },
  { id: 6, type: 'confirm', typeName: '정산 확정', store: '신촌점', desc: '2026년 2월 정산 확정', user: '김관리', date: '2026-02-08 11:00:18' },
  { id: 7, type: 'document', typeName: '문서 생성', store: '잠실점', desc: '2026년 1월 전표 Excel 생성', user: '정산관리자', date: '2026-02-08 11:05:55' },
  { id: 8, type: 'adjust', typeName: '조정 전표', store: '강남점', desc: '본사 프로모션 보전금 +₩50,000 등록', user: '정산관리자', date: '2026-02-08 15:20:12' },
  { id: 9, type: 'cancel', typeName: '취소', store: '이태원점', desc: '2026년 2월 정산 확정 취소', user: '김관리', date: '2026-02-09 09:10:05' },
  { id: 10, type: 'confirm', typeName: '정산 확정', store: '건대점', desc: '2026년 2월 정산 확정', user: '김관리', date: '2026-02-10 10:00:00' },
  { id: 11, type: 'confirm', typeName: '정산 확정', store: '합정점', desc: '2026년 2월 정산 확정', user: '김관리', date: '2026-02-10 10:01:30' },
  { id: 12, type: 'document', typeName: '문서 생성', store: '건대점', desc: '2026년 2월 정산서 PDF 생성', user: '김관리', date: '2026-02-10 10:05:44' },
])

const filteredLogs = computed(() => {
  let list = allLogs.value
  if (filterType.value !== 'all') {
    list = list.filter(l => l.type === filterType.value)
  }
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const getTypeClass = (type) => ({
  confirm: 'log-confirm',
  document: 'log-document',
  adjust: 'log-adjust',
  cancel: 'log-cancel',
}[type] || '')
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
          <h1 class="page-title">정산 이력 조회</h1>
          <p class="page-desc">정산 확정, 문서 생성, 조정 내역 로그를 조회합니다.</p>
        </div>
      </div>
    </div>

    <!-- 필터 -->
    <div class="filter-bar">
      <button
        v-for="ft in filterTypes"
        :key="ft.key"
        :class="['filter-chip', { active: filterType === ft.key }]"
        @click="filterType = ft.key"
      >
        {{ ft.label }}
      </button>
    </div>

    <!-- 로그 테이블 -->
    <div class="data-table-card">
      <div class="table-header">
        <h3>이력 목록</h3>
        <span class="badge">{{ filteredLogs.length }}건</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>유형</th>
            <th>가맹점</th>
            <th>내역</th>
            <th>처리자</th>
            <th>일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td class="id-cell">#{{ log.id }}</td>
            <td><span :class="['log-tag', getTypeClass(log.type)]">{{ log.typeName }}</span></td>
            <td class="fw600">{{ log.store }}</td>
            <td>{{ log.desc }}</td>
            <td>{{ log.user }}</td>
            <td class="time-cell">{{ log.date }}</td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="6" class="empty-cell">해당 유형의 이력이 없습니다.</td>
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

.filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.filter-chip { padding: 0.45rem 1rem; border-radius: 999px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--text-light); transition: all 0.15s; }
.filter-chip.active { background: var(--primary); color: white; border-color: var(--primary); }
.filter-chip:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

.data-table-card { background: white; border-radius: 16px; border: 1px solid var(--border-color); overflow: hidden; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
.table-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 0.9rem 1.5rem; background: #f8fafc; color: var(--text-light); font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border-color); }
.data-table td { padding: 0.9rem 1.5rem; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-dark); }
.data-table tbody tr:hover { background: #f8fafc; }
.id-cell { color: var(--text-light); font-weight: 600; font-size: 0.8rem; }
.fw600 { font-weight: 600; }
.time-cell { color: var(--text-light); font-size: 0.8rem; white-space: nowrap; }
.empty-cell { text-align: center; color: var(--text-light); padding: 3rem !important; }

.log-tag { padding: 3px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.log-confirm { background: #d1fae5; color: #065f46; }
.log-document { background: #e0f2fe; color: #0369a1; }
.log-adjust { background: #fef3c7; color: #92400e; }
.log-cancel { background: #fee2e2; color: #991b1b; }
</style>
