<template>
  <div class="hq-management-container">
    <!-- 상단 헤더 -->
    <div class="management-header">
      <div class="header-left">
        <div class="brand-line"></div>
        <div class="title-group">
          <h1>본사 정보 관리</h1>
          <p class="subtitle">시스템 핵심 운영 정보를 조회하고 관리합니다</p>
        </div>
      </div>
      <div class="header-actions">
        <button v-if="!isEditing" @click="startEdit" class="btn-action edit">
          정보 수정
        </button>
        <template v-else>
          <button @click="saveChanges" class="btn-action save">저장</button>
          <button @click="cancelEdit" class="btn-action cancel">취소</button>
        </template>
      </div>
    </div>

    <div v-if="hqData" class="content-layout">
      <!-- 왼쪽 프로필 요약 -->
      <div class="profile-sidebar">
        <div class="hq-card">
          <div class="hq-logo-area">
            <h1 class="logo-barcode">CHAIN-G</h1>
          </div>
          <div class="hq-main-name">
            <h2 v-if="!isEditing">{{ hqData.name }}</h2>
            <input v-else type="text" v-model="hqData.name" class="inline-edit title">
          </div>
        </div>
      </div>

      <!-- 오른쪽 세부 정보 -->
      <div class="info-details-area">
        <div class="details-card">
          <div class="info-list">
            <div class="info-row">
              <div class="label">본사명</div>
              <div class="value">
                <span v-if="!isEditing">{{ hqData.name }}</span>
                <input v-else type="text" v-model="hqData.name">
              </div>
            </div>

            <div class="info-row">
              <div class="label">본사 코드</div>
              <div class="value">
                <span class="fixed-code">{{ hqData.code }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="label">대표명</div>
              <div class="value">
                <span v-if="!isEditing">{{ hqData.representativeName }}</span>
                <input v-else type="text" v-model="hqData.representativeName">
              </div>
            </div>

            <div class="info-row">
              <div class="label">사업자 번호</div>
              <div class="value">
                <span class="fixed-code">{{ hqData.businessNumber }}</span>
              </div>
            </div>


            <div class="info-row">
              <div class="label">전화번호</div>
              <div class="value">
                <span v-if="!isEditing">{{ hqData.phone }}</span>
                <input v-else type="tel" v-model="hqData.phone">
              </div>
            </div>

            <div class="info-row">
              <div class="label">주소</div>
              <div class="value address">
                <span v-if="!isEditing">{{ hqData.address }}</span>
                <input v-else type="text" v-model="hqData.address">
              </div>
            </div>
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

onMounted(async () => {
  await fetchHqInfo()
})

const fetchHqInfo = async () => {
  try {
    const response = await api.get('/hq/business-units/HQ/1')
    if (response.data.success) {
      hqData.value = response.data.data
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

const saveChanges = async () => {
  try {
    const payload = {
      name: hqData.value.name,
      address: hqData.value.address,
      phone: hqData.value.phone,
      representativeName: hqData.value.representativeName
    }
    const response = await api.patch('/hq/business-units/HQ/1', payload)
    if (response.data.success) {
      alert('본사 정보가 업데이트되었습니다.')
      hqData.value = response.data.data
      isEditing.value = false
    }
  } catch (error) {
    console.error('본사 정보 업데이트 실패:', error)
    alert('본사 정보 업데이트에 실패했습니다.')
  }
}

const getRegionLabel = (region) => {
  const map = {
    'SEOUL': '서울',
    'GYEONGGI': '경기',
    'INCHEON': '인천',
    'BUSAN': '부산',
    'DAEGU': '대구',
    'DAEJEON': '대전',
    'GWANGJU': '광주',
    'ULSAN': '울산',
    'SEJONG': '세종',
    'GANGWON': '강원',
    'CHUNGBUK': '충북',
    'CHUNGNAM': '충남',
    'JEONBUK': '전북',
    'JEONNAM': '전남',
    'GYEONGBUK': '경북',
    'GYEONGNAM': '경남',
    'JEJU': '제주'
  }
  return map[region] || region
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.hq-management-container {
  padding: 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* Header Section */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand-line {
  width: 4px;
  height: 40px;
  background: #0f172a;
  border-radius: 4px;
}

.title-group h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Actions */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  padding: 0.6rem 1.4rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.edit {
  background: #0f172a;
  color: white;
  border: none;
}

.btn-action.edit:hover { background: #1e293b; }

.btn-action.save {
  background: #2563eb;
  color: white;
  border: none;
}

.btn-action.cancel {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

/* Layout */
.content-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2.5rem;
}

/* Sidebar Profile */
.hq-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 3.5rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.hq-logo-area {
  margin-bottom: 2rem;
}

.logo-barcode {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 60px;
  color: #0f172a;
  margin: 0;
  font-weight: 100;
  display: inline-block;
  transform: scaleX(0.7);
  letter-spacing: 2px;
  filter: contrast(120%);
}

.hq-main-name h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
}

.inline-edit.title {
  width: 100%;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 800;
  border: none;
  border-bottom: 2px solid #2563eb;
  background: transparent;
  padding: 0.25rem 0;
  margin-bottom: 1rem;
}

.code-badge {
  background: #f1f5f9;
  color: #64748b;
  font-family: monospace;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.org-type-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 0.5rem;
}

.org-type-badge.hq {
  background: #dcfce7;
  color: #166534;
}

/* Details Area */
.details-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 3.5rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
}

.info-row .label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #94a3b8;
}

.info-row .value {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
}

.fixed-code {
  color: #64748b;
  font-family: monospace;
}

.info-row .value.address {
  line-height: 1.5;
}

/* Edit Controls */
.info-row input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.info-row select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #f1f5f9;
  background: #f8fafc;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  outline: none;
}
</style>
