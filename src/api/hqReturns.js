import { request } from './http.js'

const BASE = '/api/v1/hq/returns'

export const getReturnList = (isAccepted) => request(`${BASE}?isAccepted=${isAccepted}`)
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
