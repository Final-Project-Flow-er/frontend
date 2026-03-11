import { request } from './http.js'

const BASE = '/api/v1/transport/internal'

export const getAvailableVehicles = () => request(`${BASE}/available-vehicles`)
export const getUnassignedOrders = () => request(`${BASE}/unassigned-orders`)
export const assignVehicle = (data) => request(`${BASE}/assignments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
