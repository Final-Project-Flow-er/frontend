<template>
  <div class="registration-container">
    <div class="registration-header">
      <h1>회원 등록</h1>
      <p class="subtitle">새로운 회원을 시스템에 등록합니다</p>
    </div>

    <!-- 권한(본사/가맹점/공장) 선택 버튼 -->
    <div class="type-selection">
      <button 
        v-for="role in roles" 
        :key="role.value"
        type="button"
        @click="selectedRole = role.value; formData.roleDetail = ''"
        :class="['type-btn', { active: selectedRole === role.value }]"
      >
        <svg v-if="role.value === 'hq'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18"></path>
          <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3"></path>
          <path d="M19 21v-7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v7"></path>
        </svg>
        <svg v-if="role.value === 'franchise'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <svg v-if="role.value === 'factory'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 20V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v1l4 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
          <path d="M17 18h1"></path>
          <path d="M12 18h1"></path>
          <path d="M7 18h1"></path>
          <path d="M7 14h1"></path>
          <path d="M12 14h1"></path>
          <path d="M17 14h1"></path>
          <path d="M7 10h1"></path>
          <path d="M12 10h1"></path>
          <path d="M17 10h1"></path>
          <path d="M7 6h1"></path>
          <path d="M12 6h1"></path>
        </svg>
        {{ role.label }}
      </button>
    </div>

    <div class="content-wrapper">
      <form @submit.prevent="handleRegister" class="registration-form">
        <div class="form-card">
          <div class="form-section">
            <h2 class="section-title">역할</h2>
            <div class="form-grid role-dropdown-row">
              <div class="form-group">
                <label>역할 <span class="required">*</span></label>
                <select v-model="formData.roleDetail" class="form-select" required>
                  <option value="" disabled>역할을 선택하세요</option>
                  <option v-for="opt in roleDetailOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="section-title">기본 정보</h2>
            
            <!-- 사진 업로드 -->
            <div class="photo-upload-section">
              <div class="photo-preview-container">
                <img v-if="formData.photoUrl" :src="formData.photoUrl" class="photo-preview rectangular">
                <div v-else class="photo-placeholder rectangular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <button type="button" class="btn-upload" @click="triggerPhotoUpload">사진 등록</button>
                <input type="file" ref="photoInput" @change="onPhotoChange" accept="image/*" style="display: none">
              </div>
            </div>

            <div class="form-grid">
              <!-- 공통 필드 -->
              <div class="form-group">
                <label>이름 <span class="required">*</span></label>
                <input type="text" v-model="formData.name" placeholder="이름을 입력하세요" required>
              </div>

              <div class="form-group">
                <label>이메일 <span class="required">*</span></label>
                <input type="email" v-model="formData.email" placeholder="이메일을 입력하세요." required>
              </div>

              <div class="form-group">
                <label>연락처 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="formData.phone" 
                  @input="handlePhoneInput"
                  placeholder="전화번호를 입력하세요."
                  maxlength="13"
                  required
                >
              </div>

              <div class="form-group">
                <label>생년월일 <span class="required">*</span></label>
                <input type="date" v-model="formData.birthdate" required>
              </div>

              <!-- 본사 전용 -->
              <template v-if="selectedRole === 'HQ'">
                <div class="form-group">
                  <label>본사 소속 <span class="required">*</span></label>
                  <div class="search-select-group">
                    <input 
                      type="text" 
                      v-model="formData.orgName" 
                      placeholder="본사를 검색하여 선택하세요" 
                      readonly 
                      @click="openUnitModal"
                      required
                    >
                    <button type="button" @click="openUnitModal" class="btn-search-trigger">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      검색
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>본사 코드</label>
                  <input type="text" v-model="formData.orgCode" placeholder="자동 입력됨" disabled class="input-disabled">
                </div>
              </template>

              <!-- 가맹점 전용 -->
              <template v-if="selectedRole === 'FRANCHISE'">
                <div class="form-group">
                  <label>가맹점명 <span class="required">*</span></label>
                  <div class="search-select-group">
                    <input 
                      type="text" 
                      v-model="formData.orgName" 
                      placeholder="가맹점을 검색하여 선택하세요" 
                      readonly 
                      @click="openUnitModal"
                      required
                    >
                    <button type="button" @click="openUnitModal" class="btn-search-trigger">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      검색
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>가맹점 코드</label>
                  <input type="text" v-model="formData.orgCode" placeholder="자동 입력됨" disabled class="input-disabled">
                </div>
              </template>

              <!-- 공장 전용 -->
              <template v-if="selectedRole === 'FACTORY'">
                <div class="form-group">
                  <label>공장 이름 <span class="required">*</span></label>
                  <div class="search-select-group">
                    <input 
                      type="text" 
                      v-model="formData.orgName" 
                      placeholder="공장을 검색하여 선택하세요" 
                      readonly 
                      @click="openUnitModal"
                      required
                    >
                    <button type="button" @click="openUnitModal" class="btn-search-trigger">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                      검색
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>공장 코드</label>
                  <input type="text" v-model="formData.orgCode" placeholder="자동 입력됨" disabled class="input-disabled">
                </div>
              </template>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-register" :disabled="isSubmitting">
              {{ isSubmitting ? '등록 중...' : '회원 등록' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- 결과 안내 모달 -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>회원 등록 완료</h2>
        </div>
        <div class="modal-body">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p class="modal-desc">축하합니다! 회원이 성공적으로 등록되었습니다.<br>ID와 비밀번호는 등록된 이메일로 발송되었습니다.</p>
          
          <div class="result-details">
            <div class="result-item">
              <span class="label">아이디:</span>
              <span class="valueHighlight">{{ resultData.loginId }}</span>
            </div>
            <div class="result-item">
              <span class="label">사원번호:</span>
              <span class="value">{{ resultData.employeeNumber }}</span>
            </div>
          </div>
          <p class="modal-info-text text-center mt-3" style="color: #64748b; font-size: 0.9rem;">
            * 임시 비밀번호가 사용자의 이메일로 안전하게 발송되었습니다.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-confirm">확인</button>
        </div>
      </div>
    </div>

    <!-- 사업장 선택 모달 -->
    <BusinessUnitSelectionModal 
      :is-open="isUnitModalOpen"
      :title="selectedRole === 'HQ' ? '본사' : (selectedRole === 'FRANCHISE' ? '가맹점' : '공장')"
      :units="selectedRole === 'HQ' ? hqOptions : (selectedRole === 'FRANCHISE' ? franchiseOptions : factoryOptions)"
      @close="isUnitModalOpen = false"
      @select="handleUnitSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useUserManagementStore } from '../stores/userManagement'
import BusinessUnitSelectionModal from './BusinessUnitSelectionModal.vue'

const userManagementStore = useUserManagementStore()

const roles = [
  { label: '본사', value: 'HQ' },
  { label: '가맹점', value: 'FRANCHISE' },
  { label: '공장', value: 'FACTORY' }
]

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

const roleDetailOptions = computed(() => roleDetailsByType[selectedRole.value] || [])

const selectedRole = ref('HQ')
const isSubmitting = ref(false)
const showResultModal = ref(false)
const photoInput = ref(null)
const selectedPhotoFile = ref(null)

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  businessUnitId: null,
  orgName: '', // UI 표시용
  orgCode: '',
  photoUrl: '', // 미리보기용
  roleDetail: ''
})

const resultData = reactive({
  employeeNumber: '',
  loginId: '',
  tempPassword: '' // 임시 비번은 백엔드 응답에 없을 수 있으니 메일 확인 문구로 대체 가능
})

// 사업장 옵션 (백엔드 연동)
const hqOptions = computed(() => userManagementStore.businessUnits.hq)
const franchiseOptions = computed(() => userManagementStore.businessUnits.franchise)
const factoryOptions = computed(() => userManagementStore.businessUnits.factory)

const isUnitModalOpen = ref(false)

const openUnitModal = () => {
  isUnitModalOpen.value = true
}

const handleUnitSelect = (unit) => {
  formData.orgName = unit.name
  formData.orgCode = unit.businessNumber || unit.code || ''
  formData.businessUnitId = unit.id
}

onMounted(async () => {
  await Promise.all([
    userManagementStore.fetchBusinessUnits('hq'),
    userManagementStore.fetchBusinessUnits('franchise'),
    userManagementStore.fetchBusinessUnits('factory')
  ])
})

// 권한 타입 변경 시 초기화
watch(selectedRole, () => {
  formData.roleDetail = ''
  formData.orgName = ''
  formData.orgCode = ''
  formData.businessUnitId = null
})

const triggerPhotoUpload = () => {
  photoInput.value.click()
}

const onPhotoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedPhotoFile.value = file
    const reader = new FileReader()
    reader.onload = (event) => {
      formData.photoUrl = event.target.result
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
  formData.phone = val;
}

const handleRegister = async () => {
  if (!formData.roleDetail) {
    alert('역할을 선택해주세요.')
    return
  }

  if (formData.phone.replace(/-/g, '').length !== 11) {
    alert('연락처는 11자리 숫자로 입력해주세요.')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const requestData = {
      username: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthdate,
      role: selectedRole.value,
      position: formData.roleDetail,
      businessUnitId: formData.businessUnitId
    }

    const response = await userManagementStore.createUser(requestData, selectedPhotoFile.value)
    
    if (response.success) {
      resultData.employeeNumber = response.data.employeeNumber
      resultData.loginId = response.data.loginId
      // 백엔드 CreateUserResponse에 tempPassword가 따로 없다면 안내 문구만
      showResultModal.value = true
    }
  } catch (error) {
    alert('회원 등록에 실패했습니다. 입력 정보를 확인해주세요.')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  showResultModal.value = false
  // 폼 초기화
  Object.keys(formData).forEach(key => {
    if (key === 'businessUnitId') formData[key] = null
    else formData[key] = ''
  })
  selectedPhotoFile.value = null
}
</script>

<style scoped>
.registration-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.registration-header { margin-bottom: 2rem; }
.registration-header h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem 0; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

/* 권한 선택 버튼 */
.type-selection { display: flex; gap: 1rem; margin-bottom: 2rem; }
.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.type-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
.type-btn.active { border-color: #0f172a; background: #0f172a; color: white; }

/* 필수 입력 표시 */
.required { color: #ef4444; margin-left: 2px; font-weight: 700; }

/* 역할 드롭다운 행 */
.role-dropdown-row { margin-bottom: 0.5rem; }

/* 폼 카드 */
.form-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid #e2e8f0;
}

/* 사진 업로드 */
.photo-upload-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.photo-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.photo-preview,
.photo-placeholder {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 4px solid #f8fafc;
  background: #f8fafc;
}

.circular {
  border-radius: 50%;
}

.rectangular {
  border-radius: 8px; /* Slightly rounded square */
}

.photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  border: 2px solid #cbd5e1; /* Changed from dashed to solid */
  background: #f8fafc;
}

.btn-upload {
  padding: 0.5rem 1.25rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #e2e8f0;
}

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem 1rem; margin-bottom: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; margin-left: 2px; }

.form-group input,
.form-group select {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
  outline: none;
  height: 42px;
  box-sizing: border-box;
}

.search-select-group { display: flex; gap: 0.5rem; }
.search-select-group input { flex: 1; cursor: pointer; background: #f8fafc; }

.btn-search-trigger {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0 1rem; background: #0f172a; border: none;
  border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  color: white; cursor: pointer; transition: all 0.2s;
}
.btn-search-trigger:hover { background: #1e293b; transform: translateY(-1px); }

.form-group input:focus,
.form-group select:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }

.input-disabled { background: #f8fafc !important; color: #94a3b8; cursor: not-allowed; }

/* 버튼 액션 */
.form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.btn-register { padding: 0.65rem 1.5rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-register { background: #0f172a; color: white; border: none; }
.btn-register:hover:not(:disabled) { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
.btn-register:disabled { background: #94a3b8; cursor: not-allowed; }

/* 모달 스타일 (기존 스타일 유지하되 톤 조정) */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 450px;
  padding: 2.5rem;
  text-align: center;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.modal-body { margin-top: 1.5rem; }
.success-icon { margin-bottom: 1.5rem; }
.modal-desc { color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; }

.result-details {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e2e8f0;
}

.result-item { display: flex; justify-content: space-between; align-items: center; }
.result-item .label { font-weight: 600; color: #64748b; font-size: 0.9rem; }
.result-item .value { font-family: monospace; font-weight: 700; color: #0f172a; font-size: 1rem; }
.valueHighlight { font-weight: 800; color: #2563eb; font-size: 1.1rem; }

.btn-confirm {
  width: 100%;
  margin-top: 2rem;
  padding: 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-confirm:hover { background: #1e293b; }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
