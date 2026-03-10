import { request } from './http.js'

const BASE = '/api/v1/franchise/orders'

export const getOrderList = () => request(BASE)
export const getOrderDetail = (orderCode) => request(`${BASE}/${orderCode}`)
export const createOrder = (data) => request(BASE, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
export const cancelOrder = (orderCode) => request(`${BASE}/${orderCode}/cancellation`, { method: 'PATCH' })
