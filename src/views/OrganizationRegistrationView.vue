<template>
  <div class="registration-container">
    <div class="registration-header">
      <h1>조직 등록</h1>
      <p class="subtitle">새로운 가맹점 또는 공장을 등록하세요</p>
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

          <div class="form-group">
            <label>가맹점 코드</label>
            <input 
              type="text" 
              :value="generatedStoreCode" 
              disabled 
              class="input-disabled"
              placeholder="자동 생성됩니다"
            >
          </div>

          <div class="form-group full-width">
            <label>주소 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="storeData.address" 
              placeholder="주소를 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>매장 전화번호 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="storeData.phone" 
              placeholder="02-1234-5678"
              required
            >
          </div>

          <div class="form-group">
            <label>면적 (㎡) <span class="required">*</span></label>
            <input 
              type="number" 
              v-model="storeData.area" 
              placeholder="면적을 입력하세요"
              required
            >
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
            <div class="photo-upload-area">
              <div v-if="storeData.photoUrl" class="photo-preview">
                <img :src="storeData.photoUrl" alt="매장 사진">
                <button @click="removeStorePhoto" class="btn-remove-photo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <button v-else @click="uploadStorePhoto" class="btn-upload">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                사진 업로드
              </button>
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

          <div class="form-group">
            <label>공장 코드</label>
            <input 
              type="text" 
              :value="generatedFactoryCode" 
              disabled 
              class="input-disabled"
              placeholder="자동 생성됩니다"
            >
          </div>

          <div class="form-group full-width">
            <label>주소 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="factoryData.address" 
              placeholder="주소를 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>공장 전화번호 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="factoryData.phone" 
              placeholder="02-1234-5678"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
  phone: '',
  area: '',
  operatingDays: [],
  openTime: '',
  closeTime: '',
  photoUrl: ''
})

// 공장 데이터
const factoryData = reactive({
  name: '',
  address: '',
  phone: ''
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
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        storeData.photoUrl = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

// 매장 사진 제거
const removeStorePhoto = () => {
  storeData.photoUrl = ''
}

// 가맹점 등록
const registerStore = () => {
  // 유효성 검사
  if (!storeData.name) {
    alert('가맹점명을 선택해주세요.')
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
  if (!storeData.area) {
    alert('면적을 입력해주세요.')
    return
  }
  if (storeData.operatingDays.length === 0) {
    alert('운영 요일을 선택해주세요.')
    return
  }
  if (!storeData.openTime || !storeData.closeTime) {
    alert('운영 시간을 입력해주세요.')
    return
  }

  // TODO: API 호출로 가맹점 등록
  console.log('가맹점 등록:', {
    code: generatedStoreCode.value,
    ...storeData
  })

  alert(`가맹점이 등록되었습니다.\n가맹점 코드: ${generatedStoreCode.value}`)
  storeCounter.value++
  resetStoreForm()
}

// 공장 등록
const registerFactory = () => {
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

  // TODO: API 호출로 공장 등록
  console.log('공장 등록:', {
    code: generatedFactoryCode.value,
    ...factoryData
  })

  alert(`공장이 등록되었습니다.\n공장 코드: ${generatedFactoryCode.value}`)
  factoryCounter.value++
  resetFactoryForm()
}

// 가맹점 폼 초기화
const resetStoreForm = () => {
  storeData.name = ''
  storeData.address = ''
  storeData.phone = ''
  storeData.area = ''
  storeData.operatingDays = []
  storeData.openTime = ''
  storeData.closeTime = ''
  storeData.photoUrl = ''
}

// 공장 폼 초기화
const resetFactoryForm = () => {
  factoryData.name = ''
  factoryData.address = ''
  factoryData.phone = ''
}
</script>

<style scoped>
.registration-container {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.registration-header {
  margin-bottom: 2rem;
}

.registration-header h1 {
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
  gap: 0.75rem;
  padding: 1.25rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
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
  margin-top: 2rem;
  min-height: 800px;
}

.form-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.day-checkbox:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.day-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.day-checkbox input[type="checkbox"]:checked + span {
  color: #0f172a;
  font-weight: 600;
}

/* 사진 업로드 */
.photo-upload-area {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-preview {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.photo-preview img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.btn-remove-photo {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
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

.btn-upload {
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
  padding: 0.85rem 2rem;
  border-radius: 8px;
  font-size: 0.95rem;
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
</style>
