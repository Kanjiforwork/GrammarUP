'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, Clock } from 'lucide-react'
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
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null)
  const [resetTime, setResetTime] = useState<Date | null>(null)
  const [isLimitReached, setIsLimitReached] = useState(false)
  const hasFetchedRef = useRef(false)
  const divRef = useRef<HTMLDivElement>(null)

  const fetchFeedback = useCallback(async () => {
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

      if (response.status === 429) {
        setFeedback(`⚠️ ${data.error || 'Bạn đã hết lượt sử dụng AI Tutor miễn phí.'}`)
        setIsLimitReached(true)
        if (data.reset) {
          setResetTime(new Date(data.reset * 1000))
        }
        return
      }

      setFeedback(data.feedback)
      
      if (data.remaining !== undefined) {
        setRemainingRequests(data.remaining)
      }
      if (data.reset) {
        setResetTime(new Date(data.reset * 1000))
      }
      
      if (data.remaining === 0) {
        setIsLimitReached(true)
      }
    } catch (error) {
      console.error('Error fetching AI feedback:', error)
      setFeedback('Xin lỗi, không thể tải phản hồi từ AI tutor.')
    } finally {
      setLoading(false)
      onLoadingChange?.(false)
    }
  }, [question, userAnswer, correctAnswer, questionType, onLoadingChange])

  // Format thời gian reset
  const formatResetTime = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff <= 0) return 'Đã có thể sử dụng lại'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} ngày ${hours % 24} giờ nữa`
    }
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút nữa`
    }
    return `${minutes} phút nữa`
  }

  useEffect(() => {
    if (divRef.current) {
      const timer = setTimeout(() => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const elementHeight = rect.height
        const targetScroll = absoluteTop + elementHeight - window.innerHeight + 50
        
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        })
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (show && userAnswer !== correctAnswer && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchFeedback()
    }
  }, [show, userAnswer, correctAnswer, fetchFeedback])

  useEffect(() => {
    if (divRef.current && feedback && feedback.trim() !== '') {
      const timer = setTimeout(() => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const elementHeight = rect.height
        const targetScroll = absoluteTop + elementHeight - window.innerHeight + 50
        
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        })
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [feedback])

  if (!show) return null

  return (
    <div ref={divRef} className="mt-6 p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl border-2 border-teal-200 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0">
          <Image
            src="/dolphin_avatar.png"
            alt="AI Tutor"
            width={50}
            height={50}
            className="object-contain md:w-[65px] md:h-[65px]"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900 md:text-lg">
              💡 Giải thích từ AI Tutor
            </h3>
            {typeof remainingRequests === 'number' && !isLimitReached && (
              <span className="text-xs text-gray-500 md:text-sm">
                Còn lại: {remainingRequests}/3 lượt
              </span>
            )}
          </div>

          {/* Hiển thị thông tin reset nếu hết lượt */}
          {isLimitReached && resetTime && (
            <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700">
                Reset sau: <span className="font-semibold">{formatResetTime(resetTime)}</span>
              </span>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm md:text-base">Đang phân tích câu trả lời của bạn...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
