import { defineStore } from 'pinia'
import api from '../api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        userRole: localStorage.getItem('userRole') || null,
        isLoggedIn: !!localStorage.getItem('accessToken'),
        userName: sessionStorage.getItem('userName') || '사용자'
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
        }
    }
})
