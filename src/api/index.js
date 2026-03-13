import axios from 'axios'

const API_BASE_URL = '/api/v1'

const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor: add tokens
instance.interceptors.request.use(
    (config) => {
        // Let the browser set multipart boundary automatically for FormData.
        if (config.data instanceof FormData) {
            if (config.headers) {
                if (typeof config.headers.set === 'function') {
                    config.headers.set('Content-Type', undefined)
                }
                delete config.headers['Content-Type']
                delete config.headers['content-type']
            }
        }

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

        // If 401 error and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If already at /login or /reissue, stop and redirect to login
            if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/reissue')) {
                return Promise.reject(error)
            }

            originalRequest._retry = true
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                console.log('Access token expired. Attempting reissue with refresh token...')
                try {
                    // Send reissue request with refresh token (no Authorization header needed for reissue)
                    const response = await axios.post(`${API_BASE_URL}/auth/reissue`, {}, {
                        headers: {
                            'Authorization-Refresh': refreshToken
                        }
                    })

                    if (response.data.success) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data
                        localStorage.setItem('accessToken', accessToken)
                        localStorage.setItem('refreshToken', newRefreshToken)

                        console.log('Reissue successful. Retrying original request.')
                        // Retry the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`
                        return instance(originalRequest)
                    }
                } catch (reissueError) {
                    console.error('Reissue failed. Logging out user.', reissueError)
                    localStorage.clear()
                    sessionStorage.clear()
                    window.location.href = '/login'
                    return Promise.reject(reissueError)
                }
            } else {
                console.warn('No refresh token available. Redirecting to login.')
                localStorage.clear()
                sessionStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default instance
