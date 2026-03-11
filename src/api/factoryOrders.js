import { request } from './http.js'

const BASE = '/api/v1/factory/orders'

export const getOrderList = (isAll) => request(`${BASE}?isAll=${isAll}`)
export const updateOrders = (data) => request(`${BASE}?isAccept=${data.isAccept}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderCodes: data.orderCodes }),
})
