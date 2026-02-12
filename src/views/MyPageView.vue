<template>
  <div class="mypage-dashboard">
    <!-- 상단 프로필 히어로 섹션 -->
    <header class="profile-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="profile-avatar-wrapper">
          <div class="avatar-container">
            <img 
              v-if="userInfo.photoUrl" 
              :src="userInfo.photoUrl" 
              alt="프로필 사진"
              class="avatar-image"
            >
            <div v-else class="avatar-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <button v-if="isEditingInfo" class="avatar-edit-btn" @click="uploadPhoto" title="사진 변경">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="hero-user-info">
          <div class="user-main">
            <h1 class="user-name">{{ userInfo.name }}</h1>
            <span class="user-role-pill" v-if="roleTypeLabel || roleDisplayName">
              <span class="user-role-type">{{ roleTypeLabel }}</span>
              <span class="user-role-sep" v-if="roleTypeLabel && roleDisplayName"> · </span>
              <span class="user-role-detail">{{ roleDisplayName }}</span>
            </span>
          </div>
          <p class="user-id">@{{ userInfo.id }}</p>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <!-- 상세 정보 그리드 -->
      <section class="dashboard-grid">
        <div class="info-card basic-info">
          <div class="card-header-row">
            <div class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h3>기본 정보</h3>
            </div>
            
            <div class="card-actions-wrapper">
              <button v-if="!isEditingInfo" @click="startEditInfo" class="btn-edit-pencil">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                프로필 수정
              </button>
              <div v-else class="edit-actions-group">
                <button @click="saveUserInfo" class="btn-indigo-primary-sm">저장</button>
                <button @click="cancelEditInfo" class="btn-slate-ghost-sm">취소</button>
              </div>
            </div>
          </div>
          
          <div class="info-fields-grid">
            <div class="info-item">
              <label>사원번호</label>
              <div class="value-box">{{ userInfo.employeeNumber }}</div>
            </div>
            <div class="info-item">
              <label>아이디</label>
              <div class="value-box">{{ userInfo.id }}</div>
            </div>
            <div class="info-item">
              <label>이메일 주소</label>
              <input 
                v-if="isEditingInfo"
                type="email" 
                v-model="userInfo.email" 
                class="premium-input"
              >
              <div v-else class="value-box">{{ userInfo.email }}</div>
            </div>
            <div class="info-item">
              <label>연락처</label>
              <input 
                v-if="isEditingInfo"
                type="tel" 
                v-model="userInfo.phone" 
                class="premium-input"
              >
              <div v-else class="value-box">{{ userInfo.phone }}</div>
            </div>
            <div class="info-item">
              <label>생년월일</label>
              <div class="value-box">{{ userInfo.birthdate }}</div>
            </div>
            <div class="info-item">
              <label>권한</label>
              <div class="value-box">{{ roleTypeLabel }}</div>
            </div>
            <div class="info-item">
              <label>역할</label>
              <div class="value-box">{{ roleDisplayName }}</div>
            </div>
          </div>
        </div>

        <!-- 액션 메뉴 (우측) -->
        <div class="settings-menu">
          <div class="info-card">
            <div class="card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <h3>계정 설정</h3>
            </div>
            
            <div class="action-list">
              <button @click="showOrgModal = true" class="action-item">
                <div class="action-icon store">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <path d="M3 9h18"></path>
                  </svg>
                </div>
                <div class="action-text">
                  <span class="label">내 사업장 정보</span>
                  <span class="desc">가맹점 또는 공장 정보 조회 및 수정</span>
                </div>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button @click="showPasswordModal = true" class="action-item">
                <div class="action-icon password">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <div class="action-text">
                  <span class="label">비밀번호 변경</span>
                  <span class="desc">주기적인 비번 변경으로 보안 유지</span>
                </div>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <button @click="showDeleteModal = true" class="action-item danger">
                <div class="action-icon delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </div>
                <div class="action-text">
                  <span class="label">회원 탈퇴</span>
                  <span class="desc">계정 영구 삭제 및 데이터 폐기</span>
                </div>
                <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 모달: 내 조직 정보 -->
    <div v-if="showOrgModal" class="modal-overlay" @click="closeOrgModal">
      <div class="modal-content modal-fancy" @click.stop>
        <div class="modal-header">
          <h2>내 사업장 정보</h2>
          <div class="modal-header-actions">
            <button v-if="!isEditingOrg" @click="startEditOrg" class="btn-edit-tool">수정</button>
            <button @click="closeOrgModal" class="btn-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body fancy-scroll">
          <div class="org-hero">
            <div class="org-avatar-big">
              <img v-if="myOrgInfo.photoUrl" :src="myOrgInfo.photoUrl" alt="조직 사진">
              <div v-else class="org-placeholder-big">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M3 9h18"></path>
                </svg>
              </div>
              <button v-if="isEditingOrg" class="avatar-edit-btn small" @click="uploadOrgPhoto">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>
            <div class="org-hero-text">
              <h3 class="org-name-title">{{ myOrgInfo.name }}</h3>
              <span class="org-code-pill">{{ myOrgInfo.code }}</span>
            </div>
          </div>

          <div class="org-form-grid">
            <div class="info-group">
              <label>사업장 이름</label>
              <input v-model="myOrgInfo.name" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
            </div>
            <div class="info-group">
              <label>연락처</label>
              <input v-model="myOrgInfo.phone" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
            </div>
            <div class="info-group full-width">
              <label>주소</label>
              <input v-model="myOrgInfo.address" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
            </div>

            <!-- 가맹점 전용 -->
            <template v-if="myOrgInfo.type === 'store'">
              <div class="info-group full-width">
                <label>운영 요일</label>
                <div class="fancy-days-chips">
                  <label v-for="day in weekDays" :key="day.value" class="fancy-day-chip" :class="{ active: myOrgInfo.operatingDays.includes(day.value), disabled: !isEditingOrg }">
                    <input type="checkbox" :value="day.value" v-model="myOrgInfo.operatingDays" :disabled="!isEditingOrg">
                    <span>{{ day.label }}</span>
                  </label>
                </div>
              </div>
              <div class="info-group">
                <label>오픈 시간</label>
                <input type="time" v-model="myOrgInfo.openTime" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
              </div>
              <div class="info-group">
                <label>마감 시간</label>
                <input type="time" v-model="myOrgInfo.closeTime" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
              </div>
            </template>

            <!-- 공장 전용 -->
            <template v-else-if="myOrgInfo.type === 'factory'">
              <div class="info-group">
                <label>공장 대표명</label>
                <input v-model="myOrgInfo.representative" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small">
              </div>
              <div class="info-group">
                <label>공장 지역</label>
                <select v-model="myOrgInfo.region" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-select-small">
                  <option value="SE01">서울</option>
                  <option value="GG01">경기</option>
                  <option value="IC01">인천</option>
                  <option value="BS01">부산</option>
                  <option value="DG01">대구</option>
                  <option value="DJ01">대전</option>
                  <option value="GJ01">광주</option>
                  <option value="UL01">울산</option>
                  <option value="SJ01">세종</option>
                  <option value="GW01">강원</option>
                  <option value="CB01">충북</option>
                  <option value="CN01">충남</option>
                  <option value="JB01">전북</option>
                  <option value="JN01">전남</option>
                  <option value="GB01">경북</option>
                  <option value="GN01">경남</option>
                  <option value="JJ01">제주</option>
                </select>
              </div>
              <div class="info-group">
                <label>생산 라인 개수</label>
                <input type="number" v-model.number="myOrgInfo.lineCount" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small" min="1" max="9">
              </div>
            </template>
          </div>

          <div v-if="isEditingOrg" class="modal-footer-sticky">
            <button @click="saveOrgInfo" class="btn-indigo-primary">저장하기</button>
            <button @click="cancelEditOrg" class="btn-slate-ghost">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달: 비밀번호 변경 -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content modal-compact" @click.stop>
        <div class="modal-header">
          <h2>비밀번호 변경</h2>
          <button @click="closePasswordModal" class="btn-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="org-form-grid">
            <div class="info-group full-width">
              <label>현재 비밀번호</label>
              <input type="password" v-model="passwordData.currentPassword" placeholder="현재 비번을 입력하세요" class="premium-input">
            </div>
            <div class="info-group full-width">
              <label>새 비밀번호</label>
              <input type="password" v-model="passwordData.newPassword" placeholder="새 비번을 입력하세요" class="premium-input">
            </div>
            <div class="info-group full-width">
              <label>새 비밀번호 확인</label>
              <input type="password" v-model="passwordData.confirmPassword" placeholder="한 번 더 입력하세요" class="premium-input">
            </div>
          </div>
          <div class="modal-footer-actions">
            <button @click="changePassword" class="btn-indigo-primary full">변경 완료</button>
            <button @click="closePasswordModal" class="btn-slate-ghost full">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 모달: 회원 탈퇴 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-compact" @click.stop>
        <div class="modal-body danger-zone">
          <div class="danger-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h3>회원 탈퇴</h3>
          <p>정말로 탈퇴하시겠습니까?<br>탈퇴 시 모든 정보가 <strong>즉시 삭제</strong>되며 복구할 수 없습니다.</p>
          
          <div class="info-group full-width mb-6">
            <label>비밀번호 확인</label>
            <input type="password" v-model="deleteAccountPassword" placeholder="비밀번호를 입력하세요" class="premium-input danger full-width">
          </div>

          <div class="danger-actions">
            <button @click="deleteAccount" class="btn-danger-primary">탈퇴하기</button>
            <button @click="closeDeleteModal" class="btn-slate-ghost">취소</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 사용자 정보
const userInfo = reactive({
  employeeNumber: '20001',
  id: 'admin123',
  name: '유저',
  email: 'admin@example.com',
  phone: '010-1234-5678',
  birthdate: '2002-06-26',
  role: 'franchise',
  roleDetail: 'fr_owner', // 권한별 세부 역할
  photoUrl: ''
})

// 세부 역할 라벨 (마이페이지 표시용)
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

// 권한 라벨 (본사/가맹점/공장) - 이름 밑에 표시
const ROLE_TYPE_LABELS = { hq: '본사', franchise: '가맹점', factory: '공장' }
const roleTypeLabel = computed(() => ROLE_TYPE_LABELS[userInfo.role] || '')

const roleDisplayName = computed(() => {
  return userInfo.roleDetail ? ROLE_DETAIL_LABELS[userInfo.roleDetail] : '사용자'
})

// 내 조직 정보
const myOrgInfo = reactive({
  code: 'SE01',
  type: 'store',
  name: '서울점',
  address: '서울특별시 강남구 테헤란로 123',
  phone: '02-1234-5678',
  operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  openTime: '09:00',
  closeTime: '22:00',
  photoUrl: '',
  representative: '',
  region: 'UL01',
  lineCount: 1
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

// 상태 관리
const isEditingInfo = ref(false)
const isEditingOrg = ref(false)
const showOrgModal = ref(false)
const showPasswordModal = ref(false)
const showDeleteModal = ref(false)

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const deleteAccountPassword = ref('')

// 수정 원본 데이터 (취소용)
let originalUserInfo = {}
let originalOrgInfo = {}

// 정보 수정 시작
const startEditInfo = () => {
  originalUserInfo = { ...userInfo }
  isEditingInfo.value = true
}

// 정보 수정 취소
const cancelEditInfo = () => {
  Object.assign(userInfo, originalUserInfo)
  isEditingInfo.value = false
}

// 정보 저장
const saveUserInfo = () => {
  alert('사용자 정보가 저장되었습니다.')
  isEditingInfo.value = false
}

// 사진 업로드
const uploadPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        userInfo.photoUrl = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 조직 정보 수정 시작
const startEditOrg = () => {
  originalOrgInfo = JSON.parse(JSON.stringify(myOrgInfo))
  isEditingOrg.value = true
}

// 조직 정보 수정 취소
const cancelEditOrg = () => {
  Object.assign(myOrgInfo, originalOrgInfo)
  isEditingOrg.value = false
}

// 조직 정보 저장
const saveOrgInfo = () => {
  alert('사업장 정보가 저장되었습니다.')
  isEditingOrg.value = false
}

// 사진 업로드 (조직)
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

// 모달 닫기
const closeOrgModal = () => {
  if (isEditingOrg.value) {
    if (confirm('수정 중인 내용이 사라집니다. 닫으시겠습니까?')) {
      cancelEditOrg()
      showOrgModal.value = false
    }
  } else {
    showOrgModal.value = false
  }
}

const closePasswordModal = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmPassword = ''
  showPasswordModal.value = false
}

const closeDeleteModal = () => {
  deleteAccountPassword.value = ''
  showDeleteModal.value = false
}

// 비밀번호 변경
const changePassword = () => {
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    alert('모든 필드를 입력해주세요.')
    return
  }
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert('새 비밀번호가 일치하지 않습니다.')
    return
  }
  
  if (confirm('비밀번호를 변경하시겠습니까?\n변경 후에는 자동으로 로그아웃됩니다.')) {
    alert('비밀번호가 성공적으로 변경되었습니다.')
    router.push('/login')
  }
}

// 회원 탈퇴
const deleteAccount = () => {
  if (!deleteAccountPassword.value) {
    alert('비밀번호를 입력해주세요.')
    return
  }
  
  if (confirm('정말로 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
    alert('그동안 이용해 주셔서 감사합니다.')
    router.push('/login')
  }
}
</script>

<style scoped>
/* 폰트 상속 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.mypage-dashboard {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  height: 100vh;
  overflow: hidden;
  background-color: #f8fafc;
  color: #1e293b;
  padding-bottom: 0;
}

/* 프로필 히어로 섹션 */
.profile-hero {
  position: relative;
  height: 180px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: flex-end;
  padding: 0 0 2rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
  opacity: 0.1;
}

.hero-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.profile-avatar-wrapper {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  background: white;
  border: 4px solid #334155;
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}

.avatar-placeholder {
  color: #94a3b8;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  background: #0f172a;
  color: white;
  border: 3px solid #1e293b;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
  background: #3b82f6;
  border-color: #1e293b;
}

.avatar-edit-btn.small {
  width: 28px;
  height: 28px;
  border-width: 3px;
  border-radius: 10px;
  bottom: -5px;
  right: -5px;
}

.hero-user-info {
  flex: 1;
}

.user-main {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.hero-actions-inline {
  margin-left: 0.5rem;
}

.hero-edit-actions-inline {
  display: flex;
  gap: 0.5rem;
}

.btn-premium-outline-sm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-premium-outline-sm:hover {
  background: white;
  color: #0f172a;
}

.btn-premium-primary-sm {
  padding: 0.4rem 1rem;
  background: #3b82f6;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-premium-ghost-sm {
  padding: 0.4rem 1rem;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.user-name {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin: 0;
  letter-spacing: -0.02em;
}

/* 이름 옆 타원형 배지 (권한 · 역할) */
.user-role-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
}

.user-role-pill .user-role-type {
  color: rgba(255, 255, 255, 0.85);
}

.user-role-pill .user-role-sep {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}

.user-role-pill .user-role-detail {
  font-weight: 600;
  color: white;
}

/* 대시보드 콘텐츠 */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 2rem;
  align-items: start;
}

.info-card {
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.card-title svg {
  color: #64748b;
}

.card-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

/* 입력 필드 섹션 */
.info-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value-box {
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s;
  min-height: 24px;
}


.premium-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  transition: all 0.2s;
  box-sizing: border-box;
}

.premium-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* 셋팅 메뉴 리스트 */
.settings-menu .info-card {
  padding: 1.5rem;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  padding: 1.15rem;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
}

.action-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  transform: translateX(4px);
}

.action-item.danger:hover {
  background: #fff1f2;
  border-color: #fecaca;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.store { background: #eff6ff; color: #3b82f6; }
.action-icon.password { background: #f0fdf4; color: #10b981; }
.action-icon.delete { background: #fff1f2; color: #ef4444; }

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-text .label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.action-text .desc {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  margin-top: 0.1rem;
}

.chevron {
  color: #cbd5e1;
  transition: all 0.2s;
}

.action-item:hover .chevron {
  color: #64748b;
  transform: translateX(2px);
}

/* 버튼 스타일 정밀화 */
.btn-indigo-primary {
  padding: 0.7rem 1.5rem;
  background: #4f46e5;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-indigo-primary:hover {
  background: #4338ca;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.btn-indigo-primary.full { width: 100%; }

.btn-slate-ghost {
  padding: 0.7rem 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-slate-ghost:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-slate-ghost.full { width: 100%; }

.btn-danger-primary {
  padding: 0.8rem 1.5rem;
  background: #ef4444;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-danger-primary:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.mb-6 { margin-bottom: 2rem !important; }
.full-width { width: 100%; }
.premium-input.full-width { width: 100%; }

/* 모달 애니메이션 및 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-compact { width: 400px; }
.modal-fancy { width: 600px; }

.modal-header {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.modal-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-edit-tool {
  padding: 0.4rem 0.9rem;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.btn-modal-close {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-close:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.fancy-scroll::-webkit-scrollbar {
  width: 6px;
}
.fancy-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* 조직 정보 모달 전용 */
.org-hero {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
}

.org-avatar-big {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.org-avatar-big img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 18px;
}

.org-placeholder-big {
  color: #cbd5e1;
}

.org-name-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.org-code-pill {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.3rem 0.75rem;
  background: #f1f5f9;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  font-family: monospace;
}

.org-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem 1.5rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group.full-width {
  grid-column: 1 / -1;
}

.info-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
}

.fancy-days-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.fancy-day-chip {
  padding: 0.4rem 0.95rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.fancy-day-chip.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.fancy-day-chip.disabled {
  cursor: default;
  opacity: 0.8;
}

.fancy-day-chip input {
  display: none;
}

.modal-footer-sticky {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  padding-bottom: 1.5rem; /* Added padding */
}

.modal-footer-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 위험 구역 */
.danger-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 2rem !important;
}

.danger-icon {
  width: 80px;
  height: 80px;
  background: #fff1f2;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.danger-zone h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.danger-zone p {
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 2rem;
}

.danger-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 추가 유틸리티 */
.premium-input-small {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  box-sizing: border-box;
}

.premium-select-small {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  background: white;
  height: 48px;
  box-sizing: border-box;
}

.input-locked {
  background: #f8fafc;
  border-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

/* 공통 반응형 */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-hero {
    height: auto;
    padding: 2rem;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .user-main {
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .info-fields-grid {
    grid-template-columns: 1fr;
  }
  
  .org-form-grid {
    grid-template-columns: 1fr;
  }
}

/* 애니메이션 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-card {
  animation: fadeInUp 0.4s ease-out forwards;
}

.settings-menu {
  animation: fadeInUp 0.4s ease-out 0.1s forwards;
  opacity: 0;
}

/* 카드 헤더 스타일 */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0;
}

/* 수정/저장 버튼 스타일 */
.btn-edit-pencil {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit-pencil:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.edit-actions-group {
  display: flex;
  gap: 0.5rem;
}

.btn-indigo-primary-sm {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-indigo-primary-sm:hover {
  background: #4338ca;
}

.btn-slate-ghost-sm {
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-slate-ghost-sm:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* 히어로 스타일 정리 */
.hero-user-info .user-main { gap: 1rem; }
.hero-user-info .user-id { margin-top: 0.25rem; font-size: 0.95rem; opacity: 0.8; }
</style>
