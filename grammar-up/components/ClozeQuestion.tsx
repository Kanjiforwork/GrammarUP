'use client'

import Image from "next/image"
import { useState, useEffect } from "react"

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
      setHasChecked(true)
    } else {
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
                className={`px-4 py-2 border-2 rounded-lg text-center min-w-[120px] transition-all ${
                  hasChecked
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'border-teal-300 focus:border-teal-500 focus:outline-none'
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
            <div className="relative bg-white -ml-12 px-8 py-6 mt-10 rounded-3xl rounded-tl-none shadow-lg border-2 border-teal-200">
              <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Template with input fields */}
          <div className="max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-lg border-2 border-teal-200">
            {renderTemplate()}
          </div>

          {/* Show correct answers after checking if wrong */}
          {hasChecked && userAnswers.some((ans, idx) => ans.trim().toLowerCase() !== answers[idx].trim().toLowerCase()) && (
            <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <p className="text-lg font-semibold text-blue-800 mb-2">Đáp án đúng:</p>
              <p className="text-xl text-blue-900">{answers.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar - style based on background */}
      <div className={`fixed bottom-0 left-0 right-0 w-full border-t p-6 shadow-sm ${
        showOceanBackground 
          ? 'bg-white/20 border-white/30' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {/* Skip button with BORDER */}
          <button
            onClick={handleSkip}
            disabled={hasChecked}
            className={`px-6 py-3 font-semibold hover:bg-teal-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
              showOceanBackground
                ? 'text-teal-800 border-teal-600/50 hover:border-teal-700'
                : 'text-teal-700 border-teal-500 hover:border-teal-600'
            }`}
          >
            BỎ QUA
          </button>
          
          {/* Check/Continue button with BORDER */}
          <button
            onClick={handleCheck}
            disabled={!allFilled}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              !allFilled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400"
                : "bg-teal-500 text-white hover:bg-teal-600 shadow-lg hover:shadow-xl border-teal-600 hover:border-teal-700"
            }`}
          >
            {hasChecked ? "TIẾP TỤC" : "KIỂM TRA"}
          </button>
        </div>
      </div>
    </div>
  )
}