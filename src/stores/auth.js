import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        userRole: localStorage.getItem('userRole') || null,
        isLoggedIn: !!localStorage.getItem('accessToken'),
        userName: sessionStorage.getItem('userName') || '사용자',
        userPhoto: sessionStorage.getItem('userPhoto') || null
    }),
    actions: {
        async login(loginId, password) {
            try {
                const response = await api.post('/auth/login', {
                    loginId,
                    password
                })

                if (response.data.success) {
                    const { accessToken, refreshToken, userRole } = response.data.data

                    // Store tokens in localStorage
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', refreshToken)
                    localStorage.setItem('userRole', userRole)

                    this.userRole = userRole
                    this.isLoggedIn = true

                    // Legacy mapping for UI compatibility
                    const roleMap = {
                        'HQ_ADMIN': 'admin',
                        'HQ_USER': 'headOffice',
                        'FACTORY_ADMIN': 'factory',
                        'FRANCHISE_ADMIN': 'franchise'
                    }
                    const uiRole = roleMap[userRole] || 'headOffice'
                    sessionStorage.setItem('userRole', uiRole)
                    sessionStorage.setItem('isLoggedIn', 'true')

                    const nameMap = {
                        'HQ_ADMIN': '본사 관리자',
                        'HQ_USER': '본사 직원',
                        'FACTORY_ADMIN': '공장 관리자',
                        'FRANCHISE_ADMIN': '가맹점주'
                    }
                    this.userName = nameMap[userRole] || '사용자'
                    sessionStorage.setItem('userName', this.userName)

                    return true
                }
                return false
            } catch (error) {
                console.error('Login failed:', error)
                throw error
            }
        },

        async logout() {
            try {
                await api.post('/auth/logout')
            } catch (error) {
                console.warn('Logout failed on backend, cleaning up client side anyway.')
            } finally {
                // Clear all stored data
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('userRole')
                sessionStorage.removeItem('isLoggedIn')
                sessionStorage.removeItem('userRole')
                sessionStorage.removeItem('userName')

                this.userRole = null
                this.isLoggedIn = false
                this.userName = '사용자'
            }
        },

        async resetPassword(loginId, email) {
            try {
                const response = await api.post('/auth/reset-password', {
                    loginId,
                    email
                })
                return response.data.message || '임시 비밀번호가 메일로 발송되었습니다.'
            } catch (error) {
                console.error('Reset password failed:', error)
                throw error
            }
        },

        async getMyInfo() {
            try {
                const response = await api.get('/users/me')
                if (response.data.success) {
                    const data = response.data.data
                    this.userName = data.username
                    this.userPhoto = data.profileImageUrl
                    sessionStorage.setItem('userName', this.userName)
                    if (this.userPhoto) sessionStorage.setItem('userPhoto', this.userPhoto)
                    return data
                }
            } catch (error) {
                console.error('Failed to fetch my info:', error)
                throw error
            }
        },

        async updateMyInfo(info, profileImage) {
            try {
                const formData = new FormData()
                formData.append('request', new Blob([JSON.stringify(info)], { type: 'application/json' }))
                if (profileImage) {
                    formData.append('profileImage', profileImage)
                }

                const response = await api.patch('/users/me', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                if (response.data.success) {
                    this.userName = response.data.data.username
                    this.userPhoto = response.data.data.profileImageUrl
                    sessionStorage.setItem('userName', this.userName)
                    if (this.userPhoto) sessionStorage.setItem('userPhoto', this.userPhoto)
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to update my info:', error)
                throw error
            }
        },

        async changePassword(currentPassword, newPassword) {
            try {
                const response = await api.patch('/users/me/password', {
                    currentPassword,
                    newPassword
                })
                return response.data.success
            } catch (error) {
                console.error('Failed to change password:', error)
                throw error
            }
        },

        async getMyWorkplaceInfo() {
            try {
                const response = await api.get('/users/me/workplace')
                if (response.data.success) {
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to fetch workplace info:', error)
                throw error
            }
        },

        async updateMyWorkplaceInfo(info) {
            try {
                const response = await api.patch('/users/me/workplace', info)
                if (response.data.success) {
                    return response.data.data
                }
            } catch (error) {
                console.error('Failed to update workplace info:', error)
                throw error
            }
        }
    }
})
