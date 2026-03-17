<template>
  <div class="registration-container">
    <div class="registration-header">
      <h1>사업장 등록</h1>
    </div>

    <!-- 타입 선택 -->
    <div class="type-selection">
      <button 
        @click="registrationType = 'store'" 
        :class="['type-btn', { active: registrationType === 'store' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        가맹점 등록
      </button>
      <button 
        @click="registrationType = 'factory'" 
        :class="['type-btn', { active: registrationType === 'factory' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="20" width="20" height="2"></rect>
          <path d="M3.5 17h17l-2-14h-13l-2 14z"></path>
          <path d="M6 17v-13h12v13"></path>
        </svg>
        공장 등록
      </button>
    </div>

    <!-- 가맹점 등록 폼 -->
    <div v-if="registrationType === 'store'" class="registration-form">
      <div class="form-card">
        <h2>가맹점 정보</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>가맹점명 <span class="required">*</span></label>
            <input
                type="text"
                v-model="storeData.name"
                placeholder="가맹점명을 입력하세요"
                required
            >
          </div>

          <div class="form-group full-width">
            <label>주소 <span class="required">*</span></label>
            <div class="address-input-group">
              <input 
                type="text" 
                v-model="storeData.address" 
                placeholder="주소를 검색하세요"
                readonly
                @click="openPostcode('store')"
              >
              <button type="button" @click="openPostcode('store')" class="btn-address-search">주소 검색</button>
            </div>
            <input 
              type="text" 
              v-model="storeData.detailAddress" 
              placeholder="상세 주소를 입력하세요" 
              class="detail-address-input"
            >
            <!-- 지도 표시 -->
            <div v-if="storeData.address" class="map-container">
              <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border:0;"
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(storeData.address)}&z=15&output=embed`"
                allowfullscreen>
              </iframe>
            </div>
          </div>

          <div class="form-group">
            <label>매장 전화번호 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="storeData.phone" 
              @input="handlePhoneInput($event, 'store')"
              placeholder="전화번호를 입력하세요"
              maxlength="13"
              required
            >
          </div>

          <div class="form-group">
            <label>대표자명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="storeData.representativeName" 
              @input="storeData.representativeName = storeData.representativeName.replace(/[0-9]/g, '')"
              placeholder="대표자명을 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>사업자 등록 번호 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="storeData.businessNumber" 
              @input="handleBizNumInput($event, 'store')"
              placeholder="사업자 등록 번호를 입력하세요"
              maxlength="12"
              required
            >
          </div>

          <div class="form-group">
            <label>매장 지역 <span class="required">*</span></label>
            <select v-model="storeData.region" required>
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


          <div class="form-group full-width">
            <label>운영 요일 <span class="required">*</span></label>
            <div class="days-selector">
              <label v-for="day in weekDays" :key="day.value" class="day-checkbox">
                <input 
                  type="checkbox" 
                  :value="day.value" 
                  v-model="storeData.operatingDays"
                >
                <span>{{ day.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>운영 시작 시간 <span class="required">*</span></label>
            <input 
              type="time" 
              v-model="storeData.openTime" 
              required
            >
          </div>

          <div class="form-group">
            <label>운영 종료 시간 <span class="required">*</span></label>
            <input 
              type="time" 
              v-model="storeData.closeTime" 
              required
            >
          </div>

          <div class="form-group full-width">
            <label>매장 사진</label>
            <div class="photo-upload-container">
              <div class="photo-preview-container" :class="{ 'is-empty': storeData.photoUrls.length === 0 }">
                <div v-for="(url, idx) in storeData.photoUrls" :key="idx" class="photo-preview">
                  <img :src="url" alt="매장 사진">
                  <button @click="removeStorePhoto(idx)" type="button" class="btn-remove-photo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <!-- 추가 버튼 -->
              <button type="button" @click="uploadStorePhoto" class="btn-upload-photo-multiple" v-if="storeData.photoFiles.length < 5">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span style="font-size:0.8rem; margin-top:0.4rem; color:#64748b;">사진 추가</span>
              </button>
              </div>
              <p class="photo-limit-notice">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                매장 사진은 최대 5개까지 등록 가능합니다. (현재: {{ storeData.photoFiles.length }}/5)
              </p>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button @click="registerStore" class="btn-register">등록</button>
          <button @click="resetStoreForm" class="btn-reset">초기화</button>
        </div>
      </div>
    </div>

    <!-- 공장 등록 폼 -->
    <div v-if="registrationType === 'factory'" class="registration-form">
      <div class="form-card">
        <h2>공장 정보</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>공장명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="factoryData.name" 
              placeholder="공장명을 입력하세요"
              required
            >
          </div>

          <div class="form-group full-width">
            <label>주소 <span class="required">*</span></label>
            <div class="address-input-group">
              <input 
                type="text" 
                v-model="factoryData.address" 
                placeholder="주소를 검색하세요"
                readonly
                @click="openPostcode('factory')"
              >
              <button type="button" @click="openPostcode('factory')" class="btn-address-search">주소 검색</button>
            </div>
            <input 
              type="text" 
              v-model="factoryData.detailAddress" 
              placeholder="상세 주소를 입력하세요" 
              class="detail-address-input"
            >
            <!-- 지도 표시 -->
            <div v-if="factoryData.address" class="map-container">
              <iframe
                width="100%"
                height="100%"
                frameborder="0"
                style="border:0;"
                :src="`https://maps.google.com/maps?q=${encodeURIComponent(factoryData.address)}&z=15&output=embed`"
                allowfullscreen>
              </iframe>
            </div>
          </div>

          <div class="form-group">
            <label>공장 전화번호 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="factoryData.phone" 
              @input="handlePhoneInput($event, 'factory')"
              placeholder="전화번호를 입력하세요"
              maxlength="13"
              required
            >
          </div>

          <div class="form-group">
            <label>공장 대표명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="factoryData.representativeName" 
              @input="factoryData.representativeName = factoryData.representativeName.replace(/[0-9]/g, '')"
              placeholder="대표자명을 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>사업자 등록 번호 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="factoryData.businessNumber" 
              @input="handleBizNumInput($event, 'factory')"
              placeholder="사업자 등록 번호를 입력하세요"
              maxlength="12"
              required
            >
          </div>

          <div class="form-group">
            <label>공장 지역 <span class="required">*</span></label>
            <select v-model="factoryData.region" required>
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

          <div class="form-group">
            <label>생산 라인 개수 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model.number="factoryData.lineCount" 
              placeholder="생산 라인 개수를 입력하세요"
              min="1"
              max="9"
              required
            >
          </div>
        </div>

        <div class="form-actions">
          <button @click="registerFactory" class="btn-register">등록</button>
          <button @click="resetFactoryForm" class="btn-reset">초기화</button>
        </div>
      </div>
    </div>
    <!-- 결과 안내 모달 -->
    <div v-if="showResultModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ registrationType === 'store' ? '가맹점' : '공장' }} 등록 완료</h2>
        </div>
        <div class="modal-body">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p class="modal-desc">축하합니다! {{ registrationType === 'store' ? '가맹점' : '공장' }}이 성공적으로 등록되었습니다.</p>
          
          <div class="result-details">
            <div class="result-item">
              <span class="label">{{ registrationType === 'store' ? '가맹점명' : '공장명' }}:</span>
              <span class="valueHighlight">{{ resultData.name }}</span>
            </div>
            <div class="result-item">
              <span class="label">식별 코드:</span>
              <span class="value">{{ resultData.code }}</span>
            </div>
            <div class="result-item">
              <span class="label">대표자:</span>
              <span class="value">{{ resultData.representativeName }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-confirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

// 등록 결과 모달 상태
const showResultModal = ref(false)
const resultData = reactive({
  name: '',
  code: '',
  representativeName: ''
})

// 등록 타입 (store 또는 factory)
const registrationType = ref('store')

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

// 가맹점 데이터
const storeData = reactive({
  name: '',
  address: '',
  detailAddress: '',
  phone: '',
  representativeName: '',
  businessNumber: '',
  region: 'SEOUL',
  warningCount: 0,
  operatingDays: [],
  openTime: '',
  closeTime: '',
  photoUrls: [],
  photoFiles: []
})

// 공장 데이터
const factoryData = reactive({
  name: '',
  address: '',
  detailAddress: '',
  phone: '',
  representativeName: '',
  businessNumber: '',
  region: 'SEOUL',
  lineCount: 1
})

// 가맹점 코드 자동 생성 (실제로는 서버에서 생성)
const storeCounter = ref(1)
const generatedStoreCode = computed(() => {
  return `SE${String(storeCounter.value).padStart(2, '0')}`
})

// 공장 코드 자동 생성 (실제로는 서버에서 생성)
const factoryCounter = ref(1)
const generatedFactoryCode = computed(() => {
  return `FA${String(factoryCounter.value).padStart(2, '0')}`
})

// 매장 사진 업로드
const uploadStorePhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    let allowedFiles = files

    if (storeData.photoFiles.length + files.length > 5) {
      alert('매장 사진은 최대 5장까지 등록 가능합니다.')
      allowedFiles = files.slice(0, 5 - storeData.photoFiles.length)
    }

    allowedFiles.forEach(file => {
      storeData.photoFiles.push(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        storeData.photoUrls.push(event.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

// 매장 사진 제거
const removeStorePhoto = (index) => {
  storeData.photoUrls.splice(index, 1)
  storeData.photoFiles.splice(index, 1)
}

// 가맹점 등록
const registerStore = async () => {
  // 유효성 검사
  if (!storeData.name) {
    alert('가맹점명을 입력해주세요.')
    return
  }
  if (!storeData.address) {
    alert('주소를 입력해주세요.')
    return
  }
  if (!storeData.phone) {
    alert('매장 전화번호를 입력해주세요.')
    return
  }
  if (!storeData.representativeName) {
    alert('가맹점주명을 입력해주세요.')
    return
  }
  if (!storeData.businessNumber || storeData.businessNumber.replace(/-/g, '').length !== 10) {
    alert('사업자 등록 번호를 10자리 숫자로 입력해주세요.')
    return
  }
  if (!storeData.region) {
    alert('지역을 선택해주세요.')
    return
  }
  if (storeData.operatingDays.length === 0) {
    alert('운영 요일을 선택해주세요.')
    return
  }
  if (!storeData.openTime || !storeData.closeTime) {
    alert('운영 시간을 입력해주세요.');
    return;
  }
  
  // 시간 유효성 검사 (시작 시간 < 종료 시간)
  if (storeData.openTime >= storeData.closeTime) {
    alert('운영 시작 시간은 종료 시간보다 이전이어야 합니다.');
    return;
  }

  try {
    const payload = {
      name: storeData.name,
      address: storeData.detailAddress ? `${storeData.address} ${storeData.detailAddress}` : storeData.address,
      phone: storeData.phone,
      representativeName: storeData.representativeName,
      businessNumber: storeData.businessNumber,
      region: storeData.region,
      franchiseCreate: {
        operatingDays: storeData.operatingDays.join(','),
        openTime: storeData.openTime + ':00', // Ensure HH:mm:ss
        closeTime: storeData.closeTime + ':00',
        imageUrl: storeData.photoUrl
      }
    }

    const response = await api.post('/hq/business-units/franchise', payload)

    if (response.data.success) {
      const franchiseId = response.data.data.id

      if (storeData.photoFiles.length > 0) {
        const formData = new FormData()
        storeData.photoFiles.forEach(file => {
          formData.append('images', file)
        })
        await api.post(`/hq/business-units/franchise/${franchiseId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // 결과 데이터 설정 및 모달 표시
      resultData.name = response.data.data.name
      resultData.code = response.data.data.code
      resultData.representativeName = response.data.data.representativeName
      showResultModal.value = true
    }
  } catch (error) {
    console.error('가맹점 등록 실패:', error)
    const serverMessage = error.response?.data?.message
    // 서버에서 에러 메시지가 내려오면 그대로 사용, 없으면 사업자 번호 중복 가능성 안내
    alert(serverMessage || '등록에 실패했습니다.\n사업자 등록 번호가 이미 등록되어 있는지 확인해 주세요.')
  }
}

// 공장 등록
const registerFactory = async () => {
  // 유효성 검사
  if (!factoryData.name) {
    alert('공장명을 입력해주세요.')
    return
  }
  if (!factoryData.address) {
    alert('주소를 입력해주세요.')
    return
  }
  if (!factoryData.phone) {
    alert('공장 전화번호를 입력해주세요.')
    return
  }
  if (!factoryData.representativeName) {
    alert('공장 대표명을 입력해주세요.')
    return
  }
  if (!factoryData.businessNumber || factoryData.businessNumber.replace(/-/g, '').length !== 10) {
    alert('사업자 등록 번호를 10자리 숫자로 입력해주세요.')
    return
  }
  if (!factoryData.region) {
    alert('공장 지역을 선택해주세요.')
    return
  }
  if (!factoryData.lineCount || factoryData.lineCount < 1) {
    alert('생산 라인 개수를 입력해주세요.')
    return
  }

  try {
    const payload = {
      name: factoryData.name,
      address: factoryData.detailAddress ? `${factoryData.address} ${factoryData.detailAddress}` : factoryData.address,
      phone: factoryData.phone,
      representativeName: factoryData.representativeName,
      businessNumber: factoryData.businessNumber,
      region: factoryData.region,
      factoryCreate: {
        productionLineCount: factoryData.lineCount
      }
    }

    const response = await api.post('/hq/business-units/factory', payload)

    if (response.data.success) {
      // 결과 데이터 설정 및 모달 표시
      resultData.name = response.data.data.name
      resultData.code = response.data.data.code
      resultData.representativeName = response.data.data.representativeName
      showResultModal.value = true
    }
  } catch (error) {
    console.error('공장 등록 실패:', error)
    const serverMessage = error.response?.data?.message
    alert(serverMessage || '등록에 실패했습니다.\n사업자 등록 번호가 이미 등록되어 있는지 확인해 주세요.')
  }
}

const closeModal = () => {
  showResultModal.value = false
  if (registrationType.value === 'store') {
    resetStoreForm()
  } else {
    resetFactoryForm()
  }
}

// 전화번호 자동 하이픈 및 제약
const handlePhoneInput = (e, type) => {
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
  
  if (type === 'store') storeData.phone = val;
  else factoryData.phone = val;
}

// 사업자 등록 번호 자동 하이픈 (000-00-00000)
const handleBizNumInput = (e, type) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 5) {
    val = val.slice(0, 3) + '-' + val.slice(3);
  } else if (val.length > 5) {
    val = val.slice(0, 3) + '-' + val.slice(3, 5) + '-' + val.slice(5, 10);
  }
  
  if (type === 'store') storeData.businessNumber = val;
  else factoryData.businessNumber = val;
}

// 주소 검색 (Daum Postcode)
const openPostcode = (type) => {
  const width = 500;
  const height = 600;
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.address;
      let extraAddress = '';

      if (data.addressType === 'R') {
        if (data.bname !== '') extraAddress += data.bname;
        if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
      }

      if (type === 'store') {
        storeData.address = fullAddress;
        // 시/도 정보를 기반으로 지역 자동 선택 (필요시)
        updateRegionByAddress(data.sido, 'store');
      } else {
        factoryData.address = fullAddress;
        updateRegionByAddress(data.sido, 'factory');
      }
    }
  }).open({
    left: (window.screen.width / 2) - (width / 2),
    top: (window.screen.height / 2) - (height / 2)
  });
}

const updateRegionByAddress = (sido, type) => {
  const sidoMap = {
    '서울': 'SEOUL',
    '경기': 'GYEONGGI',
    '인천': 'INCHEON',
    '부산': 'BUSAN',
    '대구': 'DAEGU',
    '대전': 'DAEJEON',
    '광주': 'GWANGJU',
    '울산': 'ULSAN',
    '세종': 'SEJONG',
    '강원': 'GANGWON',
    '충북': 'CHUNGBUK',
    '충남': 'CHUNGNAM',
    '전북': 'JEONBUK',
    '전남': 'JEONNAM',
    '경북': 'GYEONGBUK',
    '경남': 'GYEONGNAM',
    '제주': 'JEJU',
    '제주특별자치도': 'JEJU'
  }
  
  const mapped = sidoMap[sido] || Object.entries(sidoMap).find(([key]) => sido.includes(key))?.[1];
  if (mapped) {
    if (type === 'store') storeData.region = mapped;
    else factoryData.region = mapped;
  }
}

// 가맹점 폼 초기화
const resetStoreForm = () => {
  storeData.name = ''
  storeData.address = ''
  storeData.detailAddress = ''
  storeData.phone = ''
  storeData.representativeName = ''
  storeData.businessNumber = ''
  storeData.region = 'SEOUL'
  storeData.operatingDays = []
  storeData.openTime = ''
  storeData.closeTime = ''
  storeData.photoUrls = []
  storeData.photoFiles = []
}

// 공장 폼 초기화
const resetFactoryForm = () => {
  factoryData.name = ''
  factoryData.address = ''
  factoryData.detailAddress = ''
  factoryData.phone = ''
  factoryData.representativeName = ''
  factoryData.businessNumber = ''
  factoryData.region = 'SEOUL'
  factoryData.lineCount = 1
}
</script>

<style scoped>
.registration-container {
  padding: 1rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.registration-header {
  margin-bottom: 2rem;
}

.registration-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* 타입 선택 */
.type-selection {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

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

.type-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.type-btn.active {
  border-color: #0f172a;
  background: #0f172a;
  color: white;
}

.type-btn svg {
  flex-shrink: 0;
}

/* 폼 카드 */
.registration-form {
  margin-top: 1rem;
  min-height: auto;
}

.form-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-card h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
  height: 42px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
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
  font-size: 0.9rem;
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

/* 요일 선택 */
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

/* 지도 표시 컨테이너 */
.map-container {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  height: 300px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* 사진 업로드 */
.photo-upload-container {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.photo-preview-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.2rem;
  align-items: center;
  overflow-x: auto;
  padding: 15px 10px 10px 10px;
  margin: -15px -10px -10px -10px;
  width: calc(100% + 20px);
}

.photo-preview-container::-webkit-scrollbar {
  height: 8px;
}
.photo-preview-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.photo-preview-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.photo-preview-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.photo-preview-container.is-empty {
  width: 100%;
  justify-content: center;
}

/* 사진 개수 안내 문구 */
.photo-limit-notice {
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.photo-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
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
  z-index: 2;
}

.btn-remove-photo:hover {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
  transform: scale(1.1);
}

.btn-upload-photo-multiple {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-upload-photo-multiple:hover {
  border-color: #0f172a;
  background: white;
  color: #0f172a;
}

.btn-upload {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-upload:hover {
  border-color: #0f172a;
  background: white;
  color: #0f172a;
}

/* 폼 액션 버튼 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-register,
.btn-reset {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-register {
  background: #0f172a;
  color: white;
}

.btn-register:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.btn-reset {
  background: white;
  color: #64748b;
  border: 1.5px solid #e2e8f0;
}

.btn-reset:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .type-selection {
    flex-direction: column;
  }
}

/* 모달 스타일 */
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

.modal-header h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
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

.address-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.detail-address-input {
  width: 100% !important;
  margin-top: 0;
}
</style>
