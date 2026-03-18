<template>
  <div class="org-detail-container">
    <!-- 헤더 -->
    <div class="detail-header">
      <button @click="goBack" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 19-7-7 7-7"></path>
          <path d="M19 12H5"></path>
        </svg>
        목록으로
      </button>

      <div v-if="organization" class="header-actions">
        <template v-if="!isEditing">
          <button @click="startEdit" class="btn-edit">수정</button>
          <template v-if="organization.unitType !== 'HQ'">
            <button v-if="isOrgActive" @click="confirmStatusToggle" class="btn-deactivate">운영중지</button>
            <button v-else-if="organization.status === 'INACTIVE'" @click="confirmStatusToggle" class="btn-restore">운영재개</button>
            <button v-if="organization.status !== 'DELETED'" @click="confirmDelete" class="btn-delete">삭제</button>
          </template>
        </template>
        <template v-else>
          <button @click="saveChanges" class="btn-save">저장</button>
          <button @click="cancelEdit" class="btn-cancel">취소</button>
        </template>
      </div>
    </div>

    <!-- 조직 정보 카드 -->
    <div v-if="organization" class="detail-card">
      <div class="card-header">
        <div class="header-left">
          <div class="org-type-badge" :class="organization.unitType">
            {{ getOrgTypeLabel(organization.unitType) }}
          </div>
          <div class="status-badge" :class="organization.status || 'ACTIVE'">
            {{ getStatusLabel(organization.status) }}
          </div>
          <h1>{{ organization.name }}</h1>
        </div>
        <div class="org-code-large">{{ organization.code }}</div>
      </div>

      <div class="card-body">
        <!-- 본사 전용 프리미엄 뷰 -->
        <div v-if="organization.unitType === 'HQ' || organization.unitType === 'headOffice'" class="hq-luxury-view">
          <div class="hq-profile-card">
            <div class="profile-main">
              <div class="hq-logo-circle">
                <span class="logo-text">C-G</span>
              </div>
              <div class="hq-title-group">
                <div class="hq-subtitle">Global Operations Center</div>
                <h2 class="hq-main-name">{{ organization.name }}</h2>
                <div class="hq-meta-pills">
                  <span class="meta-pill">HQ</span>
                  <span class="meta-pill-outline">{{ organization.region }} REGION</span>
                </div>
              </div>
            </div>
            
            <div class="hq-stats-row">
              <div class="hq-stat-item">
                <div class="stat-label">상태</div>
                <div class="stat-value active">운영중</div>
              </div>
              <div class="hq-stat-divider"></div>
              <div class="hq-stat-item">
                <div class="stat-label">사업자 구분</div>
                <div class="stat-value">법인 사업자</div>
              </div>
              <div class="hq-stat-divider"></div>
              <div class="hq-stat-item">
                <div class="stat-label">소속 국적</div>
                <div class="stat-value">대한민국</div>
              </div>
            </div>
          </div>

          <div class="hq-detail-grid">
            <!-- 기업 정보 -->
            <div class="hq-info-card">
              <div class="hq-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                기업 프로필
              </div>
              <div class="hq-card-body">
                <div class="hq-field">
                  <label>본사 명칭</label>
                  <input type="text" v-model="organization.name" :disabled="!isEditing" :class="{ 'editing': isEditing }">
                </div>
                <div class="hq-field">
                  <label>시스템 식별 코드</label>
                  <div class="hq-read-only">{{ organization.code }}</div>
                </div>
                <div class="hq-field">
                  <label>대표이사</label>
                  <input type="text" v-model="organization.representativeName" @input="organization.representativeName = organization.representativeName.replace(/[0-9]/g, '')" :disabled="!isEditing" :class="{ 'editing': isEditing }">
                </div>
              </div>
            </div>

            <!-- 연락처 및 위치 -->
            <div class="hq-info-card">
              <div class="hq-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                연락처 및 위치
              </div>
              <div class="hq-card-body">
                <div class="hq-field">
                  <label>대표 전화</label>
                  <input type="tel" v-model="organization.phone" :disabled="!isEditing" :class="{ 'editing': isEditing }" @input="handlePhoneInput">
                </div>
                <div class="hq-field">
                  <label>소속 지역</label>
                  <select v-model="organization.region" :disabled="!isEditing" :class="{ 'editing': isEditing }">
                    <option value="SEOUL">서울특별시</option>
                    <option value="GYEONGGI">경기도</option>
                    <option value="INCHEON">인천광역시</option>
                    <option value="BUSAN">부산광역시</option>
                    <option value="DAEGU">대구광역시</option>
                    <option value="DAEJEON">대전광역시</option>
                    <option value="GWANGJU">광주광역시</option>
                    <option value="ULSAN">울산광역시</option>
                    <option value="SEJONG">세종특별자치시</option>
                    <option value="GANGWON">강원도</option>
                    <option value="CHUNGBUK">충청북도</option>
                    <option value="CHUNGNAM">충청남도</option>
                    <option value="JEONBUK">전라북도</option>
                    <option value="JEONNAM">전라남도</option>
                    <option value="GYEONGBUK">경상북도</option>
                    <option value="GYEONGNAM">경상남도</option>
                    <option value="JEJU">제주특별자치도</option>
                  </select>
                </div>
                <div class="hq-field full">
                  <label>본사 소재지</label>
                  <div class="hq-address-group">
                    <input type="text" v-model="organization.address" :disabled="!isEditing" :class="{ 'editing': isEditing }" placeholder="주소를 직접 입력하거나 검색하세요" @click="isEditing && openPostcode()">
                    <button v-if="isEditing" @click="openPostcode" class="hq-search-btn">주소 검색</button>
                  </div>
                  <input 
                    v-if="isEditing"
                    type="text" 
                    v-model="organization.detailAddress" 
                    placeholder="상세 주소를 입력하세요" 
                    class="detail-address-input-hq"
                  >
                </div>
              </div>
            </div>

            <!-- 법인 정보 -->
            <div class="hq-info-card full">
              <div class="hq-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                법적 고지 정보
              </div>
              <div class="hq-card-body horizontal">
                <div class="hq-field">
                  <label>사업자 등록 번호</label>
                  <div class="hq-read-only special">{{ organization.businessNumber }}</div>
                </div>
                <div class="hq-field">
                  <label>설립 목적</label>
                  <div class="hq-read-only">공급망 관리 및 유통 인프라 총괄</div>
                </div>
              </div>
            </div>
            
            <!-- 지도 영역 -->
            <div class="hq-map-section full">
              <div class="hq-card-title">본사 위치 지도</div>
              <div class="hq-map-canvas">
                <iframe
                  v-if="organization.address"
                  width="100%"
                  height="100%"
                  frameborder="0"
                  style="border:0;"
                  :src="`https://maps.google.com/maps?q=${encodeURIComponent(organization.address)}&z=15&output=embed`"
                  allowfullscreen>
                </iframe>
                <div v-else class="no-map-placeholder">주소를 등록하시면 지도가 표시됩니다.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 가맹점/공급처 기존 정보 (HQ가 아닐 때만) -->
        <section v-if="organization.unitType !== 'HQ' && organization.unitType !== 'headOffice'" class="info-section">
          <h2>기본 정보</h2>
          <div class="info-grid">
            <div class="info-field">
              <label>{{ getOrgNameLabel(organization.unitType) }}</label>
              <input 
                type="text" 
                v-model="organization.name" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>코드</label>
              <input 
                type="text" 
                :value="organization.code" 
                disabled 
                class="input-disabled"
              >
            </div>

            <div class="info-field full-width">
              <label>주소</label>
              <div class="address-input-group">
                <input 
                  type="text" 
                  v-model="organization.address" 
                  :disabled="!isEditing"
                  :class="{ 'input-disabled': !isEditing }"
                  placeholder="주소를 직접 입력하거나 검색하세요"
                  @click="isEditing && openPostcode()"
                >
                <button v-if="isEditing" type="button" @click="openPostcode" class="btn-address-search">주소 검색</button>
              </div>
              <input 
                v-if="isEditing"
                type="text" 
                v-model="organization.detailAddress" 
                placeholder="상세 주소를 입력하세요" 
                class="detail-address-input-org"
              >
              <div v-if="organization.address" class="map-container">
                <iframe
                  width="100%"
                  height="100%"
                  frameborder="0"
                  style="border:0;"
                  :src="`https://maps.google.com/maps?q=${encodeURIComponent(organization.address)}&z=15&output=embed`"
                  allowfullscreen>
                </iframe>
              </div>
            </div>

            <div class="info-field">
              <label>전화번호</label>
              <input 
                type="tel" 
                v-model="organization.phone" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                @input="handlePhoneInput"
                maxlength="13"
              >
            </div>

            <div class="info-field">
              <label>대표명</label>
              <input 
                type="text" 
                v-model="organization.representativeName" 
                @input="organization.representativeName = organization.representativeName.replace(/[0-9]/g, '')"
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                :placeholder="getOrgTypeLabel(organization.unitType) + ' 대표명을 입력하세요'"
              >
            </div>

            <div class="info-field">
              <label>사업자 등록 번호</label>
              <input 
                type="text" 
                :value="organization.businessNumber" 
                disabled
                class="input-disabled"
              >
            </div>

            <div class="info-field">
              <label>지역</label>
              <select v-model="organization.region" :disabled="!isEditing" :class="{ 'input-disabled': !isEditing }">
                <option value="SEOUL">서울</option>
                <option value="GYEONGGI">경기</option>
                <option value="INCHEON">인천</option>
                <option value="BUSAN">부산</option>
                <option value="DAEGU">대구</option>
                <option value="DAEJEON">대전</option>
                <option value="GWANGJU">광주</option>
                <option value="ULSAN">울산</option>
                <option value="SEJONG">세종</option>
                <option value="GANGWON">강원</option>
                <option value="CHUNGBUK">충북</option>
                <option value="CHUNGNAM">충남</option>
                <option value="JEONBUK">전북</option>
                <option value="JEONNAM">전남</option>
                <option value="GYEONGBUK">경북</option>
                <option value="GYEONGNAM">경남</option>
                <option value="JEJU">제주</option>
              </select>
            </div>
          </div>
        </section>


        <!-- 가맹점 추가 정보 -->
        <section v-if="organization.unitType === 'FRANCHISE'" class="info-section">
          <h2>매장 정보</h2>
          <div class="info-grid">

            <div class="info-field">
              <label>운영 시작 시간</label>
              <input 
                type="time" 
                v-model="organization.franchiseDetail.openTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field">
              <label>운영 종료 시간</label>
              <input 
                type="time" 
                v-model="organization.franchiseDetail.closeTime" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
            </div>

            <div class="info-field full-width">
              <label>운영 요일</label>
              <div class="days-container">
                <div v-if="!isEditing" class="days-readonly">
                  <span v-for="day in weekDays" :key="day.value" 
                        class="day-box" 
                        :class="{ active: organization.franchiseDetail && (organization.franchiseDetail.operatingDays || '').split(',').includes(day.value) }">
                    {{ day.label }}
                  </span>
                </div>
                <div v-else class="days-interactive">
                  <label v-for="day in weekDays" :key="day.value" 
                         class="day-check-box"
                         :class="{ checked: tempOperatingDays.includes(day.value) }">
                    <input 
                      type="checkbox" 
                      :value="day.value" 
                      v-model="tempOperatingDays"
                    >
                    <span>{{ day.label }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="info-field full-width">
              <label>매장 사진</label>
              <div class="photo-section">
                <!-- 이미지 목록 -->
                <div class="photo-preview-container" :class="{ 'is-empty': (!organization.franchiseDetail?.images || organization.franchiseDetail.images.length === 0) && previewImageUrls.length === 0 }">
                  <div v-for="(img, idx) in organization.franchiseDetail.images" :key="'exist-'+idx" class="photo-preview" :class="{ 'large-view': !isEditing }">
                    <img :src="img.url" alt="매장 사진" @click="openModal(img.url)" class="clickable-image">
                    <button type="button" v-if="isEditing" @click="removeExistingPhoto(img.storedName)" class="btn-remove-photo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <!-- 새로 추가한 이미지 -->
                  <div v-for="(preview, idx) in previewImageUrls" :key="'new-'+idx" class="photo-preview new">
                    <img :src="preview" alt="미리보기" @click="openModal(preview)" class="clickable-image">
                    <button type="button" v-if="isEditing" @click="removeNewPhoto(idx)" class="btn-remove-photo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <!-- 추가 버튼 -->
                  <button type="button" v-if="isEditing && (organization.franchiseDetail?.images?.length || 0) + previewImageUrls.length < 5" @click="uploadPhoto" class="btn-upload-photo-multiple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span style="font-size:0.8rem; margin-top:0.4rem; color:#64748b;">사진 추가</span>
                  </button>
                  
                  <p v-if="!isEditing && (!organization.franchiseDetail?.images || organization.franchiseDetail.images.length === 0)" class="no-photo">등록된 사진이 없습니다</p>
                </div>
                <!-- 사진 개수 안내 문구 -->
                <p v-if="isEditing" class="photo-limit-notice">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: middle;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  매장 사진은 최대 5개까지 등록 가능합니다. (현재: {{ (organization.franchiseDetail?.images?.length || 0) + previewImageUrls.length }}/5)
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 경고 및 제한 상태 (가맹점 전용) -->
        <section v-if="organization.unitType === 'FRANCHISE'" class="info-section warning-section">
          <h2>경고 및 반품 제한 상태</h2>
          <div class="warning-status-card" :class="{ 'is-restricted': organization.franchiseDetail.warningCount >= 3 }">
            <div class="warning-info">
              <div class="warning-label">누적 경고 횟수</div>
              <div class="warning-value">
                <span class="count">{{ organization.franchiseDetail.warningCount || 0 }}</span>
              </div>
            </div>
            <div class="restriction-status">
              <div class="status-icon">
                <svg v-if="organization.franchiseDetail.warningCount < 3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div class="status-texts">
                <div class="status-title">{{ organization.franchiseDetail.warningCount >= 3 ? '반품 제한 적용 중' : '정상 운영 중' }}</div>
                <p class="status-desc">
                  {{ organization.franchiseDetail.warningCount >= 3 
                    ? '경고 3회 누적으로 인해 현재 반품 신청이 제한된 상태입니다.' 
                    : '현재 반품 신청에 제한이 없습니다. 경고 3회 누적 시 제한이 적용됩니다.' }}
                </p>
                <div v-if="organization.franchiseDetail.warningCount >= 3 && organization.franchiseDetail.penaltyEndDate" class="restriction-timer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span>제한 종료 예정일: <strong>{{ new Date(organization.franchiseDetail.penaltyEndDate).toLocaleDateString() }}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 공장 추가 정보 -->
        <section v-if="organization.unitType === 'FACTORY'" class="info-section">
          <h2>공장 정보</h2>
          <div class="info-grid">
            <div class="info-field">
              <label>공장 지역</label>
              <select 
                v-model="organization.region" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
              >
                <option value="SE01">서울</option>
                <option value="GG01">경기</option>
                <option value="IC01">인천</option>
                <option value="BS01">부산</option>
                <option value="DG01">대구</option>
                <option value="DJ01">대전</option>
                <option value="GJ01">광주</option>
                <option value="UL01">울산</option>
                <option value="SJ01">세종</option>
                <option value="GW01">강원</option>
                <option value="CB01">충북</option>
                <option value="CN01">충남</option>
                <option value="JB01">전북</option>
                <option value="JN01">전남</option>
                <option value="GB01">경북</option>
                <option value="GN01">경남</option>
                <option value="JJ01">제주</option>
              </select>
            </div>

            <div class="info-field">
              <label>생산 라인 개수</label>
              <input 
                type="number" 
                v-model.number="organization.factoryDetail.productionLineCount" 
                :disabled="!isEditing"
                :class="{ 'input-disabled': !isEditing }"
                min="1"
                max="9"
              >
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-else class="loading">
      <p>조직 정보를 불러오는 중...</p>
    </div>

    <!-- 이미지 확대 모달 -->
    <div v-if="modalImageUrl" class="image-modal-overlay" @click="closeModal">
      <div class="image-modal-content">
        <button class="btn-close-modal" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <img :src="modalImageUrl" alt="확대 사진" @click.stop>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/api'

const router = useRouter()
const route = useRoute()

// 조직 정보
const organization = ref(null)
const originalOrganization = ref(null)
const isEditing = ref(false)
const tempOperatingDays = ref([])
const photoFiles = ref([])
const deleteStoredFileNames = ref([])
const previewImageUrls = ref([])

const modalImageUrl = ref('')

const openModal = (url) => {
  modalImageUrl.value = url
}

const closeModal = () => {
  modalImageUrl.value = ''
}

// 요일 목록
const weekDays = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' }
]

// 요일 라벨 가져오기
const getDayLabel = (value) => {
  const day = weekDays.find(d => d.value === value)
  return day ? day.label : value
}

const getOrgTypeLabel = (type) => {
  const map = {
    headOffice: '본사',
    store: '가맹점',
    factory: '공장'
  }
  return map[type] || '사업장'
}

const getStatusLabel = (status) => {
  switch(status) {
    case 'ACTIVE': return '운영중'
    case 'INACTIVE': return '운영중지'
    case 'DELETED': return '삭제'
    default: return '운영중'
  }
}

const isOrgActive = computed(() => {
  return !organization.value || organization.value.status === 'ACTIVE'
})

// 조직 정보 로드
const loadOrganization = async () => {
  const type = route.params.type
  const id = route.params.id
  
  try {
    const response = await api.get(`/hq/business-units/${type}/${id}`)
    if (response.data.success) {
      organization.value = response.data.data
      originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
      if (organization.value.franchiseDetail) {
        tempOperatingDays.value = (organization.value.franchiseDetail.operatingDays || '').split(',').filter(d => d)
        previewImageUrls.value = []
        photoFiles.value = []
      }
      // Initialize detailAddress
      organization.value.detailAddress = ''
    }
  } catch (error) {
    console.error('조직 정보 로딩 실패:', error)
    alert('정보를 불러오지 못했습니다.')
    router.back()
  }
}

// 수정 시작
const startEdit = () => {
  if (organization.value.franchiseDetail) {
    tempOperatingDays.value = (organization.value.franchiseDetail.operatingDays || '').split(',').filter(d => d)
  }
  isEditing.value = true
}

// 수정 취소
const cancelEdit = () => {
  organization.value = JSON.parse(JSON.stringify(originalOrganization.value))
  isEditing.value = false
  photoFiles.value = []
  deleteStoredFileNames.value = []
  previewImageUrls.value = []
}

// 변경사항 저장
const saveChanges = async () => {
  const type = organization.value.unitType
  const id = organization.value.id

  try {
    // 공통 필수 정보 검증
    if (!organization.value.name?.trim() || 
        !organization.value.address?.trim() || 
        !organization.value.phone?.trim() || 
        !organization.value.representativeName?.trim() ||
        !organization.value.region) {
      alert('모든 필수 정보를 입력해주세요.')
      return
    }

    const payload = {
      name: organization.value.name,
      address: organization.value.detailAddress ? `${organization.value.address} ${organization.value.detailAddress}` : organization.value.address,
      phone: organization.value.phone,
      representativeName: organization.value.representativeName,
      region: organization.value.region,
    }

    if (type === 'FRANCHISE') {
      // 가맹점 필수 정보 검증
      if (tempOperatingDays.value.length === 0) {
        alert('운영 요일을 최소 하루 이상 선택해주세요.')
        return
      }
      if (!organization.value.franchiseDetail.openTime || !organization.value.franchiseDetail.closeTime) {
        alert('운영 시간을 모두 입력해주세요.')
        return
      }

      // 시간 유효성 검사
      if (organization.value.franchiseDetail.openTime >= organization.value.franchiseDetail.closeTime) {
        alert('운영 시작 시간은 종료 시간보다 이전이어야 합니다.');
        return;
      }

      payload.franchiseUpdate = {
        operatingDays: tempOperatingDays.value.join(','),
        openTime: organization.value.franchiseDetail.openTime.length === 5 
          ? organization.value.franchiseDetail.openTime + ':00' 
          : organization.value.franchiseDetail.openTime,
        closeTime: organization.value.franchiseDetail.closeTime.length === 5 
          ? organization.value.franchiseDetail.closeTime + ':00' 
          : organization.value.franchiseDetail.closeTime
      }
    } else if (type === 'FACTORY') {
      if (!organization.value.factoryDetail.productionLineCount || organization.value.factoryDetail.productionLineCount < 1) {
        alert('생산 라인 개수는 1개 이상이어야 합니다.')
        return
      }

      payload.factoryUpdate = {
        productionLineCount: organization.value.factoryDetail.productionLineCount
      }
    }

    const response = await api.patch(`/hq/business-units/${type}/${id}`, payload)
    
    if (response.data.success) {
      if (type === 'FRANCHISE' && (photoFiles.value.length > 0 || deleteStoredFileNames.value.length > 0)) {
        const formData = new FormData()
        photoFiles.value.forEach(file => {
          formData.append('images', file)
        })
        deleteStoredFileNames.value.forEach(name => {
          formData.append('deleteStoredFileNames', name)
        })
        await api.post(`/hq/business-units/franchise/${id}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        await loadOrganization()
      } else {
        organization.value = response.data.data
        originalOrganization.value = JSON.parse(JSON.stringify(organization.value))
        if (organization.value.franchiseDetail) {
          previewImageUrls.value = []
          photoFiles.value = []
        }
      }

      alert('변경사항이 저장되었습니다.')
      isEditing.value = false
      photoFiles.value = []
      deleteStoredFileNames.value = []
    }
  } catch (error) {
    console.error('업데이트 실패:', error)
    alert(error.response?.data?.message || '저장 중 오류가 발생했습니다.')
  }
}

const confirmStatusToggle = async () => {
  const isActive = isOrgActive.value
  const action = isActive ? '운영중지' : '운영재개'
  if (confirm(`'${organization.value.name}'의 ${action} 하시겠습니까?`)) {
    try {
      const type = organization.value.unitType
      const id = organization.value.id
      const newStatus = isActive ? 'INACTIVE' : 'ACTIVE'
      
      const response = await api.patch(`/hq/business-units/${type}/${id}/status`, {
        status: newStatus
      })
      
      if (response.data.success) {
        organization.value.status = newStatus
        originalOrganization.value.status = newStatus
        alert(`${action} 처리되었습니다.`)
      }
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }
}

const confirmDelete = async () => {
  if (confirm(`'${organization.value.name}'을(를) 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.`)) {
    try {
      const type = organization.value.unitType
      const id = organization.value.id
      
      const response = await api.delete(`/hq/business-units/${type}/${id}`)
      if (response.data.success) {
        alert('삭제 처리되었습니다.')
        if (type === 'FRANCHISE') {
          router.push('/admin/organizations/franchise')
        } else {
          router.push('/admin/organizations/factory')
        }
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
}

// 사진 추가
const uploadPhoto = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = (e) => {
    const files = Array.from(e.target.files)
    const currentCount = (organization.value.franchiseDetail?.images?.length || 0) + previewImageUrls.value.length
    let allowedFiles = files

    if (currentCount + files.length > 5) {
      alert('매장 사진은 최대 5장까지 등록 가능합니다.')
      allowedFiles = files.slice(0, 5 - currentCount)
    }

    allowedFiles.forEach(file => {
      photoFiles.value.push(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        previewImageUrls.value.push(event.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
  input.click()
}

// 기존 사진 제거
const removeExistingPhoto = (storedName) => {
  if (!deleteStoredFileNames.value.includes(storedName)) {
    deleteStoredFileNames.value.push(storedName)
  }
  if (organization.value.franchiseDetail && organization.value.franchiseDetail.images) {
    organization.value.franchiseDetail.images = organization.value.franchiseDetail.images.filter(img => img.storedName !== storedName)
  }
}

// 새 사진 제거
const removeNewPhoto = (index) => {
  photoFiles.value.splice(index, 1)
  previewImageUrls.value.splice(index, 1)
}

// 목록으로 돌아가기
const goBack = () => {
  if (organization.value) {
    if (organization.value.unitType === 'FRANCHISE') {
      router.push('/admin/organizations/franchise')
    } else if (organization.value.unitType === 'FACTORY') {
      router.push('/admin/organizations/factory')
    } else if (organization.value.unitType === 'HQ') {
      router.push('/admin/head-office/management')
    } else {
      router.push('/organizations')
    }
  } else {
    router.back()
  }
}

onMounted(() => {
  loadOrganization()
})

// 전화번호 자동 하이픈
const handlePhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.startsWith('02')) {
    if (val.length > 2 && val.length <= 5) {
      val = val.slice(0, 2) + '-' + val.slice(2);
    } else if (val.length > 5 && val.length <= 9) {
      val = val.slice(0, 2) + '-' + val.slice(2, 5) + '-' + val.slice(5);
    } else if (val.length > 9) {
      val = val.slice(0, 2) + '-' + val.slice(2, 6) + '-' + val.slice(6, 10);
    }
  } else {
    if (val.length > 3 && val.length <= 7) {
      val = val.slice(0, 3) + '-' + val.slice(3);
    } else if (val.length > 7 && val.length <= 11) {
      val = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7);
    } else if (val.length > 11) {
      val = val.slice(0, 3) + '-' + val.slice(3, 8) + '-' + val.slice(8, 12);
    }
  }
  organization.value.phone = val;
}

// 사업자 등록 번호 자동 하이픈 (000-00-00000)
const handleBizNumInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '');
  if (val.length > 3 && val.length <= 5) {
    val = val.slice(0, 3) + '-' + val.slice(3);
  } else if (val.length > 5) {
    val = val.slice(0, 3) + '-' + val.slice(3, 5) + '-' + val.slice(5, 10);
  }
  organization.value.businessNumber = val;
}

// 주소 검색 (Daum Postcode)
const openPostcode = () => {
  const width = 500;
  const height = 600;
  new window.daum.Postcode({
    oncomplete: (data) => {
      let fullAddress = data.address;
      let extraAddress = '';

      if (data.addressType === 'R') {
        if (data.bname !== '') extraAddress += data.bname;
        if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
      }

      organization.value.address = fullAddress;
      
      // 시/도 정보를 기반으로 지역 자동 선택
      const sidoMap = {
        '서울': 'SEOUL', '경기': 'GYEONGGI', '인천': 'INCHEON', '부산': 'BUSAN',
        '대구': 'DAEGU', '대전': 'DAEJEON', '광주': 'GWANGJU', '울산': 'ULSAN',
        '세종': 'SEJONG', '강원': 'GANGWON', '충북': 'CHUNGBUK', '충남': 'CHUNGNAM',
        '전북': 'JEONBUK', '전남': 'JEONNAM', '경북': 'GYEONGBUK', '경남': 'GYEONGNAM',
        '제주': 'JEJU', '제주특별자치도': 'JEJU'
      }
      const mapped = sidoMap[data.sido] || Object.entries(sidoMap).find(([key]) => data.sido.includes(key))?.[1];
      if (mapped) organization.value.region = mapped;
    }
  }).open({
    left: (window.screen.width / 2) - (width / 2),
    top: (window.screen.height / 2) - (height / 2),
    popupTitle: '주소 검색'
  });
}

const getOrgNameLabel = (type) => {
  if (type === 'FRANCHISE') return '가맹점명'
  if (type === 'FACTORY') return '공장명'
  if (type === 'HQ') return '본사명'
  return '사업장명'
}
</script>

<style scoped>
.org-detail-container {
  padding: 1rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* 폼 그룹 및 인풋 공통 */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #475569;
}

/* 헤더 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit, .btn-save {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}
.btn-edit:hover, .btn-save:hover {
  background: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.2);
}

.btn-deactivate {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-deactivate:hover {
  background: #f1f5f9;
  color: #475569;
}

.btn-delete {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #ef4444;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete:hover {
  background: #fef2f2;
}

.btn-restore {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #10b981;
  border: 1px solid #6ee7b7;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-restore:hover {
  background: #ecfdf5;
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  font-size: 0.9rem;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover {
  background: #f8fafc;
}

/* 상세 카드 */
.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1.5px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.org-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.org-type-badge.store {
  background: #dbeafe;
  color: #1e40af;
}

.org-type-badge.factory {
  background: #fef3c7;
  color: #92400e;
}

.org-type-badge.headOffice {
  background: #dcfce7;
  color: #166534;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge.inactive { background: #f1f5f9; color: #64748b; }
.status-badge.deleted { background: #fee2e2; color: #b91c1c; }

.card-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.org-code-large {
  font-size: 1.2rem;
  font-weight: 700;
  color: #64748b;
  font-family: monospace;
}

.card-body {
  padding: 1.5rem;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 2.5rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h2 {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid #e2e8f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-field.full-width {
  grid-column: 1 / -1;
}

.info-field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.info-field input,
.info-field select {
  padding: 0.6rem 0.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
  height: 40px;
  box-sizing: border-box;
}

.info-field input:focus,
.info-field select:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

.address-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.map-container {
  height: 300px;
  margin-top: 0.5rem;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.address-input-group input {
  flex: 1;
}

.btn-address-search {
  padding: 0 1rem;
  background: #f1f5f9;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
}

.btn-address-search:hover {
  background: #e2e8f0;
}

.input-disabled {
  background: #f8fafc !important;
  color: #94a3b8;
  cursor: not-allowed;
}

/* 요일 표시 */
.days-pill-display {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.day-pill {
  font-size: 0.95rem;
  color: #cbd5e1;
  font-weight: 500;
}

.day-pill.active {
  color: #0f172a;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 4px;
}

/* 경고 및 제한 상태 */
.warning-section h2 {
  color: #e11d48;
  border-bottom-color: #fecaca;
}

.warning-status-card {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  gap: 2rem;
  align-items: center;
  margin-top: 0.5rem;
}

.warning-status-card.is-restricted {
  background: #fff1f2;
  border-color: #fecaca;
}

.warning-info {
  text-align: center;
  padding-right: 2rem;
  border-right: 1px solid #e2e8f0;
}

.warning-status-card.is-restricted .warning-info {
  border-right-color: #fecaca;
}

.warning-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.warning-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.warning-value .count {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.warning-status-card.is-restricted .warning-value .count {
  color: #e11d48;
}

.warning-value .total {
  font-size: 1rem;
  font-weight: 600;
  color: #94a3b8;
}

.restriction-status {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.status-icon {
  padding: 0.5rem;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
}

.is-restricted .status-icon {
  background: #e11d48;
  color: white;
}

.status-texts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.status-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}

.is-restricted .status-title {
  color: #e11d48;
}

.status-desc {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.is-restricted .status-desc {
  color: #9f1239;
}

.restriction-timer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #e11d48;
  background: white;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  width: fit-content;
  border: 1px solid #fecaca;
}

.restriction-timer strong {
  font-weight: 700;
}

/* 운영 요일 스타일 개선 */
.days-container {
  padding: 0.5rem 0;
}

.days-readonly, .days-interactive {
  display: flex;
  gap: 0.5rem;
}

.day-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #cbd5e1;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.day-box.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-check-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  background: white;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.day-check-box:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.day-check-box.checked {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.day-check-box input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* 사진 섹션 */
.photo-section {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-display {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.photo-display img {
  width: 100%;
  max-width: 320px;
  height: auto;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.btn-remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.btn-remove-photo:hover {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
  transform: scale(1.1);
}

.btn-upload-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.btn-upload-photo:hover {
  border-color: #0f172a;
  background: white;
  color: #0f172a;
}

.no-map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f8fafc;
  color: #94a3b8;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 로딩 */
.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .header-actions button {
    flex: 1;
  }
}

/* 사진 다중 업로드 관련 CSS */
.photo-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.photo-preview-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.2rem;
  align-items: center;
  overflow-x: auto;
  padding: 15px 10px 10px 10px;
  margin: -15px -10px -10px -10px;
  width: calc(100% + 20px);
}

.photo-preview-container::-webkit-scrollbar {
  height: 8px;
}
.photo-preview-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.photo-preview-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.photo-preview-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.photo-preview-container.is-empty {
  width: 100%;
  justify-content: center;
}

.no-photo {
  text-align: center;
  width: 100%;
  color: #64748b;
  padding: 2rem 0;
  font-weight: 500;
}

/* 사진 개수 안내 문구 */
.photo-limit-notice {
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: #64748b;
  display: flex;
  align-items: center;
  font-weight: 500;
}

/* HQ 프리미엄 뷰 스타일 */
.hq-luxury-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.hq-profile-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.hq-logo-circle {
  width: 100px;
  height: 100px;
  background: #0f172a;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.2);
}

.hq-title-group {
  flex: 1;
}

.hq-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.hq-main-name {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.5px;
}

.hq-meta-pills {
  display: flex;
  gap: 0.75rem;
}

.meta-pill {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.meta-pill-outline {
  padding: 0.25rem 0.75rem;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.hq-stats-row {
  display: flex;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
}

.hq-stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #334155;
}

.stat-value.active {
  color: #10b981;
}

.hq-stat-divider {
  width: 1px;
  height: 24px;
  background: #f1f5f9;
}

.hq-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.hq-info-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.hq-info-card.full {
  grid-column: 1 / -1;
}

.hq-card-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f8fafc;
}

.hq-card-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hq-card-body.horizontal {
  flex-direction: row;
  gap: 3rem;
}

.hq-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.hq-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.hq-field input, .hq-field select {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  width: 100%;
}

.hq-field input.editing, .hq-field select.editing {
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.25rem;
  background: #f8fafc;
}

.hq-read-only {
  font-size: 1.05rem;
  font-weight: 600;
  color: #64748b;
}

.hq-read-only.special {
  color: #0f172a;
  letter-spacing: 0.5px;
}

.hq-address-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.hq-search-btn {
  padding: 0.4rem 0.8rem;
  background: #eff6ff;
  color: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.hq-map-section {
  grid-column: 1 / -1;
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  border: 1px solid #e2e8f0;
}

.hq-map-canvas {
  height: 340px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

@media (max-width: 768px) {
  .hq-detail-grid { grid-template-columns: 1fr; }
  .profile-main { flex-direction: column; text-align: center; }
  .hq-stats-row { flex-wrap: wrap; gap: 1rem; }
  .hq-stat-item { flex: 1 1 40%; }
  .hq-stat-divider { display: none; }
}

.photo-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
  transition: all 0.2s;
}

.photo-preview.large-view {
  width: 200px;
  height: 200px;
}

.photo-preview.new {
  border-style: solid;
  border-color: #e2e8f0;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.btn-remove-photo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  z-index: 2;
}

.btn-remove-photo:hover {
  background: #fff1f2;
  color: #ef4444;
  border-color: #fecaca;
  transform: scale(1.1);
}

/* 사진 클릭 시 애니메이션 */
.clickable-image {
  cursor: pointer;
  transition: opacity 0.2s;
}

.clickable-image:hover {
  opacity: 0.8;
}

/* 사진 확대 모달 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.image-modal-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  object-fit: contain;
}

.btn-close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.btn-close-modal:hover {
  transform: scale(1.1);
}

.btn-upload-photo-multiple {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-upload-photo-multiple:hover {
  border-color: #0f172a;
  background: white;
  color: #0f172a;
}

.hq-address-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.detail-address-input-hq,
.detail-address-input-org {
  width: 100% !important;
  margin-top: 0;
}
</style>
