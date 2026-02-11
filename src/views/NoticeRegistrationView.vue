<template>
  <div class="notice-registration-container">
    <div class="registration-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"></path>
          </svg>
          목록으로
        </button>
        <h1>{{ isEdit ? '공지사항 수정' : '새 공지사항 등록' }}</h1>
      </div>
    </div>

    <div class="form-card">
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>제목</label>
          <input 
            type="text" 
            v-model="formData.title" 
            placeholder="공지사항 제목을 입력하세요" 
            required
            class="title-input"
          >
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.isImportant">
              <span>중요 공지로 설정 (목록 상단 노출 및 강조)</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>내용</label>
          <textarea 
            v-model="formData.content" 
            placeholder="공지사항 내용을 상세히 입력하세요..." 
            required
            rows="15"
          ></textarea>
        </div>

        <div class="attachment-section">
          <label>첨부파일</label>
          <div class="file-upload-box" :class="{ 'has-file': formData.fileName }">
            <input type="file" id="notice-file" @change="handleFileChange" style="display: none">
            <label for="notice-file" class="file-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ formData.fileName || '파일을 선택하거나 여기로 드래그하세요 (최대 10MB)' }}</span>
            </label>
            <button v-if="formData.fileName" type="button" @click="removeFile" class="btn-remove-file">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn-cancel">취소</button>
          <button type="submit" class="btn-submit">
            {{ isEdit ? '수정 완료' : '등록하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const formData = reactive({
  title: '',
  content: '',
  isImportant: false,
  fileName: ''
})

onMounted(() => {
  if (route.name === 'notice-edit') {
    isEdit.value = true
    const noticeId = route.params.id
    
    // 샘플 데이터 매칭 (실제로는 API 호출)
    const mockNotices = [
      {
        id: '3',
        title: '[긴급] 시스템 점검 안내 (02/15)',
        content: '원활한 서비스 제공을 위해 아래와 같이 시스템 점검을 진행할 예정입니다.\n\n[점검 일시]\n2026년 2월 15일(일) 02:00 ~ 04:00 (약 2시간)\n\n[점검 내용]\n데이터베이스 최적화 및 보안 패치 적용\n\n점검 시간 동안에는 서비스 접속이 일시적으로 제한될 수 있으니 양해 부탁드립니다.',
        isImportant: true
      },
      {
        id: '2',
        title: '신규 상품 입고 및 주문 가이드 안내',
        content: '안녕하세요. 본사 관리자입니다.\n\n2026년 상반기 신규 상품 라인업이 확정되어 안내 드립니다.\n첨부된 가이드 파일을 확인하시어 주문 및 판매에 참고 부탁드립니다.\n\n궁금하신 사항은 영업담당자에게 문의 바랍니다.',
        isImportant: false,
        fileName: '2026_신규상품_가이드라인.pdf'
      },
      {
        id: '1',
        title: '개인정보 처리방침 개정 안내',
        content: '안녕하세요. 본사 관리자입니다.\n\n회사의 개인정보 처리방침이 다음과 같이 개정될 예정임을 안내 드립니다.\n\n[주요 개정 내용]\n- 개인정보 보호 책임자 지정 방식 변경\n- 제3자 제공 업체 현황 업데이트\n\n개정된 방침은 2026년 3월 1일부터 적용됩니다.',
        isImportant: false
      }
    ]

    const found = mockNotices.find(n => n.id === noticeId)
    if (found) {
      formData.title = found.title
      formData.content = found.content
      formData.isImportant = found.isImportant
      formData.fileName = found.fileName || ''
    }
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    formData.fileName = file.name
  }
}

const removeFile = () => {
  formData.fileName = ''
  document.getElementById('notice-file').value = ''
}

const submitForm = () => {
  alert(isEdit.value ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.')
  router.push('/notice')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.notice-registration-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.registration-header {
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.registration-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
}

.form-card {
  background: white;
  padding: 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.title-input {
  font-size: 1.1rem;
  font-weight: 600;
}

input[type="text"],
textarea {
  padding: 0.85rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

input[type="text"]:focus,
textarea:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.checkbox-group {
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #1e293b;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 첨부파일 */
.attachment-section {
  margin-bottom: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-section label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.file-upload-box {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s;
}

.file-upload-box:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.file-upload-box.has-file {
  border-style: solid;
  border-color: #0f172a;
  background: #f1f5f9;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
}

.has-file .file-label {
  color: #0f172a;
  font-weight: 600;
}

.btn-remove-file {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 버튼 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel {
  padding: 0.75rem 2rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  padding: 0.75rem 2.5rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  background: #1e293b;
  transform: translateY(-1px);
}
</style>
