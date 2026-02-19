<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content fade-in" :class="{ 'edit-mode': isEditMode }">
      <div class="modal-header">
        <div class="header-left">
          <h2>
            {{ type === 'company' ? '운송 업체' : '배송 차량' }} 
            {{ isEditMode ? '정보 수정' : '상세 정보' }}
          </h2>
          <span v-if="data.status" :class="['status-badge', getStatusClass(data.status)]">
            {{ getStatusLabel(data.status) }}
          </span>
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
              <span class="value">{{ data.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">담당자명</span>
              <span class="value">{{ data.managerName }}</span>
            </div>
            <div class="info-item">
              <span class="label">업체 연락처</span>
              <span class="value">{{ data.phone }}</span>
            </div>
            <div class="info-item">
              <span class="label">주력 운송 지역</span>
              <span class="value">{{ data.mainRegion }}</span>
            </div>
            <div class="info-item">
              <span class="label">사업장 주소</span>
              <span class="value">{{ data.address }}</span>
            </div>
            <div class="info-item">
              <span class="label">보유 차량 수</span>
              <span class="value">{{ data.vehicleCount }}대</span>
            </div>
            <div class="info-item">
              <span class="label">운송 단가</span>
              <span class="value highlight-text">{{ data.costPerKm?.toLocaleString() }} 원/km</span>
            </div>
            <div class="info-item">
              <span class="label">계약 시작일</span>
              <span class="value">{{ data.contractStart }}</span>
            </div>
            <div class="info-item">
              <span class="label">계약 종료일</span>
              <span class="value">{{ data.contractEnd }}</span>
            </div>
          </div>

          <!-- 정보 그리드 (차량) -->
          <div v-else class="info-list">
            <div class="info-item">
              <span class="label">차량 번호</span>
              <span class="value highlight-text">{{ data.vehicleNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">소속 업체</span>
              <span class="value">{{ data.company }}</span>
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
          </div>
        </div>

        <!-- 2. 수정 모드 (Edit Mode) -->
        <div v-else class="edit-form">
          <div v-if="type === 'company'" class="form-grid">
            <div class="form-group">
              <label>운송 업체명 <span class="required">*</span></label>
              <input type="text" v-model="formData.name" required>
            </div>
            <div class="form-group">
              <label>업체 연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.phone" required>
            </div>
            <div class="form-group full-width">
              <label>사업장 주소 <span class="required">*</span></label>
              <input type="text" v-model="formData.address" required>
            </div>
            <div class="form-group">
              <label>담당자 이름</label>
              <input type="text" v-model="formData.managerName">
            </div>
            <div class="form-group">
              <label>주력 운송 지역 <span class="required">*</span></label>
              <select v-model="formData.mainRegion" required>
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
              <input type="number" v-model="formData.vehicleCount" required>
            </div>
            <div class="form-group">
              <label>운송 단가 (원/km) <span class="required">*</span></label>
              <input type="number" v-model="formData.costPerKm" required>
            </div>
            <div class="form-group">
              <label>계약 시작일 <span class="required">*</span></label>
              <input type="date" v-model="formData.contractStart" required>
            </div>
            <div class="form-group">
              <label>계약 종료일 <span class="required">*</span></label>
              <input type="date" v-model="formData.contractEnd" required>
            </div>
          </div>

          <div v-else class="form-grid">
            <div class="form-group">
              <label>차량 번호 <span class="required">*</span></label>
              <input type="text" v-model="formData.vehicleNo" required>
            </div>
            <div class="form-group">
              <label>소속 업체 <span class="required">*</span></label>
              <input type="text" v-model="formData.company" disabled class="input-disabled">
            </div>
            <div class="form-group">
              <label>차량 종류 <span class="required">*</span></label>
              <select v-model="formData.vehicleType" required>
                <option value="frozen">냉동탑차</option>
                <option value="normal">카고/일반탑차</option>
                <option value="wingbody">윙바디</option>
                <option value="bike">이륜차</option>
              </select>
            </div>
            <div class="form-group">
              <label>최대 적재량 <span class="required">*</span></label>
              <input type="text" v-model="formData.maxLoad" required>
            </div>
            <div class="form-group">
              <label>운전자 이름 <span class="required">*</span></label>
              <input type="text" v-model="formData.driverName" required>
            </div>
            <div class="form-group">
              <label>운전자 연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.driverPhone" required>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <template v-if="!isEditMode">
          <div class="footer-left">
            <button v-if="data.status === 'active' || !data.status" @click="confirmDeactivate" class="btn-deactivate">비활성화</button>
            <button v-else-if="data.status === 'inactive'" @click="confirmRestore" class="btn-restore">복구하기</button>
            <button v-if="data.status !== 'deleted'" @click="confirmDelete" class="btn-delete">삭제</button>
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
    'frozen': '냉동탑차',
    'normal': '카고/일반탑차',
    'wingbody': '윙바디',
    'bike': '이륜차'
  }
  return types[type] || type
}

const save = () => {
  emit('save', { type: props.type, data: formData.value })
  isEditMode.value = false
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'active': return props.type === 'vehicle' ? '운행가능' : '활성'
    case 'inactive': return '비활성'
    case 'deleted': return '삭제됨'
    default: return props.type === 'vehicle' ? '운행가능' : '활성'
  }
}

const getStatusClass = (status) => {
  switch(status) {
    case 'active': return 'active'
    case 'inactive': return 'inactive'
    case 'deleted': return 'deleted'
    default: return 'active'
  }
}

const confirmDeactivate = () => {
  const targetName = props.type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 비활성화하시겠습니까?`)) {
    formData.value.status = 'inactive'
    save()
  }
}

const confirmRestore = () => {
  const targetName = props.type === 'company' ? '운송 업체' : '차량'
  if (confirm(`${targetName}를 다시 활성화하시겠습니까?`)) {
    formData.value.status = 'active'
    save()
  }
}

const confirmDelete = () => {
  const targetName = props.type === 'company' ? '운송 업체' : '차량'
  if (confirm(`이 ${targetName}를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`)) {
    formData.value.status = 'deleted'
    save()
  }
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
  width: 90%; max-width: 500px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: max-width 0.3s ease;
}

.modal-content.edit-mode { max-width: 600px; }

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

.modal-footer {
  padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.footer-left, .footer-right {
  display: flex;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem; background: white; border: 1.5px solid #e2e8f0;
  border-radius: 10px; color: #64748b; font-weight: 600; cursor: pointer;
}
.btn-edit-toggle, .btn-save {
  padding: 0.75rem 1.5rem; background: #0f172a; color: white; border: none;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 0.5rem;
}
.btn-edit-toggle:hover, .btn-save:hover { background: #1e293b; transform: translateY(-1px); }

.btn-deactivate {
  padding: 0.75rem 1.5rem; background: white; color: #ef4444; border: 1.5px solid #ef4444;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-deactivate:hover { background: #fff1f2; }

.btn-restore {
  padding: 0.75rem 1.5rem; background: #15803d; color: white; border: none;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-restore:hover { background: #166534; transform: translateY(-1px); }

.btn-delete {
  padding: 0.75rem 1.5rem; background: #ef4444; color: white; border: none;
  border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.btn-delete:hover { background: #dc2626; transform: translateY(-1px); }

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>
