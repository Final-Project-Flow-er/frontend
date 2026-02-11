<template>
  <div class="registration-container">
    <div class="registration-header">
      <h1>업체 및 차량 등록</h1>
      <p class="subtitle">운송 협력 업체와 배송 차량을 시스템에 등록하세요</p>
    </div>

    <!-- 타입 선택 -->
    <div class="type-selection">
      <button 
        @click="registrationType = 'company'" 
        :class="['type-btn', { active: registrationType === 'company' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        운송 업체 등록
      </button>
      <button 
        @click="registrationType = 'vehicle'" 
        :class="['type-btn', { active: registrationType === 'vehicle' }]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        차량 등록
      </button>
    </div>

    <!-- 운송 업체 등록 폼 -->
    <div v-if="registrationType === 'company'" class="registration-form">
      <div class="form-card">
        <h2>운송 업체 정보</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>운송 업체명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="companyData.name" 
              placeholder="업체명을 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>업체 연락처 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="companyData.phone" 
              placeholder="02-1234-5678"
              required
            >
          </div>

          <div class="form-group full-width">
            <label>사업장 주소 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="companyData.address" 
              placeholder="사업장 주소를 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>담당자 이름</label>
            <input 
              type="text" 
              v-model="companyData.managerName" 
              placeholder="담당자 이름을 입력하세요"
            >
          </div>

          <div class="form-group">
            <label>주력 운송 지역 <span class="required">*</span></label>
            <select v-model="companyData.mainRegion" required>
              <option value="">지역을 선택하세요</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="강원">강원</option>
              <option value="충청">충청</option>
              <option value="전라">전라</option>
              <option value="경상">경상</option>
              <option value="제주">제주</option>
              <option value="전국">전국</option>
            </select>
          </div>

          <div class="form-group">
            <label>보유 차량 수 <span class="required">*</span></label>
            <input 
              type="number" 
              v-model="companyData.vehicleCount" 
              placeholder="0"
              required
            >
          </div>

          <div class="form-group">
            <label>운송 단가 (박스 당) <span class="required">*</span></label>
            <input 
              type="number" 
              v-model="companyData.costPerBox" 
              placeholder="0"
              required
            >
          </div>

          <div class="form-group">
            <label>계약 시작일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="companyData.contractStart" 
              required
            >
          </div>

          <div class="form-group">
            <label>계약 종료일 <span class="required">*</span></label>
            <input 
              type="date" 
              v-model="companyData.contractEnd" 
              required
            >
          </div>
        </div>

        <div class="form-actions">
          <button @click="registerCompany" class="btn-register">등록</button>
          <button @click="resetCompanyForm" class="btn-reset">초기화</button>
        </div>
      </div>
    </div>

    <!-- 차량 등록 폼 -->
    <div v-if="registrationType === 'vehicle'" class="registration-form">
      <div class="form-card">
        <h2>차량 정보</h2>
        
        <div class="form-grid">
          <div class="form-group">
            <label>소속 운송 업체 <span class="required">*</span></label>
            <select v-model="vehicleData.companyId" required>
              <option value="">운송 업체를 선택하세요</option>
              <option v-for="company in registeredCompanies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>차량 번호 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="vehicleData.vehicleNo" 
              placeholder="예: 12가 3456"
              required
            >
          </div>

          <div class="form-group">
            <label>차량 종류 <span class="required">*</span></label>
            <select v-model="vehicleData.vehicleType" required>
              <option value="">선택하세요</option>
              <option value="frozen">냉동탑차</option>
              <option value="normal">카고/일반탑차</option>
              <option value="wingbody">윙바디</option>
              <option value="bike">이륜차</option>
            </select>
          </div>

          <div class="form-group">
            <label>최대 적재량 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="vehicleData.maxLoad" 
              placeholder="예: 1.5t, 500kg"
              required
            >
          </div>

          <div class="form-group">
            <label>운전자 이름 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="vehicleData.driverName" 
              placeholder="운전자 이름을 입력하세요"
              required
            >
          </div>

          <div class="form-group">
            <label>운전자 연락처 <span class="required">*</span></label>
            <input 
              type="tel" 
              v-model="vehicleData.driverPhone" 
              placeholder="010-0000-0000"
              required
            >
          </div>
        </div>

        <div class="form-actions">
          <button @click="registerVehicle" class="btn-register">등록</button>
          <button @click="resetVehicleForm" class="btn-reset">초기화</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 등록 타입 (company 또는 vehicle)
const registrationType = ref('company')

// 업체 데이터
const companyData = reactive({
  name: '',
  phone: '',
  address: '',
  managerName: '',
  managerPhone: '',
  vehicleCount: 0,
  mainRegion: '',
  costPerBox: 0,
  contractStart: '',
  contractEnd: ''
})

// 차량 데이터
const vehicleData = reactive({
  companyId: '',
  vehicleNo: '',
  vehicleType: '',
  tonnage: '',
  driverName: '',
  driverPhone: '',
  maxLoad: ''
})

onMounted(() => {
  // 초기화 로직 (필요시)
})

// 업체 코드 자동 생성 (샘플용)
const companyCounter = ref(1)
const generatedCompanyCode = computed(() => {
  return `LOGI-${String(companyCounter.value).padStart(3, '0')}`
})

// 등록된 업체 샘플 (차량 등록 시 선택용)
const registeredCompanies = ref([
  { id: 1, name: 'CJ대한통운' },
  { id: 2, name: '한진택배' },
  { id: 3, name: '롯데글로벌로지스' },
  { id: 4, name: '자체 배송팀' }
])

// 업체 등록
const registerCompany = () => {
  if (!companyData.name || !companyData.phone || !companyData.address) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }

  alert('등록되었습니다.')
  
  // 샘플 목록에 추가 (동적으로)
  registeredCompanies.value.push({
    id: registeredCompanies.value.length + 1,
    name: companyData.name
  })
  
  companyCounter.value++
  resetCompanyForm()
}

// 차량 등록
const registerVehicle = () => {
  if (!vehicleData.companyId || !vehicleData.vehicleNo || !vehicleData.vehicleType || !vehicleData.tonnage || !vehicleData.driverName || !vehicleData.driverPhone) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }

  alert('등록되었습니다.')
  resetVehicleForm()
}

// 폼 초기화
const resetCompanyForm = () => {
  companyData.name = ''
  companyData.phone = ''
  companyData.address = ''
  companyData.managerName = ''
  companyData.managerPhone = ''
  companyData.vehicleCount = 0
  companyData.mainRegion = ''
  companyData.costPerBox = 0
  companyData.contractStart = ''
  companyData.contractEnd = ''
}

const resetVehicleForm = () => {
  vehicleData.companyId = ''
  vehicleData.vehicleNo = ''
  vehicleData.vehicleType = ''
  vehicleData.tonnage = ''
  vehicleData.driverName = ''
  vehicleData.driverPhone = ''
  vehicleData.maxLoad = ''
}
</script>

<style scoped>
.registration-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.registration-header { margin-bottom: 2rem; }
.registration-header h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0; }
.subtitle { color: #64748b; font-size: 0.95rem; margin: 0; }

/* 타입 선택 */
.type-selection { display: flex; gap: 1rem; margin-bottom: 2rem; }
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
.type-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
.type-btn.active { border-color: #0f172a; background: #0f172a; color: white; }

/* 폼 카드 */
.form-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.form-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; margin-left: 2px; }

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
  outline: none;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }

.input-disabled { background: #f8fafc !important; color: #94a3b8; cursor: not-allowed; }

/* 버튼 액션 */
.form-actions { display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
.btn-register, .btn-reset { padding: 0.85rem 2.5rem; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-register { background: #0f172a; color: white; border: none; }
.btn-register:hover { background: #1e293b; transform: translateY(-1px); }
.btn-reset { background: white; color: #64748b; border: 1.5px solid #e2e8f0; }
.btn-reset:hover { background: #f8fafc; border-color: #cbd5e1; }

@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
