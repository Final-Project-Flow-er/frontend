<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content fade-in">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }} 선택</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body custom-scrollbar">
        <!-- 검색바 -->
        <div class="search-bar">
          <div class="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="title + '명으로 검색하세요'"
            >
          </div>
        </div>

        <!-- 사업장 목록 -->
        <div class="unit-list">
          <div v-if="filteredUnits.length === 0" class="no-results">
            검색 결과가 없습니다.
          </div>
          <div 
            v-for="unit in filteredUnits" 
            :key="unit.id" 
            class="unit-item"
            @click="selectUnit(unit)"
          >
            <div class="item-info">
              <span class="unit-name">{{ unit.name }}</span>
              <span class="unit-details">
                코드: {{ unit.code || unit.businessNumber }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  units: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')

const filteredUnits = computed(() => {
  if (!searchQuery.value) return props.units
  
  const query = searchQuery.value.toLowerCase()
  return props.units.filter(u => 
    u.name.toLowerCase().includes(query) || 
    (u.code && u.code.toLowerCase().includes(query)) ||
    (u.businessNumber && u.businessNumber.toLowerCase().includes(query))
  )
})

const selectUnit = (unit) => {
  emit('select', unit)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; backdrop-filter: blur(4px);
}

.modal-content {
  background: white; border-radius: 16px;
  width: 90%; max-width: 450px; max-height: 70vh;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-title { font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0; }

.close-btn {
  background: none; border: none; color: #94a3b8; cursor: pointer;
  padding: 0.5rem; border-radius: 50%; transition: all 0.2s;
}
.close-btn:hover { background: #f1f5f9; color: #0f172a; }

.modal-body { padding: 1.25rem; overflow-y: auto; }

.search-bar { margin-bottom: 1rem; }
.search-box { position: relative; }
.search-box svg {
  position: absolute; left: 1rem; top: 50%;
  transform: translateY(-50%); color: #94a3b8;
}
.search-box input {
  width: 100%; padding: 0.7rem 1rem 0.7rem 2.75rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.9rem; outline: none; transition: all 0.2s;
}
.search-box input:focus { border-color: #0f172a; }

.unit-list { display: flex; flex-direction: column; gap: 0.5rem; }

.unit-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem; border: 1.5px solid #f1f5f9; border-radius: 10px;
  cursor: pointer; transition: all 0.2s;
}
.unit-item:hover {
  background: #f8fafc; border-color: #cbd5e1;
}

.item-info { display: flex; flex-direction: column; gap: 0.25rem; }
.unit-name { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
.unit-details { font-size: 0.8rem; color: #64748b; }

.no-results {
  text-align: center; padding: 2rem 0; color: #94a3b8; font-size: 0.9rem;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
