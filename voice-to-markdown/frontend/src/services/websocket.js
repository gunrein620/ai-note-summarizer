class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = []
  }

  connect(taskId, onMessage, onError = null, onClose = null) {
    // 현재 호스트에 맞춰 WebSocket URL 동적 설정
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    
    let wsUrl
    // ngrok이나 다른 프록시 환경에서는 같은 도메인 사용
    if (window.location.hostname.includes('ngrok') || 
        window.location.hostname.includes('app') ||
        window.location.port === '') {
      // ngrok이나 배포 환경에서는 /api/ws 경로 사용
      wsUrl = `${protocol}//${window.location.host}/api/ws/${taskId}`
    } else {
      // 로컬 개발 환경에서는 백엔드 포트 직접 사용
      const hostname = window.location.hostname
      wsUrl = `${protocol}//${hostname}:8000/ws/${taskId}`
    }
    
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (onError) onError(error)
    }
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected')
      if (onClose) onClose()
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
  
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }
}

export default WebSocketService