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

      <div v-if="organization" class="header-actions">
        <template v-if="!isEditing">
          <button @click="startEdit" class="btn-edit">수정</button>
          <template v-if="organization.unitType !== 'HQ'">
            <button v-if="isOrgActive" @click="confirmStatusToggle" class="btn-deactivate">운영중지</button>
            <button v-else-if="organization.status === 'INACTIVE'" @click="confirmStatusToggle" class="btn-restore">운영재개</button>
            <button v-if="organization.status !== 'DELETED'" @click="confirmDelete" class="btn-delete">삭제</button>
          </template>
        </template>
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
          <div class="org-type-badge" :class="organization.unitType">
            {{ getOrgTypeLabel(organization.unitType) }}
          </div>
          <div class="status-badge" :class="organization.status || 'ACTIVE'">
            {{ getStatusLabel(organization.status) }}
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
              <label>{{ getOrgNameLabel(organization.unitType) }}</label>
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
              <div class="address-input-group">
                <input 
                  type="text" 
                  v-model="organization.address" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                  placeholder="주소를 검색하세요"
                  readonly
                  @click="isEditing && openPostcode()"
                >
                <button v-if="isEditing" type="button" @click="openPostcode" class="btn-address-search">주소 검색</button>
              </div>
            </div>

            <div class="info-field">
              <label>전화번호</label>
              <input 
                type="tel" 
                v-model="organization.phone" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                @input="handlePhoneInput"
                maxlength="13"
              >
            </div>

            <div class="info-field">
              <label>대표명</label>
              <input 
                type="text" 
                v-model="organization.representativeName" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                :placeholder="getOrgTypeLabel(organization.unitType) + ' 대표명을 입력하세요'"
              >
            </div>

            <div class="info-field">
              <label>사업자 등록 번호</label>
              <input 
                type="text" 
                :value="organization.businessNumber" 
                disabled
                class="input-disabled"
              >
            </div>

            <div class="info-field">
              <label>지역</label>
              <select v-model="organization.region" :disabled="!isEditing" :class="{ 'input-disabled': !isEditing }">
                <option value="SEOUL">서울</option>
                <option value="GYEONGGI">경기</option>
                <option value="INCHEON">인천</option>
                <option value="BUSAN">부산</option>
                <option value="DAEGU">대구</option>
                <option value="DAEJEON">대전</option>
                <option value="GWANGJU">광주</option>
                <option value="ULSAN">울산</option>
                <option value="SEJONG">세종</option>
                <option value="GANGWON">강원</option>
                <option value="CHUNGBUK">충북</option>
                <option value="CHUNGNAM">충남</option>
                <option value="JEONBUK">전북</option>
                <option value="JEONNAM">전남</option>
                <option value="GYEONGBUK">경북</option>
                <option value="GYEONGNAM">경남</option>
                <option value="JEJU">제주</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 가맹점 추가 정보 -->
        <section v-if="organization.unitType === 'FRANCHISE'" class="info-section">
          <h2>매장 정보</h2>
          <div class="info-grid">

            <div class="info-field">
              <label>운영 시작 시간</label>
              <input 
                type="time" 
                v-model="organization.franchiseDetail.openTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>운영 종료 시간</label>
              <input 
                type="time" 
                v-model="organization.franchiseDetail.closeTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field full-width">
              <label>운영 요일</label>
              <div class="days-container">
                <div v-if="!isEditing" class="days-readonly">
                  <span v-for="day in weekDays" :key="day.value" 
                        class="day-box" 
                        :class="{ active: organization.franchiseDetail && (organization.franchiseDetail.operatingDays || '').split(',').includes(day.value) }">
                    {{ day.label }}
                  </span>
                </div>
                <div v-else class="days-interactive">
                  <label v-for="day in weekDays" :key="day.value" 
                         class="day-check-box"
                         :class="{ checked: tempOperatingDays.includes(day.value) }">
                    <input 
                      type="checkbox" 
                      :value="day.value" 
                      v-model="tempOperatingDays"
                    >
                    <span>{{ day.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="info-field full-width">
              <label>매장 사진</label>
              <div class="photo-section">
                <div v-if="organization.franchiseDetail.imageUrl" class="photo-display">
                  <img :src="organization.franchiseDetail.imageUrl" alt="매장 사진">
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

        <!-- 경고 및 제한 상태 (가맹점 전용) -->
        <section v-if="organization.unitType === 'FRANCHISE'" class="info-section warning-section">
          <h2>경고 및 반품 제한 상태</h2>
          <div class="warning-status-card" :class="{ 'is-restricted': organization.franchiseDetail.warningCount >= 3 }">
            <div class="warning-info">
              <div class="warning-label">누적 경고 횟수</div>
              <div class="warning-value">
                <span class="count">{{ organization.franchiseDetail.warningCount || 0 }}</span>
                <span class="total">/ 3</span>
              </div>
            </div>
            <div class="restriction-status">
              <div class="status-icon">
                <svg v-if="organization.franchiseDetail.warningCount < 3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="status-texts">
                <div class="status-title">{{ organization.franchiseDetail.warningCount >= 3 ? '반품 제한 적용 중' : '정상 운영 중' }}</div>
                <p class="status-desc">
                  {{ organization.franchiseDetail.warningCount >= 3 
                    ? '경고 3회 누적으로 인해 현재 반품 신청이 제한된 상태입니다.' 
                    : '현재 반품 신청에 제한이 없습니다. 경고 3회 누적 시 제한이 적용됩니다.' }}
                </p>
                <div v-if="organization.franchiseDetail.warningCount >= 3 && organization.franchiseDetail.penaltyEndDate" class="restriction-timer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>제한 종료 예정일: <strong>{{ new Date(organization.franchiseDetail.penaltyEndDate).toLocaleDateString() }}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 공장 추가 정보 -->
        <section v-if="organization.unitType === 'FACTORY'" class="info-section">
          <h2>공장 정보</h2>
          <div class="info-grid">
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
                v-model.number="organization.factoryDetail.productionLineCount" 
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

// 조직 정보
const organization = ref(null)
const originalOrganization = ref(null)
const isEditing = ref(false)
const tempOperatingDays = ref([])

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

const getStatusLabel = (status) => {
  switch(status) {
    case 'ACTIVE': return '운영중'
    case 'INACTIVE': return '운영중지'
    case 'DELETED': return '삭제'
    default: return '운영중'
  }
}

const isOrgActive = computed(() => {
  return !organization.value || organization.value.status === 'ACTIVE'
})

// 조직 정보 로드
const loadOrganization = async () => {
  const type = route.params.type
  const id = route.params.id
  
  try {
    const response = await api.get(`/hq/business-units/${type}/${id}`)
    if (response.data.success) {
      organization.value = response.data.data
      originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
      if (organization.value.franchiseDetail) {
        tempOperatingDays.value = (organization.value.franchiseDetail.operatingDays || '').split(',').filter(d => d)
      }
    }
  } catch (error) {
    console.error('조직 정보 로딩 실패:', error)
    alert('정보를 불러오지 못했습니다.')
    router.back()
  }
}

// 수정 시작
const startEdit = () => {
  if (organization.value.franchiseDetail) {
    tempOperatingDays.value = (organization.value.franchiseDetail.operatingDays || '').split(',').filter(d => d)
  }
  isEditing.value = true
}

// 수정 취소
const cancelEdit = () => {
  organization.value = JSON.parse(JSON.stringify(originalOrganization.value))
  isEditing.value = false
}

// 변경사항 저장
const saveChanges = async () => {
  const type = organization.value.unitType
  const id = organization.value.id

  try {
    const payload = {
      name: organization.value.name,
      address: organization.value.address,
      phone: organization.value.phone,
      representativeName: organization.value.representativeName,
      region: organization.value.region,
    }

    if (type === 'FRANCHISE') {
      // 시간 유효성 검사
      if (organization.value.franchiseDetail.openTime >= organization.value.franchiseDetail.closeTime) {
        alert('운영 시작 시간은 종료 시간보다 이전이어야 합니다.');
        return;
      }

      payload.franchiseUpdate = {
        operatingDays: tempOperatingDays.value.join(','),
        openTime: organization.value.franchiseDetail.openTime.length === 5 
          ? organization.value.franchiseDetail.openTime + ':00' 
          : organization.value.franchiseDetail.openTime,
        closeTime: organization.value.franchiseDetail.closeTime.length === 5 
          ? organization.value.franchiseDetail.closeTime + ':00' 
          : organization.value.franchiseDetail.closeTime,
        imageUrl: organization.value.franchiseDetail.imageUrl
      }
    } else if (type === 'FACTORY') {
      payload.factoryUpdate = {
        productionLineCount: organization.value.factoryDetail.productionLineCount
      }
    }

    const response = await api.patch(`/hq/business-units/${type}/${id}`, payload)
    if (response.data.success) {
      alert('변경사항이 저장되었습니다.')
      organization.value = response.data.data
      originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
      isEditing.value = false
    }
  } catch (error) {
    console.error('업데이트 실패:', error)
    alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.')
  }
}

const confirmStatusToggle = async () => {
  const isActive = isOrgActive.value
  const action = isActive ? '운영중지' : '운영재개'
  if (confirm(`'${organization.value.name}'의 ${action} 하시겠습니까?`)) {
    try {
      const type = organization.value.unitType
      const id = organization.value.id
      const newStatus = isActive ? 'INACTIVE' : 'ACTIVE'
      
      const response = await api.patch(`/hq/business-units/${type}/${id}/status`, {
        status: newStatus
      })
      
      if (response.data.success) {
        organization.value.status = newStatus
        originalOrganization.value.status = newStatus
        alert(`${action} 처리되었습니다.`)
      }
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }
}

const confirmDelete = async () => {
  if (confirm(`'${organization.value.name}'을(를) 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`)) {
    try {
      const type = organization.value.unitType
      const id = organization.value.id
      
      const response = await api.delete(`/hq/business-units/${type}/${id}`)
      if (response.data.success) {
        alert('삭제 처리되었습니다.')
        if (type === 'FRANCHISE') {
          router.push('/admin/organizations/franchise')
        } else {
          router.push('/admin/organizations/factory')
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
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
      const reader = new FileReader()
      reader.onload = (event) => {
        if (organization.value.franchiseDetail) {
          organization.value.franchiseDetail.imageUrl = event.target.result
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 사진 제거
const removePhoto = () => {
  if (organization.value.franchiseDetail) {
    organization.value.franchiseDetail.imageUrl = ''
  }
}

// 목록으로 돌아가기
const goBack = () => {
  if (organization.value) {
    if (organization.value.unitType === 'FRANCHISE') {
      router.push('/admin/organizations/franchise')
    } else if (organization.value.unitType === 'FACTORY') {
      router.push('/admin/organizations/factory')
    } else if (organization.value.unitType === 'HQ') {
      router.push('/admin/head-office/management')
    } else {
      router.push('/organizations')
    }
  } else {
    router.back()
  }
}

onMounted(() => {
  loadOrganization()
})

// 전화번호 자동 하이픈
const handlePhoneInput = (e) => {
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
  organization.value.phone = val;
}

// 사업자 등록 번호 자동 하이픈 (000-00-00000)
const handleBizNumInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 5) {
    val = val.slice(0, 3) + '-' + val.slice(3);
  } else if (val.length > 5) {
    val = val.slice(0, 3) + '-' + val.slice(3, 5) + '-' + val.slice(5, 10);
  }
  organization.value.businessNumber = val;
}

// 주소 검색 (Daum Postcode)
const openPostcode = () => {
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.address;
      let extraAddress = '';

      if (data.addressType === 'R') {
        if (data.bname !== '') extraAddress += data.bname;
        if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
      }

      organization.value.address = fullAddress;
      
      // 시/도 정보를 기반으로 지역 자동 선택
      const sidoMap = {
        '서울': 'SEOUL', '경기': 'GYEONGGI', '인천': 'INCHEON', '부산': 'BUSAN',
        '대구': 'DAEGU', '대전': 'DAEJEON', '광주': 'GWANGJU', '울산': 'ULSAN',
        '세종': 'SEJONG', '강원': 'GANGWON', '충북': 'CHUNGBUK', '충남': 'CHUNGNAM',
        '전북': 'JEONBUK', '전남': 'JEONNAM', '경북': 'GYEONGBUK', '경남': 'GYEONGNAM',
        '제주': 'JEJU', '제주특별자치도': 'JEJU'
      }
      const mapped = sidoMap[data.sido] || Object.entries(sidoMap).find(([key]) => data.sido.includes(key))?.[1];
      if (mapped) organization.value.region = mapped;
    }
  }).open();
}

const getOrgNameLabel = (type) => {
  if (type === 'FRANCHISE') return '가맹점명'
  if (type === 'FACTORY') return '공장명'
  if (type === 'HQ') return '본사명'
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

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }
.status-badge.deleted { background: #fee2e2; color: #b91c1c; }

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

.info-field input:focus,
.info-field select:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.address-input-group {
  display: flex;
  gap: 0.5rem;
}

.address-input-group input {
  flex: 1;
}

.btn-address-search {
  padding: 0 1rem;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
}

.btn-address-search:hover {
  background: #e2e8f0;
}

.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8;
  cursor: not-allowed;
}

/* 요일 표시 */
.days-pill-display {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.day-pill {
  font-size: 0.95rem;
  color: #cbd5e1;
  font-weight: 500;
}

.day-pill.active {
  color: #0f172a;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* 경고 및 제한 상태 */
.warning-section h2 {
  color: #e11d48;
  border-bottom-color: #fecaca;
}

.warning-status-card {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  gap: 2rem;
  align-items: center;
  margin-top: 0.5rem;
}

.warning-status-card.is-restricted {
  background: #fff1f2;
  border-color: #fecaca;
}

.warning-info {
  text-align: center;
  padding-right: 2rem;
  border-right: 1px solid #e2e8f0;
}

.warning-status-card.is-restricted .warning-info {
  border-right-color: #fecaca;
}

.warning-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.warning-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.warning-value .count {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.warning-status-card.is-restricted .warning-value .count {
  color: #e11d48;
}

.warning-value .total {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
}

.restriction-status {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.status-icon {
  padding: 0.5rem;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
}

.is-restricted .status-icon {
  background: #e11d48;
  color: white;
}

.status-texts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.is-restricted .status-title {
  color: #e11d48;
}

.status-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.is-restricted .status-desc {
  color: #9f1239;
}

.restriction-timer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #e11d48;
  background: white;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  width: fit-content;
  border: 1px solid #fecaca;
}

.restriction-timer strong {
  font-weight: 700;
}

/* 운영 요일 스타일 개선 */
.days-container {
  padding: 0.5rem 0;
}

.days-readonly, .days-interactive {
  display: flex;
  gap: 0.5rem;
}

.day-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #cbd5e1;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.day-box.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-check-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  background: white;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.day-check-box:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.day-check-box.checked {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-check-box input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
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
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.btn-remove-photo:hover {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
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
