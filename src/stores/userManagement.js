import { defineStore } from 'pinia'
import api from '../api'

export const useUserManagementStore = defineStore('userManagement', {
    state: () => ({
        users: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        userLogs: [],
        businessUnits: {
            hq: [],
            franchise: [],
            factory: []
        }
    }),
    actions: {
        // 회원 목록 조회
        async fetchUsers(params) {
            try {
                const response = await api.get('/hq/users', { params })
                if (response.data.success) {
                    this.users = response.data.data.content
                    this.totalElements = response.data.data.totalElements
                    this.totalPages = response.data.data.totalPages
                    this.currentPage = response.data.data.number
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to fetch users:', error)
                throw error
            }
        },

        // 회원 상세 조회
        async fetchUserDetail(id) {
            try {
                const response = await api.get(`/hq/users/${id}`)
                if (response.data.success) {
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to fetch user detail:', error)
                throw error
            }
        },

        // 회원 등록
        async createUser(userData, profileImage) {
            try {
                const formData = new FormData()
                formData.append('request', new Blob([JSON.stringify(userData)], { type: 'application/json' }))
                if (profileImage) {
                    formData.append('profileImage', profileImage)
                }

                const response = await api.post('/hq/users', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                return response.data
            } catch (error) {
                console.error('Failed to create user:', error)
                throw error
            }
        },

        // 회원 수정
        async updateUser(id, userData, profileImage) {
            try {
                const formData = new FormData()
                formData.append('request', new Blob([JSON.stringify(userData)], { type: 'application/json' }))
                if (profileImage) {
                    formData.append('profileImage', profileImage)
                }

                const response = await api.patch(`/hq/users/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                return response.data
            } catch (error) {
                console.error('Failed to update user:', error)
                throw error
            }
        },

        // 회원 상태 변경
        async updateUserStatus(id, status) {
            try {
                const response = await api.patch(`/hq/users/${id}/status`, { status })
                return response.data
            } catch (error) {
                console.error('Failed to update user status:', error)
                throw error
            }
        },

        // 회원 삭제
        async deleteUser(id) {
            try {
                const response = await api.delete(`/hq/users/${id}`)
                return response.data
            } catch (error) {
                console.error('Failed to delete user:', error)
                throw error
            }
        },

        // 정보 재전송
        async resendUserInfo(id) {
            try {
                const response = await api.post(`/hq/users/${id}/resend-info`)
                return response.data
            } catch (error) {
                console.error('Failed to resend user info:', error)
                throw error
            }
        },

        // 로그 조회
        async fetchUserLogs(params) {
            try {
                const response = await api.get('/hq/users/logs', { params })
                if (response.data.success) {
                    this.userLogs = response.data.data.content
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to fetch user logs:', error)
                throw error
            }
        },

        // 사업장 목록 조회 (가맹점/공장 선텍용)
        async fetchBusinessUnits(type) {
            try {
                const response = await api.get(`/hq/business-units/${type.toUpperCase()}`, {
                    params: { size: 100 } // 페이지네이션 없이 많이 가져옴
                })
                if (response.data.success) {
                    this.businessUnits[type] = response.data.data.content
                    return response.data.data.content
                }
            } catch (error) {
                console.error(`Failed to fetch ${type} business units:`, error)
                throw error
            }
        }
    }
})
