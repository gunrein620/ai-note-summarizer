import React from 'react'

const ProcessingStatus = ({ status, progress, message, taskId, transcript }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'uploading':
        return 'text-blue-600 bg-blue-100'
      case 'transcribing':
        return 'text-purple-600 bg-purple-100'
      case 'summarizing':
        return 'text-indigo-600 bg-indigo-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'uploading':
        return '업로드 중'
      case 'transcribing':
        return '음성 인식 중'
      case 'summarizing':
        return 'AI 요약 중'
      case 'completed':
        return '완료'
      case 'failed':
        return '실패'
      default:
        return '알 수 없음'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'uploading':
        return '📤'
      case 'transcribing':
        return '🎤'
      case 'summarizing':
        return '🤖'
      case 'completed':
        return '✅'
      case 'failed':
        return '❌'
      default:
        return '⚪'
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
          <span className="mr-2">{getStatusIcon(status)}</span>
          {getStatusText(status)}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>진행률</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              status === 'failed' ? 'bg-red-500' : status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.max(progress, 0)}%` }}
          />
        </div>
      </div>

      {/* 상태 메시지 */}
      <div className="text-center">
        <p className="text-gray-600">{message}</p>
        {taskId && (
          <p className="text-xs text-gray-400 mt-2">작업 ID: {taskId}</p>
        )}
      </div>

      {/* 처리 단계 표시 */}
      <div className="grid grid-cols-4 gap-2 mt-6">
        <div className={`text-center p-2 rounded ${
          ['uploading', 'transcribing', 'summarizing', 'completed'].includes(status) 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <div className="text-sm">📤</div>
          <div className="text-xs mt-1">업로드</div>
        </div>
        
        <div className={`text-center p-2 rounded ${
          ['transcribing', 'summarizing', 'completed'].includes(status) 
            ? 'bg-purple-100 text-purple-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <div className="text-sm">🎤</div>
          <div className="text-xs mt-1">음성인식</div>
        </div>
        
        <div className={`text-center p-2 rounded ${
          ['summarizing', 'completed'].includes(status) 
            ? 'bg-indigo-100 text-indigo-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <div className="text-sm">🤖</div>
          <div className="text-xs mt-1">AI 요약</div>
        </div>
        
        <div className={`text-center p-2 rounded ${
          status === 'completed' 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-100 text-gray-400'
        }`}>
          <div className="text-sm">✅</div>
          <div className="text-xs mt-1">완료</div>
        </div>
      </div>

      {/* STT 결과 표시 */}
      {transcript && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-700 font-medium mb-2">📝 음성 인식 결과</div>
          <div className="text-sm text-gray-700 bg-white p-3 rounded border max-h-40 overflow-y-auto">
            {transcript}
          </div>
          <div className="text-xs text-blue-600 mt-2">
            위 텍스트를 바탕으로 AI 요약을 생성합니다.
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700 font-medium">처리 실패</div>
          <div className="text-red-600 text-sm mt-1">
            다시 시도하거나 다른 오디오 파일을 사용해보세요.
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessingStatus