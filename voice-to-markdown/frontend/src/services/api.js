import axios from 'axios'

// 현재 호스트에 맞춰 API URL 동적 설정
const getAPIBaseURL = () => {
  // ngrok이나 다른 프록시 환경에서는 같은 도메인 사용
  if (window.location.hostname.includes('ngrok') || 
      window.location.hostname.includes('app') ||
      window.location.port === '') {
    // ngrok이나 배포 환경에서는 /api 경로 사용
    return `${window.location.protocol}//${window.location.host}/api`
  }
  
  // 로컬 개발 환경에서는 백엔드 포트 직접 사용
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `${protocol}//${hostname}:8000`
}

const api = axios.create({
  baseURL: getAPIBaseURL(),
  timeout: 300000, // 5분 타임아웃
})

export const uploadAudio = async (audioFile, processingType = 'lecture') => {
  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('processing_type', processingType)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

export const getProcessingStatus = async (taskId) => {
  const response = await api.get(`/status/${taskId}`)
  return response.data
}

export const downloadResult = async (taskId) => {
  const response = await api.get(`/download/${taskId}`, {
    responseType: 'blob',
  })
  
  // Blob을 파일로 다운로드
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `voice-summary-${taskId}.md`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
  
  return response.data
}

export const getResultContent = async (taskId) => {
  const response = await api.get(`/download/${taskId}`, {
    responseType: 'text',
  })
  return response.data
}