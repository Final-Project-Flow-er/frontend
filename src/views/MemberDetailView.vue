<template>
  <div class="member-detail-container">
    <div class="detail-header">
      <button @click="goBack" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
        목록으로
      </button>
      <div v-if="member" class="header-actions">
        <template v-if="!isEditing">
          <button @click="startEdit" class="btn-edit">수정</button>
          <button v-if="isMemberActive" @click="confirmDeactivate" class="btn-deactivate">비활성화</button>
          <button v-else-if="member.status === 'INACTIVE'" @click="confirmRestore" class="btn-restore">계정 복구</button>
          <button v-if="member.status !== 'DELETED'" @click="confirmDelete" class="btn-delete">삭제</button>
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
          <span class="role-badge" :class="member.role ? member.role.toLowerCase() : ''">
            {{ getRoleDisplay(member) }}
          </span>
          <span class="status-badge" :class="member.status ? member.status.toLowerCase() : 'active'">
            {{ getStatusLabel(member.status) }}
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
                <input type="text" :value="member.loginId" disabled class="input-disabled">
              </div>
              <div class="info-field">
                <label>이름</label>
                <input 
                  type="text" 
                  v-model="member.name" 
                  @input="member.name = member.name.replace(/[0-9]/g, '')"
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
                  type="text" 
                  v-model="member.phone" 
                  @input="handlePhoneInput"
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                  maxlength="13"
                >
              </div>
              <div class="info-field">
                <label>생년월일</label>
                <input 
                  type="date" 
                  v-model="member.birthdate" 
                  :max="today"
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
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
                  <option value="HQ">본사</option>
                  <option value="FRANCHISE">가맹점</option>
                  <option value="FACTORY">공장</option>
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
              
              <!-- 소속 정보 검색 -->
              <div class="info-field">
                <label>{{ getOrgLabel(member.role) }}</label>
                <div v-if="isEditing" class="search-select-group">
                  <input 
                    type="text" 
                    v-model="member.orgName" 
                    placeholder="사업장을 검색하여 선택하세요" 
                    readonly 
                    @click="openUnitModal"
                  >
                  <button type="button" @click="openUnitModal" class="btn-search-trigger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    검색
                  </button>
                </div>
                <input 
                  v-else 
                  type="text" 
                  v-model="member.orgName" 
                  disabled 
                  class="input-disabled"
                >
              </div>

              <div class="info-field">
                <label>{{ getCodeLabel(member.role) }}</label>
                <input type="text" v-model="member.orgCode" disabled class="input-disabled">
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="isLoading" class="loading-state">
      <p class="loading-spinner">회원 정보를 불러오는 중...</p>
    </div>

    <!-- 오류 상태 -->
    <div v-else class="loading-state error-state">
      <div class="error-icon">⚠️</div>
      <p>회원 정보를 찾을 수 없거나 불러오는데 실패했습니다.</p>
      <button @click="goBack" class="btn-back-error">목록으로 돌아가기</button>
    </div>
    
    <!-- 사업장 선택 모달 -->
    <BusinessUnitSelectionModal 
      v-if="member"
      :is-open="isUnitModalOpen"
      :title="member.role === 'HQ' ? '본사' : (member.role === 'FRANCHISE' ? '가맹점' : '공장')"
      :units="member.role === 'HQ' ? hqOptions : (member.role === 'FRANCHISE' ? franchiseOptions : factoryOptions)"
      @close="isUnitModalOpen = false"
      @select="handleUnitSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserManagementStore } from '../stores/userManagement'
import BusinessUnitSelectionModal from './BusinessUnitSelectionModal.vue'

const router = useRouter()
const route = useRoute()
const userManagementStore = useUserManagementStore()
const photoInput = ref(null)
const selectedPhotoFile = ref(null)
const today = new Date().toISOString().split('T')[0]

const isEditing = ref(false)
const isLoading = ref(true)
const member = ref(null)
const originalMember = ref(null)

const isUnitModalOpen = ref(false)
const openUnitModal = () => {
  if (isEditing.value) {
    isUnitModalOpen.value = true
  }
}

const handleUnitSelect = (unit) => {
  member.value.orgName = unit.name
  member.value.orgCode = unit.businessNumber || unit.code || ''
  member.value.businessUnitId = unit.id
  isUnitModalOpen.value = false
}

// 사업장 옵션 (백엔드 연동)
const hqOptions = computed(() => userManagementStore.businessUnits.hq)
const franchiseOptions = computed(() => userManagementStore.businessUnits.franchise)
const factoryOptions = computed(() => userManagementStore.businessUnits.factory)

// 권한별 세부 역할 (백엔드 UserPosition 매핑)
const roleDetailsByType = {
  HQ: [
    { value: 'HR_MANAGER', label: '인사 관리자' },
    { value: 'FINANCE_MANAGER', label: '정산 관리자' },
    { value: 'LOGISTICS_MANAGER', label: '물류 관리자' },
    { value: 'SYSTEM_MANAGER', label: '시스템 관리자' }
  ],
  FRANCHISE: [
    { value: 'OWNER', label: '점주' },
    { value: 'STORE_MANAGER', label: '매니저' },
    { value: 'STAFF', label: '직원' }
  ],
  FACTORY: [
    { value: 'PRODUCTION_MANAGER', label: '생산 관리자' },
    { value: 'FACTORY_LOGISTICS_MANAGER', label: '공장 물류 관리자' },
    { value: 'FACTORY_MANAGER', label: '공장 관리자' }
  ]
}

const POSITION_LABELS = {
  HR_MANAGER: '인사 관리자',
  FINANCE_MANAGER: '정산 관리자',
  LOGISTICS_MANAGER: '물류 관리자',
  SYSTEM_MANAGER: '시스템 관리자',
  OWNER: '점주',
  STORE_MANAGER: '매니저',
  STAFF: '직원',
  PRODUCTION_MANAGER: '생산 관리자',
  FACTORY_LOGISTICS_MANAGER: '공장 물류 관리자',
  FACTORY_MANAGER: '공장 관리자'
}

const roleDetailOptions = computed(() => member.value ? roleDetailsByType[member.value.role] || [] : [])

const fetchDetail = async () => {
  const userId = route.params.id
  isLoading.value = true
  try {
    const data = await userManagementStore.fetchUserDetail(userId)
    if (data) {
      // API 응답 필드와 UI 필드 매핑
      member.value = {
        userId: data.userId || data.id,
        loginId: data.loginId,
        name: data.username,
        email: data.email,
        phone: data.phone,
        birthdate: data.birthDate,
        employeeNumber: data.employeeNumber,
        photoUrl: data.profileImageUrl,
        role: data.role,
        roleDetail: data.position,
        status: data.status,
        businessUnitId: data.businessUnitId,
        orgName: data.businessUnitName || (data.role === 'HQ' ? '본사' : '-')
      }
      
      // 소속 코드는 옵션에서 찾아야 함
      updateOrgCodeFromOptions()
      
      originalMember.value = JSON.parse(JSON.stringify(member.value))
    }
  } catch (error) {
    console.error('Fetch detail error:', error)
    alert('회원 정보를 불러오는데 실패했습니다.')
    router.push('/admin/members')
  } finally {
    isLoading.value = false
  }
}

const getOrgLabel = (role) => {
  switch (role) {
    case 'HQ': return '본사명'
    case 'FRANCHISE': return '가맹점명'
    case 'FACTORY': return '공장명'
    default: return '소속명'
  }
}

const getCodeLabel = (role) => {
  switch (role) {
    case 'HQ': return '본사 코드'
    case 'FRANCHISE': return '가맹점 코드'
    case 'FACTORY': return '공장 코드'
    default: return '코드'
  }
}

const updateOrgCodeFromOptions = () => {
  if (!member.value || !member.value.businessUnitId) {
    member.value.orgCode = '-'
    return
  }
  
  const options = member.value.role === 'HQ' ? hqOptions.value : 
                 (member.value.role === 'FRANCHISE' ? franchiseOptions.value : factoryOptions.value)
  const org = options.find(o => o.id === member.value.businessUnitId)
  if (org) {
    member.value.orgCode = org.hqCode || org.code || '-'
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      userManagementStore.fetchBusinessUnits('hq'),
      userManagementStore.fetchBusinessUnits('franchise'),
      userManagementStore.fetchBusinessUnits('factory'),
      fetchDetail()
    ])
  } catch (error) {
    console.error('onMounted initialization error:', error)
  } finally {
    isLoading.value = false
  }
})

// 권한 변경 시 세부 역할·소속 초기화
watch(() => member.value?.role, (newRole, oldRole) => {
  if (!member.value || !isEditing.value) return
  if (newRole !== oldRole) {
    const opts = roleDetailsByType[newRole]
    member.value.roleDetail = opts && opts.length ? opts[0].value : ''
    member.value.orgName = newRole === 'HQ' ? '본사' : ''
    member.value.orgCode = ''
    member.value.businessUnitId = null
  }
})

// 조직 선택 시 코드/ID 자동 업데이트
watch(() => member.value?.orgName, (newVal) => {
  if (!member.value || !isEditing.value) return
  
  const options = member.value.role === 'HQ' ? hqOptions.value : 
                 (member.value.role === 'FRANCHISE' ? franchiseOptions.value : factoryOptions.value)
  const org = options.find(o => o.name === newVal)
  if (org) {
    member.value.businessUnitId = org.id
    member.value.orgCode = org.hqCode || org.code || ''
  }
})

const getRoleLabel = (role) => {
  switch(role) {
    case 'HQ': return '본사'
    case 'FRANCHISE': return '가맹점'
    case 'FACTORY': return '공장'
    default: return role
  }
}

const getRoleDisplay = (m) => {
  const typeLabel = getRoleLabel(m.role)
  const detailLabel = m.roleDetail ? POSITION_LABELS[m.roleDetail] : null
  return detailLabel ? `${typeLabel} · ${detailLabel}` : typeLabel
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'ACTIVE': return '활성'
    case 'INACTIVE': return '비활성'
    case 'DELETED': return '삭제'
    default: return '활성'
  }
}

const isMemberActive = computed(() => {
  return !member.value || member.value.status === 'ACTIVE'
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
    selectedPhotoFile.value = null
  }
}

const saveChanges = async () => {
  if (!member.value.name?.trim() || !member.value.email?.trim() || !member.value.phone?.trim() || !member.value.birthdate) {
    alert('모든 필수 정보를 입력해주세요.');
    return;
  }
  
  if (member.value.phone.replace(/-/g, '').length !== 11) {
    alert('연락처는 11자리 숫자로 입력해주세요.');
    return;
  }

  if (!member.value.businessUnitId) {
    alert('소속 사업장을 선택해주세요.');
    return;
  }

  try {
    const updateData = {
      username: member.value.name,
      email: member.value.email,
      phone: member.value.phone,
      birthDate: member.value.birthdate,
      role: member.value.role,
      position: member.value.roleDetail,
      businessUnitId: member.value.businessUnitId
    }

    await userManagementStore.updateUser(member.value.userId, updateData, selectedPhotoFile.value)
    alert('회원 정보가 성공적으로 수정되었습니다.')
    await fetchDetail()
    isEditing.value = false
    selectedPhotoFile.value = null
  } catch (error) {
    alert('정보 수정에 실패했습니다.')
  }
}

const confirmDeactivate = async () => {
  if (confirm('이 회원 계정을 비활성화하시겠습니까? 비활성화된 계정은 로그인할 수 없습니다.')) {
    try {
      await userManagementStore.updateUserStatus(member.value.userId, 'INACTIVE')
      alert('계정이 비활성화되었습니다.')
      await fetchDetail()
    } catch (error) {
      alert('상태 변경 실패')
    }
  }
}

const confirmRestore = async () => {
  if (confirm('이 회원 계정을 복구하시겠습니까?')) {
    try {
      await userManagementStore.updateUserStatus(member.value.userId, 'ACTIVE')
      alert('계정이 복구되었습니다.')
      await fetchDetail()
    } catch (error) {
      alert('상태 변경 실패')
    }
  }
}

const confirmDelete = async () => {
  if (confirm('이 회원 계정을 정말로 삭제하시겠습니까? 삭제된 회원은 복구할 수 없습니다.')) {
    try {
      await userManagementStore.deleteUser(member.value.userId)
      alert('계정이 삭제되었습니다.')
      router.push('/admin/members')
    } catch (error) {
      alert('삭제 실패')
    }
  }
}

const resendCredentials = async () => {
  try {
    await userManagementStore.resendUserInfo(member.value.userId)
    alert('해당 회원의 이메일로 계정 정보가 재발송되었습니다.')
  } catch (error) {
    alert('재발송 실패')
  }
}

const triggerPhotoUpload = () => {
  photoInput.value.click()
}

const onPhotoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedPhotoFile.value = file
    const reader = new FileReader()
    reader.onload = (event) => {
      member.value.photoUrl = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 전화번호 자동 하이픈
const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 7) {
    val = val.slice(0, 3) + '-' + val.slice(3);
  } else if (val.length > 7) {
    val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
  }
  member.value.phone = val;
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
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-edit:hover, .btn-save:hover {
  background: #1e293b;
}

.btn-deactivate {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-deactivate:hover {
  background: #f1f5f9;
  color: #475569;
}

.btn-delete {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete:hover {
  background: #fef2f2;
}

.btn-restore {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #10b981;
  border: 1px solid #6ee7b7;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-restore:hover {
  background: #ecfdf5;
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover {
  background: #f8fafc;
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
.status-badge.deleted { background: #fee2e2; color: #b91c1c; }

@media (max-width: 900px) {
  .card-body {
    grid-template-columns: 1fr;
  }
}

.search-select-group {
  display: flex;
  gap: 0.5rem;
}

.search-select-group input {
  flex: 1;
  cursor: pointer;
  background: #f8fafc;
}

.btn-search-trigger {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 1rem;
  background: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-search-trigger:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  color: #64748b;
}

.error-state {
  color: #ef4444;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-back-error {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
