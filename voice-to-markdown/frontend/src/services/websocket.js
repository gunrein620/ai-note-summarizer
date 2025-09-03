class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = []
  }

  connect(taskId, onMessage, onError = null, onClose = null) {
    const wsUrl = `ws://localhost:8000/ws/${taskId}`
    
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