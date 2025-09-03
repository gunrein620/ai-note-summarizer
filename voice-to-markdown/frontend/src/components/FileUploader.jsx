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
    <div className="space-y-6">
      {/* 드래그앤 드롭 영역 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : selectedFile
            ? 'border-green-500 bg-green-50'
            : fileError
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
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

        <div className="space-y-4">
          {/* 아이콘 */}
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            {selectedFile ? (
              <div className="text-4xl text-green-500">📎</div>
            ) : fileError ? (
              <div className="text-4xl text-red-500">❌</div>
            ) : dragActive ? (
              <div className="text-4xl text-blue-500">📁</div>
            ) : (
              <div className="text-4xl text-gray-400">🎵</div>
            )}
          </div>

          {/* 메시지 */}
          <div>
            {selectedFile ? (
              <div>
                <div className="text-lg font-medium text-green-700">
                  파일 선택됨
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            ) : fileError ? (
              <div>
                <div className="text-lg font-medium text-red-700">
                  파일 업로드 오류
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {fileError}
                </div>
              </div>
            ) : dragActive ? (
              <div className="text-lg font-medium text-blue-700">
                파일을 여기에 놓으세요
              </div>
            ) : (
              <div>
                <div className="text-lg font-medium text-gray-700">
                  오디오 파일을 드래그하거나 클릭하여 선택
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  지원 형식: MP3, WAV, WEBM, M4A, AAC, OGG, FLAC
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  최대 파일 크기: 100MB
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      {selectedFile && (
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
            onClick={clearFile}
            disabled={disabled}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            🗑️ 파일 제거
          </button>
        </div>
      )}

      {/* 안내 메시지 */}
      {!selectedFile && !fileError && (
        <div className="text-center text-sm text-gray-500">
          <p>💡 팁: 음성 파일을 직접 드래그해서 넣으시거나 위 영역을 클릭하여 파일을 선택하세요</p>
        </div>
      )}
    </div>
  )
}

export default FileUploader