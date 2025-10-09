'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'
import { AIFeedback } from './ai-feedback-translate'

interface TranslateQuestionProps {
  prompt: string
  vietnameseText: string
  correctAnswer: string
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
}

export function TranslateQuestion({ prompt, vietnameseText, correctAnswer, onAnswer, onSkip }: TranslateQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('')
  const [hasChecked, setHasChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [aiTutorLoading, setAiTutorLoading] = useState(false)
  const { playSound } = useSound()

  // Reset state when question changes
  useEffect(() => {
    setUserAnswer('')
    setHasChecked(false)
    setIsCorrect(false)
  }, [vietnameseText])

  const handleCheck = async () => {
    if (!userAnswer.trim()) return
    
    if (!hasChecked) {
      // First click - Check answer with GPT
      setIsCheckingAnswer(true)
      
      try {
        const response = await fetch('/api/check-translation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vietnameseText,
            userAnswer: userAnswer.trim(),
            suggestedAnswer: correctAnswer
          })
        })

        const data = await response.json()
        
        setHasChecked(true)
        setIsCorrect(data.isCorrect)
        playSound(data.isCorrect ? 'correct' : 'incorrect')
      } catch (error) {
        console.error('Error checking translation:', error)
        setHasChecked(true)
        setIsCorrect(false)
      } finally {
        setIsCheckingAnswer(false)
      }
    } else {
      // Second click - Continue to next question
      onAnswer(isCorrect)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const isWrong = hasChecked && !isCorrect

  return (
<div className="relative w-full h-full">
      {/* Main content area with padding for bottom bar */}
      <div className="w-full h-full overflow-auto pb-32">
        <div className="w-full max-w-4xl mx-auto p-2 flex flex-col justify-center min-h-full">
          {/* Character with speech bubble containing question */}
          <div className="flex items-start gap-8 ">
            {/* Character - remove whitespace */}
            <div className="flex-shrink-0 -ml-4">
              <Image 
                src="/dolphin_book.png"
                alt="Dolphin mascot"
                width={200}
                height={200}
                className="object-contain object-left"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
            
            {/* Speech bubble with question */}
            <div className="relative bg-white -ml-12 px-8 py-6 mt-10 rounded-3xl rounded-tl-none shadow-lg border-2 border-teal-200">
              <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
              {/* Small triangle pointer */}
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Vietnamese text to translate */}
          <div className="max-w-3xl mx-auto w-full bg-teal-50 p-8 rounded-2xl shadow-md border border-teal-200 mb-6">
            <p className="text-sm font-semibold text-teal-700 mb-3 uppercase tracking-wide">
              Câu tiếng Việt:
            </p>
            <p className="text-2xl font-medium text-gray-900">{vietnameseText}</p>
          </div>

          {/* Answer input area */}
          <div className={`max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-md border transition-all ${
            hasChecked
              ? isCorrect
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
              : 'border-gray-100'
          }`}>
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Câu trả lời của bạn:
            </p>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={hasChecked || isCheckingAnswer}
              placeholder="Nhập câu dịch tiếng Anh của bạn..."
              className={`w-full p-4 text-lg rounded-xl border-2 resize-none transition-all ${
                hasChecked || isCheckingAnswer
                  ? 'cursor-not-allowed bg-gray-50'
                  : 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none'
              }`}
              rows={3}
            />
          </div>

          {/* Show correct answer if wrong */}
          {isWrong && (
            <>
              <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Đáp án gợi ý:</p>
                <p className="text-xl text-blue-900 font-medium">{correctAnswer}</p>
              </div>
              
              {/* AI Feedback */}
              <div className="max-w-3xl mx-auto w-full">
                <AIFeedback
                  question={prompt + " - " + vietnameseText}
                  userAnswer={userAnswer}
                  correctAnswer={correctAnswer}
                  questionType="translate"
                  show={true}
                  onLoadingChange={setAiTutorLoading}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleSkip}
            disabled={hasChecked || isCheckingAnswer}
            className="px-6 py-3 font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-0 disabled:cursor-not-allowed active:scale-95"
          >
            BỎ QUA
          </button>
          
          <button
            onClick={handleCheck}
            disabled={!userAnswer.trim() || isCheckingAnswer || (hasChecked && aiTutorLoading)}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              !userAnswer.trim() || isCheckingAnswer || (hasChecked && aiTutorLoading)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {isCheckingAnswer ? "ĐANG KIỂM TRA..." : hasChecked ? "TIẾP TỤC" : "KIỂM TRA"}
          </button>
        </div>
      </div>
    </div>
  )
}