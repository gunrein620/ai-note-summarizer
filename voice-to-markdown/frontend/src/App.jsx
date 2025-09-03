import React, { useState, useEffect } from 'react'
import TypeSelector from './components/TypeSelector'
import AudioRecorder from './components/AudioRecorder'
import ProcessingStatus from './components/ProcessingStatus'
import ResultViewer from './components/ResultViewer'
import WebSocketService from './services/websocket'
import { uploadAudio, getProcessingStatus } from './services/api'

function App() {
  const [currentStep, setCurrentStep] = useState('ready') // ready, recording, processing, completed
  const [processingType, setProcessingType] = useState('lecture')
  const [taskId, setTaskId] = useState(null)
  const [processingStatus, setProcessingStatus] = useState({
    status: 'pending',
    progress: 0,
    message: '준비 중...',
    transcript: null
  })

  const wsService = new WebSocketService()

  useEffect(() => {
    return () => {
      // Cleanup WebSocket on unmount
      wsService.disconnect()
    }
  }, [])

  const handleRecordingComplete = async (audioFile) => {
    try {
      setCurrentStep('processing')
      
      // 파일 업로드
      const response = await uploadAudio(audioFile, processingType)
      setTaskId(response.task_id)
      
      // WebSocket 연결하여 실시간 상태 업데이트
      wsService.connect(
        response.task_id,
        (data) => {
          setProcessingStatus({
            status: data.status,
            progress: data.progress || 0,
            message: data.message || '',
            transcript: data.transcript
          })
          
          if (data.status === 'completed') {
            setCurrentStep('completed')
            wsService.disconnect()
          } else if (data.status === 'failed') {
            wsService.disconnect()
          }
        },
        (error) => {
          console.error('WebSocket error:', error)
          // Fallback to polling
          startPolling(response.task_id)
        }
      )
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('업로드에 실패했습니다: ' + error.message)
      setCurrentStep('ready')
    }
  }

  const startPolling = (taskId) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await getProcessingStatus(taskId)
        setProcessingStatus({
          status: status.status,
          progress: status.progress,
          message: status.message,
          transcript: status.transcript
        })
        
        if (status.status === 'completed' || status.status === 'failed') {
          if (status.status === 'completed') {
            setCurrentStep('completed')
          }
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Polling error:', error)
        clearInterval(pollInterval)
      }
    }, 2000) // 2초마다 폴링
  }

  const handleStartNew = () => {
    setCurrentStep('ready')
    setTaskId(null)
    setProcessingStatus({
      status: 'pending',
      progress: 0,
      message: '준비 중...',
      transcript: null
    })
    wsService.disconnect()
  }

  const renderContent = () => {
    switch (currentStep) {
      case 'ready':
        return (
          <div className="space-y-8">
            <TypeSelector 
              selectedType={processingType}
              onTypeChange={setProcessingType}
            />
            <AudioRecorder 
              onRecordingComplete={handleRecordingComplete}
            />
          </div>
        )
      
      case 'processing':
        return (
          <ProcessingStatus
            status={processingStatus.status}
            progress={processingStatus.progress}
            message={processingStatus.message}
            taskId={taskId}
            transcript={processingStatus.transcript}
          />
        )
      
      case 'completed':
        return (
          <ResultViewer
            taskId={taskId}
            onStartNew={handleStartNew}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Voice to Markdown
          </h1>
          <p className="text-gray-600">
            음성을 녹음하고 AI로 구조화된 Markdown 요약을 생성하세요
          </p>
          
          {/* 현재 단계 표시 */}
          <div className="mt-4">
            <div className="inline-flex items-center space-x-4 text-sm">
              <div className={`flex items-center ${currentStep === 'ready' ? 'text-blue-600' : currentStep !== 'ready' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${currentStep === 'ready' ? 'bg-blue-600' : currentStep !== 'ready' ? 'bg-green-600' : 'bg-gray-400'}`} />
                준비
              </div>
              <div className={`flex items-center ${currentStep === 'processing' ? 'text-blue-600' : currentStep === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${currentStep === 'processing' ? 'bg-blue-600' : currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-400'}`} />
                처리
              </div>
              <div className={`flex items-center ${currentStep === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-3 h-3 rounded-full mr-2 ${currentStep === 'completed' ? 'bg-green-600' : 'bg-gray-400'}`} />
                완료
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md p-8">
          {renderContent()}
        </div>
        
        {/* 푸터 */}
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Whisper + Llama 3.1 8B</p>
          <p className="mt-1">🎤 음성 → 📝 텍스트 → 🤖 AI 요약 → 📋 Markdown</p>
        </footer>
      </div>
    </div>
  )
}

export default App