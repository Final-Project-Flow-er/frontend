<template>
  <div class="org-detail-container">
    <!-- 헤더 -->
    <div class="detail-header">
      <button @click="goBack" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
        목록으로
      </button>

      <div class="header-actions">
        <button v-if="!isEditing" @click="startEdit" class="btn-edit">
          수정
        </button>
        <template v-else>
          <button @click="saveChanges" class="btn-save">저장</button>
          <button @click="cancelEdit" class="btn-cancel">취소</button>
        </template>
      </div>
    </div>

    <!-- 조직 정보 카드 -->
    <div v-if="organization" class="detail-card">
      <div class="card-header">
        <div class="header-left">
          <div class="org-type-badge" :class="organization.type">
            {{ getOrgTypeLabel(organization.type) }}
          </div>
          <h1>{{ organization.name }}</h1>
        </div>
        <div class="org-code-large">{{ organization.code }}</div>
      </div>

      <div class="card-body">
        <!-- 기본 정보 -->
        <section class="info-section">
          <h2>기본 정보</h2>
          <div class="info-grid">
            <div class="info-field">
              <label>{{ getOrgNameLabel(organization.type) }}</label>
              <input 
                type="text" 
                v-model="organization.name" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>코드</label>
              <input 
                type="text" 
                :value="organization.code" 
                disabled 
                class="input-disabled"
              >
            </div>

            <div class="info-field full-width">
              <label>주소</label>
              <input 
                type="text" 
                v-model="organization.address" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>전화번호</label>
              <input 
                type="tel" 
                v-model="organization.phone" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>
          </div>
        </section>

        <!-- 가맹점 추가 정보 -->
        <section v-if="organization.type === 'store'" class="info-section">
          <h2>매장 정보</h2>
          <div class="info-grid">

            <div class="info-field">
              <label>운영 시작 시간</label>
              <input 
                type="time" 
                v-model="organization.openTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>운영 종료 시간</label>
              <input 
                type="time" 
                v-model="organization.closeTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field full-width">
              <label>운영 요일</label>
              <div v-if="!isEditing" class="days-display">
                <span v-for="day in organization.operatingDays" :key="day" class="day-tag">
                  {{ getDayLabel(day) }}
                </span>
              </div>
              <div v-else class="days-selector">
                <label v-for="day in weekDays" :key="day.value" class="day-checkbox">
                  <input 
                    type="checkbox" 
                    :value="day.value" 
                    v-model="organization.operatingDays"
                  >
                  <span>{{ day.label }}</span>
                </label>
              </div>
            </div>

            <div class="info-field full-width">
              <label>매장 사진</label>
              <div class="photo-section">
                <div v-if="organization.photoUrl" class="photo-display">
                  <img :src="organization.photoUrl" alt="매장 사진">
                  <button v-if="isEditing" @click="removePhoto" class="btn-remove-photo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <button v-else-if="isEditing" @click="uploadPhoto" class="btn-upload-photo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  사진 업로드
                </button>
                <p v-else class="no-photo">등록된 사진이 없습니다</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 공장 추가 정보 -->
        <section v-if="organization.type === 'factory'" class="info-section">
          <h2>공장 정보</h2>
          <div class="info-grid">
            <div class="info-field">
              <label>공장 대표명</label>
              <input 
                type="text" 
                v-model="organization.representative" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>공장 지역</label>
              <select 
                v-model="organization.region" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
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

            <div class="info-field">
              <label>생산 라인 개수</label>
              <input 
                type="number" 
                v-model.number="organization.lineCount" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                min="1"
                max="9"
              >
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else class="loading">
      <p>조직 정보를 불러오는 중...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 조직 정보
const organization = ref(null)
const originalOrganization = ref(null)
const isEditing = ref(false)

// 요일 목록
const weekDays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
]

// 요일 라벨 가져오기
const getDayLabel = (value) => {
  const day = weekDays.find(d => d.value === value)
  return day ? day.label : value
}

const getOrgTypeLabel = (type) => {
  const map = {
    headOffice: '본사',
    store: '가맹점',
    factory: '공장'
  }
  return map[type] || '사업장'
}

// 조직 정보 로드
const loadOrganization = () => {
  const code = route.params.code
  
  // TODO: API 호출로 조직 정보 가져오기
  // TODO: API 호출로 조직 정보 가져오기
  // 샘플 데이터
  const sampleData = {
    'HEAD': {
      code: 'HEAD',
      type: 'headOffice',
      name: '본사',
      address: '서울특별시 강남구 테헤란로 1',
      phone: '02-0000-0000',
      photoUrl: ''
    },
    'SE01': {
      code: 'SE01',
      type: 'store',
      name: '서울점',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      openTime: '09:00',
      closeTime: '22:00',
      photoUrl: ''
    },
    'SE02': {
      code: 'SE02',
      type: 'store',
      name: '부산점',
      address: '부산광역시 해운대구 센텀중앙로 78',
      phone: '051-9876-5432',
      operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      openTime: '10:00',
      closeTime: '21:00',
      photoUrl: ''
    },
    'FA01': {
      code: 'FA01',
      type: 'factory',
      name: '중앙 생산 공장',
      address: '경기도 화성시 동탄산업1로 45',
      phone: '031-5555-6666',
      representative: '김철수',
      region: 'GG01',
      lineCount: 5
    },
    'SE03': {
      code: 'SE03',
      type: 'store',
      name: '대구점',
      address: '대구광역시 수성구 동대구로 456',
      phone: '053-7777-8888',
      operatingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      openTime: '08:00',
      closeTime: '23:00',
      photoUrl: ''
    }
  }

  organization.value = sampleData[code]
  if (organization.value) {
    originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
  }
}

// 수정 시작
const startEdit = () => {
  isEditing.value = true
}

// 수정 취소
const cancelEdit = () => {
  organization.value = JSON.parse(JSON.stringify(originalOrganization.value))
  isEditing.value = false
}

// 변경사항 저장
const saveChanges = () => {
  // TODO: API 호출로 조직 정보 업데이트
  console.log('Updated organization:', organization.value)
  
  alert('변경사항이 저장되었습니다.')
  originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
  isEditing.value = false
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
        organization.value.photoUrl = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 사진 제거
const removePhoto = () => {
  organization.value.photoUrl = ''
}

// 목록으로 돌아가기
const goBack = () => {
  router.push('/organizations')
}

onMounted(() => {
  loadOrganization()
})

const getOrgNameLabel = (type) => {
  if (type === 'store') return '가맹점명'
  if (type === 'factory') return '공장명'
  if (type === 'headOffice') return '본사명'
  return '사업장명'
}
</script>

<style scoped>
.org-detail-container {
  padding: 1rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* 헤더 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit,
.btn-save,
.btn-cancel {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
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

.btn-save {
  background: #0f172a;
  color: white;
}

.btn-save:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.btn-cancel {
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 상세 카드 */
.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1.5px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.org-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.org-type-badge.store {
  background: #dbeafe;
  color: #1e40af;
}

.org-type-badge.factory {
  background: #fef3c7;
  color: #92400e;
}

.org-type-badge.headOffice {
  background: #dcfce7;
  color: #166534;
}

.card-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.org-code-large {
  font-size: 1.2rem;
  font-weight: 700;
  color: #64748b;
  font-family: monospace;
}

.card-body {
  padding: 1.5rem;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 2.5rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-field.full-width {
  grid-column: 1 / -1;
}

.info-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.info-field input,
.info-field select {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
  height: 40px;
  box-sizing: border-box;
}

.info-field input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8;
  cursor: not-allowed;
}

/* 요일 표시 */
.days-display {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-tag {
  padding: 0.35rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
}

.days-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border: 1.2px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  font-size: 0.8rem;
}

.day-checkbox:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.day-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 14px;
  height: 14px;
}

.day-checkbox input[type="checkbox"]:checked + span {
  color: #0f172a;
  font-weight: 700;
}

/* 사진 섹션 */
.photo-section {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-display {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.photo-display img {
  width: 100%;
  max-width: 320px;
  height: auto;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.btn-remove-photo {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 36px;
  height: 36px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-photo:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.btn-upload-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-upload-photo:hover {
  border-color: #0f172a;
  background: white;
  color: #0f172a;
}

.no-photo {
  color: #94a3b8;
  font-size: 0.9rem;
  margin: 0;
}

/* 로딩 */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions button {
    flex: 1;
  }
}
</style>
