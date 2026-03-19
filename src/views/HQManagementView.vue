<template>
  <div class="hq-management-container">
    <!-- 상단 프리미엄 헤더 -->
    <div class="management-header">
      <div class="header-left">
        <div class="title-group">
          <h1>본사 정보 관리</h1>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="!isEditing" @click="startEdit" class="btn-premium-edit">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          정보 수정
        </button>
        <div v-else class="edit-actions">
          <button @click="saveChanges" class="btn-premium-save">저장</button>
          <button @click="cancelEdit" class="btn-premium-cancel">취소</button>
        </div>
      </div>
    </div>

    <div v-if="hqData" class="premium-layout">
      <!-- 본사 대시보드 상단 프로필 -->
      <div class="hq-profile-banner">
        <div class="profile-main-info">
          <div class="hq-symbol-box">
            <h1 class="logo-barcode-mini">CHAIN-G</h1>
          </div>
          <div class="hq-identity">
            <h2 class="hq-display-name">{{ hqData.name }}</h2>
            <div class="hq-meta-row">
              <span class="hq-code-badge">{{ hqData.code }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 본사 상세 정보 그리드 -->
      <div class="hq-info-grid">
        <!-- 섹션 1: 기업 프로필 -->
        <div class="hq-card-section">
          <div class="card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            기업 프로필
          </div>
          <div class="card-content">
            <div class="hq-form-group">
              <label>기업 명칭</label>
              <input type="text" v-model="hqData.name" :disabled="!isEditing" :class="{ 'is-editing': isEditing }">
            </div>
            <div class="hq-form-group">
              <label>대표자 성명</label>
              <input type="text" v-model="hqData.representativeName" @input="hqData.representativeName = hqData.representativeName.replace(/[0-9]/g, '')" :disabled="!isEditing" :class="{ 'is-editing': isEditing }">
            </div>
            <div class="hq-form-group">
              <label>사업자 등록 번호</label>
              <input type="text" :value="hqData.businessNumber" disabled>
            </div>
          </div>
        </div>

        <!-- 섹션 2: 연락처 및 주소 -->
        <div class="hq-card-section">
          <div class="card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            지리 정보 및 연락처
          </div>
          <div class="card-content">
            <div class="hq-form-group">
              <label>본사 연락처</label>
              <input type="tel" v-model="hqData.phone" :disabled="!isEditing" :class="{ 'is-editing': isEditing }" @input="handlePhoneInput" maxlength="13" placeholder="예: 02-1234-5678">
            </div>
            <div class="hq-form-group full-width">
              <label>본사 공식 소재지</label>
              <div class="address-input-wrapper">
                <input type="text" v-model="hqData.address" :disabled="!isEditing" :class="{ 'is-editing': isEditing }" readonly @click="isEditing && openPostcode()">
                <button v-if="isEditing" @click="openPostcode" class="btn-search-addr">주소 검색</button>
              </div>
              <input 
                v-if="isEditing" 
                type="text" 
                v-model="hqData.detailAddress" 
                placeholder="상세 주소를 입력하세요" 
                class="detail-address-input-hq"
              >
            </div>
          </div>
        </div>

        <!-- 섹션 3: 지도 섹션 -->
        <div class="hq-card-section map-section full-width">
          <div class="card-header">
            본사 위치 안내
          </div>
          <div class="map-container">
            <iframe
              v-if="hqData.address"
              width="100%"
              height="380"
              frameborder="0"
              style="border:0; border-radius: 12px;"
              :src="`https://maps.google.com/maps?q=${encodeURIComponent(hqData.address)}&z=16&output=embed`"
              allowfullscreen>
            </iframe>
            <div v-else class="no-map-placeholder">주소를 등록해 주세요</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const isEditing = ref(false)
const hqData = ref(null)
const originalData = ref(null)

const regionMap = {
  'SEOUL': '서울특별시',
  'GYEONGGI': '경기도',
  'INCHEON': '인천광역시',
  'BUSAN': '부산광역시',
  'DAEGU': '대구광역시',
  'DAEJEON': '대전광역시',
  'GWANGJU': '광주광역시',
  'ULSAN': '울산광역시',
  'SEJONG': '세종특별자치시',
  'GANGWON': '강원도',
  'CHUNGBUK': '충청북도',
  'CHUNGNAM': '충청남도',
  'JEONBUK': '전라북도',
  'JEONNAM': '전라남도',
  'GYEONGBUK': '경상북도',
  'GYEONGNAM': '경상남도',
  'JEJU': '제주특별자치도'
}

onMounted(async () => {
  await fetchHqInfo()
})

const fetchHqInfo = async () => {
  try {
    const response = await api.get('/hq/business-units/HQ/1')
    if (response.data.success) {
      hqData.value = response.data.data
      hqData.value.detailAddress = ''
      if (hqData.value.phone) {
        handlePhoneInput({ target: { value: hqData.value.phone } })
      }
    }
  } catch (error) {
    console.error('본사 정보 조회 실패:', error)
  }
}

const startEdit = () => {
  originalData.value = { ...hqData.value }
  isEditing.value = true
}

const cancelEdit = () => {
  if (originalData.value) {
    hqData.value = { ...originalData.value }
  }
  isEditing.value = false
}

const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length < 3) {
    hqData.value.phone = val;
    return;
  }
  
  if (val.startsWith('02')) {
    if (val.length <= 5) {
      val = val.replace(/(\d{2})(\d{1,3})/, '$1-$2');
    } else if (val.length <= 9) {
      val = val.replace(/(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3');
    } else {
      val = val.replace(/(\d{2})(\d{4})(\d{1,4})/, '$1-$2-$3');
    }
  } else {
    if (val.length <= 6) {
      val = val.replace(/(\d{3})(\d{1,3})/, '$1-$2');
    } else if (val.length <= 10) {
      val = val.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
    } else {
      val = val.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    }
  }
  hqData.value.phone = val.slice(0, 13);
}

const openPostcode = () => {
  const width = 500
  const height = 600
  const left = (window.screen.width / 2) - (width / 2)
  const top = (window.screen.height / 2) - (height / 2)

  new window.daum.Postcode({
    oncomplete: (data) => {
      hqData.value.address = data.address
    }
  }).open({
    left: left,
    top: top,
    popupTitle: '본사 소재지 검색'
  })
}

const saveChanges = async () => {
  try {
    const payload = {
      name: hqData.value.name,
      address: hqData.value.detailAddress ? `${hqData.value.address} ${hqData.value.detailAddress}` : hqData.value.address,
      phone: hqData.value.phone,
      representativeName: hqData.value.representativeName,
    }
    const response = await api.patch('/hq/business-units/HQ/1', payload)
    if (response.data.success) {
      alert('본사 정보가 성공적으로 업데이트되었습니다.')
      hqData.value = response.data.data
      isEditing.value = false
    }
  } catch (error) {
    console.error('본사 정보 업데이트 실패:', error)
    const serverMessage = error.response?.data?.message
    alert(serverMessage || '본사 정보 업데이트 중 오류가 발생했습니다.')
  }
}

const getRegionLabel = (region) => {
  return regionMap[region] || region
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.hq-management-container {
  padding: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Header Section */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
}


.title-group h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-top: 0.25rem;
}

/* Header Buttons */
.btn-premium-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.4rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.btn-premium-edit:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.25);
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-premium-save {
  padding: 0.6rem 1.4rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.btn-premium-save:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.25);
}

.btn-premium-cancel {
  padding: 0.6rem 1.2rem;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Profile Banner */
.hq-profile-banner {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.profile-main-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.hq-symbol-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.logo-barcode-mini {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 42px;
  color: #0f172a;
  margin: 0;
  font-weight: 100;
  transform: scaleX(0.8);
  letter-spacing: 2px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
}


.hq-display-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.hq-meta-row {
  margin-top: 0.5rem;
}

.hq-code-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.5px;
  border: 2px solid #dbeafe;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}

.profile-status-stats {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding-right: 2rem;
}

.stat-box {
  text-align: right;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-value.active { color: #10b981; }

.stat-divider {
  width: 1px;
  height: 40px;
  background: #f1f5f9;
}

/* Grid Layout */
.hq-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.hq-card-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem 1.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.hq-card-section.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f8fafc;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hq-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.hq-form-group.full-width {
  grid-column: 1 / -1;
}

.hq-form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
}

.hq-form-group input, .hq-form-group select {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  width: 100%;
  transition: all 0.2s;
}

.hq-form-group input.is-editing, .hq-form-group select.is-editing {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hq-form-group input:disabled, .hq-form-group select:disabled {
  color: #64748b;
  cursor: not-allowed;
}

.hq-readonly-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #64748b;
}


.address-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.1rem;
}

.detail-address-input-hq {
  margin-top: -0.3rem;
}

.btn-search-addr {
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #3b82f6;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.map-container {
  height: 300px;
  margin-top: 0.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.no-map-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  color: #94a3b8;
  border-radius: 12px;
}
</style>
