'use client'
import { Bot, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react'

interface CreateLessonModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateLessonModal({ isOpen, onClose, onSuccess }: CreateLessonModalProps) {
  const [lessonName, setLessonName] = useState('')
  const [lessonDescription, setLessonDescription] = useState('')
  const [additionalRequirements, setAdditionalRequirements] = useState('')

  // AI mode states
  const [difficulty, setDifficulty] = useState<'A2' | 'B1' | 'B2' | 'C1'>('A2')
  const [blockCount, setBlockCount] = useState(8)

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingStage, setLoadingStage] = useState<'generating' | 'uploading' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showRetryDialog, setShowRetryDialog] = useState(false)
  const [lastSubmitData, setLastSubmitData] = useState<any>(null)

  const MAX_RETRY_ATTEMPTS = 3

  const resetForm = () => {
    setLessonName('')
    setLessonDescription('')
    setAdditionalRequirements('')
    setError(null)
    setRetryCount(0)
    setShowRetryDialog(false)
    setLastSubmitData(null)
  }

  const handleSubmit = async () => {
    // Validation
    if (!lessonName.trim()) {
      setError('Vui lòng nhập tên bài học')
      return
    }

    if (!lessonDescription.trim()) {
      setError('Vui lòng nhập mô tả bài học')
      return
    }

    const submitData = {
      lessonName: lessonName.trim(),
      lessonDescription: lessonDescription.trim(),
      additionalRequirements: additionalRequirements.trim(),
      difficulty,
      blockCount
    }

    setLastSubmitData(submitData)
    await submitLesson(submitData)
  }

  const submitLesson = async (data: any) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Stage 1: Generating lesson content
      setLoadingStage('generating')

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tạo bài học')
      }

      // Stage 2: Uploading to database (handled by API, but show for UX)
      setLoadingStage('uploading')
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UX

      // Success!
      console.log('✅ Lesson created:', result.lesson)

      // Show success state briefly
      setLoadingStage(null)
      setIsSubmitting(false)

      // Reset and close
      resetForm()
      onSuccess?.()
      onClose()

    } catch (err) {
      console.error('❌ Error creating lesson:', err)
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
      submitLesson(lastSubmitData)
    }
  }

  const handleCancelRetry = () => {
    setShowRetryDialog(false)
    setError(null)
    setRetryCount(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Retry Dialog */}
      {showRetryDialog && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Tạo bài học thất bại</h3>
            </div>
            <p className="text-gray-700 mb-2">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              Lần thử: {retryCount + 1}/{MAX_RETRY_ATTEMPTS}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelRetry}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-teal-500 hover:bg-teal-600 transition-all"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tạo bài học mới</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Error Display */}
          {error && !showRetryDialog && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 mb-1">Có lỗi xảy ra</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSubmitting && (
            <div className="mb-6 p-6 bg-teal-50 border-2 border-teal-200 rounded-xl">
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                <div className="flex-1">
                  <p className="font-semibold text-teal-900 mb-1">
                    {loadingStage === 'generating' && 'Đang tạo nội dung bài học...'}
                    {loadingStage === 'uploading' && 'Đang lưu vào database...'}
                  </p>
                  <p className="text-sm text-teal-700">
                    {loadingStage === 'generating' && 'AI đang phân tích và tạo các phần học cho bạn'}
                    {loadingStage === 'uploading' && 'Đang lưu bài học vào hệ thống'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên bài học
            </label>
            <input
              type="text"
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="Ví dụ: Present Simple - Thì hiện tại đơn"
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Lesson Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả bài học
            </label>
            <textarea
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="Ví dụ: Học cách sử dụng thì hiện tại đơn để diễn tả các hành động thường xuyên, sự thật hiển nhiên..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* Additional Requirements */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Yêu cầu thêm (tùy chọn)
            </label>
            <textarea
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              placeholder="Ví dụ: Tập trung vào các từ vựng về công việc, bao gồm nhiều ví dụ thực tế..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          {/* AI Mode Content */}
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
                    disabled={isSubmitting}
                    className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 disabled:opacity-50 ${difficulty === level
                      ? 'bg-teal-50 border-teal-500 text-teal-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Số phần học: <span className="text-teal-600">{blockCount}</span>
              </label>
              <input
                type="range"
                min="5"
                max="15"
                step="1"
                value={blockCount}
                onChange={(e) => setBlockCount(parseInt(e.target.value))}
                disabled={isSubmitting}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>15</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bao gồm: Giới thiệu, Lý thuyết, Ví dụ, Bài tập mini
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6 rounded-b-3xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-semibold bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  <span>Tạo bài học</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}