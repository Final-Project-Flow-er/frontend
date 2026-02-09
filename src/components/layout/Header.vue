<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <header class="header">
    <div class="page-title"><h2>재고 관리 현황</h2></div>
    <div class="header-tools">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          :value="modelValue" 
          @input="$emit('update:modelValue', $event.target.value)"
          placeholder="SKU ID 또는 상품명으로 검색"
        >
      </div>
      <div class="notification">
        <img src="@/assets/notification.png" alt="알림" class="notif-img" height="30">
        <span class="dot"></span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header { height: var(--header-h); background: var(--white); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; flex-shrink: 0; }
.page-title h2 { font-size: 1.25rem; font-weight: 700; margin: 0; }
.header-tools { display: flex; align-items: center; gap: 2rem; }
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 12px; color: var(--text-light); }
.search-wrapper input { padding: 0.6rem 1rem 0.6rem 2.5rem; border: 1px solid var(--border-color); border-radius: 10px; width: 320px; font-size: 0.9rem; background-color: #f8fafc; outline: none; }
.notification { position: relative; font-size: 1.2rem; cursor: pointer; }
.notification .dot { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; }
</style>