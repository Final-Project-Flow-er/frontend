<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const loginData = reactive({
  id: '',
  pw: ''
})

const handleLogin = async () => {
  if (!loginData.id || !loginData.pw) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }

  isLoading.value = true
  try {
    const success = await authStore.login(loginData.id, loginData.pw)
    if (success) {
      router.push('/')
    } else {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.')
    }
  } catch (e) {
    alert(e.response?.data?.message || '로그인에 실패하였습니다.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-wrapper fade-in">
      <!-- Left Section: Visual Branding -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="logo-area">
            <h1 class="logo-barcode">CHAIN-G</h1>
          </div>
          <div class="text-area">
            <p>CONNECT GOOD, VALUE CHAIN</p>
            <p>상품의 가치를 신뢰로 잇는 스마트 SCM</p>
          </div>
        </div>
        <!-- Decorative Background Element -->
        <div class="bg-pattern"></div>
      </div>

      <!-- Right Section: Login Form -->
      <div class="form-panel">
        <div class="login-box">
          <div class="welcome-text">
            <h3>시스템 로그인</h3>
            <p>등록된 아이디와 비밀번호를 입력해주세요</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="input-container">
              <label>아이디</label>
              <div class="input-field">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text" v-model="loginData.id" placeholder="아이디를 입력하세요" required>
              </div>
            </div>

            <div class="input-container">
              <label>비밀번호</label>
              <div class="input-field">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input type="password" v-model="loginData.pw" placeholder="비밀번호를 입력하세요" required>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <span v-if="!isLoading">로그인</span>
              <span v-else class="loader"></span>
            </button>

            <div class="form-options">
              <a href="#" @click.prevent="$router.push('/account')" class="help-link">
                계정 분실 또는 접속 관련 문의
              </a>
            </div>
          </form>
        </div>
        
        <!-- Footer Info Removed -->
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&family=Outfit:wght@300;400;500;600;700&display=swap');

.login-page {
  width: 100vw;
  height: 100vh;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
}

.login-wrapper {
  width: 1000px;
  height: 640px;
  display: flex;
  background: white;
  border-radius: 24px;
  box-shadow: 0 40px 100px -20px rgba(15, 23, 42, 0.15);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 1);
}

/* Left Brand Panel */
.brand-panel {
  flex: 1.1;
  background: #0f172a;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 2;
}

.logo-area {
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-barcode {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 84px;
  color: white;
  margin: 0;
  font-weight: 100;
  display: inline-block;
  transform: scaleX(0.7);
  letter-spacing: 2px;
  filter: drop-shadow(0 0 15px rgba(255,255,255,0.1));
}


.text-area {
  text-align: center;
}

.text-area h2 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  letter-spacing: -0.025em;
}

.text-area p {
  font-size: 1.1rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto;
}

.bg-pattern {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 100%;
  height: 120%;
  background-image: radial-gradient(circle at 70% 30%, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* Right Form Panel */
.form-panel {
  flex: 1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white;
}

.login-box {
  width: 100%;
  max-width: 340px;
  margin: auto;
}

.welcome-text {
  margin-bottom: 2.5rem;
}

.welcome-text h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.welcome-text p {
  font-size: 0.95rem;
  color: #64748b;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.input-container label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.02em;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field .icon {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  color: #94a3b8;
  transition: all 0.2s;
}

.input-field input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-field input:focus {
  outline: none;
  border-color: #0ea5e9;
  background: white;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.08);
}

.input-field input:focus + .icon {
  color: #0ea5e9;
}

.submit-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 1.1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.2);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-options {
  text-align: center;
  margin-top: 0.5rem;
}

.help-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.help-link:hover {
  color: #0ea5e9;
}


.fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .login-wrapper { width: 90%; height: auto; flex-direction: column; max-width: 500px; }
  .brand-panel { padding: 3rem 2rem; }
  .form-panel { padding: 3rem 2rem; }
  .logo-barcode { font-size: 64px; }
  .text-area h2 { font-size: 1.75rem; }
  .text-area p { font-size: 1rem; }
}
</style>