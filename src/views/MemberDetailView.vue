<template>
  <div class="member-detail-container">
    <div class="detail-header">
      <button @click="goBack" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        목록으로
      </button>
      <div class="header-actions">
        <template v-if="!isEditing">
          <button @click="startEdit" class="btn-edit">수정</button>
          <button v-if="isMemberActive" @click="confirmDeactivate" class="btn-deactivate">비활성화</button>
          <button v-else @click="confirmRestore" class="btn-restore">계정 복구</button>
        </template>
        <template v-else>
          <button @click="saveChanges" class="btn-save">저장</button>
          <button @click="cancelEdit" class="btn-cancel">취소</button>
        </template>
      </div>
    </div>

    <div v-if="member" class="detail-card">
      <div class="card-header">
        <div class="header-left">
          <span class="role-badge" :class="member.role">
            {{ getRoleDisplay(member) }}
          </span>
          <span class="status-badge" :class="member.status || 'active'">
            {{ (member.status === 'active' || !member.status) ? '활성' : '비활성' }}
          </span>
          <h1>{{ member.name }}</h1>
        </div>
        <div class="emp-number-large">{{ member.employeeNumber }}</div>
      </div>

      <div class="card-body">
        <div class="side-panel">
          <div class="photo-section">
            <div class="photo-container">
              <img v-if="member.photoUrl" :src="member.photoUrl" alt="회원 사진" class="profile-photo">
              <div v-else class="photo-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <button v-if="isEditing" class="btn-photo-upload" @click="triggerPhotoUpload">
                사진 변경
              </button>
              <input type="file" ref="photoInput" @change="onPhotoChange" accept="image/*" style="display: none">
            </div>
          </div>

          <div class="action-panel" v-if="!isEditing">
            <button @click="resendCredentials" class="btn-action">
              계정 정보 재발송
            </button>
          </div>
        </div>

        <div class="info-content">
          <section class="info-section">
            <h2>기본 정보</h2>
            <div class="info-grid">
              <div class="info-field">
                <label>아이디</label>
                <input type="text" :value="member.id" disabled class="input-disabled">
              </div>
              <div class="info-field">
                <label>이름</label>
                <input 
                  type="text" 
                  v-model="member.name" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
              </div>
              <div class="info-field">
                <label>이메일</label>
                <input 
                  type="email" 
                  v-model="member.email" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
              </div>
              <div class="info-field">
                <label>연락처</label>
                <input 
                  type="tel" 
                  v-model="member.phone" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
              </div>
              <div class="info-field">
                <label>생년월일</label>
                <input 
                  type="date" 
                  v-model="member.birthdate" 
                  disabled 
                  class="input-disabled"
                >
              </div>
            </div>
          </section>

          <section class="info-section">
            <h2>소속 정보</h2>
            <div class="info-grid">
              <div class="info-field">
                <label>권한</label>
                <select 
                  v-model="member.role" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
                  <option value="hq">본사</option>
                  <option value="franchise">가맹점</option>
                  <option value="factory">공장</option>
                </select>
              </div>
              <div class="info-field">
                <label>역할</label>
                <select 
                  v-model="member.roleDetail" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
                  <option value="" disabled>역할 선택</option>
                  <option v-for="opt in roleDetailOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              
              <!-- 가맹점/공장 관리자용 소속 검색 -->
              <div v-if="member.role !== 'hq'" class="info-field">
                <label>{{ member.role === 'franchise' ? '가맹점명' : '공장명' }}</label>
                <select 
                  v-model="member.orgName" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                >
                  <template v-if="member.role === 'franchise'">
                    <option v-for="org in franchiseOptions" :key="org.code" :value="org.name">
                      {{ org.name }}
                    </option>
                  </template>
                  <template v-else-if="member.role === 'factory'">
                    <option v-for="org in factoryOptions" :key="org.code" :value="org.name">
                      {{ org.name }}
                    </option>
                  </template>
                </select>
              </div>

              <div v-if="member.role !== 'hq'" class="info-field">
                <label>{{ member.role === 'franchise' ? '가맹점 코드' : '공장 코드' }}</label>
                <input type="text" v-model="member.orgCode" disabled class="input-disabled">
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else class="loading-state">
      <p>회원 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const photoInput = ref(null)

const isEditing = ref(false)
const member = ref(null)
const originalMember = ref(null)

const franchiseOptions = [
  { name: '서울본점', code: 'SE01' },
  { name: '경기분점', code: 'GE01' },
  { name: '부산분점', code: 'BU01' }
]

const factoryOptions = [
  { name: '경기공장', code: 'FA01' },
  { name: '충청공장', code: 'FA02' }
]

// 권한별 세부 역할
const roleDetailsByType = {
  hq: [
    { value: 'hq_hr', label: '인사 관리자' },
    { value: 'hq_settlement', label: '정산 관리자' },
    { value: 'hq_logistics', label: '물류 관리자' },
    { value: 'hq_system', label: '시스템 관리자' }
  ],
  franchise: [
    { value: 'fr_owner', label: '점주' },
    { value: 'fr_manager', label: '매니저' },
    { value: 'fr_staff', label: '직원' }
  ],
  factory: [
    { value: 'fa_production', label: '생산 관리자' },
    { value: 'fa_logistics', label: '물류 관리자' },
    { value: 'fa_factory', label: '공장 관리자' }
  ]
}

const ROLE_DETAIL_LABELS = {
  hq_hr: '인사 관리자',
  hq_settlement: '정산 관리자',
  hq_logistics: '물류 관리자',
  hq_system: '시스템 관리자',
  fr_owner: '점주',
  fr_manager: '매니저',
  fr_staff: '직원',
  fa_production: '생산 관리자',
  fa_logistics: '물류 관리자',
  fa_factory: '공장 관리자'
}

const roleDetailOptions = computed(() => member.value ? roleDetailsByType[member.value.role] || [] : [])

onMounted(() => {
  const empNum = route.params.employeeNumber
  // API 모드 (샘플 데이터 매칭)
  const sampleMembers = [
    {
      employeeNumber: '10001',
      name: '본사유저',
      id: 'hq_admin',
      role: 'hq',
      roleDetail: 'hq_hr',
      orgName: '본사',
      orgCode: '',
      email: 'admin@company.com',
      phone: '010-1111-2222',
      birthdate: '1985-05-15',
      photoUrl: '',
      status: 'active'
    },
    {
      employeeNumber: '20001',
      name: '가맹점유저',
      id: 'admin123',
      role: 'franchise',
      roleDetail: 'fr_owner',
      orgName: '서울본점',
      orgCode: 'SE01',
      email: 'admin@example.com',
      phone: '010-1234-5678',
      birthdate: '2002-06-26',
      photoUrl: '',
      status: 'active'
    },
    {
      employeeNumber: '30001',
      name: '공장유저',
      id: 'factory_mgr',
      role: 'factory',
      roleDetail: 'fa_factory',
      orgName: '경기공장',
      orgCode: 'FA01',
      email: 'factory@factory.com',
      phone: '010-5555-6666',
      birthdate: '1990-11-20',
      photoUrl: '',
      status: 'inactive'
    }
  ]

  const found = sampleMembers.find(m => m.employeeNumber === empNum)
  if (found) {
    member.value = JSON.parse(JSON.stringify(found))
    originalMember.value = JSON.parse(JSON.stringify(found))
  }
})

// 권한 변경 시 세부 역할·소속 초기화
watch(() => member.value?.role, (newRole, oldRole) => {
  if (!member.value || !isEditing.value) return
  if (newRole !== oldRole) {
    const opts = roleDetailsByType[newRole]
    member.value.roleDetail = opts && opts.length ? opts[0].value : ''
    member.value.orgName = newRole === 'hq' ? '본사' : ''
    member.value.orgCode = ''
  }
})

// 조직 선택 시 코드 자동 업데이트
watch(() => member.value?.orgName, (newVal) => {
  if (!member.value || !isEditing.value) return
  
  if (member.value.role === 'franchise') {
    const org = franchiseOptions.find(o => o.name === newVal)
    member.value.orgCode = org ? org.code : ''
  } else if (member.value.role === 'factory') {
    const org = factoryOptions.find(o => o.name === newVal)
    member.value.orgCode = org ? org.code : ''
  }
})

const getRoleLabel = (role) => {
  switch(role) {
    case 'hq': return '본사'
    case 'franchise': return '가맹점'
    case 'factory': return '공장'
    default: return role
  }
}

const getRoleDisplay = (m) => {
  const typeLabel = getRoleLabel(m.role)
  const detailLabel = m.roleDetail ? ROLE_DETAIL_LABELS[m.roleDetail] : null
  return detailLabel ? `${typeLabel} · ${detailLabel}` : typeLabel
}

const isMemberActive = computed(() => {
  return !member.value || member.value.status === 'active' || !member.value.status
})

const goBack = () => {
  router.push('/admin/members')
}

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  if (confirm('수정한 내용을 취소하시겠습니까?')) {
    member.value = JSON.parse(JSON.stringify(originalMember.value))
    isEditing.value = false
  }
}

const saveChanges = () => {
  alert('회원 정보가 성공적으로 수정되었습니다.')
  originalMember.value = JSON.parse(JSON.stringify(member.value))
  isEditing.value = false
}

const confirmDeactivate = () => {
  if (confirm('이 회원 계정을 비활성화하시겠습니까? 비활성화된 계정은 로그인할 수 없습니다.')) {
    member.value.status = 'inactive'
    originalMember.value.status = 'inactive'
    alert('계정이 비활성화되었습니다.')
  }
}

const confirmRestore = () => {
  if (confirm('이 회원 계정을 복구하시겠습니까?')) {
    member.value.status = 'active'
    originalMember.value.status = 'active'
    alert('계정이 복구되었습니다.')
  }
}

const resendCredentials = () => {
  alert('해당 회원의 이메일로 계정 정보가 재발송되었습니다.')
}

const triggerPhotoUpload = () => {
  photoInput.value.click()
}

const onPhotoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      member.value.photoUrl = event.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.member-detail-container {
  padding: 1.5rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit, .btn-save {
  padding: 0.6rem 1.5rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-deactivate {
  padding: 0.6rem 1.5rem;
  background: white;
  color: #ef4444;
  border: 1.5px solid #ef4444;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-deactivate:hover {
  background: #fff1f2;
}

.btn-restore {
  padding: 0.6rem 1.5rem;
  background: #15803d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-restore:hover {
  background: #166534;
}

.btn-cancel {
  padding: 0.6rem 1.5rem;
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* 카드 영역 */
.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.emp-number-large {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2563eb;
}

.card-body {
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 3rem;
}

/* 사이드 패널 (사진) */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-photo,
.photo-placeholder {
  width: 180px;
  height: 180px;
  border-radius: 50% !important;
  object-fit: cover;
  border: 4px solid #f1f5f9;
}

.photo-placeholder {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.btn-photo-upload {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-action {
  width: 100%;
  padding: 0.85rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-action:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* 정보 영역 */
.info-section {
  margin-bottom: 2.5rem;
}

.info-section h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
}

.info-field input,
.info-field select {
  padding: 0.7rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
}

.input-disabled {
  background: #f8fafc !important;
  color: #64748b;
  cursor: not-allowed;
}

.role-badge {
  padding: 0.35rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.role-badge.hq { background: #e0f2fe; color: #0369a1; }
.role-badge.franchise { background: #fef3c7; color: #b45309; }
.role-badge.factory { background: #dcfce7; color: #15803d; }

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }

@media (max-width: 900px) {
  .card-body {
    grid-template-columns: 1fr;
  }
}
</style>
