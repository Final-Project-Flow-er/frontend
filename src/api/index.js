import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
        }

        const accessToken = localStorage.getItem('accessToken')
        // reissue 요청일 때는 기존 AccessToken을 보내지 않도록 처리 (서버 설정에 따라 필요할 수 있음)
        if (accessToken && !config.url.includes('/auth/reissue')) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 1. 401 에러이고, 이미 재시도한 요청이 아닐 때만 실행
        if (error.response?.status === 401 && !originalRequest._retry) {

            // 2. 만약 재발급(reissue) 요청 자체가 401이 나면 즉시 로그아웃 (무한 루프 방지)
            if (originalRequest.url.includes('/auth/reissue')) {
                console.error('Refresh token expired. Logging out.')
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            originalRequest._retry = true
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                try {
                    console.log('Access token expired. Attempting reissue...')

                    // 3. 재발급 요청 (인터셉터가 없는 순수 axios 사용 권장)
                    const response = await axios.post(`${API_BASE_URL}/auth/reissue`, {}, {
                        headers: {
                            // 서버 규격에 따라 'Bearer ' 접두사 유무 확인 필요!
                            'Authorization-Refresh': `Bearer ${refreshToken}`
                        }
                    })

                    // 4. 재발급 성공 시 (서버 응답 규격에 맞춰 수정 필요)
                    if (response.data.success || response.status === 200) {
                        const { accessToken, refreshToken: newRefreshToken } = response.data.data

                        localStorage.setItem('accessToken', accessToken)
                        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

                        console.log('Reissue successful. Retrying original request.')

                        // 5. 원래 요청의 헤더를 새 토큰으로 교체
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`

                        // 6. 업데이트된 설정으로 다시 요청
                        return instance(originalRequest)
                    }
                } catch (reissueError) {
                    console.error('Reissue failed. Redirecting to login.')
                    localStorage.clear()
                    window.location.href = '/login'
                    return Promise.reject(reissueError)
                }
            } else {
                localStorage.clear()
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default instance