'use client'

import Image from "next/image"
import { useState, useEffect } from "react"

interface MultipleChoiceProps {
  prompt: string
  choices: string[]
  answerIndex: number
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
  showOceanBackground?: boolean
}

export function MultipleChoice({ prompt, choices, answerIndex, onAnswer, onSkip, showOceanBackground = true }: MultipleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasChecked, setHasChecked] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null)
    setHasChecked(false)
  }, [prompt]) // Reset khi prompt thay đổi

  const handleSelect = (index: number) => {
    if (hasChecked) return
    setSelectedIndex(index)
  }

  const handleCheck = () => {
    if (selectedIndex === null) return
    
    if (!hasChecked) {
      // First click - Check answer
      setHasChecked(true)
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
      <div className="w-full h-full overflow-auto pt-25">
        <div className="w-full max-w-4xl mx-auto p-8 flex flex-col justify-center min-h-full">
          {/* Character with speech bubble containing question */}
          <div className="flex items-start gap-8 mb-12">
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
          
          {/* Answer choices */}
          <div className="space-y-3 max-w-2xl mx-auto w-full">
            {choices.map((choice, index) => {
              const isSelected = selectedIndex === index
              const isCorrect = index === answerIndex
              const showResult = hasChecked && isSelected
              
              let borderColor = "border-gray-300"
              let bgColor = "bg-white hover:bg-teal-50"
              let textColor = "text-gray-800"
              
              if (isSelected && !hasChecked) {
                borderColor = "border-teal-400"
                bgColor = "bg-teal-50"
              }
              
              if (showResult) {
                if (isCorrect) {
                  borderColor = "border-green-500"
                  bgColor = "bg-green-50"
                  textColor = "text-green-800"
                } else {
                  borderColor = "border-red-500"
                  bgColor = "bg-red-50"
                  textColor = "text-red-800"
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  disabled={hasChecked}
                  className={`w-full p-5 rounded-2xl text-left text-lg transition-all border-2 ${borderColor} ${bgColor} ${textColor} ${
                    hasChecked ? "cursor-not-allowed" : "cursor-pointer"
                  } flex items-center gap-4 shadow-sm hover:shadow-md`}
                >
                  {/* Number badge */}
                  <div className={`flex-shrink-0 w-12 h-12 ${isSelected && !hasChecked ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600'} rounded-xl flex items-center justify-center font-bold text-lg transition-colors`}>
                    {index + 1}
                  </div>
                  
                  {/* Choice text */}
                  <span className="flex-1 font-medium">{choice}</span>
                  
                  {/* Checkmark or X */}
                  {showResult && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
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
            disabled={selectedIndex === null}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              selectedIndex === null
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