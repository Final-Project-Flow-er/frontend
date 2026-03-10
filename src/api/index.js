import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor: add tokens
instance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor: handle token expiration
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 error and not trying to reissue
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/reissue') {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try {
                    // Reissue token
                    const currentAccessToken = localStorage.getItem('accessToken')
                    const response = await axios.post(`${API_BASE_URL}/auth/reissue`, {}, {
                        headers: {
                            'Authorization-Refresh': refreshToken,
                            'Authorization': `Bearer ${currentAccessToken}`
                        }
                    })

                    if (response.data.success) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data
                        localStorage.setItem('accessToken', accessToken)
                        localStorage.setItem('refreshToken', newRefreshToken)

                        // Re-run original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`
                        return instance(originalRequest)
                    }
                } catch (reissueError) {
                    // Reissue failed: logout user
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('userRole')
                    sessionStorage.removeItem('isLoggedIn')
                    window.location.href = '/login'
                    return Promise.reject(reissueError)
                }
            } else {
                // No refresh token: logout user
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default instance
