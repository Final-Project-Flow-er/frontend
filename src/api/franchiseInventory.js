import { request } from './http.js'

const BASE = '/api/v1/franchise/inventory'

export const getFranchiseStock = () => request(`${BASE}`)
