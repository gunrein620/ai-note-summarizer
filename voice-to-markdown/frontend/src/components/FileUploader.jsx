import React, { useState, useRef } from 'react'

const FileUploader = ({ onFileUpload, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef(null)

  // 지원하는 오디오 파일 형식
  const supportedFormats = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/wave', 
    'audio/webm', 'audio/m4a', 'audio/mp4', 'audio/aac',
    'audio/ogg', 'audio/flac'
  ]
  
  const maxFileSize = 100 * 1024 * 1024 // 100MB

  const validateFile = (file) => {
    // 파일 타입 검증
    if (!supportedFormats.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|m4a|mp4|aac|ogg|flac)$/i)) {
      return '지원하지 않는 파일 형식입니다. MP3, WAV, WEBM, M4A, AAC, OGG, FLAC 파일을 업로드해주세요.'
    }
    
    // 파일 크기 검증
    if (file.size > maxFileSize) {
      return '파일 크기가 너무 큽니다. 100MB 이하의 파일을 업로드해주세요.'
    }
    
    return null
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e) => {
    if (disabled) return
    
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    const error = validateFile(file)
    if (error) {
      setFileError(error)
      setSelectedFile(null)
      return
    }

    setFileError('')
    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-8">
      {/* 드래그앤 드롭 영역 - 개선된 디자인 */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 transform ${
          dragActive
            ? 'border-blue-400 bg-gradient-to-br from-blue-900/30 to-purple-900/30 scale-105 shadow-lg shadow-blue-500/20'
            : selectedFile
            ? 'border-green-400 bg-gradient-to-br from-green-900/30 to-emerald-900/30 shadow-lg shadow-green-500/20'
            : fileError
            ? 'border-red-400 bg-gradient-to-br from-red-900/30 to-pink-900/30 shadow-lg shadow-red-500/20'
            : 'border-gray-600 bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:border-purple-400 hover:bg-gradient-to-br hover:from-blue-900/30 hover:to-purple-900/30 hover:scale-102 hover:shadow-xl hover:shadow-purple-500/20'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} shadow-md`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={supportedFormats.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
        />

        <div className="space-y-6">
          {/* 아이콘 - 개선된 크기와 스타일 */}
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            {selectedFile ? (
              <div className="text-6xl animate-bounce">📎</div>
            ) : fileError ? (
              <div className="text-6xl animate-pulse">❌</div>
            ) : dragActive ? (
              <div className="text-6xl animate-bounce text-blue-500">📁</div>
            ) : (
              <div className="text-6xl text-gray-500 group-hover:scale-110 transition-transform duration-300">🎵</div>
            )}
          </div>

          {/* 메시지 */}
          <div>
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-xl font-bold text-green-400">
                  ✅ 파일 선택됨
                </div>
                <div className="text-lg text-green-300 font-medium truncate max-w-md mx-auto">
                  {selectedFile.name}
                </div>
                <div className="text-sm text-gray-200 bg-green-900/50 px-3 py-1 rounded-full inline-block border border-green-600/30">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            ) : fileError ? (
              <div className="space-y-2">
                <div className="text-xl font-bold text-red-400">
                  ❌ 파일 업로드 오류
                </div>
                <div className="text-sm text-red-300 bg-red-900/50 px-4 py-2 rounded-lg max-w-md mx-auto border border-red-600/30">
                  {fileError}
                </div>
              </div>
            ) : dragActive ? (
              <div className="text-xl font-bold text-blue-400 animate-pulse">
                📁 파일을 여기에 놓으세요
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xl font-bold text-gray-300">
                  🎵 오디오 파일을 드래그하거나 클릭하여 선택
                </div>
                <div className="text-sm text-gray-300 bg-gray-700/50 px-4 py-2 rounded-lg inline-block border border-gray-600/30">
                  지원 형식: MP3, WAV, WEBM, M4A, AAC, OGG, FLAC
                </div>
                <div className="text-xs text-gray-400">
                  최대 파일 크기: 100MB
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 - 개선된 디자인 */}
      {selectedFile && (
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
            onClick={clearFile}
            disabled={disabled}
            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            🗑️ 파일 제거
          </button>
        </div>
      )}

      {/* 안내 메시지 - 다크 테마 */}
      {!selectedFile && !fileError && (
        <div className="text-center bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-xl border border-blue-600/30">
          <p className="text-blue-300 font-medium">💡 팁: 음성 파일을 직접 드래그해서 넣으시거나 위 영역을 클릭하여 파일을 선택하세요</p>
        </div>
      )}
    </div>
  )
}

export default FileUploader