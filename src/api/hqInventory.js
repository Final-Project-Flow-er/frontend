import { request } from './http.js'

const BASE = '/api/v1/hq/inventory'

export const getHQStock = () => request(BASE)
