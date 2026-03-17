import { request } from './http.js'

const BASE = '/api/v1/hq/settlements'

export const settlementsApi = {
    // 일별
    getDailySummary: (date) => request(`${BASE}/daily/summary?date=${date}`),
    getDailyFranchises: (params) => {
        const { date, keyword, status, page = 0, size = 20 } = params
        let url = `${BASE}/daily/franchises?date=${date}&page=${page}&size=${size}`
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
        if (status) url += `&status=${status}`
        return request(url)
    },
    getDailyTrend: (start, end) => request(`${BASE}/daily/daily-sales-graph?start=${start}&end=${end}`),

    // 가맹점 상세 요약 (Hq용)
    getDailyFranchiseSummary: (franchiseId, date) => request(`${BASE}/daily/franchises/${franchiseId}/summary?date=${date}`),
    getMonthlyFranchiseSummary: (franchiseId, month) => request(`${BASE}/monthly/franchises/${franchiseId}/summary?month=${month}`),

    // 가맹점 상세 부가 내역 (상품/발주/그래프)
    getDailyFranchiseSalesItems: (franchiseId, date, limit = 5) => request(`${BASE}/daily/franchises/${franchiseId}/sales-items?date=${date}&limit=${limit}`),
    getDailyFranchiseOrderItems: (franchiseId, date, limit = 5) => request(`${BASE}/daily/franchises/${franchiseId}/order-items?date=${date}&limit=${limit}`),
    getMonthlyFranchiseSalesItems: (franchiseId, month, limit = 5) => request(`${BASE}/monthly/franchises/${franchiseId}/sales-items?month=${month}&limit=${limit}`),
    getMonthlyFranchiseOrderItems: (franchiseId, month, limit = 5) => request(`${BASE}/monthly/franchises/${franchiseId}/order-items?month=${month}&limit=${limit}`),
    getMonthlyFranchiseSalesTrend: (franchiseId, month) => request(`${BASE}/monthly/franchises/${franchiseId}/sales-graph?month=${month}`),

    // 월별
    getMonthlySummary: (month) => request(`${BASE}/monthly/summary?month=${month}`),
    getMonthlyFranchises: (params) => {
        const { month, keyword, status, page = 0, size = 20 } = params
        let url = `${BASE}/monthly/franchises?month=${month}&page=${page}&size=${size}`
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
        if (status) url += `&status=${status}`
        return request(url)
    },
    getMonthlyTrend: (start, end) => request(`${BASE}/monthly/monthly-sales-graph?start=${start}&end=${end}`),

    // PDF & Excel
    getDailyAllSummaryPdf: (date) => request(`${BASE}/daily/receipt-all/pdf?date=${date}`),
    getMonthlyAllSummaryPdf: (month) => request(`${BASE}/monthly/receipt-all/pdf?month=${month}`),
    getDailyFranchiseReceiptPdf: (franchiseId, date) => request(`${BASE}/daily/franchises/${franchiseId}/receipt/pdf?date=${date}`),
    getMonthlyFranchiseReceiptPdf: (franchiseId, month) => request(`${BASE}/monthly/franchises/${franchiseId}/receipt/pdf?month=${month}`),
    /* ── 정산 확정 (Confirmation) ── */
    getConfirmStatusCounts(month) {
        return request(`/api/v1/hq/settlements/confirm/monthly/status-counts?month=${month}`)
    },
    getConfirmFranchises(params) {
        const { month, keyword, status, page = 0, size = 20 } = params
        let url = `/api/v1/hq/settlements/confirm/monthly/franchises?month=${month}&page=${page}&size=${size}`
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
        if (status) url += `&status=${status}`
        return request(url)
    },
    requestConfirm(franchiseId, month) {
        return request(`/api/v1/hq/settlements/confirm/monthly/franchises/${franchiseId}/request?month=${month}`, { method: 'POST' })
    },
    finalConfirm(franchiseId, month) {
        return request(`/api/v1/hq/settlements/confirm/monthly/franchises/${franchiseId}/finalize?month=${month}`, { method: 'POST' })
    },
    rollbackConfirm(franchiseId, month) {
        return request(`/api/v1/hq/settlements/confirm/monthly/franchises/${franchiseId}/rollback?month=${month}`, { method: 'POST' })
    },
    finalConfirmAll(month) {
        return request(`/api/v1/hq/settlements/confirm/monthly/finalize-all?month=${month}`, { method: 'POST' })
    },
    getVouchers(params) {
        const { franchiseId, period, date, month, type, page = 0, size = 20 } = params
        let url = `/api/v1/hq/settlements/vouchers?franchiseId=${franchiseId}&period=${period}&page=${page}&size=${size}`
        if (date) url += `&date=${date}`
        if (month) url += `&month=${month}`
        if (type) url += `&type=${type}`
        return request(url)
    },
    getAllVouchers(params) {
        const { period, date, month, type, page = 0, size = 50 } = params
        let url = `/api/v1/hq/settlements/vouchers/all?period=${period}&page=${page}&size=${size}`
        if (date) url += `&date=${date}`
        if (month) url += `&month=${month}`
        if (type) url += `&type=${type}`
        return request(url)
    },
    getMonthlyExcel: (month, type) => {
        let url = `${BASE}/monthly/vouchers/excel?month=${month}`
        if (type) url += `&type=${type}`
        return request(url)
    },

    /* ── 조정 전표 (Adjustment) ── */
    getAdjustmentFranchises: () => request(`${BASE}/voucher-adjustments/franchises`),
    getAdjustmentTypes: () => request(`${BASE}/voucher-adjustments/types`),
    createAdjustment: (data) => request(`${BASE}/voucher-adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }),
    getAdjustments: (params) => {
        const { month, franchiseId, type, page = 0, size = 20 } = params
        let url = `${BASE}/voucher-adjustments?month=${month}&page=${page}&size=${size}`
        if (franchiseId) url += `&franchiseId=${franchiseId}`
        if (type) url += `&type=${type}`
        return request(url)
    },

    /* ── 정산 이력 (Logs) ── */
    getLogs: (params) => {
        const { type, page = 0, size = 20 } = params
        let url = `${BASE}/logs?page=${page}&size=${size}`
        if (type && type !== 'ALL') url += `&type=${type}`
        return request(url)
    }
}
