import { request } from './http.js'

const BASE = '/api/v1/franchise/settlements'

export const franchiseSettlementsApi = {
    // 일별
    getDailySummary: (date) => request(`${BASE}/daily/summary?date=${date}`),
    getDailySalesItems: (date, limit) => {
        let url = `${BASE}/daily/sales-items?date=${date}`
        if (limit) url += `&limit=${limit}`
        return request(url)
    },
    getDailyOrderItems: (date, limit) => {
        let url = `${BASE}/daily/order-items?date=${date}`
        if (limit) url += `&limit=${limit}`
        return request(url)
    },

    // 월별
    getMonthlySummary: (month) => request(`${BASE}/monthly/summary?month=${month}`),
    getMonthlySalesItems: (month, limit) => {
        let url = `${BASE}/monthly/sales-items?month=${month}`
        if (limit) url += `&limit=${limit}`
        return request(url)
    },
    getMonthlyOrderItems: (month, limit) => {
        let url = `${BASE}/monthly/order-items?month=${month}`
        if (limit) url += `&limit=${limit}`
        return request(url)
    },
    getMonthlyDailyGraph: (month) => {
        return request(`${BASE}/monthly/sales-graph?month=${month}`)
    },

    // 전표 (Vouchers)
    getVouchers: (params) => {
        const { period, date, month, type, page = 0, size = 20 } = params
        let url = `${BASE}/vouchers?period=${period}&page=${page}&size=${size}`
        if (date) url += `&date=${date}`
        if (month) url += `&month=${month}`
        if (type) url += `&type=${type}`
        return request(url)
    },

    // PDF & Excel
    getDailyReceiptPdf: (date) => request(`${BASE}/daily/receipt/pdf?date=${date}`),
    getMonthlyReceiptPdf: (month) => request(`${BASE}/monthly/receipt/pdf?month=${month}`),
    getMonthlyExcel: (month) => request(`${BASE}/monthly/vouchers/excel?month=${month}`)
}
