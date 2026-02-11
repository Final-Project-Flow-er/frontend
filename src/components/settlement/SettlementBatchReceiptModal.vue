<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  stores: Array, // Array of store objects
  date: String
})

const emit = defineEmits(['close'])

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const today = new Date().toLocaleString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false
}).replace(/\. /g, '-').replace('.', '')

const getFinalAmount = (store) => {
  if (!store) return 0
  const sales = store.sales || 0
  const orderCost = store.orderCost || 0
  const shipping = store.shipping || 0
  const commission = store.commission || 0
  const loss = store.loss || 0
  const refund = store.refund || 0
  return sales - (orderCost + shipping + commission + loss) + refund
}

const totals = computed(() => {
  if (!props.stores) return null
  return {
    sales: props.stores.reduce((acc, s) => acc + (s.sales || 0), 0),
    orderCost: props.stores.reduce((acc, s) => acc + (s.orderCost || 0), 0),
    shipping: props.stores.reduce((acc, s) => acc + (s.shipping || 0), 0),
    commission: props.stores.reduce((acc, s) => acc + (s.commission || 0), 0),
    loss: props.stores.reduce((acc, s) => acc + (s.loss || 0), 0),
    refund: props.stores.reduce((acc, s) => acc + (s.refund || 0), 0),
  }
})

const totalFinal = computed(() => {
  if (!totals.value) return 0
  const t = totals.value
  return t.sales - (t.orderCost + t.shipping + t.commission + t.loss) + t.refund
})
</script>

<template>
  <div v-if="isOpen" class="receipt-overlay" @click.self="$emit('close')">
    <div class="batch-receipt-modal">
      <div class="batch-header">
        <h2>전체 가맹점 정산 요약 영수증</h2>
        <span class="count-badge">{{ stores?.length || 0 }}개 가맹점</span>
        <button class="close-top-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="batch-scroll-area">
        <!-- [수정] 전체 합산 영수증만 표시 -->
        <div v-if="totals" class="receipt-instance summary-instance">
          <div class="receipt-content">
            <div class="receipt-card left-card summary-card-style">
              <div class="receipt-header">
                <h2>전체 가맹점 정산 요약</h2>
                <div class="sub-header">TOTAL SUMMARY RECEIPT</div>
                <div class="brand">Chain-G 정산 시스템</div>
              </div>
              
              <div class="receipt-info">
                <div class="info-row">
                  <span class="label">가맹점 :</span>
                  <span class="value">전체 가맹점 (Total)</span>
                </div>
                <div class="info-row">
                  <span class="label">대상 점포 수 :</span>
                  <span class="value">{{ stores?.length }}개 지점</span>
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

              <div class="section">
                <h3>전체 매출 합계</h3>
                <div class="item-row">
                  <span>총 주문 매출</span>
                  <span class="amount text-red">{{ fmt(totals.sales) }}원</span>
                </div>
                <div class="total-box">
                  <span>전체 매출</span>
                  <span class="total-amount">{{ fmt(totals.sales) }}</span>
                </div>
              </div>

              <div class="section">
                <h3>전체 차감 합계</h3>
                <div class="item-row">
                  <span>총 발주 대금</span>
                  <span class="amount text-red">-{{ fmt(totals.orderCost) }}원</span>
                </div>
                <div class="item-row">
                  <span>총 배송비</span>
                  <span class="amount text-red">-{{ fmt(totals.shipping) }}원</span>
                </div>
                <div class="item-row">
                  <span>총 수수료</span>
                  <span class="amount text-red">-{{ fmt(totals.commission) }}원</span>
                </div>
                <div class="item-row">
                  <span>총 손실</span>
                  <span class="amount text-red">-{{ fmt(totals.loss) }}원</span>
                </div>
              </div>
            </div>

            <div class="receipt-card right-card summary-card-style">
              <div class="section">
                <h3>전체 환급 합계</h3>
                <div class="item-row">
                  <span>총 반품 환급</span>
                  <span class="amount text-green">+{{ fmt(totals.refund) }}원</span>
                </div>
              </div>

              <div class="section-divider"></div>

              <div class="final-box summary-final">
                <span>전체 최종 정산 합계</span>
                <span class="final-amount">{{ fmt(totalFinal) }}</span>
              </div>

              <div class="calculation-guide">
                전체 매출 - (발주+배송+수수료+손실 합계) + 환급 합계
              </div>

              <div class="section-divider"></div>

              <div class="footer-msg">
                <p>위 내역은 해당 기간 모든 가맹점의 정산 합계입니다.</p>
                <p>총 {{ stores?.length }}개 지점의 데이터가 포함되었습니다.</p>
              </div>

              <div class="signature">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
  z-index: 2100;
  backdrop-filter: blur(4px);
}

.batch-receipt-modal {
  background: #f8fafc;
  width: 1000px;
  max-width: 95vw;
  height: 90vh;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.batch-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.batch-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: #1e293b;
}

.count-badge {
  background: #4f46e5;
  color: white;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
}

.close-top-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 2rem;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.batch-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background: #f1f5f9;
}

.receipt-instance {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.receipt-content {
  display: flex;
  gap: 20px;
  width: 100%;
}

.receipt-card {
  flex: 1;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.receipt-header { text-align: center; margin-bottom: 30px; }
.receipt-header h2 { font-size: 24px; font-weight: 800; margin: 0; color: #000; }
.sub-header { font-size: 14px; color: #94a3b8; font-weight: 600; margin: 5px 0; }
.brand { font-size: 13px; color: #64748b; }

.section-divider { height: 2px; background: #000; margin: 20px 0; }

.receipt-info .info-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
.receipt-info .label { font-weight: 700; color: #000; }
.receipt-info .value { font-weight: 600; }

.section h3 { font-size: 16px; font-weight: 800; margin-bottom: 15px; color: #000; }

.item-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #334155; font-weight: 600; }
.item-row .amount.text-red { color: #ef4444; }
.item-row .amount.text-green { color: #10b981; }

.total-box { background: #eff6ff; border-radius: 50px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 30px; }
.total-box span:first-child { font-weight: 800; font-size: 16px; color: #1e293b; }
.total-box .total-amount { font-weight: 800; font-size: 20px; color: #000; }

.final-box { background: #eff6ff; border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.final-box span:first-child { font-weight: 800; font-size: 18px; color: #000; }
.final-box .final-amount { font-weight: 800; font-size: 24px; color: #000; }

.calculation-guide { background: #e2e8f0; border-radius: 50px; padding: 12px; text-align: center; font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 30px; }

.footer-msg { text-align: center; font-size: 12px; color: #64748b; margin-top: 20px; margin-bottom: 50px; }
.footer-msg p { margin: 2px 0; }

.signature { text-align: right; color: #94a3b8; }

.summary-card-style {
  background: #f8fafc;
  border: 2px solid #334155 !important;
}

.summary-final {
  background: #334155 !important;
  color: white !important;
}
.summary-final span { color: white !important; }

.summary-divider {
  background: #334155 !important;
  height: 2px !important;
}
.summary-divider span {
  background: #334155 !important;
  color: white !important;
}

.batch-divider {
  width: 100%;
  height: 1px;
  background: #cbd5e1;
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.batch-divider span {
  background: #f1f5f9;
  padding: 0 1rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 2px;
}
</style>
