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
  const divRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    // Scroll ngay khi component được mount (xuất hiện)
    if (divRef.current) {
      console.log('🔍 AI Feedback Translate component mounted, scrolling immediately...')
      
      // Đợi một chút để DOM render xong
      const timer = setTimeout(() => {
        if (!divRef.current) return
        
        console.log('📜 Executing scroll...')
        
        // Lấy vị trí của feedback element
        const rect = divRef.current.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const elementHeight = rect.height
        
        console.log('Element position:', {
          top: absoluteTop,
          height: elementHeight,
          windowHeight: window.innerHeight
        })
        
        // Scroll window để hiện feedback ở cuối màn hình
        const targetScroll = absoluteTop + elementHeight - window.innerHeight + 50 // +50px padding
        
        console.log('Scrolling window to:', targetScroll)
        
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        })
      }, 300) // Delay ngắn hơn vì không cần đợi GPT
      
      return () => clearTimeout(timer)
    }
  }, []) // Empty dependency array - chỉ chạy khi component mount

  useEffect(() => {
    // Chỉ fetch 1 lần duy nhất khi show = true và chưa fetch trước đó
    if (show && userAnswer !== correctAnswer && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchFeedback()
    }
  }, [show, userAnswer, correctAnswer])

  useEffect(() => {
    // Chỉ scroll khi feedback đã được load xong (có nội dung)
    if (divRef.current && feedback && feedback.trim() !== '') {
      console.log('🔍 AI Feedback loaded, attempting scroll...')
      
      // Đợi để DOM update xong
      const timer = setTimeout(() => {
        if (!divRef.current) return
        
        console.log('📜 Executing scroll...')
        
        // Lấy vị trí của feedback element
        const rect = divRef.current.getBoundingClientRect()
        const absoluteTop = rect.top + window.pageYOffset
        const elementHeight = rect.height
        
        console.log('Element position:', {
          top: absoluteTop,
          height: elementHeight,
          windowHeight: window.innerHeight
        })
        
        // Scroll window để hiện feedback ở cuối màn hình
        const targetScroll = absoluteTop + elementHeight - window.innerHeight + 50 // +50px padding
        
        console.log('Scrolling window to:', targetScroll)
        
        window.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        })
        
        // Backup: force scroll
        setTimeout(() => {
          console.log('🔧 Current window scroll:', window.pageYOffset)
        }, 500)
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [feedback])

  if (!show) return null

  return (
    <div ref={divRef} className="mt-6 p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-2xl border-2 border-teal-200 md:p-6">
      <div className="flex items-start gap-3 md:gap-4">
        {/* Dolphin Avatar */}
        <div className="flex-shrink-0">
          <Image
            src="/dolphin_avatar.png"
            alt="AI Tutor"
            width={50}
            height={50}
            className="object-contain md:w-[65px] md:h-[65px]"
          />
        </div>

        {/* Feedback Content */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-2 md:text-lg">
            💡 Giải thích từ AI Tutor
          </h3>
          
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