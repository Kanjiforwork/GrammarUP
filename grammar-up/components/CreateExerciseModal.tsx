'use client'
import { Bot, Pen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react'

interface CreateExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateExerciseModal({ isOpen, onClose, onSuccess }: CreateExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('')
  const [additionalRequirements, setAdditionalRequirements] = useState('')
  const [mode, setMode] = useState<'ai' | 'manual'>('ai')

  // AI mode states - Mặc định tick hết 4 loại
  const [difficulty, setDifficulty] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A2')
  const [questionTypes, setQuestionTypes] = useState({
    MCQ: true,
    CLOZE: true,
    ORDER: true,
    TRANSLATE: true
  })
  const [questionCount, setQuestionCount] = useState(10)

  // Manual mode states
  const [manualContent, setManualContent] = useState('')

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStage, setLoadingStage] = useState<'generating' | 'uploading' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showRetryDialog, setShowRetryDialog] = useState(false)
  const [lastSubmitData, setLastSubmitData] = useState<any>(null)

  const MAX_RETRY_ATTEMPTS = 3

  const toggleQuestionType = (type: keyof typeof questionTypes) => {
    const newTypes = {
      ...questionTypes,
      [type]: !questionTypes[type]
    }
    
    // Kiểm tra xem có ít nhất 1 loại được chọn không
    const hasAtLeastOne = Object.values(newTypes).some(v => v)
    
    if (hasAtLeastOne) {
      setQuestionTypes(newTypes)
    } else {
      // Không cho phép bỏ chọn hết tất cả
      setError('Phải chọn ít nhất một loại câu hỏi')
      setTimeout(() => setError(null), 2000)
    }
  }

  const resetForm = () => {
    setExerciseName('')
    setAdditionalRequirements('')
    setManualContent('')
    setError(null)
    setRetryCount(0)
    setShowRetryDialog(false)
    setLastSubmitData(null)
  }

  const handleSubmit = async () => {
    // Validation
    if (!exerciseName.trim()) {
      setError('Vui lòng nhập tên bài tập')
      return
    }

    if (mode === 'ai') {
      const hasSelectedType = Object.values(questionTypes).some(v => v)
      if (!hasSelectedType) {
        setError('Vui lòng chọn ít nhất một loại câu hỏi')
        return
      }
    } else {
      if (!manualContent.trim()) {
        setError('Vui lòng nhập nội dung bài tập')
        return
      }
    }

    const submitData = {
      mode,
      exerciseName: exerciseName.trim(),
      additionalRequirements: additionalRequirements.trim(),
      ...(mode === 'ai' ? {
        difficulty,
        questionTypes,
        questionCount
      } : {
        manualContent: manualContent.trim()
      })
    }

    setLastSubmitData(submitData)
    await submitExercise(submitData)
  }

  const submitExercise = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Stage 1: Generating questions
      setLoadingStage('generating')

      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tạo bài tập')
      }

      // Stage 2: Uploading to database (handled by API, but show for UX)
      setLoadingStage('uploading')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX

      // Success!
      console.log('✅ Exercise created:', result.exercise)

      // Show success state briefly
      setLoadingStage(null)
      setIsSubmitting(false)

      // Reset and close
      resetForm()
      onSuccess?.()
      onClose()

    } catch (err) {
      console.error('❌ Error creating exercise:', err)
      setIsSubmitting(false)
      setLoadingStage(null)

      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định'
      setError(errorMessage)

      // Show retry dialog if under max attempts
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setShowRetryDialog(true)
      }
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setShowRetryDialog(false)
    if (lastSubmitData) {
      submitExercise(lastSubmitData)
    }
  }

  const handleCancelRetry = () => {
    setShowRetryDialog(false)
    setError(null)
    setRetryCount(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Retry Dialog */}
      {showRetryDialog && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mx-4 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tạo bài tập thất bại</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-700 mb-2">{error}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Lần thử: {retryCount + 1}/{MAX_RETRY_ATTEMPTS}
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={handleCancelRetry}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white bg-teal-500 hover:bg-teal-600 transition-all"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Container - FIXED: Responsive width and height */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - FIXED: Responsive padding */}
        <div className="relative z-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Tạo bài tập mới</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - FIXED: Responsive padding */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto flex-1">
          {/* Error Display */}
          {error && !showRetryDialog && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-red-900 mb-1">Có lỗi xảy ra</p>
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSubmitting && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-teal-50 border-2 border-teal-200 rounded-xl">
              <div className="flex items-center gap-3 sm:gap-4">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-semibold text-teal-900 mb-1">
                    {loadingStage === 'generating' && 'Đang tạo câu hỏi...'}
                    {loadingStage === 'uploading' && 'Đang lưu vào database...'}
                  </p>
                  <p className="text-xs sm:text-sm text-teal-700">
                    {loadingStage === 'generating' && 'AI đang phân tích và tạo câu hỏi cho bạn'}
                    {loadingStage === 'uploading' && 'Đang lưu bài tập vào hệ thống'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Exercise Name */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Tên bài tập
            </label>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Ví dụ: Present Simple - Basic Practice"
              disabled={isSubmitting}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Additional Requirements */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Yêu cầu thêm
            </label>
            <textarea
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Ví dụ: Tập trung vào các từ vựng về gia đình, sử dụng ngữ cảnh hàng ngày"
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Mode Tabs - FIXED: Responsive */}
          <div className="mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
              <button
                onClick={() => setMode('ai')}
                disabled={isSubmitting}
                className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'ai'
                    ? 'bg-teal-500 text-white hover:bg-teal-600 scale-[1.02]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="ml-1.5 sm:ml-2">AI tạo đề</span>
              </button>
              <button
                onClick={() => setMode('manual')}
                disabled={isSubmitting}
                className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl flex items-center justify-center font-semibold text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'manual'
                    ? 'bg-teal-500 text-white hover:bg-teal-600 scale-[1.02]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Pen className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="ml-1.5 sm:ml-2">Tự nhập đề</span>
              </button>
            </div>
          </div>

          {/* AI Mode Content */}
          {mode === 'ai' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Difficulty Level */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Độ khó
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {(['A1', 'A2', 'B1', 'B2'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      disabled={isSubmitting}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all border-2 disabled:opacity-50 ${
                        difficulty === level
                          ? 'bg-teal-50 border-teal-500 text-teal-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Types - FIXED: Single column on mobile */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Loại câu hỏi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { key: 'MCQ', label: 'Trắc nghiệm' },
                    { key: 'CLOZE', label: 'Điền từ' },
                    { key: 'ORDER', label: 'Sắp xếp' },
                    { key: 'TRANSLATE', label: 'Dịch câu' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleQuestionType(key as keyof typeof questionTypes)}
                      disabled={isSubmitting}
                      className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-left transition-all border-2 disabled:opacity-50 ${
                        questionTypes[key as keyof typeof questionTypes]
                          ? 'bg-teal-50 border-teal-500'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          questionTypes[key as keyof typeof questionTypes]
                            ? 'bg-teal-500 border-teal-500'
                            : 'border-gray-300'
                        }`}>
                          {questionTypes[key as keyof typeof questionTypes] && (
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium text-xs sm:text-sm ${
                          questionTypes[key as keyof typeof questionTypes] ? 'text-teal-700' : 'text-gray-700'
                        }`}>
                          {label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Số câu hỏi: <span className="text-teal-600">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Mode Content - FIXED: Responsive grid and padding */}
          {mode === 'manual' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Nội dung bài tập
              </label>

              {/* Two-column layout for info boxes - FIXED: Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Info Box - Left */}
                <div className="p-3 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">Hỗ trợ 2 định dạng</p>
                      <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs text-gray-600">
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span><span className="font-medium text-gray-700">Text thường</span> - AI tự động phân tích</span>
                        </div>
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span><span className="font-medium text-gray-700">JSON</span> - Định dạng có cấu trúc</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Box - Right */}
                <div className="p-3 sm:p-5 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Chỉ 4 dạng câu hỏi</p>

                      {/* Supported types */}
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {['Trắc nghiệm', 'Điền từ', 'Sắp xếp', 'Dịch câu'].map((type) => (
                          <div key={type} className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                            <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm bg-teal-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-700">{type}</span>
                          </div>
                        ))}
                      </div>

                      {/* Not supported */}
                      <div className="pt-2 sm:pt-3 border-t border-gray-200">
                        <div className="flex items-start gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500">
                          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Không hỗ trợ: Reading, Listening, Essay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                rows={10}
                disabled={isSubmitting}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none text-xs sm:text-sm disabled:opacity-50 disabled:bg-gray-50 font-normal"
              />

              {/* Example section - collapsible or always visible */}
              <div className="mt-3 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <details className="group">
                  <summary className="text-[10px] sm:text-xs font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span>Xem ví dụ chi tiết</span>
                  </summary>
                  <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                    {/* Text example */}
                    <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">📝 Ví dụ Text thường:</p>
                      <pre className="text-[10px] sm:text-xs text-gray-600 font-mono whitespace-pre-wrap">
                        {`1. He ___ to school every day (go/goes/going/went)
2. Điền từ: She ___ coffee (drink)
3. Sắp xếp: I / like / tea
4. Dịch: Tôi đi học mỗi ngày`}
                      </pre>
                    </div>

                    {/* JSON example */}
                    <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-gray-200">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">💻 Ví dụ JSON:</p>
                      <pre className="text-[10px] sm:text-xs text-gray-600 font-mono whitespace-pre-wrap overflow-x-auto">
                        {`{
  "questions": [
    {
      "type": "MCQ",
      "prompt": "He ___ to school",
      "concept": "present_simple",
      "level": "A1",
      "data": {
        "choices": ["go", "goes", "going", "went"],
        "answerIndex": 1
      }
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>

        {/* Footer - FIXED: Responsive padding and button sizes */}
        <div className="relative z-20 bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-b-2xl sm:rounded-b-3xl flex-shrink-0">
          <div className="flex gap-2 sm:gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <span>Tạo bài tập</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
