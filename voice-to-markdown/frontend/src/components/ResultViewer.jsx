import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { getResultContent, downloadResult } from '../services/api'

const ResultViewer = ({ taskId, onStartNew }) => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('preview') // 'preview' or 'raw'

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true)
        const resultContent = await getResultContent(taskId)
        setContent(resultContent)
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
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
          onClick={copyToClipboard}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          📋 복사
        </button>
        
        <button
          onClick={onStartNew}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          🆕 새로 시작
        </button>
      </div>

      {/* 내용 표시 */}
      <div className="border rounded-lg overflow-hidden">
        {viewMode === 'preview' ? (
          <div className="prose prose-lg max-w-none p-6 bg-white">
            <ReactMarkdown 
              components={{
                // 커스텀 스타일링
                h1: ({children}) => <h1 className="text-3xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
                li: ({children}) => <li className="text-gray-700">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                pre: ({children}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
                hr: () => <hr className="my-8 border-gray-300" />,
                table: ({children}) => <table className="w-full border-collapse border border-gray-300 mb-4">{children}</table>,
                th: ({children}) => <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium">{children}</th>,
                td: ({children}) => <td className="border border-gray-300 px-4 py-2">{children}</td>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="bg-gray-50 p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
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