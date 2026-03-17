import { request } from './http.js'

const BASE = '/api/v1/factory/orders'

export const getOrderList = (isAll, { page = 0, size = 20 } = {}) =>
  request(`${BASE}?isAll=${isAll}&page=${page}&size=${size}`)
export const updateOrders = (data) => request(`${BASE}?isAccept=${data.isAccept}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderCodes: data.orderCodes }),
})
