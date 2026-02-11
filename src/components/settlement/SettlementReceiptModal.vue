<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  store: Object,
  date: String
})

const emit = defineEmits(['close'])

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const today = new Date().toLocaleString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false
}).replace(/\. /g, '-').replace('.', '')

const finalAmount = computed(() => {
  if (!props.store) return 0
  const sales = props.store.sales || 0
  const orderCost = props.store.orderCost || 0
  const shipping = props.store.shipping || 0
  const commission = props.store.commission || 0
  const loss = props.store.loss || 0
  const refund = props.store.refund || 0
  return sales - (orderCost + shipping + commission + loss) + refund
})
</script>

<template>
  <div v-if="isOpen" class="receipt-overlay" @click.self="$emit('close')">
    <div class="receipt-modal">
      <div class="receipt-content">
        <!-- Left Section -->
        <div class="receipt-card left-card">
          <div class="receipt-header">
            <h2>정산 영수증</h2>
            <div class="sub-header">RECEIPT</div>
            <div class="brand">Chain-G 정산 시스템</div>
          </div>
          
          <div class="receipt-info">
            <div class="info-row">
              <span class="label">가맹점 :</span>
              <span class="value">{{ store?.name }} ({{ store?.id }})</span>
            </div>
            <div class="info-row">
              <span class="label">정산 기간 :</span>
              <span class="value">{{ date }}</span>
            </div>
            <div class="info-row">
              <span class="label">발행일 :</span>
              <span class="value">{{ today }}</span>
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- Sales Section -->
          <div class="section">
            <h3>매출 내역</h3>
            <div class="item-row">
              <span>주문 list</span>
              <span class="amount text-red">{{ fmt(store?.sales || 0) }}원</span>
            </div>
            <div class="total-box">
              <span>총 매출</span>
              <span class="total-amount">{{ fmt(store?.sales || 0) }}</span>
            </div>
          </div>

          <!-- Deduction Section -->
          <div class="section">
            <h3>차감 내역</h3>
            <div class="item-row">
              <span>발주 대금 (상품list)</span>
              <span class="amount text-red">-{{ fmt(store?.orderCost || 0) }}원</span>
            </div>
            <div class="item-row">
              <span>배송비</span>
              <span class="amount text-red">-{{ fmt(store?.shipping || 0) }}원</span>
            </div>
            <div class="item-row">
              <span>수수료</span>
              <span class="amount text-red">-{{ fmt(store?.commission || 0) }}원</span>
            </div>
            <div class="item-row">
              <span>손실</span>
              <span class="amount text-red">-{{ fmt(store?.loss || 0) }}원</span>
            </div>
          </div>
        </div>

        <!-- Right Section -->
        <div class="receipt-card right-card">
          <!-- Refund Section -->
          <div class="section">
            <h3>환급 내역</h3>
            <div class="item-row">
              <span>반품 환급</span>
              <span class="amount text-green">+{{ fmt(store?.refund || 0) }}원</span>
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- Final Amount -->
          <div class="final-box">
            <span>최종 정산 금액</span>
            <span class="final-amount">{{ fmt(finalAmount) }}</span>
          </div>

          <div class="calculation-guide">
            총 매출 - (발주대금+배송비+수수료+손실)+반품 환급
          </div>

          <div class="section-divider"></div>

          <div class="footer-msg">
            <p>본 문서는 공식 정식 영수증입니다.</p>
            <p>세무 신고 및 회계 처리 시 보관하시기 바랍니다.</p>
          </div>

          <div class="signature">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
          </div>
        </div>
      </div>
      
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>
  </div>
</template>

<style scoped>
.receipt-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000;
}

.receipt-modal {
  background: transparent;
  width: 900px;
  max-width: 95vw;
  position: relative;
}

.receipt-content {
  display: flex;
  gap: 20px;
}

.receipt-card {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.receipt-header {
  text-align: center;
  margin-bottom: 30px;
}
.receipt-header h2 {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #000;
}
.sub-header {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
  margin: 5px 0;
}
.brand {
  font-size: 13px;
  color: #64748b;
}

.section-divider {
  height: 2px;
  background: #000;
  margin: 20px 0;
}

.receipt-info .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}
.receipt-info .label {
  font-weight: 700;
  color: #000;
}
.receipt-info .value {
  font-weight: 600;
}

.section h3 {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 15px;
  color: #000;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.item-row .amount.text-red { color: #ef4444; }
.item-row .amount.text-green { color: #10b981; }

.total-box {
  background: #eff6ff;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 30px;
}
.total-box span:first-child {
  font-weight: 800;
  font-size: 16px;
  color: #1e293b;
}
.total-box .total-amount {
  font-weight: 800;
  font-size: 20px;
  color: #000;
}

.final-box {
  background: #eff6ff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.final-box span:first-child {
  font-weight: 800;
  font-size: 18px;
  color: #000;
}
.final-box .final-amount {
  font-weight: 800;
  font-size: 24px;
  color: #000;
}

.calculation-guide {
  background: #e2e8f0;
  border-radius: 50px;
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  margin-bottom: 30px;
}

.footer-msg {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  margin-top: 20px;
  margin-bottom: 50px;
}
.footer-msg p { margin: 2px 0; }

.signature {
  text-align: right;
  color: #94a3b8;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}
</style>
