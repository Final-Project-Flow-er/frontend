<script setup>
import { ref, computed, onMounted } from 'vue'
import Modal from '@/components/common/Modal.vue'

const inboundItems = ref([])

const fetchInboundItems = async () => {
  try {
    const response = await fetch('/api/v1/inbounds/items', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    const result = await response.json()
    if (response.ok && result.success) {
      inboundItems.value = result.data.map(item => ({
        id: item.serialCode,
        productCode: item.productCode || item.productId,
        name: item.productName,
        productionDate: item.manufactureDate
      }))
    } else {
      inboundItems.value = []
    }
  } catch (error) {
    console.error('Error fetching inbound items:', error)
    openModal('?ㅻ쪟', '?쒕쾭? ?듭떊?섎뒗 ???ㅽ뙣?덉뒿?덈떎.', null, false)
  }
}

onMounted(() => {
  fetchInboundItems()
})

const selectedItemIds = ref(new Set())

const isAllSelected = computed(() => {
  return inboundItems.value.length > 0 && selectedItemIds.value.size === inboundItems.value.length
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItemIds.value.clear()
  } else {
    selectedItemIds.value = new Set(inboundItems.value.map(item => item.id))
  }
}

const toggleSelectItem = (id) => {
  if (selectedItemIds.value.has(id)) {
    selectedItemIds.value.delete(id)
  } else {
    selectedItemIds.value.add(id)
  }
}

const approveInbound = () => {
  if (selectedItemIds.value.size === 0) {
    openModal('?뚮┝', '?낃퀬 ?뱀씤????ぉ???좏깮?댁＜?몄슂.', null, false)
    return
  }
  openModal(
    '?낃퀬 ?뱀씤 ?뺤씤', 
    `?좏깮??${selectedItemIds.value.size}媛쒖쓽 ??ぉ???낃퀬 ?뱀씤?섏떆寃좎뒿?덇퉴?`, 
    performApprove
  )
}

const performApprove = async () => {
  try {
    const serialCodes = Array.from(selectedItemIds.value)
    const response = await fetch('/api/v1/inbounds/confirm', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ serialCodes })
    })
    
    if (response.status === 401 || response.status === 403) {
      openModal('?ㅻ쪟', '沅뚰븳???놁뒿?덈떎 (?≪꽭???좏겙 ?뺤씤 ?꾩슂).', null, false)
      return
    }

    const result = await response.json()
    if (response.ok && result.success) {
      await fetchInboundItems()
      selectedItemIds.value.clear()
      openModal('?뚮┝', '?낃퀬 ?뱀씤 ?섏뿀?듬땲??', null, false)
    } else {
      openModal('?ㅻ쪟', result.message || '?낃퀬 ?뱀씤???ㅽ뙣?덉뒿?덈떎.', null, false)
    }
  } catch (error) {
    console.error('Error confirming inbound:', error)
    openModal('?ㅻ쪟', '?쒕쾭 ?듭떊 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.', null, false)
  }
}

// Modal State
const modalVisible = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalConfirmCallback = ref(null)
const modalShowCancel = ref(true)

const openModal = (title, message, callback, showCancel = true) => {
  modalTitle.value = title
  modalMessage.value = message
  modalConfirmCallback.value = callback
  modalShowCancel.value = showCancel
  modalVisible.value = true
}

const handleModalConfirm = () => {
  const callback = modalConfirmCallback.value
  modalVisible.value = false
  if (callback) callback()
}

const handleModalClose = () => {
  modalVisible.value = false
}
</script>

<template>
  <div class="content-wrapper">
    <div class="page-header">
      <h2 class="page-title">?낃퀬 愿由?(怨듭옣)</h2>
    </div>

    <div class="main-container">
      <section class="full-panel">
        <h3 class="panel-title">?곸꽭 ?덈ぉ 紐⑸줉</h3>
        <div class="data-table-card">
          <div class="data-table-scroll-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                  </th>
                  <th>?쒗뭹 ?앸퀎 肄붾뱶</th>
                  <th>?쒗뭹 肄붾뱶</th>
                  <th>?쒗뭹紐?/th>
                  <th>?앹궛??/th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in inboundItems" :key="item.id">
                  <td class="checkbox-col">
                    <input type="checkbox" :checked="selectedItemIds.has(item.id)" @change="toggleSelectItem(item.id)" />
                  </td>
                  <td class="code-cell">{{ item.id }}</td>
                  <td>{{ item.productCode }}</td>
                  <td class="name-cell">{{ item.name }}</td>
                  <td>{{ item.productionDate }}</td>
                </tr>
                <tr v-if="inboundItems.length === 0">
                  <td colspan="5" class="empty-state">?낃퀬 ?湲???ぉ???놁뒿?덈떎.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="action-bar">
          <div class="selected-count" v-if="selectedItemIds.size > 0">
            ?좏깮????ぉ: <strong>{{ selectedItemIds.size }}</strong>媛?          </div>
          <button class="approve-btn" @click="approveInbound" :disabled="selectedItemIds.size === 0">
            ?낃퀬 ?뱀씤
          </button>
        </div>
      </section>
    </div>

    <Modal
      :isOpen="modalVisible"
      :title="modalTitle"
      :message="modalMessage"
      :showCancel="modalShowCancel"
      @close="handleModalClose"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
.content-wrapper { 
  max-width: 100%;
  height: 100vh;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8fafc;
}

.page-header {
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.full-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #475569;
}

.data-table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.data-table-scroll-wrapper {
  flex: 1;
  overflow: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 10;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9375rem;
  color: #334155;
  white-space: nowrap;
}

.checkbox-col {
  width: 50px;
  text-align: center;
}

.code-cell {
  font-family: 'JetBrains Mono', monospace;
  color: #64748b;
}

.name-cell {
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #94a3b8;
}

.action-bar {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.selected-count {
  font-size: 1rem;
  color: #64748b;
}

.approve-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.approve-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.approve-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
