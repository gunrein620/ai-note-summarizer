import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
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