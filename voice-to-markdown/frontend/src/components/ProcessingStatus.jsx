import React from 'react'

const ProcessingStatus = ({ status, progress, message, taskId, transcript }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-300 bg-yellow-900/50 border border-yellow-600/50'
      case 'uploading':
        return 'text-blue-300 bg-blue-900/50 border border-blue-600/50'
      case 'transcribing':
        return 'text-purple-300 bg-purple-900/50 border border-purple-600/50'
      case 'summarizing':
        return 'text-indigo-300 bg-indigo-900/50 border border-indigo-600/50'
      case 'completed':
        return 'text-green-300 bg-green-900/50 border border-green-600/50'
      case 'failed':
        return 'text-red-300 bg-red-900/50 border border-red-600/50'
      default:
        return 'text-gray-300 bg-gray-900/50 border border-gray-600/50'
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
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>진행률</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
          <div
            className={`h-3 rounded-full transition-all duration-300 shadow-sm ${
              status === 'failed' ? 'bg-gradient-to-r from-red-500 to-red-400' : status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${Math.max(progress, 0)}%` }}
          />
        </div>
      </div>

      {/* 상태 메시지 */}
      <div className="text-center">
        <p className="text-gray-300 text-lg">{message}</p>
        {taskId && (
          <p className="text-xs text-gray-500 mt-2">작업 ID: {taskId}</p>
        )}
      </div>

      {/* 처리 단계 표시 */}
      <div className="grid grid-cols-4 gap-3 mt-6">
        <div className={`text-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
          ['uploading', 'transcribing', 'summarizing', 'completed'].includes(status) 
            ? 'bg-blue-900/50 text-blue-300 border border-blue-600/50 shadow-lg' 
            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
        }`}>
          <div className="text-lg mb-1">📤</div>
          <div className="text-xs font-medium">업로드</div>
        </div>
        
        <div className={`text-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
          ['transcribing', 'summarizing', 'completed'].includes(status) 
            ? 'bg-purple-900/50 text-purple-300 border border-purple-600/50 shadow-lg' 
            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
        }`}>
          <div className="text-lg mb-1">🎤</div>
          <div className="text-xs font-medium">음성인식</div>
        </div>
        
        <div className={`text-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
          ['summarizing', 'completed'].includes(status) 
            ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-600/50 shadow-lg' 
            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
        }`}>
          <div className="text-lg mb-1">🤖</div>
          <div className="text-xs font-medium">AI 요약</div>
        </div>
        
        <div className={`text-center p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
          status === 'completed' 
            ? 'bg-green-900/50 text-green-300 border border-green-600/50 shadow-lg' 
            : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
        }`}>
          <div className="text-lg mb-1">✅</div>
          <div className="text-xs font-medium">완료</div>
        </div>
      </div>

      {/* STT 결과 표시 */}
      {transcript && (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-xl backdrop-blur-sm">
          <div className="text-blue-300 font-medium mb-3 text-lg">📝 음성 인식 결과</div>
          <div className="text-sm text-gray-200 bg-gray-800/80 p-4 rounded-lg border border-gray-700/50 max-h-40 overflow-y-auto">
            {transcript}
          </div>
          <div className="text-xs text-blue-400 mt-3">
            위 텍스트를 바탕으로 AI 요약을 생성합니다.
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="mt-4 p-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-600/30 rounded-xl backdrop-blur-sm">
          <div className="text-red-300 font-medium text-lg">처리 실패</div>
          <div className="text-red-400 text-sm mt-2">
            다시 시도하거나 다른 오디오 파일을 사용해보세요.
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessingStatus