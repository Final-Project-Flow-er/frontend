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
                @input="formatPhoneNumber(userInfo, 'phone')"
                maxlength="13"
              >
              <div v-else class="value-box">{{ userInfo.phone }}</div>
            </div>
            <div class="info-item">
              <label>생년월일</label>
              <div class="value-box">{{ userInfo.birthdate }}</div>
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
              <button @click="openOrgModal" class="action-item">
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
                  <span class="desc">주기적인 비밀번호 변경으로 보안 유지</span>
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
    <div v-if="showOrgModal" class="modal-overlay" @click="handleCloseOrgModal">
      <div class="modal-content modal-fancy" @click.stop>
        <div class="modal-header">
          <h2>내 사업장 정보</h2>
          <div class="modal-header-actions">
            <button v-if="!isEditingOrg" @click="startEditOrg" class="btn-edit-tool">수정</button>
            <button @click="handleCloseOrgModal" class="btn-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="modal-body fancy-scroll" :class="{ 'editing-mode': isEditingOrg }">
          <div class="org-hero">
            <div class="org-hero-text no-avatar">
              <h3 class="org-name-title">{{ myOrgInfo.name }}</h3>
              <span class="org-code-pill">{{ myOrgInfo.code }}</span>
            </div>
          </div>

          <div class="org-form-grid">
            <div class="info-group">
              <label>사업장 이름</label>
              <input v-model="myOrgInfo.name" disabled class="premium-input-small input-locked">
            </div>
            <div class="info-group">
              <label>연락처</label>
              <input 
                v-model="myOrgInfo.phone" 
                :disabled="!isEditingOrg" 
                :class="{ 'input-locked': !isEditingOrg }" 
                class="premium-input-small"
                @input="handleOrgPhoneInput"
                maxlength="13"
              >
            </div>
            <div class="info-group">
              <label>사업자 번호</label>
              <input v-model="myOrgInfo.businessNumber" disabled class="premium-input-small input-locked">
            </div>
            <div class="info-group">
              <label>주소</label>
              <div class="address-input-wrapper">
                <input 
                  v-model="myOrgInfo.address" 
                  :disabled="!isEditingOrg" 
                  :class="{ 'input-locked': !isEditingOrg }" 
                  class="premium-input-small"
                  readonly
                  @click="isEditingOrg && openPostcode()"
                >
                <button v-if="isEditingOrg" @click="openPostcode" class="btn-address-search-mini">조회</button>
              </div>
              <input 
                v-if="isEditingOrg"
                v-model="myOrgInfo.detailAddress" 
                placeholder="상세 주소를 입력하세요" 
                class="premium-input-small"
              >
            </div>

            <!-- 가맹점 전용 -->
            <template v-if="myOrgInfo.type === 'store'">
              <div class="info-group">
                <label>대표자명</label>
                <input v-model="myOrgInfo.representative" disabled class="premium-input-small input-locked">
              </div>
              <div class="info-group">
                <label>지역</label>
                <input :value="regionLabel" disabled class="premium-input-small input-locked">
              </div>
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
              
              <div v-if="!isEditingOrg" class="info-group">
                <label>누적 경고 횟수</label>
                <div class="premium-input-small input-locked warning-text" :class="{ 'critical': myOrgInfo.warningCount >= 3 }">
                  {{ myOrgInfo.warningCount }}
                </div>
              </div>
              <div v-if="!isEditingOrg" class="info-group">
                <label>경고 상태</label>
                <div class="premium-input-small input-locked warning-text" :class="{ 'critical': myOrgInfo.warningCount >= 3 }">
                  {{ myOrgInfo.warningCount >= 3 ? '반품 제한 중' : '정상' }}
                </div>
              </div>
              <div v-if="!isEditingOrg && myOrgInfo.penaltyEndDate" class="info-group">
                <label>반품 제한 종료일</label>
                <div class="premium-input-small input-locked warning-text critical">
                  {{ new Date(myOrgInfo.penaltyEndDate).toLocaleDateString() }}
                </div>
              </div>
            </template>

            <!-- 공장 전용 -->
            <template v-else-if="myOrgInfo.type === 'factory'">
              <div class="info-group">
                <label>공장 대표명</label>
                <input v-model="myOrgInfo.representative" disabled class="premium-input-small input-locked">
              </div>
              <div class="info-group">
                <label>공장 지역</label>
                <input :value="regionLabel" disabled class="premium-input-small input-locked">
              </div>
              <div class="info-group">
                <label>생산 라인 개수</label>
                <input type="number" v-model.number="myOrgInfo.lineCount" :disabled="!isEditingOrg" :class="{ 'input-locked': !isEditingOrg }" class="premium-input-small" min="1" max="9">
              </div>
            </template>

            <!-- 가맹점 사진 관리 (가맹점 전용) -->
            <div v-if="myOrgInfo.type === 'store'" class="info-group full-width">
              <label>매장 사진 (최대 5장)</label>
              <div class="org-photo-manage-container">
                <div class="org-photo-preview-scroll">
                  <!-- 기존 이미지 -->
                  <div v-for="img in myOrgInfo.images" :key="img.storedName" class="org-photo-item">
                    <img :src="img.url" alt="매장 사진" @click="openModal(img.url)" class="clickable-image">
                    <button v-if="isEditingOrg" @click="removeExistingOrgPhoto(img.storedName)" class="btn-remove-mini">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <!-- 새 이미지 미리보기 -->
                  <div v-for="(preview, idx) in orgPreviewImageUrls" :key="'new-'+idx" class="org-photo-item new">
                    <img :src="preview" alt="새 매장 사진" @click="openModal(preview)" class="clickable-image">
                    <button v-if="isEditingOrg" @click="removeNewOrgPhoto(idx)" class="btn-remove-mini">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <!-- 추가 버튼 -->
                  <button v-if="isEditingOrg && (myOrgInfo.images.length + orgPhotoFiles.length < 5)" 
                          @click="uploadOrgPhoto" 
                          class="btn-add-org-photo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
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
              <input type="password" v-model="passwordData.currentPassword" placeholder="현재 비밀번호를 입력하세요" class="premium-input">
            </div>
            <div class="info-group full-width">
              <label>새 비밀번호</label>
              <input type="password" v-model="passwordData.newPassword" placeholder="새 비밀번호를 입력하세요" class="premium-input" :class="{ 'input-error': passwordData.newPassword && !isPasswordValid }">
              <p v-if="passwordData.newPassword && !isPasswordValid" class="validation-msg error">8자 이상, 대소문자, 숫자, 특수문자 포함 필수</p>
            </div>
            <div class="info-group full-width">
              <label>새 비밀번호 확인</label>
              <input type="password" v-model="passwordData.confirmPassword" placeholder="한 번 더 입력하세요" class="premium-input" :class="{ 'input-error': passwordData.confirmPassword && !isPasswordMatch }">
              <p v-if="passwordData.confirmPassword && isPasswordMatch" class="validation-msg success">비밀번호가 일치합니다.</p>
              <p v-if="passwordData.confirmPassword && !isPasswordMatch" class="validation-msg error">비밀번호가 일치하지 않습니다.</p>
            </div>
          </div>
          <div class="modal-footer-actions">
            <button @click="changePassword" class="btn-indigo-primary full" :disabled="!isPasswordValid || !isPasswordMatch || !passwordData.currentPassword">변경 완료</button>
            <button @click="closePasswordModal" class="btn-slate-ghost full">취소</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <div v-if="modalImageUrl" class="image-modal-overlay" @click="closeModal">
      <div class="image-modal-content">
        <button class="btn-close-modal-round" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img :src="modalImageUrl" alt="확대 사진" @click.stop>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 사용자 정보
const userInfo = reactive({
  employeeNumber: '',
  id: '',
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  role: '',
  roleDetail: '', // 권한별 세부 역할 (Position)
  photoUrl: ''
})

// 세부 역할 라벨 (Backend UserPosition Enum과 매핑)
const ROLE_DETAIL_LABELS = {
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

// 권한 라벨 (Backend UserRole Enum과 매핑)
const ROLE_TYPE_LABELS = { 
  ADMIN: '총 관리자', 
  HQ: '본사', 
  FRANCHISE: '가맹점', 
  FACTORY: '공장' 
}

// 지역 라벨 (Backend Region Enum과 매핑)
const REGION_LABELS = {
  SEOUL: '서울',
  GYEONGGI: '경기',
  INCHEON: '인천',
  BUSAN: '부산',
  DAEGU: '대구',
  DAEJEON: '대전',
  GWANGJU: '광주',
  ULSAN: '울산',
  SEJONG: '세종',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  JEONBUK: '전북',
  JEONNAM: '전남',
  GYEONGBUK: '경북',
  GYEONGNAM: '경남',
  JEJU: '제주'
}

const roleTypeLabel = computed(() => ROLE_TYPE_LABELS[userInfo.role] || '')
const roleDisplayName = computed(() => {
  return userInfo.roleDetail ? (ROLE_DETAIL_LABELS[userInfo.roleDetail] || userInfo.roleDetail) : '사용자'
})
const regionLabel = computed(() => REGION_LABELS[myOrgInfo.region] || myOrgInfo.region)

// 유효성 검사 및 포맷팅
const handleOrgPhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.startsWith('02')) {
    if (val.length > 2 && val.length <= 5) {
      val = val.slice(0, 2) + '-' + val.slice(2);
    } else if (val.length > 5 && val.length <= 9) {
      val = val.slice(0, 2) + '-' + val.slice(2, 5) + '-' + val.slice(5);
    } else if (val.length > 9) {
      val = val.slice(0, 2) + '-' + val.slice(2, 6) + '-' + val.slice(6, 10);
    }
  } else {
    if (val.length > 3 && val.length <= 7) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7 && val.length <= 11) {
      val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7);
    } else if (val.length > 11) {
      val = val.slice(0, 3) + '-' + val.slice(3, 8) + '-' + val.slice(8, 12);
    }
  }
  myOrgInfo.phone = val;
}

const formatPhoneNumber = (target, key) => {
  let val = target[key].replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 7) {
    val = val.slice(0, 3) + '-' + val.slice(3);
  } else if (val.length > 7) {
    val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
  }
  target[key] = val;
}

const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !userInfo.email || emailRegex.test(userInfo.email)
})

const isPasswordValid = computed(() => {
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-]).{8,}$/
  return pwdRegex.test(passwordData.newPassword)
})

const isPasswordMatch = computed(() => {
  return passwordData.newPassword === passwordData.confirmPassword
})

// 내 조직 정보
const myOrgInfo = reactive({
  code: '',
  type: '', // 'store' or 'factory' or 'hq'
  name: '',
  address: '',
  phone: '',
  businessNumber: '',
  operatingDays: [],
  openTime: '',
  closeTime: '',
  images: [], // List of { storedName, url }
  representative: '',
  region: '',
  lineCount: 0,
  warningCount: 0,
  penaltyEndDate: null,
  detailAddress: ''
})

const orgPhotoFiles = ref([])
const orgDeleteStoredFileNames = ref([])
const orgPreviewImageUrls = ref([])

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
const modalImageUrl = ref('')

const openModal = (url) => {
  modalImageUrl.value = url
}

const closeModal = () => {
  modalImageUrl.value = ''
}

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const selectedProfileImage = ref(null)

// 데이터 초기화
onMounted(async () => {
  await fetchMyInfo()
})

const fetchMyInfo = async () => {
  try {
    const data = await authStore.getMyInfo()
    if (data) {
      userInfo.employeeNumber = data.employeeNumber
      userInfo.id = data.loginId
      userInfo.name = data.username
      userInfo.email = data.email
      userInfo.phone = data.phone
      if (userInfo.phone) formatPhoneNumber(userInfo, 'phone')
      userInfo.birthdate = data.birthDate
      userInfo.role = data.role
      userInfo.roleDetail = data.position
      userInfo.photoUrl = data.profileImageUrl
    }
  } catch (error) {
    alert('내 정보를 불러오는데 실패했습니다.')
  }
}

const fetchWorkplaceInfo = async () => {
  try {
    const data = await authStore.getMyWorkplaceInfo()
    if (data) {
      myOrgInfo.code = data.code
      myOrgInfo.name = data.name
      myOrgInfo.address = data.address
      myOrgInfo.detailAddress = ''
      myOrgInfo.businessNumber = data.businessNumber
      
      // unitType에 따른 내 사업장 타입 매핑
      if (data.unitType === 'FRANCHISE') {
        myOrgInfo.type = 'store'
      } else if (data.unitType === 'FACTORY') {
        myOrgInfo.type = 'factory'
      } else {
        myOrgInfo.type = 'hq'
      }

      myOrgInfo.representative = data.representativeName
      myOrgInfo.region = data.region
      
      const formatTime = (time) => {
        if (!time) return ''
        if (Array.isArray(time)) {
          return `${String(time[0]).padStart(2, '0')}:${String(time[1]).padStart(2, '0')}`
        }
        if (typeof time === 'string') {
          return time.substring(0, 5)
        }
        return ''
      }

      if (data.franchiseDetail) {
        myOrgInfo.operatingDays = data.franchiseDetail.operatingDays ? data.franchiseDetail.operatingDays.split(',') : []
        myOrgInfo.openTime = formatTime(data.franchiseDetail.openTime)
        myOrgInfo.closeTime = formatTime(data.franchiseDetail.closeTime)
        myOrgInfo.images = data.franchiseDetail.images || []
        myOrgInfo.warningCount = data.franchiseDetail.warningCount || 0
        myOrgInfo.penaltyEndDate = data.franchiseDetail.penaltyEndDate
      } else if (data.factoryDetail) {
        myOrgInfo.lineCount = data.factoryDetail.productionLineCount || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch workplace info:', error)
    alert('사업장 정보를 불러오는데 실패했습니다.')
  }
}

// 상장 정보 모달 열기 시 데이터 조회
const openOrgModal = async () => {
  try {
    await fetchWorkplaceInfo()
    showOrgModal.value = true
  } catch (error) {
    // fetchWorkplaceInfo에서 처리됨
  }
}

// 수정 원본 데이터 (취소용)
let originalUserInfo = {}
let originalOrgInfo = {}

// 정보 수정 시작
const startEditInfo = () => {
  originalUserInfo = JSON.parse(JSON.stringify(userInfo))
  isEditingInfo.value = true
}

// 정보 수정 취소
const cancelEditInfo = () => {
  Object.assign(userInfo, originalUserInfo)
  selectedProfileImage.value = null
  isEditingInfo.value = false
}

// 정보 저장
const saveUserInfo = async () => {
  if (!userInfo.email?.trim() || !userInfo.phone?.trim()) {
    alert('모든 필수 정보를 입력해주세요.')
    return
  }
  if (!isEmailValid.value) {
    alert('올바른 이메일 형식을 입력해주세요.')
    return
  }
  if (userInfo.phone.replace(/[^0-9]/g, '').length !== 11) {
    alert('연락처는 11자리 숫자로 입력해주세요.')
    return
  }
  try {
    // URL에서 파일명만 추출하는 유틸리티
    const getFileName = (url) => {
      if (!url || url.startsWith('data:')) return null
      try {
        const path = new URL(url).pathname
        return path.substring(path.lastIndexOf('/') + 1)
      } catch (e) {
        return url // URL 형식이 아니면 그대로 반환
      }
    }

    const updateData = {
      email: userInfo.email,
      phone: userInfo.phone,
      profileImageUrl: getFileName(userInfo.photoUrl)
    }
    await authStore.updateMyInfo(updateData, selectedProfileImage.value)
    alert('사용자 정보가 저장되었습니다.')
    isEditingInfo.value = false
    selectedProfileImage.value = null
    await fetchMyInfo() // 최신 정보 다시 불러오기
  } catch (error) {
    const errorMsg = error.response?.data?.message || '정보 저장에 실패했습니다.'
    console.error('Save user info failed:', error)
    alert(errorMsg)
  }
}

// 사진 업로드
const uploadPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      selectedProfileImage.value = file
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
  orgPhotoFiles.value = []
  orgDeleteStoredFileNames.value = []
  orgPreviewImageUrls.value = []
  isEditingOrg.value = false
}

// 조직 정보 저장
const saveOrgInfo = async () => {
  if (!myOrgInfo.phone?.trim()) {
    alert('연락처를 입력해주세요.')
    return
  }

  if (myOrgInfo.phone.replace(/[^0-9]/g, '').length < 9) {
    alert('올바른 연락처 형식이 아닙니다.')
    return
  }

  if (myOrgInfo.type === 'store') {
    if (!myOrgInfo.operatingDays || myOrgInfo.operatingDays.length === 0) {
      alert('운영 요일을 최소 하루 이상 선택해주세요.')
      return
    }
    if (!myOrgInfo.openTime || !myOrgInfo.closeTime) {
      alert('운영 시간을 모두 입력해주세요.')
      return
    }
  }

  if (myOrgInfo.type === 'factory') {
    if (!myOrgInfo.lineCount || myOrgInfo.lineCount < 1) {
      alert('생산 라인 개수는 1개 이상이어야 합니다.')
      return
    }
  }

  try {
    const updateData = {
      address: myOrgInfo.detailAddress ? `${myOrgInfo.address} ${myOrgInfo.detailAddress}` : myOrgInfo.address,
      phone: myOrgInfo.phone,
      operatingDays: (myOrgInfo.operatingDays || []).join(','),
      openTime: myOrgInfo.openTime && myOrgInfo.openTime !== '' ? myOrgInfo.openTime + (myOrgInfo.openTime.length === 5 ? ':00' : '') : null,
      closeTime: myOrgInfo.closeTime && myOrgInfo.closeTime !== '' ? myOrgInfo.closeTime + (myOrgInfo.closeTime.length === 5 ? ':00' : '') : null,
      productionLineCount: myOrgInfo.type === 'factory' ? parseInt(myOrgInfo.lineCount) : null
    }
    
    await authStore.updateMyWorkplaceInfo(updateData, orgDeleteStoredFileNames.value, orgPhotoFiles.value)
    
    alert('사업장 정보가 저장되었습니다.')
    isEditingOrg.value = false
    orgPhotoFiles.value = []
    orgDeleteStoredFileNames.value = []
    orgPreviewImageUrls.value = []
    await fetchWorkplaceInfo()
  } catch (error) {
    const errorMsg = error.response?.data?.message || '사업장 정보 저장에 실패했습니다.'
    console.error('Save org info failed:', error)
    alert(errorMsg)
  }
}

// 가맹점 사진 수정 관련 함수
const removeExistingOrgPhoto = (storedName) => {
  if (!orgDeleteStoredFileNames.value.includes(storedName)) {
    orgDeleteStoredFileNames.value.push(storedName)
  }
  myOrgInfo.images = myOrgInfo.images.filter(img => img.storedName !== storedName)
}

const removeNewOrgPhoto = (index) => {
  orgPhotoFiles.value.splice(index, 1)
  orgPreviewImageUrls.value.splice(index, 1)
}

// 사진 업로드 (조직)
const uploadOrgPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    const currentTotal = myOrgInfo.images.length + orgPhotoFiles.value.length
    
    let allowedFiles = files
    if (currentTotal + files.length > 5) {
      alert('매장 사진은 최대 5장까지 등록 가능합니다.')
      allowedFiles = files.slice(0, 5 - currentTotal)
    }

    allowedFiles.forEach(file => {
      orgPhotoFiles.value.push(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        orgPreviewImageUrls.value.push(event.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

const openPostcode = () => {
  const width = 500
  const height = 600
  new window.daum.Postcode({
    oncomplete: (data) => {
      myOrgInfo.address = data.address
    }
  }).open({
    left: (window.screen.width / 2) - (width / 2),
    top: (window.screen.height / 2) - (height / 2)
  })
}

// 모달 닫기
const handleCloseOrgModal = () => {
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

// 비밀번호 변경
const changePassword = async () => {
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    alert('모든 필드를 입력해주세요.')
    return
  }
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert('새 비밀번호가 일치하지 않습니다.')
    return
  }
  
  // 비밀번호 정규식 체크 (백엔드와 동일하게)
  const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-]).{8,}$/
  if (!pwdRegex.test(passwordData.newPassword)) {
    alert('비밀번호는 8자 이상이며, 알파벳 대소문자, 숫자, 특수문자를 모두 포함해야 합니다.')
    return
  }

  if (confirm('비밀번호를 변경하시겠습니까?\n변경 후에는 자동으로 로그아웃됩니다.')) {
    try {
      await authStore.changePassword(passwordData.currentPassword, passwordData.newPassword)
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.')
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      const errorMsg = error.response?.data?.message || '비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.'
      alert(errorMsg)
    }
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
  align-items: center; /* 바의 수직 중앙에 배치 */
  padding: 0;
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
  align-items: center; /* 프로필과 텍스트의 중심을 맞춤 */
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
  margin-top: 15px; /* 요청하신 대로 확실하게 내림 */
}

.user-main {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
  margin-top: 0; /* 불필요한 상단 여백 제거하여 하단 정렬 유지 */
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
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem 2.5rem;
  align-items: start;
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
  margin-top: 1.5rem;
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
  padding: 0.8rem 1.75rem;
  background: #0f172a;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-indigo-primary:hover {
  background: #1e293b;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  transform: translateY(-1px);
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

.modal-compact { width: 480px; } /* 400px -> 480px */
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
  padding-bottom: 4rem; /* 조회 모드에서는 시원하게 */
  overflow-y: auto;
}

.modal-body.editing-mode {
  padding-bottom: 2rem; /* 수정 모드에서는 버튼 공간 확보를 위해 패딩 축소 */
}

.modal-compact .modal-body {
  padding-bottom: 2rem; /* 비밀번호 모달 등 컴팩트 모달 하단 여백 축소 */
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

.info-group-row {
  display: flex;
  gap: 1.5rem;
  grid-column: 1 / -1;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

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

/* 가맹점 사진 관리 스타일 */
.org-photo-manage-container {
  background: white;
  border-radius: 16px;
  padding: 0.5rem 0;
}

.org-photo-preview-scroll {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  padding: 1rem 0.25rem 0.5rem 0.25rem;
}

.org-photo-item {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  overflow: visible;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.org-photo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.org-photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 11px;
}

.clickable-image {
  cursor: pointer;
}

.btn-remove-mini {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 26px;
  height: 26px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  z-index: 10;
  padding: 0;
  transition: all 0.2s;
}

.btn-remove-mini:hover {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
  transform: scale(1.1);
}

.btn-add-org-photo {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-add-org-photo:hover {
  border-color: #0f172a;
  color: #0f172a;
  background: white;
}

/* 이미지 확대 모달 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  object-fit: contain;
}

.btn-close-modal-round {
  position: absolute;
  top: -40px;
  right: 0;
  background: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-close-modal-round:hover {
  transform: scale(1.1);
  background: #f1f5f9;
}

.modal-footer-sticky {
  margin-top: 1rem; /* 간격을 더 좁게 */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
}

.modal-footer-actions {
  margin-top: 2rem;
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
  padding: 0.55rem 1.25rem;
  background: #0f172a;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-indigo-primary-sm:hover {
  background: #1e293b;
  transform: translateY(-1px);
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

/* 유효성 검사 스타일 */
.validation-msg {
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: 600;
}
.validation-msg.error { color: #ef4444; }
.validation-msg.success { color: #10b981; }

.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
}

.address-input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0;
}

.address-input-wrapper + .premium-input-small {
  margin-top: -0.2rem;
}

.btn-address-search-mini {
  padding: 0 0.75rem;
  background: #0f172a;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
