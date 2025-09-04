import React from 'react'

const TypeSelector = ({ selectedType, onTypeChange, disabled = false }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-white mb-3">
        처리 유형을 선택하세요
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onTypeChange('lecture')}
          disabled={disabled}
          className={`p-6 rounded-xl border-2 backdrop-blur-md transition-all duration-300 transform hover:scale-105 ${
            selectedType === 'lecture'
              ? 'border-blue-400 bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white shadow-lg shadow-blue-500/25'
              : 'border-gray-600/50 bg-gray-800/30 hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-purple-500/20 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-3xl mb-3">🎓</div>
            <div className="font-semibold text-lg">강의</div>
            <div className="text-sm text-gray-300 mt-2">
              강의 내용을 체계적으로 정리
            </div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onTypeChange('meeting')}
          disabled={disabled}
          className={`p-6 rounded-xl border-2 backdrop-blur-md transition-all duration-300 transform hover:scale-105 ${
            selectedType === 'meeting'
              ? 'border-green-400 bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-white shadow-lg shadow-green-500/25'
              : 'border-gray-600/50 bg-gray-800/30 hover:border-green-400/50 hover:bg-gradient-to-br hover:from-green-500/20 hover:to-emerald-500/20 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-3xl mb-3">🤝</div>
            <div className="font-semibold text-lg">회의</div>
            <div className="text-sm text-gray-300 mt-2">
              회의록 및 액션 아이템 정리
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default TypeSelector