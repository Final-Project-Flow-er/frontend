<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 상세 데이터 상태
const detailData = ref(null)

// 1. 초기화: 라우터로 전달된 데이터 확인 (또는 API 호출)
onMounted(() => {
  // 리스트 페이지에서 push할 때 state로 데이터를 넘겨줬다고 가정
  if (history.state && history.state.rowData) {
    detailData.value = history.state.rowData
  } else {
    // 새로고침 등으로 state가 없으면 route params를 이용해 API 호출 로직이 필요함
    // 여기서는 예시로 mock 데이터를 넣거나 경고 표시
    alert('잘못된 접근이거나 데이터가 없습니다.')
    router.back()
  }
})

// 2. 포맷팅 헬퍼
const formatPrice = (price) => new Intl.NumberFormat('ko-KR').format(price)

const getStatusClass = (status) => {
  switch (status) {
    case '접수 완료': return 'status-ok'
    case '부분 접수': return 'status-primary'
    case '반려': return 'status-danger'
    default: return 'status-warning'
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="detail-wrapper" v-if="detailData">
    <!-- Header -->
    <div class="header-row">
      <button @click="goBack" class="back-btn">← 뒤로가기</button>
      <h2>발주 상세 정보</h2>
      <span :class="['status-badge', getStatusClass(detailData.status)]">
        {{ detailData.status }}
      </span>
    </div>

    <!-- Content Grid -->
    <div class="info-card">
      <h3>기본 정보</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>발주 코드</label>
          <p>{{ detailData.orderCode }}</p>
        </div>
        <div class="info-item">
          <label>가맹점 코드</label>
          <p>{{ detailData.franchiseCode }}</p>
        </div>
        <div class="info-item">
          <label>발주 일자</label>
          <p>{{ detailData.orderDate }}</p>
        </div>
        <div class="info-item">
          <label>도착 예정일</label>
          <p>{{ detailData.arrivalDate }}</p>
        </div>
      </div>
    </div>

    <div class="info-card">
      <h3>수령인 정보</h3>
      <div class="info-grid">
        <div class="info-item">
          <label>수령인 이름</label>
          <p>{{ detailData.recipientName }}</p>
        </div>
        <div class="info-item">
          <label>연락처</label>
          <p>{{ detailData.recipientPhone }}</p>
        </div>
      </div>
    </div>

    <div class="info-card product-card">
      <h3>제품 상세 정보</h3>
      <div class="product-summary">
        <div class="product-header">
          <span class="p-code">{{ detailData.productCode }}</span>
        </div>

        <div class="product-stats">
          <div class="stat-box">
            <span class="label">수량</span>
            <span class="value">{{ detailData.quantity }}개</span>
          </div>
          <div class="stat-box">
            <span class="label">단가</span>
            <span class="value">{{ formatPrice(detailData.unitAmount) }}원</span>
          </div>
          <div class="stat-box highlight">
            <span class="label">총 금액</span>
            <span class="value">{{ formatPrice(detailData.totalAmount) }}원</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.detail-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #1f2937;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 600;
}

.header-row h2 {
  flex: 1;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.9rem;
}

.status-ok { background: #d1fae5; color: #065f46; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-danger { background: #fee2e2; color: #991b1b; }
.status-primary { background: #dbeafe; color: #1e40af; }

.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item label {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
}

/* Product Card Specifics */
.product-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.p-code {
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary, #059669);
}

.product-stats {
  display: flex;
  gap: 1rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.stat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-box.highlight .value {
  color: var(--primary, #059669);
  font-weight: 800;
}

.stat-box .label {
  font-size: 0.8rem;
  color: #6b7280;
}
.stat-box .value {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
