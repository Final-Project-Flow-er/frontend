<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const salesCode = route.params.salesCode

const saleDetail = ref(null)

// Mock data — 판매 코드별 그룹핑된 데이터
const allSales = [
  {
    salesCode: '2023102614300001',
    date: '2023-10-26 14:30',
    products: [
      {
        productCode: 'OR0101',
        productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분',
        quantity: 5,
        unitPrice: 5000,
        totalPrice: 25000,
        identificationCodes: [
          'UL01FA01A1OR0101001',
          'UL01FA01A1OR0101002',
          'UL01FA01A2OR0101003',
          'UL01FA01A2OR0101004',
          'UL01FA01A3OR0101005'
        ]
      },
      {
        productCode: 'RO0201',
        productName: '로제 떡볶이 밀키트 기본맛 1,2인분',
        quantity: 2,
        unitPrice: 7000,
        totalPrice: 14000,
        identificationCodes: [
          'UL01FA01A1RO0201001',
          'UL01FA01A1RO0201002'
        ]
      }
    ]
  },
  {
    salesCode: '2023102510150001',
    date: '2023-10-25 10:15',
    products: [
      {
        productCode: 'MA0301',
        productName: '마라 떡볶이 밀키트 매운맛 1,2인분',
        quantity: 3,
        unitPrice: 7000,
        totalPrice: 21000,
        identificationCodes: [
          'UL01FA01A2MA0301001',
          'UL01FA01A2MA0301002',
          'UL01FA01A3MA0301003'
        ]
      },
      {
        productCode: 'OR0403',
        productName: '오리지널 떡볶이 밀키트 아주 매운맛 3,4인분',
        quantity: 1,
        unitPrice: 13000,
        totalPrice: 13000,
        identificationCodes: [
          'UL01FA01A1OR0403001'
        ]
      }
    ]
  },
  {
    salesCode: '2023102409000001',
    date: '2023-10-24 09:00',
    products: [
      {
        productCode: 'RO0103',
        productName: '로제 떡볶이 밀키트 순한맛 3,4인분',
        quantity: 1,
        unitPrice: 17000,
        totalPrice: 17000,
        identificationCodes: [
          'UL01FA01A1RO0103001'
        ]
      },
      {
        productCode: 'MA0301',
        productName: '마라 떡볶이 밀키트 매운맛 1,2인분',
        quantity: 4,
        unitPrice: 7000,
        totalPrice: 28000,
        identificationCodes: [
          'UL01FA01A3MA0301004',
          'UL01FA01A3MA0301005',
          'UL01FA01A4MA0301006',
          'UL01FA01A4MA0301007'
        ]
      }
    ]
  }
]

onMounted(() => {
  saleDetail.value = allSales.find(s => s.salesCode === salesCode)
})

const grandTotal = computed(() => {
  if (!saleDetail.value) return 0
  return saleDetail.value.products.reduce((sum, p) => sum + p.totalPrice, 0)
})

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

// 제품 식별 코드 펼치기 토글
const expandedProducts = ref({})

const toggleExpand = (productCode) => {
  expandedProducts.value[productCode] = !expandedProducts.value[productCode]
}

const isExpanded = (productCode) => {
  return expandedProducts.value[productCode] || false
}

const cancelSale = () => {
  if (confirm('해당 판매를 취소하시겠습니까?')) {
    alert('판매가 취소되었습니다.')
    router.push({ name: 'franchise-product-list' })
  }
}
</script>

<template>
  <div class="content-wrapper" v-if="saleDetail">
    <div class="header-row">
      <h2>판매 상세 정보</h2>
      <div class="header-actions">
        <button @click="cancelSale" class="cancel-btn">판매 취소</button>
        <button @click="$router.back()" class="back-btn">목록으로 돌아가기</button>
      </div>
    </div>

    <div class="detail-card">
      <!-- 기본 정보 -->
      <div class="section-title">
        <h3>기본 정보</h3>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <label>판매 코드</label>
          <span class="sales-code-value">{{ saleDetail.salesCode }}</span>
        </div>
        <div class="info-item">
          <label>판매 일시</label>
          <span>{{ saleDetail.date }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 상품 목록 -->
      <div class="section-title">
        <h3>상품 목록</h3>
      </div>
      <div class="product-list-table">
        <div class="product-list-header">
          <span>제품 코드</span>
          <span>제품 이름</span>
          <span class="text-right">수량</span>
          <span class="text-right">단가</span>
          <span class="text-right">총 금액</span>
        </div>
        <div v-for="(product, index) in saleDetail.products" :key="index" class="product-list-item">
          <span class="sku-cell">{{ product.productCode }}</span>
          <span>{{ product.productName }}</span>
          <span class="text-right">{{ product.quantity }}개</span>
          <span class="text-right">{{ formatPrice(product.unitPrice) }}</span>
          <span class="text-right">{{ formatPrice(product.totalPrice) }}</span>
        </div>
        <div class="product-list-total">
          <label>총 판매 금액</label>
          <span class="total-price">{{ formatPrice(grandTotal) }}</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 제품 식별 코드 -->
      <div class="section-title">
        <h3>제품 식별 코드</h3>
      </div>
      <p class="code-format-desc">
        양식: <code>지역 + 공장 넘버링 + 생산 라인 + 제품 코드 + 박스 코드</code>
      </p>

      <div v-for="(product, index) in saleDetail.products" :key="'id-' + index" class="id-code-section">
        <div class="id-code-header" @click="toggleExpand(product.productCode)">
          <span class="id-code-product">
            <span class="sku-cell">{{ product.productCode }}</span>
            {{ product.productName }}
            <span class="count-badge">{{ product.identificationCodes.length }}건</span>
          </span>
          <span class="expand-icon">{{ isExpanded(product.productCode) ? '▲' : '▼' }}</span>
        </div>
        <div v-if="isExpanded(product.productCode)" class="id-code-list">
          <div v-for="(code, codeIdx) in product.identificationCodes" :key="codeIdx" class="id-code-item">
            <span class="code-index">{{ codeIdx + 1 }}</span>
            <code class="id-code-value">{{ code }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Loading...
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { font-size: 1.5rem; color: var(--text-dark); margin: 0; }
.header-actions { display: flex; gap: 1rem; }
.back-btn { background: white; border: 1px solid var(--border-color); padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-light); transition: all 0.2s; }
.back-btn:hover { border-color: var(--text-light); color: var(--text-dark); }
.cancel-btn { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
.cancel-btn:hover { background: #fecaca; }

.detail-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.section-title { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
.section-title h3 { font-size: 1.1rem; color: var(--text-dark); margin: 0; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

.divider { height: 1px; background: #e2e8f0; margin: 2rem 0; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.info-item span { font-size: 1rem; color: var(--text-dark); }
.sales-code-value { color: var(--primary); font-weight: 600; }

.sku-cell { color: var(--primary); font-weight: 600; }

/* 상품 목록 테이블 */
.product-list-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.product-list-header, .product-list-item {
  display: grid;
  grid-template-columns: 1.5fr 3fr 1fr 1.5fr 1.5fr;
  padding: 0.8rem 1.5rem;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.product-list-header {
  background: #f8fafc;
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.9rem;
}

.product-list-item {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.product-list-item:last-child {
  border-bottom: none;
}

.product-list-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  font-weight: 700;
  font-size: 1rem;
  gap: 1rem;
}

.total-price { font-weight: 700; color: var(--primary); font-size: 1.2rem !important; }
.text-right { text-align: right; }

/* 제품 식별 코드 */
.code-format-desc {
  font-size: 0.85rem;
  color: var(--text-light);
  margin: 0 0 1.2rem 0;
}

.code-format-desc code {
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--text-dark);
}

.id-code-section {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.id-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1.25rem;
  background: #f8fafc;
  cursor: pointer;
  transition: background 0.2s;
}

.id-code-header:hover {
  background: #f1f5f9;
}

.id-code-product {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.count-badge {
  background: var(--primary);
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.expand-icon {
  font-size: 0.7rem;
  color: var(--text-light);
}

.id-code-list {
  padding: 0.5rem 1.25rem 0.75rem;
}

.id-code-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.id-code-item:last-child {
  border-bottom: none;
}

.code-index {
  font-size: 0.75rem;
  color: var(--text-light);
  min-width: 1.5rem;
  text-align: center;
}

.id-code-value {
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  color: var(--text-dark);
  background: #f8fafc;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.loading { text-align: center; padding: 3rem; color: var(--text-light); }
</style>
