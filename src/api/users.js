import { request } from './http.js'

export const getMyInfo = () => request('/api/v1/users/me')
export const getMyWorkplaceInfo = () => request('/api/v1/users/me/workplace')
