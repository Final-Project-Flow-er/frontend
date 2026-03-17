import { request } from './http.js'

const BASE = '/api/v1/franchise/sales'

export const getSalesList = ({ page = 0, size = 20 } = {}) =>
  request(`${BASE}?page=${page}&size=${size}`)

export const getCanceledSalesList = () => request(`${BASE}/canceled`)

export const getSalesDetail = (salesCode) => request(`${BASE}/${salesCode}`)

export const cancelSale = (salesCode) =>
  request(`${BASE}/${salesCode}`, { method: 'PATCH' })

export const createSale = (data) =>
  request(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })