import React, { useState, useEffect } from 'react'
import TypeSelector from './components/TypeSelector'
import AudioRecorder from './components/AudioRecorder'
import FileUploader from './components/FileUploader'
import ProcessingStatus from './components/ProcessingStatus'
import ResultViewer from './components/ResultViewer'
import WebSocketService from './services/websocket'
import { uploadAudio, getProcessingStatus } from './services/api'

function App() {
  const [currentStep, setCurrentStep] = useState('ready') // ready, recording, processing, completed
  const [processingType, setProcessingType] = useState('lecture')
  const [inputMode, setInputMode] = useState('record') // record, upload
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

  // 파일 업로드 핸들러 (녹음과 동일한 로직 사용)
  const handleFileUpload = (audioFile) => {
    handleRecordingComplete(audioFile)
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
            
            {/* 입력 방식 선택 탭 - 다크 테마 */}
            <div className="flex justify-center">
              <div className="inline-flex bg-gray-700/50 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-gray-600/30">
                <button
                  onClick={() => setInputMode('record')}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                    inputMode === 'record'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 hover:shadow-xl'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50 hover:scale-105'
                  }`}
                >
                  🎤 음성 녹음
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                    inputMode === 'upload'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105 hover:shadow-xl'
                      : 'text-gray-300 hover:text-white hover:bg-gray-600/50 hover:scale-105'
                  }`}
                >
                  📁 파일 업로드
                </button>
              </div>
            </div>

            {/* 선택된 입력 방식에 따른 컴포넌트 렌더링 */}
            {inputMode === 'record' ? (
              <AudioRecorder 
                onRecordingComplete={handleRecordingComplete}
              />
            ) : (
              <FileUploader 
                onFileUpload={handleFileUpload}
              />
            )}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-block p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-4">
              <span className="text-2xl">🤖</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AI 필기노트
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            음성을 녹음하거나 오디오 파일을 업로드하여 AI로 구조화된 Markdown 요약을 생성하세요
          </p>
          
          {/* 현재 단계 표시 - 개선된 프로그레스 바 스타일 */}
          <div className="mt-8">
            <div className="flex justify-center items-center space-x-8">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep === 'ready' 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg' 
                    : currentStep !== 'ready' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep !== 'ready' ? '✓' : '1'}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep === 'ready' ? 'text-blue-400' : currentStep !== 'ready' ? 'text-green-400' : 'text-gray-500'
                }`}>준비</span>
              </div>
              
              <div className={`w-12 h-0.5 ${
                currentStep === 'processing' || currentStep === 'completed' ? 'bg-blue-500' : 'bg-gray-600'
              }`} />
              
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep === 'processing' 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg animate-pulse' 
                    : currentStep === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep === 'completed' ? '✓' : currentStep === 'processing' ? '⟳' : '2'}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep === 'processing' ? 'text-blue-400' : currentStep === 'completed' ? 'text-green-400' : 'text-gray-500'
                }`}>처리</span>
              </div>
              
              <div className={`w-12 h-0.5 ${
                currentStep === 'completed' ? 'bg-green-500' : 'bg-gray-600'
              }`} />
              
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  currentStep === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep === 'completed' ? '✓' : '3'}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep === 'completed' ? 'text-green-400' : 'text-gray-500'
                }`}>완료</span>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-8 hover:shadow-2xl transition-all duration-300">
          {renderContent()}
        </div>
        
        {/* 푸터 */}
        <footer className="text-center mt-8 text-sm text-gray-400">
          <p>Powered by Whisper + Llama 3.1 8B</p>
          <p className="mt-1">🎤 음성/📁 파일 → 📝 텍스트 → 🤖 AI 요약 → 📋 Markdown</p>
        </footer>
      </div>
    </div>
  )
}

export default App