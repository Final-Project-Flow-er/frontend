<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock Data: Orders available for return
const availableOrders = ref([
 { 
   orderCode: 'SE0120231026001', 
   recipientName: '김철수', 
   recipientPhone: '010-1234-5678', 
   franchiseCode: 'SE01',
   items: [
     { 
       boxCode: 'SE01FA0120231026OR0101001', 
       idCode: 'SE01FA01AOR0101B001', 
       productCode: 'OR0101', 
       productName: '오리지널 떡볶이 밀키트 순한맛 1,2인분', 
       quantity: 5,        amount: 5000,
        totalAmount: 25000
     },
     { 
       boxCode: 'SE01FA0120231026RO0201002', 
       idCode: 'SE01FA01ARO0201B002', 
       productCode: 'RO0201', 
       productName: '로제 떡볶이 밀키트 기본맛 1,2인분', 
       quantity: 3,        amount: 7000,
        totalAmount: 21000
     }
   ]
 },
 { 
   orderCode: 'SE0120231025005', 
   recipientName: '이영희', 
   recipientPhone: '010-9876-5432', 
   franchiseCode: 'SE01',
   items: [
     { 
       boxCode: 'SE01FA0120231025RO0201005', 
       idCode: 'SE01FA01ARO0201B005', 
       productCode: 'RO0201', 
       productName: '로제 떡볶이 밀키트 기본맛 1,2인분', 
       quantity: 10,        amount: 7000,
        totalAmount: 70000
     }
   ]
 }
])



onMounted(() => {
  const state = history.state
  if (state && state.returnItems && state.returnItems.length > 0) {
    // Assumption: All returned items belong to the same order.
    // If mixed orders, we might need a different UI or restrict selection in InboundView.
    // user said "existing page" which implies single order selection.
    // Let's use the first item's orderCode.
    const firstItem = state.returnItems[0]
    const targetOrderCode = firstItem.orderCode
    
    // Check if order exists in mock data
    // In real app, we might need to fetch it.
    // For now, if not found, we can add a mock entry or alert.
    let order = availableOrders.value.find(o => o.orderCode === targetOrderCode)
    
    if (!order) {
        // If not in the list, maybe meaningful to add it to simulate "fetching"
        order = {
            orderCode: targetOrderCode,
            recipientName: '김갑자', // Default as per requirement
            recipientPhone: '010-0000-0000',
            franchiseCode: 'SE01',
            items: [] // Will start empty and we map state items? 
                      // Or better: The page usually fetches order items.
                      // Let's assume availableOrders has the data or we inject it.
            // Let's try to map state items to the order structure
        }
        // Map returnItems to order items structure
        order.items = state.returnItems.map((ri, idx) => ({
             boxCode: ri.boxCode,
             idCode: `ITEM-${idx}`, // dummy
             productCode: ri.productCode,
             productName: ri.productName,
             quantity: ri.quantity,
             amount: 12000,
             totalAmount: ri.totalAmount
        }))
        availableOrders.value.push(order)
    }

    selectedOrderCode.value = targetOrderCode
    
    // Select the specific boxes passed
    // We match by boxCode
    const passedBoxCodes = new Set(state.returnItems.map(i => i.boxCode))
    
    // Wait for computed to update (nextTick) or manually trigger
    // selectedOrder is computed from selectedOrderCode.
    // We can select indices.
    
    // Since we potentially created the order object, selectedOrder.value should be valid immediately if sync.
    // However, if we just pushed to availableOrders, computed will update.
    
    setTimeout(() => {
        if (selectedOrder.value) {
            selectedOrder.value.items.forEach((item, index) => {
                if (passedBoxCodes.has(item.boxCode)) {
                    selectedItemIndices.value.add(index)
                    returnQuantities[index] = item.quantity
                }
            })
        }
    }, 0)
  }
})

const selectedOrderCode = ref('')
const selectedOrder = computed(() => availableOrders.value.find(o => o.orderCode === selectedOrderCode.value))

const selectedItemIndices = ref(new Set())
const returnQuantities = reactive({})

const form = ref({
  reason: '',
  details: ''
})

const toggleSelection = (index) => {
  if (selectedItemIndices.value.has(index)) {
    selectedItemIndices.value.delete(index)
    delete returnQuantities[index]
  } else {
    selectedItemIndices.value.add(index)
    returnQuantities[index] = 1 // Default return qty
  }
}

const submitReturn = () => {
  if (!selectedOrderCode.value) {
    alert('반품할 발주 번호를 선택해주세요.')
    return
  }
  if (selectedItemIndices.value.size === 0) {
    alert('반품할 상품을 최소 하나 이상 선택해주세요.')
    return
  }
  if (!form.value.reason) {
    alert('반품 사유를 선택해주세요.')
    return
  }

  // Validate quantities
  for (const index of selectedItemIndices.value) {
    const item = selectedOrder.value.items[index]
    const qty = returnQuantities[index]
    if (qty <= 0 || qty > item.quantity) {
      alert(`'${item.productName}'의 반품 수량이 올바르지 않습니다. (1 ~ ${item.quantity})`)
      return
    }
  }

  alert('반품 요청이 등록되었습니다.')
  router.push('/returns')
}

const formatPrice = (p) => new Intl.NumberFormat('ko-KR').format(p)
</script>

<template>
  <div class="content-wrapper">
    <div class="header-row">
      <h2>반품 요청 등록</h2>
    </div>

    <div class="form-card">
      <!-- Section 1: Select Order -->
      <div class="form-section">
        <h3>반품 대상 선택</h3>
        <div class="form-group">
          <label>발주 번호 선택</label>
          <select v-model="selectedOrderCode" class="full-width-input" @change="selectedItemIndices.clear(); Object.keys(returnQuantities).forEach(key => delete returnQuantities[key])">
             <option value="" disabled>발주 번호를 선택하세요</option>
             <option v-for="order in availableOrders" :key="order.orderCode" :value="order.orderCode">
               {{ order.orderCode }} ({{ order.recipientName }})
             </option>
          </select>
        </div>
      </div>

      <div v-if="selectedOrder">
        <!-- Section 2: Product List (Table) -->
        <div class="form-section">
          <h3>제품 선택</h3>
          <div class="table-container">
            <table class="product-table">
              <thead>
                <tr>
                  <th width="50">선택</th>
                  <th>박스 코드</th>
                  <th>제품 정보</th>
                  <th>발주 수량</th>
                  <th width="100">반품 수량</th>
                  <th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedOrder.items" :key="index" :class="{ selected: selectedItemIndices.has(index) }">
                  <td class="center">
                    <input type="checkbox" :checked="selectedItemIndices.has(index)" @change="toggleSelection(index)" />
                  </td>
                  <td>{{ item.boxCode }}</td>
                  <td>
                    <div class="item-info">
                      <span class="code">{{ item.productCode }}</span>
                      <span class="name">{{ item.productName }}</span>
                    </div>
                  </td>
                  <td class="center">{{ item.quantity }}</td>
                  <td>
                    <input 
                      type="number" 
                      v-model="returnQuantities[index]" 
                      :disabled="!selectedItemIndices.has(index)"
                      min="1" 
                      :max="item.quantity"
                      class="qty-input"
                    />
                  </td>
                  <td class="right">{{ formatPrice(item.amount * (returnQuantities[index] || item.quantity)) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Return Information -->
        <div class="form-section">
          <h3>반품 정보 입력</h3>
          <div class="info-grid">
            <!-- Auto-filled Fields -->
            <div class="info-item">
              <label>수령인 이름</label>
              <input type="text" :value="selectedOrder.recipientName" readonly class="auto-filled" />
            </div>
            <div class="info-item">
              <label>수령인 전화번호</label>
              <input type="text" :value="selectedOrder.recipientPhone" readonly class="auto-filled" />
            </div>
            <div class="info-item">
              <label>가맹점 코드</label>
              <input type="text" :value="selectedOrder.franchiseCode" readonly class="auto-filled" />
            </div>

            <!-- Manual Fields -->
            <div class="info-item full-width">
              <label>반품 사유 <span class="required">*</span></label>
              <select v-model="form.reason">
                <option value="" disabled>사유를 선택하세요</option>
                <option value="파손">상품 파손</option>
                <option value="오배송">오배송</option>
              </select>
            </div>
            <div class="info-item full-width">
              <label>세부 사항</label>
              <textarea v-model="form.details" rows="3" placeholder="반품사유에 대한 상세 내용을 입력하세요."></textarea>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="cancel-btn" @click="$router.back()">취소</button>
          <button class="submit-btn" @click="submitReturn">반품 요청</button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>반품할 발주 번호를 선택해주세요.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.content-wrapper { max-width: 900px; margin: 0 auto; padding-bottom: 4rem; }
.header-row { margin-bottom: 2rem; }
.header-row h2 { font-size: 1.5rem; color: var(--text-dark); }

.form-card { background: white; padding: 2.5rem; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }

.form-section { margin-bottom: 2.5rem; }
.form-section h3 { font-size: 1.1rem; color: var(--text-dark); margin-bottom: 1.2rem; border-left: 4px solid var(--primary); padding-left: 0.75rem; }

/* Table Styles */
.table-container { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
.product-table { width: 100%; border-collapse: collapse; }
.product-table th { background: #f8fafc; padding: 0.8rem; text-align: left; font-size: 0.85rem; color: var(--text-light); border-bottom: 1px solid var(--border-color); }
.product-table td { padding: 0.8rem; border-bottom: 1px solid var(--border-color); font-size: 0.95rem; }
.product-table tr:last-child td { border-bottom: none; }
.product-table tr.selected { background-color: #f0f9ff; }

.center { text-align: center; }
.right { text-align: right; }
.qty-input { width: 60px; padding: 0.4rem; border: 1px solid var(--border-color); border-radius: 6px; text-align: center; }
.item-info { display: flex; flex-direction: column; }
.item-info .code { font-size: 0.8rem; color: var(--text-light); }
.item-info .name { font-weight: 500; }


.info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.2rem; }
.info-item { display: flex; flex-direction: column; gap: 0.5rem; }
.info-item.full-width { grid-column: 1 / -1; }

.info-item label { font-size: 0.85rem; font-weight: 600; color: var(--text-light); }
.required { color: #dc2626; margin-left: 2px; }

input[type="text"], select, textarea { 
  padding: 0.75rem; 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  font-size: 0.95rem; 
  background: white;
  width: 100%;
}
input[readonly] { background: #f8fafc; color: var(--text-dark); cursor: default; }
.auto-filled { background: #eef2ff; color: #3730a3; font-weight: 500; }

.full-width-input { width: 100%; font-size: 1rem; padding: 0.8rem; }

.actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
.cancel-btn { background: white; border: 1px solid var(--border-color); padding: 0.8rem 1.8rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; color: var(--text-light); transition: all 0.2s; }
.cancel-btn:hover { border-color: var(--text-light); color: var(--text-dark); }

.submit-btn { background: var(--primary); color: white; border: none; padding: 0.8rem 1.8rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: all 0.2s; }
.submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); }

.empty-state { text-align: center; padding: 3rem; color: var(--text-light); background: #f8fafc; border-radius: 12px; margin-top: 2rem; }
</style>
