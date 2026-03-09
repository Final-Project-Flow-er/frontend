import { defineStore } from 'pinia'
import api from '../api'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
        eventSource: null,
        loading: false,
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        activeTab: 'all', // 현재 활성화된 탭 추적
        unreadCounts: {}, // 타입별 미읽음/전체 개수 맵
        // 토스트 알림 상태 추가
        toast: {
            show: false,
            message: ''
        }
    }),

    actions: {
        // 알림 목록 조회
        async fetchNotifications(page = 0, size = 10, type = 'all') {
            this.loading = true
            this.activeTab = type
            try {
                const params = { page, size, sort: 'createdAt,desc' }
                if (type && type !== 'all') {
                    params.type = type
                }
                const response = await api.get('/notifications', { params })
                if (response.data.success) {
                    const data = response.data.data
                    this.notifications = data.content.map(n => ({
                        ...n,
                        read: n.isRead // DTO의 isRead를 read로 통일
                    }))
                    this.totalPages = data.totalPages
                    this.totalElements = data.totalElements
                    this.currentPage = data.number
                    await this.fetchUnreadCount()
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error)
            } finally {
                this.loading = false
            }
        },

        // 미읽음 알림 수 조회
        async fetchUnreadCount() {
            try {
                const response = await api.get('/notifications/unread-count')
                if (response.data.success) {
                    this.unreadCounts = response.data.data
                    this.unreadCount = response.data.data.all?.unread || 0
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error)
            }
        },

        // SSE 연결 시작
        connectSSE() {
            if (this.eventSource) return

            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) return

            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

            // EventSource는 헤더를 직접 넣을 수 없으므로, 필요시 쿼리스트링 등으로 토큰 전달 로직이 필요할 수 있음
            // 하지만 현재 백엔드 subscribe에서 @AuthenticationPrincipal을 사용하므로, 
            // 프로젝트 설정에 따라 쿠키나 URL 파라미터가 필요할 수 있습니다.
            // 여기서는 표준적인 처리를 위해 URL에 토큰을 포함하거나, 별도 라이브러리(event-source-polyfill) 사용을 고려할 수 있습니다.
            // 일단은 URL 파라미터 방식을 가정하거나 기본 설정을 따릅니다.
            const url = `${API_BASE_URL}/notifications/stream?token=${accessToken}`

            this.eventSource = new EventSource(url)

            this.eventSource.addEventListener('notification', (event) => {
                // 백엔드에서 data(event.message())로 문자열만 보내고 있음
                const message = event.data

                // 새로운 메시지가 오면 목록 새로고침 (전체 공지사항 등 복잡한 상태 대응)
                this.fetchNotifications()

                // 인앱 토스트 알림 표시
                this.showToastNotification(message)

                // 브라우저 알림 (권한 있을 때)
                if (Notification.permission === 'granted') {
                    new Notification('새로운 알림', {
                        body: message,
                        icon: '/favicon.ico'
                    })
                }
            })

            this.eventSource.onerror = (error) => {
                console.error('SSE Error:', error)
                this.disconnectSSE()
                // 5초 후 재연결 시도
                setTimeout(() => this.connectSSE(), 5000)
            }
        },

        // SSE 연결 종료
        disconnectSSE() {
            if (this.eventSource) {
                this.eventSource.close()
                this.eventSource = null
            }
        },

        // 알림 읽음 처리
        async readNotification(id) {
            try {
                const response = await api.patch(`/notifications/${id}`)
                if (response.data.success) {
                    const index = this.notifications.findIndex(n => n.notificationId === id)
                    if (index !== -1) {
                        this.notifications[index].read = true
                        this.updateUnreadCount()
                    }
                }
            } catch (error) {
                console.error('Failed to read notification:', error)
            }
        },

        // 전체 읽음 처리
        async markAllAsRead() {
            try {
                const response = await api.patch('/notifications/read-all')
                if (response.data.success) {
                    this.notifications.forEach(n => n.read = true)
                    await this.fetchUnreadCount()
                }
            } catch (error) {
                console.error('Failed to mark all as read:', error)
            }
        },

        // 알림 삭제
        async deleteNotification(id) {
            try {
                const response = await api.delete(`/notifications/${id}`)
                if (response.data.success) {
                    // 삭제 후 현재 페이지 데이터 다시 불러오기 (데이터 일치 유도 및 리필링)
                    await this.fetchNotifications(this.currentPage, 10, this.activeTab)
                }
            } catch (error) {
                console.error('Failed to delete notification:', error)
            }
        },

        updateUnreadCount() {
            this.fetchUnreadCount()
        },

        // 토스트 알림 표시 로직
        showToastNotification(message) {
            this.toast.message = message
            this.toast.show = true

            // 5초 후 자동으로 닫기
            setTimeout(() => {
                this.toast.show = false
            }, 5000)
        }
    }
})
