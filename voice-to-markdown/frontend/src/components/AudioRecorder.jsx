import React, { useState, useRef, useEffect } from 'react'

const AudioRecorder = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      // 기존 녹음 정리
      if (audioBlob) {
        setAudioBlob(null)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
        setAudioUrl(null)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      streamRef.current = stream
      chunksRef.current = []

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        
        // 미리보기용 URL 생성
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // 스트림 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start(100) // 100ms마다 데이터 수집
      setIsRecording(true)
      setRecordingTime(0)

      // 녹음 시간 카운터
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const handleUpload = () => {
    if (audioBlob && onRecordingComplete) {
      // Blob을 File 객체로 변환
      const fileName = `recording-${Date.now()}.webm`
      const file = new File([audioBlob], fileName, { type: 'audio/webm' })
      onRecordingComplete(file)
    }
  }

  const clearRecording = () => {
    setAudioBlob(null)
    setRecordingTime(0)
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            isRecording ? 'bg-red-100' : audioBlob ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isRecording ? (
              <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
            ) : audioBlob ? (
              <div className="text-green-500 text-2xl">✓</div>
            ) : (
              <div className="text-gray-400 text-2xl">🎤</div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-mono text-gray-700">
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="text-sm text-red-500 mt-1">녹음 중...</div>
          )}
          {audioBlob && !isRecording && (
            <div className="text-sm text-green-500 mt-1">녹음 완료</div>
          )}
        </div>

        <div className="space-y-3">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              disabled={disabled}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              🎤 녹음 시작
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              ⏹️ 녹음 중지
            </button>
          )}

          {audioBlob && !isRecording && (
            <div className="space-y-3">
              {audioUrl && (
                <div>
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={disabled}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  📤 처리 시작
                </button>
                
                <button
                  onClick={clearRecording}
                  disabled={disabled}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  🗑️ 다시 녹음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!navigator.mediaDevices && (
        <div className="text-center text-red-500 text-sm">
          이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Firefox, Safari 등 최신 브라우저를 사용해주세요.
        </div>
      )}
    </div>
  )
}

export default AudioRecorder