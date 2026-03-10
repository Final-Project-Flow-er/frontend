import { request } from './http.js'

const BASE = '/api/v1/factory/orders'

export const getOrderList = (isAccepted) => request(`${BASE}/accepted?isAccepted=${isAccepted}`)
export const updateOrders = (data) => request(BASE, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
