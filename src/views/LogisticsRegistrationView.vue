<template>
  <div class="logistics-registration-container">
    <div class="registration-header">
      <h1>업체 및 차량 등록</h1>
    </div>

    <!-- 등록 타입 선택 -->
    <div class="type-selection">
      <button 
        @click="registrationType = 'company'" 
        :class="['type-btn', { active: registrationType === 'company' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4"></path><path d="M5 21V10.85"></path><path d="M19 21V10.85"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>
        운송 업체 등록
      </button>
      <button 
        @click="registrationType = 'vehicle'" 
        :class="['type-btn', { active: registrationType === 'vehicle' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3"></path><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle></svg>
        배송 차량 등록
      </button>
    </div>

    <div class="content-wrapper">
      <!-- 업체 등록 폼 -->
      <div v-if="registrationType === 'company'" class="registration-form">
        <div class="form-card">
          <div class="form-section">
            <h2 class="section-title">운송 업체 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>운송 업체명 <span class="required">*</span></label>
                <input type="text" v-model="companyData.companyName" placeholder="업체명을 입력하세요" required>
              </div>
              <div class="form-group">
                <label>업체 연락처 <span class="required">*</span></label>
                <input
                  type="tel"
                  v-model="companyData.officePhone"
                  @input="handlePhoneInput"
                  placeholder="연락처를 입력하세요"
                  maxlength="13"
                  required
                >
              </div>
              <div class="form-group full-width">
                <label>사업장 주소 <span class="required">*</span></label>
                <div class="address-input-group">
                  <input
                    type="text"
                    v-model="companyData.address"
                    placeholder="주소를 검색하세요"
                    readonly
                    @click="openPostcode"
                  >
                  <button type="button" @click="openPostcode" class="btn-address-search">주소 검색</button>
                </div>
              </div>
              <div class="form-group">
                <label>담당자 이름 <span class="required">*</span></label>
                <input type="text" v-model="companyData.manager" @input="companyData.manager = companyData.manager.replace(/[0-9]/g, '')" placeholder="담당자 성함을 입력하세요" required>
              </div>
              <div class="form-group">
                <label>주력 운송 지역 <span class="required">*</span></label>
                <select v-model="companyData.usableRegion" required>
                  <option value="">선택하세요</option>
                  <option value="SEOUL">서울</option>
                  <option value="GYEONGGI">경기</option>
                  <option value="INCHEON">인천</option>
                  <option value="GANGWON">강원</option>
                  <option value="CHUNGNAM">충남</option>
                  <option value="CHUNGBUK">충북</option>
                  <option value="DAEJEON">대전</option>
                  <option value="SEJONG">세종</option>
                  <option value="JEONNAM">전남</option>
                  <option value="JEONBUK">전북</option>
                  <option value="GWANGJU">광주</option>
                  <option value="GYEONGNAM">경남</option>
                  <option value="GYEONGBUK">경북</option>
                  <option value="BUSAN">부산</option>
                  <option value="DAEGU">대구</option>
                  <option value="ULSAN">울산</option>
                  <option value="JEJU">제주</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section divider">
            <h2 class="section-title">계약 및 단가 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>보유 차량 수 <span class="required">*</span></label>
                <input
                  type="number"
                  v-model.number="companyData.ownedVehicles"
                  placeholder="보유 차량 대수를 입력하세요"
                  min="0"
                  @keypress="onlyNumber"
                  required
                >
              </div>
              <div class="form-group">
                <label>운송 단가 (원/km) <span class="required">*</span></label>
                <input
                  type="number"
                  v-model.number="companyData.unitPrice"
                  placeholder="km당 운송 단가를 입력하세요"
                  min="0"
                  @keypress="onlyNumber"
                  required
                >
              </div>
              <div class="form-group">
                <label>계약 시작일 <span class="required">*</span></label>
                <input
                  type="date"
                  v-model="companyData.contractStartDate"
                  @change="validateDates"
                  required
                >
              </div>
              <div class="form-group">
                <label>계약 종료일 <span class="required">*</span></label>
                <input
                  type="date"
                  v-model="companyData.contractEndDate"
                  :min="companyData.contractStartDate"
                  @change="validateDates"
                  required
                >
                <span v-if="dateError" class="field-error">{{ dateError }}</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="resetForm('company')" class="btn-reset">초기화</button>
            <button @click="registerCompany" class="btn-submit">업체 등록하기</button>
          </div>
        </div>
      </div>

      <!-- 차량 등록 폼 -->
      <div v-else class="registration-form">
        <div class="form-card">
          <div class="form-section">
            <h2 class="section-title">배송 차량 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>차량 번호 <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="vehicleData.vehicleNumber"
                  @input="handleVehicleNumberInput"
                  placeholder="차량 번호를 입력하세요"
                  maxlength="9"
                  required
                >
                <span class="field-hint">숫자 2자리 + 한글 1자리 + 공백 + 숫자 4자리</span>
              </div>
              <div class="form-group">
                <label>소속 업체 <span class="required">*</span></label>
                <div class="search-select-group">
                  <input 
                    type="text" 
                    :value="selectedCompanyName" 
                    placeholder="업체를 검색하여 선택하세요" 
                    readonly 
                    @click="isTransportModalOpen = true"
                    required
                  >
                  <button type="button" @click="isTransportModalOpen = true" class="btn-search-trigger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    검색
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label>차량 종류 <span class="required">*</span></label>
                <select v-model="vehicleData.vehicleType" required>
                  <option value="">선택하세요</option>
                  <option value="CARGO">카고</option>
                  <option value="WING_BODY">윙바디</option>
                  <option value="REFRIGERATED_TOP">냉동탑차</option>
                  <option value="CHILLED_TOP">냉장탑차</option>
                  <option value="CONTAINER">컨테이너 캐리어</option>
                </select>
              </div>
              <div class="form-group">
                <label>최대 적재량 (톤 단위) <span class="required">*</span></label>
                <input
                  type="number"
                  v-model.number="vehicleData.maxLoad"
                  placeholder="최대 적재 중량을 입력하세요"
                  min="0"
                  @keypress="onlyNumber"
                  required
                >
              </div>
            </div>
          </div>

          <div class="form-section divider">
            <h2 class="section-title">운전자 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>운전자 성함 <span class="required">*</span></label>
                <input type="text" v-model="vehicleData.driverName" @input="vehicleData.driverName = vehicleData.driverName.replace(/[0-9]/g, '')" placeholder="실명을 입력하세요" required>
              </div>
              <div class="form-group">
                <label>운전자 연락처 <span class="required">*</span></label>
                <input
                  type="tel"
                  v-model="vehicleData.driverPhone"
                  @input="handleDriverPhoneInput"
                  placeholder="연락처를 입력하세요"
                  maxlength="13"
                  required
                >
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="resetForm('vehicle')" class="btn-reset">초기화</button>
            <button @click="registerVehicle" class="btn-submit">차량 등록하기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 업체 선택 모달 -->
    <TransportSelectionModal 
      :is-open="isTransportModalOpen"
      :companies="activeCompanies"
      @close="isTransportModalOpen = false"
      @select="handleTransportSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TransportSelectionModal from './TransportSelectionModal.vue'
import api from '@/api/index'

const router = useRouter()
const registrationType = ref('company')
const dateError = ref('')

const companies = ref([])

onMounted(async () => {
  await fetchCompanies()
})

const fetchCompanies = async () => {
  try {
    const res = await api.get('/transport/vendors?size=1000')
    if (res.data.success) {
      // content가 있는 경우와 없는 경우 모두 대응
      const rawData = res.data.data
      companies.value = rawData?.content || (Array.isArray(rawData) ? rawData : [])
    }
  } catch (err) {
    console.error(err)
  }
}

// 활성 업체만 필터링
const activeCompanies = computed(() => {
  return companies.value.filter(c => c.status === 'ACTIVE' || !c.status || c.status === 'active')
})

const isTransportModalOpen = ref(false)
const selectedCompanyName = ref('')

const handleTransportSelect = (company) => {
  vehicleData.transportId = company.id
  selectedCompanyName.value = company.companyName
}

const companyData = reactive({
  companyName: '',
  officePhone: '',
  address: '',
  manager: '',
  usableRegion: '',
  ownedVehicles: null,
  unitPrice: null,
  contractStartDate: '',
  contractEndDate: ''
})

const vehicleData = reactive({
  vehicleNumber: '',
  transportId: '',
  vehicleType: '',
  maxLoad: '',
  driverName: '',
  driverPhone: ''
})

// 숫자만 입력
const onlyNumber = (e) => {
  if (!/[0-9]/.test(e.key)) e.preventDefault()
}

// 전화번호 자동 하이픈 (업체)
const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '')
  if (val.startsWith('02')) {
    if (val.length > 2 && val.length <= 5) val = val.slice(0,2) + '-' + val.slice(2)
    else if (val.length > 5 && val.length <= 9) val = val.slice(0,2) + '-' + val.slice(2,5) + '-' + val.slice(5)
    else if (val.length > 9) val = val.slice(0,2) + '-' + val.slice(2,6) + '-' + val.slice(6,10)
  } else {
    if (val.length > 3 && val.length <= 7) val = val.slice(0,3) + '-' + val.slice(3)
    else if (val.length > 7) val = val.slice(0,3) + '-' + val.slice(3,7) + '-' + val.slice(7,11)
  }
  companyData.officePhone = val
}

// 차량번호 자동 포맷: 숫자2자리 + 한글1자리 + 공백 + 숫자4자리 (ex. 12가 3456)
const handleVehicleNumberInput = (e) => {
  let raw = e.target.value.replace(/\s/g, '') // 공백 제거
  let result = ''

  // 숫자 최대 2자리
  const leadingNums = raw.match(/^[0-9]{1,2}/)?.[0] || ''
  result += leadingNums

  // 다음 한글 1자리
  const afterNums = raw.slice(leadingNums.length)
  const hangul = afterNums.match(/^[가-힣]/)?.[0] || ''
  result += hangul

  // 공백 + 숫자 최대 4자리
  const afterHangul = afterNums.slice(hangul.length)
  const trailingNums = afterHangul.replace(/[^0-9]/g, '').slice(0, 4)
  if (hangul && trailingNums) result += ' ' + trailingNums
  else if (hangul) result += ' '

  vehicleData.vehicleNumber = result
}
const handleDriverPhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '')
  if (val.startsWith('02')) {
    if (val.length > 2 && val.length <= 5) val = val.slice(0,2) + '-' + val.slice(2)
    else if (val.length > 5 && val.length <= 9) val = val.slice(0,2) + '-' + val.slice(2,5) + '-' + val.slice(5)
    else if (val.length > 9) val = val.slice(0,2) + '-' + val.slice(2,6) + '-' + val.slice(6,10)
  } else {
    if (val.length > 3 && val.length <= 7) val = val.slice(0,3) + '-' + val.slice(3)
    else if (val.length > 7) val = val.slice(0,3) + '-' + val.slice(3,7) + '-' + val.slice(7,11)
  }
  vehicleData.driverPhone = val
}

// 주소 검색 (Daum Postcode)
const openPostcode = () => {
  const width = 500
  const height = 600
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.address
      let extraAddress = ''
      if (data.addressType === 'R') {
        if (data.bname !== '') extraAddress += data.bname
        if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
      }
      companyData.address = fullAddress
      // 시도 → 지역 자동 선택
      const sidoMap = {
        '서울': 'SEOUL', '경기': 'GYEONGGI', '인천': 'INCHEON', '부산': 'BUSAN',
        '대구': 'DAEGU', '대전': 'DAEJEON', '광주': 'GWANGJU', '울산': 'ULSAN',
        '세종': 'SEJONG', '강원': 'GANGWON', '충북': 'CHUNGBUK', '충남': 'CHUNGNAM',
        '전북': 'JEONBUK', '전남': 'JEONNAM', '경북': 'GYEONGBUK', '경남': 'GYEONGNAM',
        '제주': 'JEJU'
      }
      const mapped = sidoMap[data.sido] || Object.entries(sidoMap).find(([k]) => data.sido.includes(k))?.[1]
      if (mapped) companyData.usableRegion = mapped
    }
  }).open({
    left: (window.screen.width / 2) - (width / 2),
    top: (window.screen.height / 2) - (height / 2)
  })
}

// 날짜 유효성 검사
const validateDates = () => {
  if (companyData.contractStartDate && companyData.contractEndDate) {
    if (companyData.contractEndDate <= companyData.contractStartDate) {
      dateError.value = '계약 종료일은 시작일보다 이후여야 합니다.'
      companyData.contractEndDate = ''
    } else {
      dateError.value = ''
    }
  }
}

const resetForm = (type) => {
  if (type === 'company') {
    companyData.companyName = ''
    companyData.officePhone = ''
    companyData.address = ''
    companyData.manager = ''
    companyData.usableRegion = ''
    companyData.ownedVehicles = null
    companyData.unitPrice = null
    companyData.contractStartDate = ''
    companyData.contractEndDate = ''
    dateError.value = ''
  } else {
    vehicleData.vehicleNumber = ''
    vehicleData.transportId = ''
    vehicleData.vehicleType = ''
    vehicleData.maxLoad = ''
    vehicleData.driverName = ''
    vehicleData.driverPhone = ''
    selectedCompanyName.value = ''
  }
}

const registerCompany = async () => {
  if (!companyData.companyName?.trim() || 
      !companyData.officePhone?.trim() || 
      !companyData.address?.trim() || 
      !companyData.manager?.trim() ||
      !companyData.usableRegion ||
      companyData.ownedVehicles === null ||
      companyData.unitPrice === null) {
    alert('모든 필수 정보를 입력해주세요.')
    return
  }
  if (!companyData.contractStartDate || !companyData.contractEndDate) {
    alert('계약 기간을 입력해주세요.')
    return
  }
  if (companyData.contractEndDate <= companyData.contractStartDate) {
    alert('계약 종료일은 시작일보다 이후여야 합니다.')
    return
  }
  if (dateError.value) {
    alert(dateError.value)
    return
  }
  try {
    const res = await api.post('/transport/vendors', companyData)
    if (res.data.success) {
      alert('업체 등록이 완료되었습니다.')
      router.push('/admin/logistics')
    }
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || '등록 중 오류가 발생했습니다.'
    alert(msg)
  }
}

const registerVehicle = async () => {
  if (!vehicleData.vehicleNumber?.trim() || 
      !vehicleData.driverName?.trim() || 
      !vehicleData.driverPhone?.trim() ||
      !vehicleData.transportId ||
      !vehicleData.vehicleType ||
      !vehicleData.maxLoad) {
    alert('모든 필수 정보를 입력해주세요.')
    return
  }
  try {
    const res = await api.post('/transport/vehicles', vehicleData)
    if (res.data.success) {
      alert('차량 등록이 완료되었습니다.')
      router.push('/admin/logistics')
    }
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || '등록 중 오류가 발생했습니다.'
    alert(msg)
  }
}
</script>

<style scoped>
.logistics-registration-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.registration-header { margin-bottom: 2rem; }
.registration-header h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.25rem 0; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

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

.form-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.form-section.divider {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid #e2e8f0;
}

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem 1rem; margin-bottom: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; margin-left: 2px; font-weight: 700; }

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
.form-group input:focus,
.form-group select:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }

.address-input-group { display: flex; gap: 0.5rem; }
.address-input-group input { flex: 1; cursor: pointer; }

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
  transition: all 0.2s;
}
.btn-address-search:hover { background: #e2e8f0; }

.search-select-group { display: flex; gap: 0.5rem; }
.search-select-group input { flex: 1; cursor: pointer; background: #f8fafc; }

.btn-search-trigger {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0 1rem; background: #0f172a; border: none;
  border-radius: 8px; font-size: 0.85rem; font-weight: 600;
  color: white; cursor: pointer; transition: all 0.2s;
}
.btn-search-trigger:hover { background: #1e293b; transform: translateY(-1px); }

.field-hint {
  font-size: 0.78rem;
  color: #94a3b8;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: 500;
}

.form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }

.btn-reset {
  padding: 0.65rem 1.5rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reset:hover { background: #e2e8f0; }

.btn-submit {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #0f172a;
  color: white;
  border: none;
}
.btn-submit:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
