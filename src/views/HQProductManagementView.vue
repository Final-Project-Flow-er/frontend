<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>본사 상품 관리</h2>
      <div class="header-actions">
        <!-- Add Buttons -->
        <button class="action-btn secondary mr-1" @click="openTypeModal">제품 타입 추가</button>
        <button class="action-btn primary" @click="openAddModal">상품 추가</button>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label>상품 코드</label>
        <input type="text" v-model="filter.productCode" placeholder="코드 입력 (예: OR0101)" />
      </div>
      <div class="filter-group">
        <label>상품 명</label>
        <input type="text" v-model="filter.name" placeholder="상품명 입력" />
      </div>
      <div class="filter-group">
        <label>상태</label>
        <select v-model="filter.status">
          <option value="">전체</option>
          <option value="ON_SALE">판매중</option>
          <option value="SOLD_OUT">단종</option>
          <option value="TEMPORARY_OUT">일시품절</option>
          <option value="SALE_SCHEDULED">판매예정</option>
        </select>
      </div>
      <div class="filter-group">
        <label>인분</label>
        <select v-model="filter.servingSize">
          <option value="">전체</option>
          <option value="01">1~2인분</option>
          <option value="03">3~4인분</option>
        </select>
      </div>

    </div>

    <!-- Product Card Grid -->
    <div class="product-grid">
      <div v-for="product in filteredProducts" :key="product.productCode" class="product-card">
        <div class="card-image">
          <img :src="product.imageUrl || 'https://via.placeholder.com/300x200?text=Topokki'" alt="Product Image" />
          <span :class="['status-badge', product.status.toLowerCase()]">{{ getStatusLabel(product.status) }}</span>
        </div>
        <div class="card-body">
          <div class="card-header">
            <h3>{{ product.name }}</h3>
            <span class="product-code">{{ product.productCode }}</span>
          </div>
          <p class="product-desc">{{ product.description }}</p>
          
          <div class="card-info-row">
            <span class="info-label">인분:</span> {{ product.servingSize === 1 ? '1~2인분' : '3~4인분' }}
            <span class="divider">|</span>
            <span class="info-label">맵기:</span> {{ getSpiceLabel(product.spiceLevel) }}
          </div>
          <div class="card-info-row">
            <span class="info-label">칼로리:</span> {{ product.kcal }}kcal
          </div>
          <div class="card-info-row">
            <span class="info-label">기준 안전재고:</span> {{ product.baseSafeStock }}개
          </div>

            <div class="price-row">
              <span class="price-label">판매가</span>
              <span class="price-value highlight">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">원가</span>
              <span class="price-value">{{ formatPrice(product.costPrice) }}</span>
            </div>
            <div class="price-row">
              <span class="price-label">공급가</span>
              <span class="date-range">({{ product.startDate }} ~ {{ product.endDate }})</span>
              <span class="price-value">{{ formatPrice(product.supplyPrice) }}</span>
            </div>

        </div>
        <div class="card-actions">
           <button class="action-btn edit-btn" @click="openEditModal(product)">수정</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditMode ? '상품 수정' : '상품 추가' }}</h3>
        <div class="modal-body scrollable">
          
          <!-- Row 1: Basic Info -->
          <div class="form-row three-col">
             <div class="form-group">
              <label>제품 타입</label>
              <select v-model="form.type" :disabled="isEditMode" @change="updateCodeAndName">
                <option v-for="t in productTypes" :key="t.code" :value="t.code">{{ t.name }}</option>
              </select>
            </div>
             <div class="form-group">
              <label>매운맛</label>
              <select v-model="form.spiceLevel" :disabled="isEditMode" @change="updateCodeAndName">
                <option value="01">순한맛</option>
                <option value="02">기본맛</option>
                <option value="03">매운맛</option>
                <option value="04">아주 매운맛</option>
              </select>
            </div>
             <div class="form-group">
              <label>사이즈</label>
              <select v-model="form.sizeCode" :disabled="isEditMode" @change="updateCodeAndName">
                <option value="01">1~2인분</option>
                <option value="03">3~4인분</option>
              </select>
            </div>
          </div>

          <!-- Row 2: Code & Name (Auto) -->
          <div class="form-row">
            <div class="form-group">
              <label>상품 코드 (자동)</label>
              <input type="text" v-model="form.productCode" disabled class="readonly-input" />
            </div>
             <div class="form-group flex-2">
              <label>상품명</label>
              <input type="text" v-model="form.name" />
            </div>
          </div>

          <!-- Row 3: Prices & Status -->
          <div class="form-row three-col">
             <div class="form-group">
              <label>판매가</label>
              <input type="number" v-model="form.price" />
            </div>
            <div class="form-group">
              <label>원가</label>
              <input type="number" v-model="form.costPrice" />
            </div>
            <div class="form-group">
              <label>공급가</label>
              <input type="number" v-model="form.supplyPrice" />
            </div>
            <div class="form-group">
              <label>상태</label>
              <select v-model="form.status">
                <option value="ON_SALE">판매중</option>
                <option value="SOLD_OUT">단종</option>
                <option value="TEMPORARY_OUT">일시품절</option>
                <option value="SALE_SCHEDULED">판매예정</option>
              </select>
            </div>
            <div class="form-group">
              <label>기준 안전재고 (공통)</label>
              <input type="number" v-model="form.baseSafeStock" min="0" />
            </div>
            <div class="form-group">
              <label>칼로리 (kcal)</label>
              <input type="number" v-model="form.kcal" min="0" />
            </div>
          </div>
          
          <!-- Row 4: Dates -->
          <div class="form-row">
             <div class="form-group">
              <label>적용 시작일</label>
              <input type="date" v-model="form.startDate" />
            </div>
             <div class="form-group">
              <label>적용 종료일</label>
              <input type="date" v-model="form.endDate" />
            </div>
          </div>

          <div class="form-group full-width">
            <label>상품 설명</label>
            <textarea v-model="form.description" rows="2"></textarea>
          </div>
          
           <!-- Image Upload -->
          <div class="form-group full-width">
            <label>상품 이미지</label>
            <div class="image-upload-wrapper">
              <div class="image-preview" v-if="form.imageUrl">
                <img :src="form.imageUrl" alt="Preview" />
                <button class="remove-img" @click="form.imageUrl = ''">×</button>
              </div>
              <div class="image-placeholder" v-else @click="$refs.fileInput.click()">
                <span class="plus-icon">+</span>
                <span>이미지 선택</span>
              </div>
              <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" hidden />
              <div class="url-input-alt">
                <label>또는 이미지 URL 입력</label>
                <input type="text" v-model="form.imageUrl" placeholder="http://..." />
              </div>
            </div>
          </div>

        </div>
        <div class="modal-actions">
          <button @click="closeModal">취소</button>
          <button class="primary" @click="saveProduct">{{ isEditMode ? '수정' : '추가' }}</button>
        </div>
      </div>
    </div>

    <!-- Product Type Add Modal -->
    <div v-if="showTypeModal" class="modal-overlay">
      <div class="modal-content type-modal">
        <h3>제품 타입 추가</h3>
        <div class="modal-body">
          <div class="form-group mb-1">
            <label>제품 타입 이름</label>
            <input type="text" v-model="typeForm.name" placeholder="예: 바질" />
          </div>
          <div class="form-group">
            <label>제품 타입 코드 (두 자리 영문)</label>
            <input type="text" v-model="typeForm.code" placeholder="예: BA" maxlength="2" />
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeTypeModal">취소</button>
          <button class="primary" @click="addType">추가</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const filter = ref({
  productCode: '',
  name: '',
  status: '',
  servingSize: ''
})

const showModal = ref(false)
const showTypeModal = ref(false)
const isEditMode = ref(false)

const productTypes = ref([
    { code: 'OR', name: '오리지널' },
    { code: 'RO', name: '로제' },
    { code: 'MA', name: '마라' }
])

const typeForm = ref({
    name: '',
    code: ''
})

const form = ref({
  type: 'OR',
  spiceLevel: '01',
  sizeCode: '01',
  productCode: '',
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  costPrice: 0,
  supplyPrice: 0,
  status: 'ON_SALE',
  servingSize: 1, // Derived from sizeCode for logic
  baseSafeStock: 10,
  kcal: 0
})

const products = ref([])

// Generate 24 Products
const generateMockProducts = () => {
    const types = [
        { code: 'OR', name: '오리지널 떡볶이 밀키트', price1: 10000, price2: 18000 },
        { code: 'RO', name: '로제 떡볶이 밀키트', price1: 12000, price2: 22000 },
        { code: 'MA', name: '마라 떡볶이 밀키트', price1: 12000, price2: 22000 }
    ]
    const spices = [
        { code: '01', name: '순한맛' },
        { code: '02', name: '기본맛' },
        { code: '03', name: '매운맛' },
        { code: '04', name: '아주 매운맛' }
    ]
    const sizes = [
        { code: '01', name: '1~2인분', serving: 1 },
        { code: '03', name: '3~4인분', serving: 3 }
    ]

    const list = []
    types.forEach(t => {
        spices.forEach(s => {
            sizes.forEach(sz => {
                const code = `${t.code}${s.code}${sz.code}`
                const name = `${t.name} ${s.name} ${sz.name.replace('~', ',')}` 
                const price = sz.code === '01' ? t.price1 : t.price2
                const costPrice = price - 7000
                const supplyPrice = price - 5000 
                
                list.push({
                    productCode: code, // e.g. OR0101
                    name: name,
                    description: `${t.name} ${s.name}입니다.`,
                    imageUrl: '',
                    price: price,
                    costPrice: costPrice,
                    supplyPrice: supplyPrice,
                    status: 'ON_SALE',
                    servingSize: sz.serving,
                    spiceLevel: s.code,
                    kcal: sz.serving === 1 ? 1400 : 2800, 
                    startDate: '2024-01-01', 
                    endDate: '2025-12-31',
                    baseSafeStock: 10,
                    type: t.code,
                    sizeCode: sz.code
                })
            })
        })
    })
    products.value = list
}

onMounted(() => {
    generateMockProducts()
})

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchCode = !filter.value.productCode || p.productCode.includes(filter.value.productCode)
    const matchName = !filter.value.name || p.name.includes(filter.value.name)
    const matchStatus = !filter.value.status || p.status === filter.value.status
    const matchSize = !filter.value.servingSize || p.sizeCode === filter.value.servingSize
    return matchCode && matchName && matchStatus && matchSize
  })
})

const getStatusLabel = (status) => {
  const map = { 'ON_SALE': '판매중', 'SOLD_OUT': '단종', 'TEMPORARY_OUT': '일시품절', 'SALE_SCHEDULED': '판매예정' }
  return map[status] || status
}

const getSpiceLabel = (code) => {
    const map = { '01': '순한맛', '02': '기본맛', '03': '매운맛', '04': '아주 매운맛' }
    return map[code] || code
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)

// Modal Logic
const updateCodeAndName = () => {
    // Re-construct name and code based on selection
    const tMap = { 'OR': '오리지널 떡볶이 밀키트', 'RO': '로제 떡볶이 밀키트', 'MA': '마라 떡볶이 밀키트' }
    const sMap = { '01': '순한맛', '02': '기본맛', '03': '매운맛', '04': '아주 매운맛' }
    const szMap = { '01': '1,2인분', '03': '3,4인분' }

    const t = form.value.type
    const s = form.value.spiceLevel
    const sz = form.value.sizeCode

    const targetType = productTypes.value.find(tt => tt.code === t)
    const typeName = targetType ? targetType.name : 'Unknown'
    const suffix = targetType && targetType.name.includes('밀키트') ? '' : ' 떡볶이 밀키트'

    form.value.productCode = `${t}${s}${sz}`
    form.value.name = `${typeName}${suffix} ${sMap[s]} ${szMap[sz]}`
    
    // Auto-set price
    // Auto-set price
    if (t === 'OR') {
        form.value.price = (sz === '01') ? 10000 : 18000
    } else {
        form.value.price = (sz === '01') ? 12000 : 22000
    }
    form.value.costPrice = form.value.price - 7000
    form.value.supplyPrice = form.value.price - 5000 // Fixed logic

    // Auto-set kcal
    form.value.kcal = sz === '01' ? 1400 : 2800
}

const openAddModal = () => {
  isEditMode.value = false
  form.value = {
      type: 'OR', spiceLevel: '01', sizeCode: '01',
      productCode: '', name: '', description: '', imageUrl: '', 
      price: 0, costPrice: 0, supplyPrice: 0, status: 'ON_SALE', servingSize: 1, baseSafeStock: 10,
      kcal: 0,
      startDate: '2024-01-01', endDate: '2025-12-31'
  }
  updateCodeAndName()
  showModal.value = true
}

const openEditModal = (product) => {
  isEditMode.value = true
  // Deconstruct code to fill form
  const type = product.productCode.substring(0, 2)
  const spice = product.productCode.substring(2, 4)
  const size = product.productCode.substring(4, 6)

  form.value = { 
      ...JSON.parse(JSON.stringify(product)),
      type, spiceLevel: spice, sizeCode: size
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveProduct = () => {
    // In real app, validate existence
    if (isEditMode.value) {
        const index = products.value.findIndex(p => p.productCode === form.value.productCode)
        if (index !== -1) products.value[index] = { ...form.value }
    } else {
        products.value.push({ ...form.value })
    }
    closeModal()
}

// Type Modal Logic
const openTypeModal = () => {
    typeForm.value = { name: '', code: '' }
    showTypeModal.value = true
}

const closeTypeModal = () => {
    showTypeModal.value = false
}

const addType = () => {
    if (!typeForm.value.name || !typeForm.value.code) {
        alert('이름과 코드를 모두 입력해주세요.')
        return
    }
    if (typeForm.value.code.length !== 2) {
        alert('코드는 반드시 두 자리여야 합니다.')
        return
    }
    if (productTypes.value.find(t => t.code === typeForm.value.code.toUpperCase())) {
        alert('이미 존재하는 코드입니다.')
        return
    }
    
    productTypes.value.push({
        name: typeForm.value.name,
        code: typeForm.value.code.toUpperCase()
    })
    alert(`신규 타입 [${typeForm.value.name}]이 추가되었습니다.`)
    closeTypeModal()
}

const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('이미지 크기는 2MB를 초과할 수 없습니다.')
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            form.value.imageUrl = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

</script>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-row h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark); }
.content-wrapper { max-width: 1400px; margin: 0 auto; }

/* Filter Styles */
.filter-section {
  background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; display: flex; gap: 1.5rem; align-items: flex-end; flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 0.5rem; min-width: 150px; }
.filter-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.filter-group input, .filter-group select { padding: 0.6rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.95rem; }
.search-btn { background: var(--text-dark); color: white; border: none; padding: 0.6rem 2rem; border-radius: 8px; cursor: pointer; font-weight: 600; height: 42px; margin-left: auto; }

/* Product Grid */
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.product-card { background: white; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.card-image { height: 200px; background: #f1f5f9; position: relative; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; }
.status-badge { position: absolute; top: 10px; right: 10px; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.status-badge.on_sale { background: #e6fffa; color: #2c7a7b; }
.status-badge.sold_out { background: #fee2e2; color: #991b1b; }
.status-badge.temporary_out { background: #fffaf0; color: #9c4221; }
.status-badge.sale_scheduled { background: #e0e7ff; color: #3730a3; }
.card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
.card-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.25rem; }
.product-code { font-size: 0.8rem; color: var(--text-light); }
.product-desc { font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-info-row { font-size: 0.9rem; color: var(--text-light); }
.divider { margin: 0 0.5rem; color: #cbd5e1; }
.info-label { font-weight: 600; margin-right: 0.25rem; color: #64748b; }
.price-section { background: #f8fafc; padding: 0.75rem; border-radius: 8px; margin-top: 0.5rem; }
.price-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
.price-label { color: #64748b; font-weight: 500; }
.price-value { font-weight: 700; color: var(--text-dark); }
.date-range { font-size: 0.8rem; color: #94a3b8; margin-left: auto; margin-right: 0.5rem; }
.card-actions { border-top: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: flex-end; }
.edit-btn {  background: white; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600; color: var(--text-dark); }
.edit-btn:hover { background: #f8fafc; }
.action-btn.primary { background: var(--primary); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.action-btn.secondary { background: white; color: var(--text-dark); border: 1px solid var(--border-color); padding: 0.6rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; }
.mr-1 { margin-right: 0.5rem; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 600px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-content.type-modal { width: 400px; }
.modal-content h3 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.4rem; }
.modal-body { flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 0.5rem; }
.form-row { display: flex; gap: 1rem; margin-bottom: 1rem; width: 100%; }
.form-row.three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
.form-group { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.flex-2 { flex: 2; }
.form-group.full-width { width: 100%; margin-bottom: 1rem; }
.form-group label { font-size: 0.85rem; font-weight: 600; color: #64748b; }
.form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit; }
.readonly-input { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; cursor: not-allowed; }
.modal-actions { margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }
.modal-actions button { padding: 0.6rem 1.2rem; border-radius: 6px; border: 1px solid var(--border-color); background: white; cursor: pointer; font-weight: 600; }
.modal-actions button.primary { background: var(--primary); color: white; border-color: var(--primary); }

/* Image Upload UI */
.image-upload-wrapper { display: flex; flex-direction: column; gap: 1rem; }
.image-preview { width: 120px; height: 120px; border-radius: 8px; overflow: hidden; position: relative; border: 1px solid var(--border-color); }
.image-preview img { width: 100%; height: 100%; object-fit: cover; }
.remove-img { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; }
.image-placeholder { width: 120px; height: 120px; border-radius: 8px; border: 2px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #64748b; background: #f8fafc; transition: all 0.2s; }
.image-placeholder:hover { border-color: var(--primary); color: var(--primary); background: #f0f9ff; }
.image-placeholder .plus-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
.url-input-alt { display: flex; flex-direction: column; gap: 0.4rem; }
.url-input-alt label { font-size: 0.75rem; color: #94a3b8; }
.url-input-alt input { font-size: 0.85rem !important; color: #64748b; }

</style>
