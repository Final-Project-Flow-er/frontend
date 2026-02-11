<template>
  <div class="mypage-container">
    <div class="mypage-header">
      <h1>마이페이지</h1>
      <p class="subtitle">내 정보를 관리하세요</p>
    </div>

    <div class="content-wrapper">
      <!-- 내 정보 조회 및 수정 -->
      <div class="card">
        <div class="card-header">
          <h2>내 정보</h2>
          <button 
            v-if="!isEditingInfo" 
            @click="startEditInfo" 
            class="btn-edit"
          >
            수정
          </button>
        </div>

        <div class="card-body">
          <!-- 사원 사진 -->
          <div class="photo-section">
            <div class="photo-container">
              <img 
                v-if="userInfo.photoUrl" 
                :src="userInfo.photoUrl" 
                alt="사원 사진"
                class="employee-photo"
              >
              <div v-else class="photo-placeholder employee-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <button v-if="isEditingInfo" class="btn-upload-photo" @click="uploadPhoto">
                사진 변경
              </button>
            </div>
          </div>

          <div class="info-group">
            <label>사원번호</label>
            <input 
              type="text" 
              :value="userInfo.employeeNumber" 
              disabled 
              class="input-disabled"
            >
          </div>

          <div class="info-group">
            <label>아이디</label>
            <input 
              type="text" 
              :value="userInfo.id" 
              disabled 
              class="input-disabled"
            >
          </div>

          <div class="info-group">
            <label>이름</label>
            <input 
              type="text" 
              v-model="userInfo.name" 
              :disabled="!isEditingInfo"
              :class="{ 'input-disabled': !isEditingInfo }"
            >
          </div>

          <div class="info-group">
            <label>이메일</label>
            <input 
              type="email" 
              v-model="userInfo.email" 
              :disabled="!isEditingInfo"
              :class="{ 'input-disabled': !isEditingInfo }"
            >
          </div>

          <div class="info-group">
            <label>전화번호</label>
            <input 
              type="tel" 
              v-model="userInfo.phone" 
              :disabled="!isEditingInfo"
              :class="{ 'input-disabled': !isEditingInfo }"
            >
          </div>

          <div class="info-group">
            <label>생년월일</label>
            <input
                type="date"
                v-model="userInfo.birthdate"
                disabled
                class="input-disabled"
            >
          </div>

          <div class="info-group">
            <label>역할</label>
            <input 
              type="text" 
              :value="userInfo.role" 
              disabled 
              class="input-disabled"
            >
          </div>

          <div v-if="isEditingInfo" class="button-group">
            <button @click="saveUserInfo" class="btn-primary">저장</button>
            <button @click="cancelEditInfo" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>

      <!-- 액션 버튼 섹션 -->
      <div class="action-buttons-section">
        <button @click="showOrgModal = true" class="btn-org-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M3 9h18"></path>
          </svg>
          내 조직 정보
        </button>

        <button @click="showPasswordModal = true" class="btn-change-password">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          비밀번호 변경
        </button>
        
        <button @click="showDeleteModal = true" class="btn-delete-account">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          회원 탈퇴
        </button>
      </div>
    </div>

    <!-- 내 조직 정보 모달 -->
    <div v-if="showOrgModal" class="modal-overlay" @click="closeOrgModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>내 조직 정보</h2>
          <div class="header-actions">
            <button 
              v-if="!isEditingOrg" 
              @click="startEditOrg" 
              class="btn-edit-small"
            >
              수정
            </button>
            <button @click="closeOrgModal" class="btn-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body scrollable">
          <!-- 조직 사진 -->
          <div class="photo-section no-border">
            <div class="photo-container">
              <img 
                v-if="myOrgInfo.photoUrl" 
                :src="myOrgInfo.photoUrl" 
                alt="조직 사진"
                class="org-photo"
              >
              <div v-else class="photo-placeholder org-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M3 9h18"></path>
                </svg>
              </div>
              <button v-if="isEditingOrg" class="btn-upload-photo" @click="uploadOrgPhoto">
                사진 변경
              </button>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-group">
              <label>{{ myOrgInfo.type === 'store' ? '가맹점 코드' : '공장 코드' }}</label>
              <input type="text" :value="myOrgInfo.code" disabled class="input-disabled">
            </div>

            <div class="info-group">
              <label>{{ myOrgInfo.type === 'store' ? '가맹점명' : '공장명' }}</label>
              <input 
                type="text" 
                v-model="myOrgInfo.name" 
                :disabled="!isEditingOrg"
                :class="{ 'input-disabled': !isEditingOrg }"
              >
            </div>

            <div class="info-group full-width">
              <label>주소</label>
              <input 
                type="text" 
                v-model="myOrgInfo.address" 
                :disabled="!isEditingOrg"
                :class="{ 'input-disabled': !isEditingOrg }"
              >
            </div>

            <div class="info-group">
              <label>전화번호</label>
              <input 
                type="tel" 
                v-model="myOrgInfo.phone" 
                :disabled="!isEditingOrg"
                :class="{ 'input-disabled': !isEditingOrg }"
              >
            </div>

            <template v-if="myOrgInfo.type === 'store'">
              <div class="info-group">
                <label>면적 (㎡)</label>
                <input 
                  type="number" 
                  v-model.number="myOrgInfo.area" 
                  :disabled="!isEditingOrg"
                  :class="{ 'input-disabled': !isEditingOrg }"
                >
              </div>

              <div class="info-group full-width">
                <label>운영 요일</label>
                <div class="days-chips">
                  <label v-for="day in weekDays" :key="day.value" class="day-chip" :class="{ 'active': myOrgInfo.operatingDays.includes(day.value), 'disabled': !isEditingOrg }">
                    <input 
                      type="checkbox" 
                      :value="day.value" 
                      v-model="myOrgInfo.operatingDays" 
                      :disabled="!isEditingOrg"
                    >
                    <span>{{ day.label }}</span>
                  </label>
                </div>
              </div>

              <div class="info-group">
                <label>개점 시간</label>
                <input 
                  type="time" 
                  v-model="myOrgInfo.openTime" 
                  :disabled="!isEditingOrg"
                  :class="{ 'input-disabled': !isEditingOrg }"
                >
              </div>

              <div class="info-group">
                <label>폐점 시간</label>
                <input 
                  type="time" 
                  v-model="myOrgInfo.closeTime" 
                  :disabled="!isEditingOrg"
                  :class="{ 'input-disabled': !isEditingOrg }"
                >
              </div>
            </template>
          </div>

          <div v-if="isEditingOrg" class="button-group sticky-bottom">
            <button @click="saveOrgInfo" class="btn-primary">저장</button>
            <button @click="cancelEditOrg" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>비밀번호 변경</h2>
          <button @click="closePasswordModal" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="info-group">
            <label>현재 비밀번호</label>
            <input 
              type="password" 
              v-model="passwordData.currentPassword" 
              placeholder="현재 비밀번호를 입력하세요"
            >
          </div>

          <div class="info-group">
            <label>새 비밀번호</label>
            <input 
              type="password" 
              v-model="passwordData.newPassword" 
              placeholder="새 비밀번호를 입력하세요"
            >
          </div>

          <div class="info-group">
            <label>새 비밀번호 확인</label>
            <input 
              type="password" 
              v-model="passwordData.confirmPassword" 
              placeholder="새 비밀번호를 다시 입력하세요"
            >
          </div>

          <div class="button-group">
            <button @click="changePassword" class="btn-primary">변경하기</button>
            <button @click="closePasswordModal" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 회원 탈퇴 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>회원 탈퇴</h2>
          <button @click="closeDeleteModal" class="btn-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="warning-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3>정말로 탈퇴하시겠습니까?</h3>
            <p>회원 탈퇴 시 모든 데이터가 삭제되며, 복구할 수 없습니다.</p>
          </div>

          <div class="info-group">
            <label>비밀번호 확인</label>
            <input 
              type="password" 
              v-model="deleteAccountPassword" 
              placeholder="비밀번호를 입력하세요"
            >
          </div>

          <div class="button-group">
            <button @click="deleteAccount" class="btn-danger">탈퇴하기</button>
            <button @click="closeDeleteModal" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 사용자 정보 (실제로는 API에서 가져와야 함)
const userInfo = reactive({
  employeeNumber: '20001',
  id: 'admin123',
  name: '유저',
  birthdate: '2002-06-26',
  email: 'admin@example.com',
  phone: '010-1234-5678',
  role: '가맹점주',
  photoUrl: '' // 사원 사진 URL
})

// 내 조직 정보 (샘플 데이터)
const myOrgInfo = reactive({
  code: 'SE01',
  type: 'store',
  name: '서울점',
  address: '서울특별시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  area: 150,
  operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  openTime: '09:00',
  closeTime: '22:00',
  photoUrl: ''
})

// 요일 정보
const weekDays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
]

// 원본 정보 백업
const originalUserInfo = { ...userInfo }
const originalOrgInfo = JSON.parse(JSON.stringify(myOrgInfo))

// 편집 모드
const isEditingInfo = ref(false)
const isEditingOrg = ref(false)

// 모달 표시 여부
const showOrgModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)

// 비밀번호 변경 데이터
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 회원 탈퇴 비밀번호 확인
const deleteAccountPassword = ref('')

// 사진 업로드
const uploadPhoto = () => {
  // TODO: 파일 선택 및 업로드 구현
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 미리보기 표시 (실제로는 서버에 업로드 후 URL 받아와야 함)
      const reader = new FileReader()
      reader.onload = (event) => {
        userInfo.photoUrl = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 정보 수정 시작
const startEditInfo = () => {
  isEditingInfo.value = true
}

// 정보 수정 취소
const cancelEditInfo = () => {
  Object.assign(userInfo, originalUserInfo)
  isEditingInfo.value = false
}

// 사용자 정보 저장
const saveUserInfo = async () => {
  try {
    alert('정보가 성공적으로 수정되었습니다.')
    Object.assign(originalUserInfo, userInfo)
    isEditingInfo.value = false
  } catch (error) {
    alert('정보 수정에 실패했습니다.')
    console.error(error)
  }
}

// 조직 정보 수정 시작
const startEditOrg = () => {
  isEditingOrg.value = true
}

// 조직 정보 수정 취소
const cancelEditOrg = () => {
  Object.assign(myOrgInfo, JSON.parse(JSON.stringify(originalOrgInfo)))
  isEditingOrg.value = false
}

// 조직 정보 저장
const saveOrgInfo = async () => {
  try {
    // TODO: API 호출
    alert('조직 정보가 성공적으로 수정되었습니다.')
    Object.assign(originalOrgInfo, JSON.parse(JSON.stringify(myOrgInfo)))
    isEditingOrg.value = false
  } catch (error) {
    alert('조직 정보 수정에 실패했습니다.')
    console.error(error)
  }
}

// 조직 모달 닫기
const closeOrgModal = () => {
  if (isEditingOrg.value) {
    if (!confirm('수정 중인 내용이 있습니다. 정말 닫으시겠습니까?')) {
      return
    }
    cancelEditOrg()
  }
  showOrgModal.value = false
}

// 조직 사진 업로드
const uploadOrgPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        myOrgInfo.photoUrl = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 비밀번호 모달 닫기
const closePasswordModal = () => {
  showPasswordModal.value = false
  // 모달 닫을 때 입력 필드 초기화
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
}

// 비밀번호 변경
const changePassword = async () => {
  // 유효성 검사
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    alert('모든 필드를 입력해주세요.')
    return
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert('새 비밀번호가 일치하지 않습니다.')
    return
  }

  if (passwordData.newPassword.length < 8) {
    alert('비밀번호는 최소 8자 이상이어야 합니다.')
    return
  }

  try {
    // TODO: API 호출로 비밀번호 변경
    // await changeUserPassword(passwordData)
    
    alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.')
    
    // 비밀번호 변경 후 로그아웃 처리
    router.push('/login')
  } catch (error) {
    alert('비밀번호 변경에 실패했습니다.')
    console.error(error)
  }
}

// 회원 탈퇴 모달 닫기
const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteAccountPassword.value = ''
}

// 회원 탈퇴
const deleteAccount = async () => {
  // 비밀번호 확인
  if (!deleteAccountPassword.value) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  // 최종 확인
  if (!confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    return
  }

  try {
    // TODO: API 호출로 회원 탈퇴
    // await deleteUserAccount(deleteAccountPassword.value)
    
    alert('회원 탈퇴가 완료되었습니다.')
    router.push('/login')
  } catch (error) {
    alert('회원 탈퇴에 실패했습니다.')
    console.error(error)
  }
}
</script>

<style scoped>
.mypage-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.mypage-header {
  margin-bottom: 2rem;
}

.mypage-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.full-width {
  grid-column: span 2;
}

/* 사원/조직 사진 섹션 */
.photo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.employee-photo,
.org-photo,
.photo-placeholder {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 3px solid #e2e8f0;
}

/* 사원 사진: 항상 동그라미 */
.employee-photo,
.employee-placeholder {
  border-radius: 50% !important;
}

/* 조직 사진: 항상 네모(라운드) */
.org-photo,
.org-placeholder {
  border-radius: 12px !important;
}

.photo-placeholder {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.btn-upload-photo {
  padding: 0.5rem 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-upload-photo:hover {
  background: #1e293b;
  transform: translateY(-1px);
}


.info-group {
  margin-bottom: 1.25rem;
}

.info-group:last-child {
  margin-bottom: 0;
}

.info-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
}

.info-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.info-group input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-edit,
.btn-primary,
.btn-secondary {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-edit {
  background: #0f172a;
  color: white;
}

.btn-edit:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-primary {
  background: #0f172a;
  color: white;
  flex: 1;
}

.btn-primary:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
  flex: 1;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 요일 칩 스타일 */
.days-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.day-chip {
  padding: 0.5rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  user-select: none;
}

.day-chip.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-chip.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.day-chip input {
  display: none;
}

/* 비밀번호 변경 및 회원 탈퇴 섹션 */
.action-buttons-section {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-change-password,
.btn-org-info,
.btn-delete-account {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 160px;
  justify-content: center;
}

.btn-org-info {
  background: white;
  color: #0f172a;
  border: 1.5px solid #0f172a;
}

.btn-org-info:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
}

.btn-change-password {
  background: #0f172a;
  color: white;
}

.btn-change-password:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.btn-delete-account {
  background: #ef4444;
  color: white;
}

.btn-delete-account:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-close:hover {
  color: #0f172a;
  background: #f8fafc;
}

.modal-body {
  padding: 1.5rem;
}

/* 경고 메시지 스타일 */
.warning-message {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.warning-message svg {
  color: #ef4444;
  margin-bottom: 1rem;
}

.warning-message h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #991b1b;
  margin: 0 0 0.5rem 0;
}

.modal-content.modal-large {
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header .header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-edit-small {
  padding: 0.4rem 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit-small:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.scrollable {
  overflow-y: auto;
  padding: 1.5rem;
}

.no-border {
  border: none !important;
}

.sticky-bottom {
  position: sticky;
  bottom: -1.5rem;
  background: white;
  padding: 1.5rem 0 0 0;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* 위험 버튼 스타일 */
.btn-danger {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #ef4444;
  color: white;
  flex: 1;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}
</style>
