import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { getResultContent, downloadResult, getProcessingStatus } from '../services/api'

const ResultViewer = ({ taskId, onStartNew }) => {
  const [content, setContent] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('preview') // 'preview', 'raw', 'transcript'
  const [showTranscript, setShowTranscript] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true)
        
        // 결과 내용과 transcript 동시에 가져오기
        const [resultContent, statusData] = await Promise.all([
          getResultContent(taskId),
          getProcessingStatus(taskId)
        ])
        
        setContent(resultContent)
        setTranscript(statusData.transcript || '음성 전사 결과를 찾을 수 없습니다.')
      } catch (err) {
        console.error('Failed to fetch result:', err)
        setError('결과를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (taskId) {
      fetchResult()
    }
  }, [taskId])

  const handleDownload = async () => {
    try {
      await downloadResult(taskId)
    } catch (err) {
      console.error('Download failed:', err)
      alert('다운로드에 실패했습니다.')
    }
  }

  const copyToClipboard = (text = content) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('클립보드에 복사되었습니다!'))
      .catch(() => alert('복사에 실패했습니다.'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">결과를 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시작
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">처리 결과</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'preview' ? 'raw' : 'preview')}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            {viewMode === 'preview' ? '🔍 원본 보기' : '📄 미리보기'}
          </button>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          📥 다운로드
        </button>
        
        <button
          onClick={() => copyToClipboard()}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          📋 복사
        </button>
        
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          🎤 {showTranscript ? 'STT 숨기기' : 'STT 보기'}
        </button>
        
        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          🆕 새로 시작
        </button>
      </div>

      {/* STT 결과 표시 */}
      {showTranscript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-blue-700 font-medium text-lg">🎤 음성 전사 결과</span>
              <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {transcript.length.toLocaleString()} 글자
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(transcript)}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              📋 STT 복사
            </button>
          </div>
          
          <div className="bg-white border border-blue-200 rounded p-4 max-h-60 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-normal">
              {transcript}
            </pre>
          </div>
          
          <div className="text-xs text-blue-600 mt-3">
            💡 이 텍스트를 바탕으로 위의 AI 요약이 생성되었습니다.
          </div>
        </div>
      )}

      {/* 내용 표시 */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
        {viewMode === 'preview' ? (
          <div className="prose prose-lg max-w-none p-6 bg-gray-800/90">
            <ReactMarkdown 
              components={{
                // 커스텀 스타일링
                h1: ({children}) => <h1 className="text-3xl font-bold text-white mb-4 border-b-2 border-gray-600 pb-2">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-200 mb-3 mt-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-medium text-gray-300 mb-2 mt-4">{children}</h3>,
                p: ({children}) => <p className="mb-4 text-gray-300 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                li: ({children}) => <li className="text-gray-300">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                code: ({children}) => <code className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-blue-300">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-900/80 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-700">{children}</pre>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-300 mb-4 bg-blue-900/20 py-2 rounded-r">{children}</blockquote>,
                hr: () => <hr className="my-8 border-gray-600" />,
                table: ({children}) => <table className="w-full border-collapse border border-gray-600 mb-4">{children}</table>,
                th: ({children}) => <th className="border border-gray-600 bg-gray-700 px-4 py-2 text-left font-medium text-gray-200">{children}</th>,
                td: ({children}) => <td className="border border-gray-600 px-4 py-2 text-gray-300">{children}</td>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="bg-gray-800/90 p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
              {content}
            </pre>
          </div>
        )}
      </div>

      {/* 푸터 정보 */}
      <div className="text-center text-sm text-gray-500 py-4">
        작업 ID: {taskId}
      </div>
    </div>
  )
}

export default ResultViewer