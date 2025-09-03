import React from 'react'

const TypeSelector = ({ selectedType, onTypeChange, disabled = false }) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        처리 유형을 선택하세요
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onTypeChange('lecture')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedType === 'lecture'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🎓</div>
            <div className="font-medium">강의</div>
            <div className="text-sm text-gray-500 mt-1">
              강의 내용을 체계적으로 정리
            </div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onTypeChange('meeting')}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedType === 'meeting'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400 text-gray-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">🤝</div>
            <div className="font-medium">회의</div>
            <div className="text-sm text-gray-500 mt-1">
              회의록 및 액션 아이템 정리
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default TypeSelector