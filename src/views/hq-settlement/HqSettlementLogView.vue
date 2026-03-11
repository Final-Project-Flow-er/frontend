<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { settlementsApi } from '@/api/settlements.js'

/* ── 필터 ── */
const filterType = ref('ALL')
const filterTypes = [
  { key: 'ALL', label: '전체' },
  { key: 'CONFIRM', label: '정산 확정' },
  { key: 'DOCUMENT', label: '문서 생성' },
  { key: 'ADJUSTMENT', label: '조정 전표' },
  { key: 'CANCEL', label: '취소' },
]

/* ── 로그 상태 ── */
const allLogs = ref([])
const totalCount = ref(0)
const isLoading = ref(false)

const fetchData = async () => {
    isLoading.value = true
    try {
        const res = await settlementsApi.getLogs({
            type: filterType.value,
            size: 50
        })
        allLogs.value = res.content
        totalCount.value = res.totalElements
    } catch (err) {
        console.error('Failed to fetch logs:', err)
    } finally {
        isLoading.value = false
    }
}

onMounted(fetchData)
watch(filterType, fetchData)

const filteredLogs = computed(() => allLogs.value)

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
          <tr v-if="isLoading">
            <td colspan="6" class="text-center" style="padding: 2rem;">데이터를 불러오는 중입니다...</td>
          </tr>
          <tr v-else-if="allLogs.length === 0">
            <td colspan="6" class="text-center" style="padding: 2rem;">이력 데이터가 없습니다.</td>
          </tr>
          <tr v-for="log in allLogs" :key="log.id" v-else>
            <td class="id-cell">#{{ log.id }}</td>
            <td><span :class="['log-tag', getTypeClass(log.type.toLowerCase())]">{{ log.type }}</span></td>
            <td class="fw600">{{ log.franchiseName || '-' }}</td>
            <td>{{ log.content }}</td>
            <td>{{ log.actorName || '-' }}</td>
            <td class="time-cell">{{ log.createdAt?.replace('T', ' ').substring(0, 16) }}</td>
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
