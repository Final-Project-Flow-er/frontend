<template>
  <div class="logistics-registration-container">
    <div class="registration-header">
      <h1>업체 및 차량 등록</h1>
      <p class="subtitle">새로운 물류 파트너 및 배송 차량을 시스템에 등록합니다</p>
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
                <input type="text" v-model="companyData.name" placeholder="업체명을 입력하세요" required>
              </div>
              <div class="form-group">
                <label>업체 연락처 <span class="required">*</span></label>
                <input type="tel" v-model="companyData.phone" placeholder="02-000-0000" required>
              </div>
              <div class="form-group full-width">
                <label>사업장 주소 <span class="required">*</span></label>
                <input type="text" v-model="companyData.address" placeholder="전체 주소를 입력하세요" required>
              </div>
              <div class="form-group">
                <label>담당자 이름</label>
                <input type="text" v-model="companyData.managerName" placeholder="담당자 성함">
              </div>
              <div class="form-group">
                <label>주력 운송 지역 <span class="required">*</span></label>
                <select v-model="companyData.mainRegion" required>
                  <option value="">선택하세요</option>
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
            </div>
          </div>

          <div class="form-section divider">
            <h2 class="section-title">계약 및 단가 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>보유 차량 수 <span class="required">*</span></label>
                <input type="number" v-model="companyData.vehicleCount" placeholder="대" required>
              </div>
              <div class="form-group">
                <label>운송 단가 (원/km) <span class="required">*</span></label>
                <input type="number" v-model="companyData.costPerKm" placeholder="원/km" required>
              </div>
              <div class="form-group">
                <label>계약 시작일 <span class="required">*</span></label>
                <input type="date" v-model="companyData.contractStart" required>
              </div>
              <div class="form-group">
                <label>계약 종료일 <span class="required">*</span></label>
                <input type="date" v-model="companyData.contractEnd" required>
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
                <input type="text" v-model="vehicleData.vehicleNo" placeholder="ex. 12가 3456" required>
              </div>
              <div class="form-group">
                <label>소속 업체 <span class="required">*</span></label>
                <select v-model="vehicleData.company" required>
                  <option value="">업체를 선택하세요</option>
                  <option value="CJ대한통운">CJ대한통운</option>
                  <option value="한진택배">한진택배</option>
                  <option value="롯데글로벌로지스">롯데글로벌로지스</option>
                  <option value="자체 배송팀">자체 배송팀</option>
                </select>
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
                <label>최대 적재량 (톤) <span class="required">*</span></label>
                <input type="text" v-model="vehicleData.maxLoad" placeholder="ex. 1.2t" required>
              </div>
            </div>
          </div>

          <div class="form-section divider">
            <h2 class="section-title">운전자 정보</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>운전자 성함 <span class="required">*</span></label>
                <input type="text" v-model="vehicleData.driverName" placeholder="실명을 입력하세요" required>
              </div>
              <div class="form-group">
                <label>운전자 연락처 <span class="required">*</span></label>
                <input type="tel" v-model="vehicleData.driverPhone" placeholder="010-0000-0000" required>
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const registrationType = ref('company')

const companyData = reactive({
  name: '',
  phone: '',
  address: '',
  managerName: '',
  mainRegion: '',
  vehicleCount: null,
  costPerKm: null,
  contractStart: '',
  contractEnd: ''
})

const vehicleData = reactive({
  vehicleNo: '',
  company: '',
  vehicleType: '',
  maxLoad: '',
  driverName: '',
  driverPhone: ''
})

const resetForm = (type) => {
  if (type === 'company') {
    Object.keys(companyData).forEach(key => companyData[key] = '')
  } else {
    Object.keys(vehicleData).forEach(key => vehicleData[key] = '')
  }
}

const registerCompany = () => {
  if (!companyData.name || !companyData.phone) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }
  alert('업체 등록이 완료되었습니다.')
  resetForm('company')
}

const registerVehicle = () => {
  if (!vehicleData.vehicleNo || !vehicleData.driverName) {
    alert('필수 정보를 모두 입력해주세요.')
    return
  }
  alert('차량 등록이 완료되었습니다.')
  resetForm('vehicle')
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

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1.5px solid #e2e8f0;
}

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem 1rem; margin-bottom: 1.5rem; }
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
