'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'


interface ClozeQuestionProps {
  prompt: string
  template: string
  answers: string[]
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
  showOceanBackground?: boolean
}

export function ClozeQuestion({ prompt, template, answers, onAnswer, onSkip, showOceanBackground = true }: ClozeQuestionProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(answers.length).fill(''))
  const [hasChecked, setHasChecked] = useState(false)
  const { playSound } = useSound()


  // Reset state when question changes
  useEffect(() => {
    setUserAnswers(Array(answers.length).fill(''))
    setHasChecked(false)
  }, [template, answers.length])

  const handleInputChange = (index: number, value: string) => {
    if (hasChecked) return
    const newAnswers = [...userAnswers]
    newAnswers[index] = value
    setUserAnswers(newAnswers)
  }

  const handleCheck = () => {
    const allFilled = userAnswers.every(ans => ans.trim() !== '')
    if (!allFilled) return
    
    if (!hasChecked) {
      // First click - Check answer and play sound
      setHasChecked(true)
      const isCorrect = userAnswers.every((ans, idx) => 
        ans.trim().toLowerCase() === answers[idx].trim().toLowerCase()
      )
      playSound(isCorrect ? 'correct' : 'incorrect')
    } else {
      // Second click - Continue to next question
      const isCorrect = userAnswers.every((ans, idx) => 
        ans.trim().toLowerCase() === answers[idx].trim().toLowerCase()
      )
      onAnswer(isCorrect)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  // Parse template and create input fields
  const renderTemplate = () => {
    const parts = template.split(/(\{\{\d+\}\})/)
    
    return (
      <div className="text-2xl font-semibold text-gray-800 flex flex-wrap items-center gap-2">
        {parts.map((part, index) => {
          const match = part.match(/\{\{(\d+)\}\}/)
          if (match) {
            const inputIndex = parseInt(match[1]) - 1
            const isCorrect = hasChecked && userAnswers[inputIndex].trim().toLowerCase() === answers[inputIndex].trim().toLowerCase()
            const isWrong = hasChecked && userAnswers[inputIndex].trim().toLowerCase() !== answers[inputIndex].trim().toLowerCase()
            
            return (
              <input
                key={index}
                type="text"
                value={userAnswers[inputIndex]}
                onChange={(e) => handleInputChange(inputIndex, e.target.value)}
                disabled={hasChecked}
                className={`px-4 py-2 border-2 rounded-xl text-center min-w-[120px] transition-all font-medium ${
                  hasChecked
                    ? isCorrect
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-red-400 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none'
                }`}
                placeholder="..."
              />
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    )
  }

  const allFilled = userAnswers.every(ans => ans.trim() !== '')

  return (
    <div className="relative w-full h-full">
      {/* Main content area with padding for bottom bar */}
      <div className="w-full h-full overflow-auto pb-32">
        <div className="w-full max-w-4xl mx-auto p-8 flex flex-col justify-center min-h-full">
          {/* Character with speech bubble containing question */}
          <div className="flex items-start gap-8 mb-12">
            {/* Character */}
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
            <div className="relative bg-white -ml-12 px-8 py-6 mt-10 rounded-3xl rounded-tl-none shadow-md border-2 border-teal-200">
              <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Template with input fields */}
          <div className="max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            {renderTemplate()}
          </div>

          {/* Show correct answers after checking if wrong */}
          {hasChecked && userAnswers.some((ans, idx) => ans.trim().toLowerCase() !== answers[idx].trim().toLowerCase()) && (
            <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Đáp án đúng:</p>
              <p className="text-xl text-blue-900 font-medium">{answers.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar - elegant style */}
      <div className={`fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg ${
        showOceanBackground 
          ? 'bg-white/90 backdrop-blur-sm border-t border-gray-100' 
          : 'bg-white border-t border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Skip button - elegant ghost style with teal hover */}
          <button
            onClick={handleSkip}
            disabled={hasChecked}
            className="px-6 py-3 font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-0 disabled:cursor-not-allowed active:scale-95"
          >
            BỎ QUA
          </button>
          
          {/* Check/Continue button - elegant teal */}
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              !allFilled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {hasChecked ? "TIẾP TỤC" : "KIỂM TRA"}
          </button>
        </div>
      </div>
    </div>
  )
}