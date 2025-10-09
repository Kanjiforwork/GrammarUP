'use client'
import { Bot, Pen } from 'lucide-react';

import { useState } from 'react'

interface CreateExerciseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateExerciseModal({ isOpen, onClose }: CreateExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('')
  const [mode, setMode] = useState<'ai' | 'manual'>('ai')

  // AI mode states
  const [difficulty, setDifficulty] = useState<'A2' | 'B1' | 'B2' | 'C1'>('A2')
  const [questionTypes, setQuestionTypes] = useState({
    MCQ: false,
    CLOZE: false,
    ORDER: false,
    TRANSLATE: false
  })
  const [questionCount, setQuestionCount] = useState(10)

  // Manual mode states
  const [manualContent, setManualContent] = useState('')

  const toggleQuestionType = (type: keyof typeof questionTypes) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tạo bài tập mới</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Exercise Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên bài tập
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ví dụ: Present Simple - Basic Practice"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all"
            />
          </div>

          {/* Mode Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setMode('ai')}
                className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${
                  mode === 'ai'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bot className="w-5 h-5" />
                <span className="ml-2">AI tạo đề</span>
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center font-semibold text-sm transition-all ${mode === 'manual'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Pen className="w-5 h-5" />
                <span className="ml-2">Tự nhập đề</span>
              </button>

            </div>
          </div>

          {/* AI Mode Content */}
          {mode === 'ai' && (
            <div className="space-y-6">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Độ khó
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['A2', 'B1', 'B2', 'C1'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${difficulty === level
                          ? 'bg-teal-50 border-teal-500 text-teal-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Loại câu hỏi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleQuestionType('MCQ')}
                    className={`px-4 py-3 rounded-xl text-left transition-all border-2 ${questionTypes.MCQ
                        ? 'bg-teal-50 border-teal-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${questionTypes.MCQ
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                        }`}>
                        {questionTypes.MCQ && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${questionTypes.MCQ ? 'text-teal-700' : 'text-gray-700'}`}>
                        Trắc nghiệm
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => toggleQuestionType('CLOZE')}
                    className={`px-4 py-3 rounded-xl text-left transition-all border-2 ${questionTypes.CLOZE
                        ? 'bg-teal-50 border-teal-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${questionTypes.CLOZE
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                        }`}>
                        {questionTypes.CLOZE && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${questionTypes.CLOZE ? 'text-teal-700' : 'text-gray-700'}`}>
                        Điền từ
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => toggleQuestionType('ORDER')}
                    className={`px-4 py-3 rounded-xl text-left transition-all border-2 ${questionTypes.ORDER
                        ? 'bg-teal-50 border-teal-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${questionTypes.ORDER
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                        }`}>
                        {questionTypes.ORDER && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${questionTypes.ORDER ? 'text-teal-700' : 'text-gray-700'}`}>
                        Sắp xếp
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => toggleQuestionType('TRANSLATE')}
                    className={`px-4 py-3 rounded-xl text-left transition-all border-2 ${questionTypes.TRANSLATE
                        ? 'bg-teal-50 border-teal-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${questionTypes.TRANSLATE
                          ? 'bg-teal-500 border-teal-500'
                          : 'border-gray-300'
                        }`}>
                        {questionTypes.TRANSLATE && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`font-medium ${questionTypes.TRANSLATE ? 'text-teal-700' : 'text-gray-700'}`}>
                        Dịch câu
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Số câu hỏi: <span className="text-teal-600">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Mode Content */}
          {mode === 'manual' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nội dung bài tập
              </label>
              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Nhập nội dung bài tập của bạn tại đây..."
                rows={12}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none"
              />
              <p className="mt-2 text-xs text-gray-500">
                Hỗ trợ định dạng JSON hoặc text thuần
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-3xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                // TODO: Handle submit logic
                console.log({
                  name: exerciseName,
                  mode,
                  ...(mode === 'ai' ? {
                    difficulty,
                    questionTypes,
                    questionCount
                  } : {
                    manualContent
                  })
                })
              }}
              className="px-8 py-3 rounded-xl font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md transition-all"
            >
              Tạo bài tập
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
