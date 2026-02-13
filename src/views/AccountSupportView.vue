<template>
  <div class="support-page">
    <div class="support-card">
      <div class="support-header">
        <h1 class="logo-barcode">CHAIN-G</h1>
        <h2>ACCOUNT SUPPORT</h2>
        <p>계정 정보를 분실하셨나요? 시스템 관리자에게 문의하세요.</p>
      </div>

      <div class="support-content">
        <div class="info-section">
          <h3>방법 1. 비밀번호 재설정 메일 발송</h3>
          <p>등록된 아이디와 사내 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
          <div class="support-form">
            <div class="input-stack">
              <input type="text" v-model="userId" placeholder="아이디를 입력하세요" class="support-input" />
              <input type="email" v-model="email" placeholder="chain-g@email.com" class="support-input" />
            </div>
            <button @click="requestReset" class="action-btn-large">안내 메일 발송</button>
          </div>
        </div>

        <hr class="divider" />

        <div class="info-section">
          <h3>방법 2. 시스템 총괄 관리자 문의</h3>
          <p>아이디를 분실했거나 이메일 접근이 불가능한 경우, IT 지원팀으로 직접 연락 바랍니다.</p>
          <ul class="contact-list">
            <li><strong>내선 번호:</strong> 02-1234-5678 (운영지원팀)</li>
            <li><strong>이메일:</strong> chain-g@email.com</li>
          </ul>
        </div>
      </div>

      <div class="support-footer">
        <button @click="$router.push('/login')" class="back-btn">← 로그인 화면으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userId = ref('')
const email = ref('')
const requestReset = () => {
  if (!userId.value) return alert('아이디를 입력해주세요.')
  if (!email.value) return alert('이메일을 입력해주세요.')
  alert('입력하신 정보를 확인하여 안내 메일이 발송되었습니다.')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+39+Text&display=swap');

.support-page {
  width: 100vw;
  height: 100vh;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-card {
  width: 100%;
  max-width: 540px;
  background: #ffffff;
  padding: 3rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.support-header { text-align: center; margin-bottom: 2.5rem; }

.logo-barcode {
  font-family: 'Libre Barcode 39 Text', system-ui;
  font-size: 50px;
  color: #0f172a;
  margin: 0;
  font-weight: 100;
  display: inline-block;
  transform: scaleX(0.7);
  letter-spacing: 2px;
  filter: contrast(120%);
}

.support-header h2 { font-size: 1.2rem; color: #1e293b; margin-bottom: 0.5rem; letter-spacing: 1px; }
.support-header p { font-size: 0.85rem; color: #64748b; line-height: 1.5; }

.support-content { margin-bottom: 2rem; }

.info-section h3 { font-size: 0.95rem; color: #0f172a; margin-bottom: 0.8rem; font-weight: 700; }
.info-section p { font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; line-height: 1.4; }

.support-form { display: flex; flex-direction: column; gap: 12px; }
.input-stack { display: flex; flex-direction: column; gap: 8px; }
.support-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}
.support-input:focus {
  outline: none;
  border-color: #0f172a;
}

.action-btn-large {
  background: #0f172a;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.action-btn-large:hover {
  background: #1e293b;
}

.divider { border: 0; border-top: 1px solid #f1f5f9; margin: 2rem 0; }

.contact-list { list-style: none; padding: 0; font-size: 0.85rem; color: #334155; }
.contact-list li { margin-bottom: 0.5rem; }

.back-btn {
  width: 100%;
  background: none;
  border: 1px solid #e2e8f0;
  padding: 0.8rem;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}
.back-btn:hover { background: #f8fafc; color: #0f172a; }
</style>