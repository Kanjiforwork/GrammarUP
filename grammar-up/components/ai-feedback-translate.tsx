'use client'
import { useEffect, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'


interface AIFeedbackProps {
  question: string
  userAnswer: string
  correctAnswer: string
  questionType: string
  show: boolean
  onLoadingChange?: (loading: boolean) => void
}

export function AIFeedback({ question, userAnswer, correctAnswer, questionType, show, onLoadingChange }: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Chỉ fetch 1 lần duy nhất khi show = true và chưa fetch trước đó
    if (show && userAnswer !== correctAnswer && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchFeedback()
    }
  }, [show, userAnswer, correctAnswer])

  const fetchFeedback = async () => {
    setLoading(true)
    onLoadingChange?.(true)
    try {
      const response = await fetch('/api/ai-tutor-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          userAnswer,
          correctAnswer,
          questionType
        })
      })
      const data = await response.json()
      setFeedback(data.feedback)
    } catch (error) {
      console.error('Error fetching AI feedback:', error)
      setFeedback('Xin lỗi, không thể tải phản hồi từ AI tutor.')
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }

  if (!show) return null

  return (
    <div className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl border-2 border-teal-200">
      <div className="flex items-start gap-4">
        {/* Dolphin Avatar */}
        <div className="flex-shrink-0">
          <Image
            src="/dolphin_avatar.png"
            alt="AI Tutor"
            width={65}
            height={65}
            className="object-contain"
          />
        </div>

        {/* Feedback Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            💡 Giải thích từ AI Tutor
          </h3>
          
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang phân tích câu trả lời của bạn...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}