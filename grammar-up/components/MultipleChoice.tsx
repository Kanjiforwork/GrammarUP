'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'
import { AIFeedback } from './ai-feedback'

interface MultipleChoiceProps {
  prompt: string
  choices: string[]
  answerIndex: number
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
}

export function MultipleChoice({ prompt, choices, answerIndex, onAnswer, onSkip }: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasChecked, setHasChecked] = useState(false)
  const [aiTutorLoading, setAiTutorLoading] = useState(false)
  const { playSound } = useSound()

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null)
    setHasChecked(false)
  }, [prompt])

  const handleSelect = (index: number) => {
    if (hasChecked) return
    setSelectedIndex(index)
  }

  const handleCheck = () => {
    if (selectedIndex === null) return
    
    if (!hasChecked) {
      // First click - Check answer and play sound
      setHasChecked(true)
      const isCorrect = selectedIndex === answerIndex
      playSound(isCorrect ? 'correct' : 'incorrect')
    } else {
      // Second click - Continue to next question
      const isCorrect = selectedIndex === answerIndex
      onAnswer(isCorrect)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

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
            <div className="relative bg-white -ml-12 px-6 py-4 mt-10 rounded-3xl rounded-tl-none shadow-lg border-2 border-teal-200 md:px-8 md:py-6">
              <p className="text-lg font-semibold text-gray-800 md:text-2xl">{prompt}</p>
              {/* Small triangle pointer */}
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Answer choices */}
          <div className="space-y-2 max-w-2xl mx-auto w-full md:space-y-3">
            {choices.map((choice, index) => {
              const isSelected = selectedIndex === index
              const isCorrect = index === answerIndex
              const showResult = hasChecked && isSelected
              
              let borderColor = "border-gray-50"
              let bgColor = "bg-white hover:bg-white-50"
              let textColor = "text-gray-600"
              let badgeBgColor = "bg-gray-100"
              let badgeTextColor = "text-gray-600"
              
              if (isSelected && !hasChecked) {
                borderColor = "border-teal-400"
                bgColor = "bg-teal-50"
                badgeBgColor = "bg-teal-500"
                badgeTextColor = "text-white"
              }
              
              if (showResult) {
                if (isCorrect) {
                  borderColor = "border-green-500"
                  bgColor = "bg-green-50"
                  textColor = "text-green-800"
                  badgeBgColor = "bg-green-500"
                  badgeTextColor = "text-white"
                } else {
                  borderColor = "border-red-500"
                  bgColor = "bg-red-50"
                  textColor = "text-red-800"
                  badgeBgColor = "bg-red-500"
                  badgeTextColor = "text-white"
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={hasChecked}
                  className={`w-full p-3 rounded-2xl text-left text-base transition-all border-2 ${borderColor} ${bgColor} ${textColor} ${
                    hasChecked ? "cursor-not-allowed" : "cursor-pointer"
                  } flex items-center gap-3 shadow-md hover:shadow-xl md:p-5 md:text-lg md:gap-4`}
                >
                  {/* Number badge */}
                  <div className={`flex-shrink-0 w-10 h-10 ${badgeBgColor} ${badgeTextColor} rounded-xl flex items-center justify-center font-bold text-base transition-colors md:w-12 md:h-12 md:text-lg`}>
                    {index + 1}
                  </div>
                  
                  {/* Choice text */}
                  <span className="flex-1 font-medium">{choice}</span>
                  
                  {/* Checkmark or X */}
                  {showResult && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <svg className="w-6 h-6 text-green-600 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-600 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* AI Feedback - chỉ hiện khi đã check và trả lời sai */}
          {hasChecked && selectedIndex !== null && selectedIndex !== answerIndex && (
            <div className="max-w-2xl mx-auto w-full mt-6">
              <AIFeedback
                question={prompt}
                userAnswer={choices[selectedIndex]}
                correctAnswer={choices[answerIndex]}
                questionType="multiple-choice"
                show={true}
                onLoadingChange={setAiTutorLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleSkip}
            disabled={hasChecked}
            className="px-6 py-3 font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-0 disabled:cursor-not-allowed active:scale-95"
          >
            BỎ QUA
          </button>
          
          <button
            onClick={handleCheck}
            disabled={selectedIndex === null || (hasChecked && aiTutorLoading)}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedIndex === null || (hasChecked && aiTutorLoading)
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