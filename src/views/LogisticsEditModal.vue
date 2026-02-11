<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content fade-in">
      <div class="modal-header">
        <h2>{{ type === 'company' ? '운송 업체 수정' : '배송 차량 수정' }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body custom-scrollbar">
        <!-- 업체 수정 폼 -->
        <div v-if="type === 'company'" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>운송 업체명 <span class="required">*</span></label>
              <input type="text" v-model="formData.name" required>
            </div>
            <div class="form-group">
              <label>대표 연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.phone" required>
            </div>
            <div class="form-group full-width">
              <label>사업장 주소 <span class="required">*</span></label>
              <input type="text" v-model="formData.address" required>
            </div>
            <div class="form-group">
              <label>담당자 이름</label>
              <input type="text" v-model="formData.manager" placeholder="담당자 이름">
            </div>
            <div class="form-group">
              <label>주력 운송 지역 <span class="required">*</span></label>
              <select v-model="formData.region" required>
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
              <label>운송 단가 <span class="required">*</span></label>
              <input type="number" v-model="formData.cost" required>
            </div>
            <div class="form-group">
              <label>계약 종료일 <span class="required">*</span></label>
              <input type="date" v-model="formData.contractEnd" required>
            </div>
          </div>
        </div>

        <!-- 차량 수정 폼 -->
        <div v-if="type === 'vehicle'" class="edit-form">
          <div class="form-grid">
            <div class="form-group">
              <label>차량 번호 <span class="required">*</span></label>
              <input type="text" v-model="formData.no" required>
            </div>
            <div class="form-group">
              <label>소속 업체 <span class="required">*</span></label>
              <input type="text" v-model="formData.company" disabled class="input-disabled">
            </div>
            <div class="form-group">
              <label>차량 종류 <span class="required">*</span></label>
              <select v-model="formData.type" required>
                <option value="냉동탑차">냉동탑차</option>
                <option value="카고">카고/일반탑차</option>
                <option value="윙바디">윙바디</option>
                <option value="이륜차">이륜차</option>
              </select>
            </div>
            <div class="form-group">
              <label>톤수 <span class="required">*</span></label>
              <select v-model="formData.tonnage" required>
                <option value="1t">1톤</option>
                <option value="2.5t">2.5톤</option>
                <option value="5t">5톤</option>
                <option value="11t">11톤</option>
                <option value="etc">기타</option>
              </select>
            </div>
            <div class="form-group">
              <label>운전자 이름 <span class="required">*</span></label>
              <input type="text" v-model="formData.driver" required>
            </div>
            <div class="form-group">
              <label>연락처 <span class="required">*</span></label>
              <input type="tel" v-model="formData.phone" required>
            </div>
            <div class="form-group full-width">
              <label>최대 적재량 <span class="required">*</span></label>
              <input type="text" v-model="formData.load" required>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="save">정보 수정</button>
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

const formData = ref({})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.data) {
    formData.value = { ...props.data }
  }
})

const save = () => {
  emit('save', { type: props.type, data: formData.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
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
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.required {
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 0.7rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.input-disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-save {
  padding: 0.75rem 2rem;
  background: #0f172a;
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
