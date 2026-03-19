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

        <div class="form-group">
          <label>작성자</label>
          <input 
            type="text" 
            v-model="formData.author" 
            disabled
            class="input-disabled"
          >
        </div>

        <div class="important-settings-card">
          <div class="checkbox-group">
            <label class="checkbox-label highlight">
              <input type="checkbox" v-model="formData.important">
              <div class="label-text">
                <span class="main-label">중요 공지로 설정</span>
                <span class="sub-label">목록 상단에 고정되어 가독성을 높입니다.</span>
              </div>
            </label>
          </div>
          
          <div v-if="formData.important" class="expiration-container fade-in">
            <div class="expiration-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>상단 고정 종료 일시</span>
            </div>
            <div class="expiration-input-group">
              <input 
                type="datetime-local" 
                v-model="formData.importantUntil" 
                class="modern-date-input"
              >
              <span class="expiration-hint">지정된 시간이 지나면 자동으로 일반 공지로 전환됩니다.</span>
            </div>
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
          <label>첨부 파일</label>
          
          <div 
            class="file-upload-box" 
            :class="{ 'has-file': files.length > 0 || existingImages.length > 0 || existingAttachments.length > 0, 'is-dragover': isDragOver }"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
          >
            <input 
              type="file" 
              id="notice-file" 
              @change="handleFileChange" 
              multiple 
              accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .zip"
              style="display: none"
            >
            <label for="notice-file" class="file-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <div class="upload-text">
                <span class="main-text">{{ (files.length === 0 && existingImages.length === 0 && existingAttachments.length === 0) ? '파일을 선택하거나 여기로 드래그하세요' : `${files.length + existingImages.length + existingAttachments.length}개의 파일` }}</span>
                <span class="sub-text">이미지, PDF, 문서 등 (최대 10MB)</span>
              </div>
            </label>
            <button v-if="files.length > 0 || existingImages.length > 0 || existingAttachments.length > 0" type="button" @click.stop="clearAllFiles" class="btn-clear-all">
              전체 삭제
            </button>
          </div>

          <!-- 통합 이미지 미리보기 (기존 + 새 파일) -->
          <div v-if="existingImages.length > 0 || imagePreviews.length > 0" class="image-preview-grid">
            <!-- 기존 이미지 -->
            <div v-for="file in existingImages" :key="file.storedName" class="preview-item">
              <img :src="file.url" alt="미리보기" />
              <button type="button" @click="removeExistingFile(file.storedName, 'image')" class="btn-remove-preview">×</button>
            </div>
            <!-- 새 이미지 -->
            <div v-for="(preview, index) in imagePreviews" :key="'new-img-' + index" class="preview-item">
              <img :src="preview.url" alt="미리보기" />
              <button type="button" @click="removeFile(preview.originalIndex)" class="btn-remove-preview">×</button>
            </div>
          </div>

          <!-- 통합 일반 파일 목록 (기존 + 새 파일) -->
          <ul v-if="existingAttachments.length > 0 || nonImageFiles.length > 0" class="file-list">
            <!-- 기존 파일 -->
            <li v-for="file in existingAttachments" :key="file.storedName" class="file-item existing">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="file-name">{{ file.originName }}</span>
              <button type="button" @click="removeExistingFile(file.storedName, 'attachment')" class="btn-remove-individual">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </li>
            <!-- 새 파일 -->
            <li v-for="(file, index) in nonImageFiles" :key="'new-file-' + index" class="file-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span class="file-name">{{ file.name }}</span>
              <button type="button" @click="removeFile(file.originalIndex)" class="btn-remove-individual">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </li>
          </ul>
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api/index'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const userRole = computed(() => authStore.userRole?.toLowerCase())
const isAdmin = computed(() => ['admin', 'headoffice', 'hq'].includes(userRole.value))

const isEdit = ref(false)
const files = ref([])
const isDragOver = ref(false)
const imagePreviews = ref([])
const nonImageFiles = ref([])

// [추가] 기존 파일 관리를 위한 상태
const existingImages = ref([])
const existingAttachments = ref([])
const deleteStoredFileNames = ref([])

const removeExistingFile = (storedName, type) => {
  if (type === 'image') {
    existingImages.value = existingImages.value.filter(f => f.storedName !== storedName)
  } else {
    existingAttachments.value = existingAttachments.value.filter(f => f.storedName !== storedName)
  }
  deleteStoredFileNames.value.push(storedName)
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB

const onDragOver = () => { isDragOver.value = true }
const onDragLeave = () => { isDragOver.value = false }

const updatePreviews = () => {
  imagePreviews.value = []
  nonImageFiles.value = []
  
  files.value.forEach((file, index) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push({ url: e.target.result, originalIndex: index })
      }
      reader.readAsDataURL(file)
    } else {
      nonImageFiles.value.push({ name: file.name, originalIndex: index })
    }
  })
}

const validateFiles = (selectedFiles) => {
  const validFiles = []
  const invalidFiles = []
  const tooLargeFiles = []
  
  // 현재 이미 담긴 파일들의 총 용량 계산
  let currentTotalSize = files.value.reduce((acc, file) => acc + file.size, 0)

  selectedFiles.forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase()
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      invalidFiles.push(`${file.name} (지원하지 않는 형식)`)
    } else if (file.size > MAX_FILE_SIZE) {
      tooLargeFiles.push(`${file.name} (10MB 초과)`)
    } else if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
      invalidFiles.push(`${file.name} (전체 용량 50MB 초과)`)
    } else {
      validFiles.push(file)
      currentTotalSize += file.size
    }
  })

  if (invalidFiles.length > 0 || tooLargeFiles.length > 0) {
    const messages = [...invalidFiles, ...tooLargeFiles]
    alert(`일부 파일을 추가할 수 없습니다:\n\n${messages.join('\n')}`)
  }

  return validFiles
}

const onDrop = (e) => {
  isDragOver.value = false
  const droppedFiles = Array.from(e.dataTransfer.files)
  const validFiles = validateFiles(droppedFiles)
  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles]
    updatePreviews()
  }
}

const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files)
  const validFiles = validateFiles(selectedFiles)
  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles]
    updatePreviews()
  }
  e.target.value = ''
}

const removeFile = (index) => {
  files.value.splice(index, 1)
  updatePreviews()
}

const clearFiles = () => {
  files.value = []
  updatePreviews()
}

const clearAllFiles = () => {
  // 기존 파일 모두 삭제 목록에 추가
  existingImages.value.forEach(f => deleteStoredFileNames.value.push(f.storedName))
  existingAttachments.value.forEach(f => deleteStoredFileNames.value.push(f.storedName))
  
  existingImages.value = []
  existingAttachments.value = []
  files.value = []
  updatePreviews()
}
const formData = reactive({
  title: '',
  author: authStore.userName || '유저',
  content: '',
  important: false,
  importantUntil: ''
})

onMounted(async () => {
  if (!isAdmin.value) {
    alert('권한이 없습니다.')
    router.push('/notice')
    return
  }
  
  // URL 경로에 edit이 포함되어 있는지 확인하거나 route.name으로 판별
  if (route.path.includes('/edit/')) {
    isEdit.value = true
    const noticeId = route.params.id
    try {
      const response = await api.get(`/notices/${noticeId}`)
      if (response.data.success) {
        const data = response.data.data
        formData.title = data.title
        formData.author = data.authorName
        formData.content = data.content
        formData.important = data.important
        if (data.importantUntil) {
          // datetime-local format: YYYY-MM-DDTHH:mm
          formData.importantUntil = data.importantUntil.substring(0, 16)
        }
        
        // [추가] 기존 파일 정보 로드
        existingImages.value = data.images || []
        existingAttachments.value = data.attachments || []
      }
    } catch (err) {
      console.error('Failed to fetch notice detail for edit:', err)
      alert('공지사항 정보를 불러오는 데 실패했습니다.')
      router.push('/notice')
    }
  }
})

// 폼 제출 완료 시
const submitForm = async () => {
  try {
    const data = {
      title: formData.title,
      content: formData.content,
      important: formData.important,
      importantUntil: formData.important && formData.importantUntil ? formData.importantUntil : null,
      deleteStoredFileNames: deleteStoredFileNames.value // [추가] 삭제할 항목들
    }

    const multipartData = new FormData()
    multipartData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    
    // [중요] 다중 파일 처리
    files.value.forEach(file => {
      multipartData.append('images', file)
    })

    if (isEdit.value) {
      const noticeId = route.params.id
      await api.patch(`/notices/${noticeId}`, multipartData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('공지사항이 수정되었습니다.')
    } else {
      await api.post('/notices', multipartData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('공지사항이 등록되었습니다.')
    }
    router.push('/notice')
  } catch (err) {
    console.error('Failed to submit notice:', err)
    
    // [중요] 상세 에러 피드백
    if (err.response?.status === 413) {
      alert('파일 용량이 너무 커서 서버에서 거절되었습니다. (최대 50MB)')
    } else if (err.code === 'ERR_NETWORK') {
      alert('네트워크 연결 오류가 발생했습니다. 파일 용량이 너무 크거나 인터넷 연결을 확인해주세요.')
    } else {
      const errorMsg = err.response?.data?.message || '공지사항 처리 중 오류가 발생했습니다.'
      alert(errorMsg)
    }
  }
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

.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0 !important;
}

.checkbox-group {
  margin-bottom: 0;
}

.important-settings-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.checkbox-label.highlight {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.label-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.main-label {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.sub-label {
  font-size: 0.85rem;
  color: #64748b;
}

.expiration-container {
  padding-top: 1.25rem;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.expiration-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
}

.expiration-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modern-date-input {
  width: auto !important;
  max-width: 300px;
  padding: 0.75rem 1rem !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 8px !important;
  background-color: white !important;
  color: #0f172a !important;
  font-family: inherit;
}

.modern-date-input:focus {
  border-color: #0f172a !important;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.05) !important;
}

.expiration-hint {
  font-size: 0.8rem;
  color: #94a3b8;
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
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.2s;
  background: #f8fafc;
}

.file-upload-box.is-dragover {
  border-color: #0f172a;
  background: #f1f5f9;
  transform: scale(1.01);
}

.file-upload-box:hover {
  border-color: #94a3b8;
}

.file-upload-box.has-file {
  border-style: solid;
  border-color: #e2e8f0;
}

.file-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  color: #64748b;
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.main-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.sub-text {
  font-size: 0.8rem;
  color: #94a3b8;
}

.btn-clear-all {
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-preview {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.file-list {
  margin-top: 1.5rem;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.file-item .file-name {
  flex: 1;
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove-individual {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.btn-remove-individual:hover {
  color: #ef4444;
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

/* 기존 파일 태그 및 스타일 */
.existing-tag {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: rgba(15, 23, 42, 0.8);
  color: white;
  font-size: 10px;
  padding: 2px 0;
  text-align: center;
  font-weight: 700;
}

.image-preview-grid.existing {
  margin-bottom: 0.5rem;
}

.badge-existing {
  background: #f1f5f9;
  color: #64748b;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.5rem;
}
</style>
