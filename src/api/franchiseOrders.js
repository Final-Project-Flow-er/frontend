import { request } from './http.js'

const BASE = '/api/v1/franchise/orders'

export const getOrderList = ({ page = 0, size = 20 } = {}) =>
  request(`${BASE}?page=${page}&size=${size}`)
export const getOrderDetail = (orderCode) => request(`${BASE}/${orderCode}`)
export const createOrder = (data) => request(BASE, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
export const cancelOrder = (orderCode) => request(`${BASE}/${orderCode}/cancellation`, { method: 'PATCH' })
export const updateOrder = (orderCode, data) => request(`${BASE}/${orderCode}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
export const getOrderCreationInfo = () => request(`${BASE}/creation/info`)
