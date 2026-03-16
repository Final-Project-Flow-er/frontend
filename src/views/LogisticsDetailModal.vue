<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content fade-in" :class="{ 'edit-mode': isEditMode }">
      <div class="modal-header">
        <div class="header-left">
          <h2 class="modal-title">
            {{ props.type === 'company' ? formData.companyName : formData.vehicleNumber }}
            <span class="type-tag">{{ props.type === 'company' ? '운송 업체' : '배송 차량' }}</span>
          </h2>
          <div v-if="formData.status" :class="['status-badge', getStatusClass(formData.status)]">
            {{ getStatusLabel(formData.status) }}
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body custom-scrollbar">
        <!-- 1. 조회 모드 (View Mode) -->
        <div v-if="!isEditMode" class="detail-view">
          <!-- 정보 그리드 (업체) -->
          <div v-if="type === 'company'" class="info-list">
            <div class="info-item">
              <span class="label">운송 업체명</span>
              <span class="value">{{ data.companyName }}</span>
            </div>
            <div class="info-item">
              <span class="label">담당자명</span>
              <span class="value">{{ data.manager }}</span>
            </div>
            <div class="info-item">
              <span class="label">업체 연락처</span>
              <span class="value">{{ data.officePhone }}</span>
            </div>
            <div class="info-item">
              <span class="label">주력 운송 지역</span>
              <span class="value">{{ getRegionLabel(data.usableRegion) }}</span>
            </div>
            <div class="info-item">
              <span class="label">사업장 주소</span>
              <span class="value">{{ data.address }}</span>
            </div>
            <div class="info-item">
              <span class="label">보유 차량 수</span>
              <span class="value">{{ data.ownedVehicles }}대</span>
            </div>
            <div class="info-item">
              <span class="label">운송 단가</span>
              <span class="value">{{ data.unitPrice?.toLocaleString() }} 원/km</span>
            </div>
            <div class="info-item">
              <span class="label">계약 시작일</span>
              <span class="value">{{ data.contractStartDate }}</span>
            </div>
            <div class="info-item">
              <span class="label">계약 종료일</span>
              <span class="value">{{ data.contractEndDate }}</span>
            </div>
          </div>

          <!-- 정보 그리드 (차량) -->
          <div v-else class="info-list">
            <div class="info-item">
              <span class="label">차량 번호</span>
              <span class="value">{{ data.vehicleNumber }}</span>
            </div>
            <div class="info-item">
              <span class="label">소속 업체</span>
              <span class="value">{{ data.companyNameText }}</span>
            </div>
            <div class="info-item">
              <span class="label">차량 종류</span>
              <span class="value">{{ getVehicleTypeText(data.vehicleType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">최대 적재량</span>
              <span class="value">{{ data.maxLoad }}</span>
            </div>
            <div class="info-item">
              <span class="label">운전자명</span>
              <span class="value">{{ data.driverName }}</span>
            </div>
            <div class="info-item">
              <span class="label">운전자 연락처</span>
              <span class="value">{{ data.driverPhone }}</span>
            </div>
            <div class="info-item">
              <span class="label">배차 상태</span>
              <span class="value">{{ getDispatchLabel(data.dispatchable) }}</span>
            </div>
          </div>
        </div>

        <!-- 2. 수정 모드 (Edit Mode) -->
        <div v-else class="edit-form">
          <div v-if="props.type === 'company'" class="form-grid">
            <div class="form-group">
              <label>운송 업체명 <span class="required">*</span></label>
              <input type="text" v-model="formData.companyName" required>
            </div>
            <div class="form-group">
              <label>업체 연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.officePhone" @input="handlePhoneInput" required>
            </div>
            <div class="form-group full-width">
              <label>사업장 주소 <span class="required">*</span></label>
              <div class="address-input-group">
                <input type="text" v-model="formData.address" required readonly>
                <button type="button" @click="openPostcode" class="btn-address">주소 검색</button>
              </div>
            </div>
            <div class="form-group">
              <label>담당자 이름 <span class="required">*</span></label>
              <input type="text" v-model="formData.manager" required>
            </div>
            <div class="form-group">
              <label>주력 운송 지역 <span class="required">*</span></label>
              <select v-model="formData.usableRegion" required>
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
            <div class="form-group">
              <label>보유 차량 수 <span class="required">*</span></label>
              <input type="number" v-model="formData.ownedVehicles" required>
            </div>
            <div class="form-group">
              <label>운송 단가 (원/km) <span class="required">*</span></label>
              <input type="number" v-model="formData.unitPrice" required>
            </div>
            <div class="form-group">
              <label>계약 시작일 <span class="required">*</span></label>
              <input type="date" v-model="formData.contractStartDate" @change="validateDates" required>
            </div>
            <div class="form-group">
              <label>계약 종료일 <span class="required">*</span></label>
              <input type="date" v-model="formData.contractEndDate" @change="validateDates" required>
            </div>
            <div class="form-group">
              <label>운영 상태 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            </div>
          </div>

          <div v-else class="form-grid">
            <div class="form-group">
              <label>차량 번호 <span class="required">*</span></label>
              <input type="text" v-model="formData.vehicleNumber" @input="handleVehicleNumberInput" required>
            </div>
            <div class="form-group">
              <label>소속 업체 <span class="required">*</span></label>
              <input type="text" v-model="formData.companyNameText" disabled class="input-disabled">
            </div>
            <div class="form-group">
              <label>차량 종류 <span class="required">*</span></label>
              <select v-model="formData.vehicleType" required>
                <option value="CARGO">카고</option>
                <option value="WING_BODY">윙바디</option>
                <option value="REFRIGERATED_TOP">냉동탑차</option>
                <option value="CHILLED_TOP">냉장탑차</option>
                <option value="CONTAINER">컨테이너 캐리어</option>
              </select>
            </div>
            <div class="form-group">
              <label>최대 적재량 (카) <span class="required">*</span></label>
              <input type="number" v-model.number="formData.maxLoad" min="0" required>
            </div>
            <div class="form-group">
              <label>운전자 이름 <span class="required">*</span></label>
              <input type="text" v-model="formData.driverName" required>
            </div>
            <div class="form-group">
              <label>기사 연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.driverPhone" @input="handleDriverPhoneInput" required>
            </div>
            <div class="form-group">
              <label>운영 상태 <span class="required">*</span></label>
              <select v-model="formData.status" required>
                <option value="ACTIVE">운행가능 (활성)</option>
                <option value="INACTIVE">운행중지 (비활성)</option>
              </select>
            </div>
            <div class="form-group">
              <label>배차 상태 <span class="required">*</span></label>
              <select v-model="formData.dispatchable" required>
                <option value="AVAILABLE">배차 가능</option>
                <option value="UNAVAILABLE">배차 불가</option>
                <option value="DISPATCHED">배차 중</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <template v-if="!isEditMode">
          <div class="footer-left">
            <button v-if="!data.status || ['active', 'ACTIVE'].includes(data.status)" @click="confirmDeactivate" class="btn-deactivate">비활성화</button>
            <button v-else-if="['inactive', 'INACTIVE'].includes(data.status)" @click="confirmRestore" class="btn-restore">복구하기</button>
            <button v-if="!data.status || !['deleted', 'DELETED'].includes(data.status)" @click="confirmDelete" class="btn-delete">삭제</button>
          </div>
          <div class="footer-right">
            <button class="btn-cancel" @click="$emit('close')">닫기</button>
            <button class="btn-edit-toggle" @click="isEditMode = true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              정보 수정
            </button>
          </div>
        </template>
        <template v-else>
          <button class="btn-cancel" @click="isEditMode = false">취소</button>
          <button class="btn-save" @click="save">저장하기</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  type: String, // 'company' or 'vehicle'
  data: Object
})

const emit = defineEmits(['close', 'save'])

const isEditMode = ref(false)
const formData = ref({})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isEditMode.value = false // 열릴 때는 항상 조회 모드
    if (props.data) {
      formData.value = { ...props.data }
    }
  }
})

const getVehicleTypeText = (type) => {
  const types = {
    'CARGO': '카고',
    'WING_BODY': '윙바디',
    'REFRIGERATED_TOP': '냉동탑차',
    'CHILLED_TOP': '냉장탑차',
    'CONTAINER': '컨테이너 캐리어'
  }
  return types[type] || type
}

const getDispatchLabel = (status) => {
  const labels = {
    'AVAILABLE': '배차 가능',
    'UNAVAILABLE': '배차 불가',
    'DISPATCHED': '배차 완료'
  }
  return labels[status] || status
}

// 자동 하이픈 및 형식 제어 로직
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
  formData.value.officePhone = val
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
  formData.value.driverPhone = val
}

const handleVehicleNumberInput = (e) => {
  let raw = e.target.value.replace(/\s/g, '')
  let result = ''
  const leadingNums = raw.match(/^[0-9]{1,2}/)?.[0] || ''
  result += leadingNums
  const afterNums = raw.slice(leadingNums.length)
  const hangul = afterNums.match(/^[가-힣]/)?.[0] || ''
  result += hangul
  const afterHangul = afterNums.slice(hangul.length)
  const trailingNums = afterHangul.replace(/[^0-9]/g, '').slice(0, 4)
  if (hangul && trailingNums) result += ' ' + trailingNums
  else if (hangul) result += ' '
  formData.value.vehicleNumber = result
}

const openPostcode = () => {
  const width = 500
  const height = 600
  new window.daum.Postcode({
    oncomplete: (data) => {
      formData.value.address = data.address
      const sidoMap = {
        '서울': 'SEOUL', '경기': 'GYEONGGI', '인천': 'INCHEON', '부산': 'BUSAN',
        '대구': 'DAEGU', '대전': 'DAEJEON', '광주': 'GWANGJU', '울산': 'ULSAN',
        '세종': 'SEJONG', '강원': 'GANGWON', '충북': 'CHUNGBUK', '충남': 'CHUNGNAM',
        '전북': 'JEONBUK', '전남': 'JEONNAM', '경북': 'GYEONGBUK', '경남': 'GYEONGNAM',
        '제주': 'JEJU'
      }
      const mapped = sidoMap[data.sido] || Object.entries(sidoMap).find(([k]) => data.sido.includes(k))?.[1]
      if (mapped) formData.value.usableRegion = mapped
    }
  }).open({
    left: (window.screen.width / 2) - (width / 2),
    top: (window.screen.height / 2) - (height / 2)
  })
}

const validateDates = () => {
  if (formData.value.contractStartDate && formData.value.contractEndDate) {
    if (formData.value.contractEndDate <= formData.value.contractStartDate) {
      alert('계약 종료일은 시작일보다 이후여야 합니다.')
      formData.value.contractEndDate = ''
    }
  }
}

const save = () => {
  if (props.type === 'company') {
    if (!formData.value.companyName?.trim() || 
        !formData.value.officePhone?.trim() || 
        !formData.value.address?.trim() || 
        !formData.value.manager?.trim() ||
        !formData.value.usableRegion ||
        formData.value.ownedVehicles === null ||
        formData.value.unitPrice === null ||
        !formData.value.contractStartDate ||
        !formData.value.contractEndDate) {
      alert('모든 필수 정보를 입력해주세요.')
      return
    }
  } else {
    if (!formData.value.vehicleNumber?.trim() || 
        !formData.value.driverName?.trim() || 
        !formData.value.driverPhone?.trim() ||
        !formData.value.vehicleType ||
        !formData.value.maxLoad ||
        !formData.value.status ||
        !formData.value.dispatchable) {
      alert('모든 필수 정보를 입력해주세요.')
      return
    }
  }

  emit('save', { type: props.type, data: formData.value })
  isEditMode.value = false
}

const getRegionLabel = (region) => {
  const regions = {
    SEOUL: '서울', GYEONGGI: '경기', INCHEON: '인천', GANGWON: '강원',
    CHUNGNAM: '충남', CHUNGBUK: '충북', DAEJEON: '대전', SEJONG: '세종',
    JEONNAM: '전남', JEONBUK: '전북', GWANGJU: '광주',
    GYEONGNAM: '경남', GYEONGBUK: '경북', BUSAN: '부산',
    DAEGU: '대구', ULSAN: '울산', JEJU: '제주'
  }
  return regions[region] || region || '-'
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'ACTIVE': case 'active': return props.type === 'vehicle' ? '운행가능' : '활성'
    case 'INACTIVE': case 'inactive': return '비활성'
    case 'DELETED': case 'deleted': return '삭제됨'
    default: return props.type === 'vehicle' ? '운행가능' : '활성'
  }
}

const getStatusClass = (status) => {
  switch(status) {
    case 'ACTIVE': case 'active': return 'active'
    case 'INACTIVE': case 'inactive': return 'inactive'
    case 'DELETED': case 'deleted': return 'deleted'
    default: return 'active'
  }
}

const confirmDeactivate = () => {
  const targetName = props.type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 비활성화하시겠습니까?`)) {
    formData.value.status = 'INACTIVE'
    save()
  }
}

const confirmRestore = () => {
  const targetName = props.type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 다시 활성화하시겠습니까?`)) {
    formData.value.status = 'ACTIVE'
    save()
  }
}

const confirmDelete = () => {
  emit('delete', { type: props.type, data: props.data })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-content {
  background: white; border-radius: 20px;
  width: 90%; max-width: 600px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: max-width 0.3s ease;
}

.modal-content.edit-mode { max-width: 650px; }

.modal-header {
  padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0; }

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }
.status-badge.deleted { background: #fee2e2; color: #b91c1c; }

.close-btn {
  background: none; border: none; color: #94a3b8; cursor: pointer;
  padding: 0.5rem; border-radius: 50%; transition: all 0.2s;
}
.close-btn:hover { background: #f1f5f9; color: #0f172a; }

.modal-body { padding: 2rem; overflow-y: auto; }

/* 조회 모드 스타일 */
.info-list { display: flex; flex-direction: column; gap: 0.75rem; }
.info-item {
  display: flex; padding: 0.75rem 0; border-bottom: 1px solid #f8fafc;
  justify-content: space-between; align-items: center;
}
.info-item:last-child { border-bottom: none; }
.info-item .label { color: #64748b; font-weight: 600; font-size: 0.95rem; }
.info-item .value { color: #0f172a; font-weight: 500; text-align: right; }
.highlight-text { color: #2563eb !important; font-weight: 700 !important; }

/* 수정 모드 스타일 */
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.form-group input, .form-group select {
  padding: 0.75rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; transition: all 0.2s; outline: none; background: white;
}
.form-group input:focus, .form-group select:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1); }
.input-disabled { background: #f8fafc; cursor: not-allowed; color: #94a3b8; }

.address-input-group { display: flex; gap: 0.5rem; }
.address-input-group input { flex: 1; }
.btn-address {
  padding: 0 1rem; background: #f1f5f9; border: 1.5px solid #e2e8f0;
  border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer;
  white-space: nowrap; transition: all 0.2s;
}
.btn-address:hover { background: #e2e8f0; }

.modal-footer {
  padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.footer-left, .footer-right {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.55rem 1.2rem; background: white; border: 1px solid #e2e8f0;
  border-radius: 8px; color: #64748b; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #f8fafc; }

.btn-edit-toggle, .btn-save {
  padding: 0.55rem 1.2rem; background: #0f172a; color: white; border: none;
  border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 0.5rem;
}
.btn-edit-toggle:hover, .btn-save:hover { background: #1e293b; }

.btn-deactivate {
  padding: 0.55rem 1.2rem; background: white; color: #64748b; border: 1px solid #cbd5e1;
  border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-deactivate:hover { background: #f1f5f9; color: #475569; }

.btn-restore {
  padding: 0.55rem 1.2rem; background: white; color: #10b981; border: 1px solid #6ee7b7;
  border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-restore:hover { background: #ecfdf5; }

.btn-delete {
  padding: 0.55rem 1.2rem; background: white; color: #ef4444; border: 1px solid #fca5a5;
  border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.btn-delete:hover { background: #fef2f2; }

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
