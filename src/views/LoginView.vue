<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loginData = reactive({
  id: '',
  pw: ''
})

const handleLogin = () => {
  if (!loginData.id || !loginData.pw) {
    alert('아이디와 비밀번호를 입력해주세요.')
    return
  }
  router.push('/')
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1 class="logo-barcode">CHAIN-G</h1>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group">
          <label>아이디</label>
          <input type="text" v-model="loginData.id" placeholder="아이디를 입력하세요" required>
        </div>

        <div class="input-group">
          <label>비밀번호</label>
          <input type="password" v-model="loginData.pw" placeholder="비밀번호를 입력하세요" required>
        </div>

        <button type="submit" class="login-submit-btn">
          로그인
        </button>

        <div class="login-options">
          <a href="#" @click.prevent="$router.push('/account')" class="forgot-link">
          계정 분실 문의
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.login-page {
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  padding: 3.5rem 2.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.login-header { text-align: center; margin-bottom: 3rem; }
.logo-barcode {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 70px;
  color: #0f172a;
  margin: 0;
  font-weight: 100;
  display: inline-block;
  transform: scaleX(0.7);
  letter-spacing: 2px;
  filter: contrast(120%);
}
.login-form { display: flex; flex-direction: column; gap: 1.2rem; }
.input-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-group label { font-size: 0.8rem; font-weight: 700; color: #475569; }
.input-group input {
  padding: 0.9rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fdfdfd;
}
.input-group input:focus {
  outline: none;
  border-color: #0f172a;
  background: #fff;
}
.login-submit-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}
.login-submit-btn:hover { background: #1e293b; transform: translateY(-1px); }
.login-options {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}
.forgot-link { text-decoration: none; color: #64748b; }
</style>