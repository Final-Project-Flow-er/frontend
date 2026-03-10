import { request } from './http.js'

const BASE = '/api/v1/factory/orders'

export const getOrderList = (isAll) => request(`${BASE}/accepted?isAll=${isAll}`)
export const updateOrders = (data) => request(BASE, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
