<template>
  <div class="content-wrapper">
    <h2>반품 수정</h2>
    <p>반품 수정 페이지입니다. (Placeholder)</p>
    <p>Return ID: {{ $route.params.id }}</p>
    <!-- 여기에 반품 수정 폼이 들어갈 예정입니다. -->
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
console.log('Editing Return ID:', route.params.id)
</script>

<style scoped>
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--border-color);
}
h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
p {
  font-size: 1rem;
  color: var(--text-dark);
}
</style>
