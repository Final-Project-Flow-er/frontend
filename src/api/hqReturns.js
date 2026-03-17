import { request } from './http.js'

const BASE = '/api/v1/hq/returns'

export const getReturnList = (isAll) => request(`${BASE}?isAll=${isAll}`)
export const getReturnDetail = (returnCode) => request(`${BASE}/${returnCode}`)
export const acceptReturns = (returnCodes) => request(BASE, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(returnCodes),
})
export const updateReturn = (returnCode, data) => request(`${BASE}/${returnCode}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})

export const updateReturnShippingPending = (data) => request(`${BASE}/shipping-pending`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
