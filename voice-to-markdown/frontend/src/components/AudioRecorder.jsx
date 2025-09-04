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
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-500 ${
            isRecording 
              ? 'bg-gradient-to-r from-red-400 to-pink-500 animate-pulse scale-110 shadow-red-500/30' 
              : audioBlob 
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-green-500/30' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-blue-500 hover:to-purple-600 hover:scale-105 shadow-gray-500/20'
          } border-4 border-gray-700`}>
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded-full animate-pulse shadow-lg"></div>
            ) : audioBlob ? (
              <div className="text-white text-4xl drop-shadow-lg">✓</div>
            ) : (
              <div className="text-gray-300 text-4xl">🎤</div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className={`text-4xl font-mono font-bold tracking-wider transition-colors duration-300 ${
            isRecording ? 'text-red-400' : audioBlob ? 'text-green-400' : 'text-gray-300'
          }`}>
            {formatTime(recordingTime)}
          </div>
          {isRecording && (
            <div className="text-sm text-red-400 mt-2 animate-pulse">🔴 녹음 중...</div>
          )}
          {audioBlob && !isRecording && (
            <div className="text-sm text-green-400 mt-2">✅ 녹음 완료</div>
          )}
        </div>

        <div className="space-y-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              disabled={disabled}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                disabled 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              🎤 녹음 시작
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
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
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={disabled}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                    disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  }`}
                >
                  📤 처리 시작
                </button>
                
                <button
                  onClick={clearRecording}
                  disabled={disabled}
                  className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  🗑️ 다시 녹음
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!navigator.mediaDevices && (
        <div className="text-center text-red-400 text-sm">
          이 브라우저는 음성 녹음을 지원하지 않습니다. Chrome, Firefox, Safari 등 최신 브라우저를 사용해주세요.
        </div>
      )}
    </div>
  )
}

export default AudioRecorder