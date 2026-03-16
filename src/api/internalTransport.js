import { request } from './http.js'

const BASE = '/api/v1/transport/internal'

export const getAvailableVehicles = () => request(`${BASE}/available-vehicles`)
export const getUnassignedOrders = () => request(`${BASE}/unassigned-orders`)
export const getUnassignedReturns = () => request(`${BASE}/unassigned-returns`)
export const assignVehicle = (data) => request(`${BASE}/assignments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
export const getTransportLogList = () => request(`${BASE}/transport-logs`)


export const assignReturns = (data) => request(`${BASE}/returns/assignments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
