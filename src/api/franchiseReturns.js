import { request } from './http.js'

const BASE = '/api/v1/franchise/returns'

export const getReturnList = () => request(BASE)
export const getReturnDetail = (returnCode) => request(`${BASE}/${returnCode}`)
export const getReturnTargets = () => request(`${BASE}/target`)
export const getReturnTargetInfo = (orderCode) => request(`${BASE}/${orderCode}/target-info`)
export const createReturn = (data) => request(BASE, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
export const cancelReturn = (returnCode) => request(`${BASE}/${returnCode}/cancellation`, { method: 'PATCH' })
export const updateReturn = (returnCode, data) => request(`${BASE}/${returnCode}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
})
