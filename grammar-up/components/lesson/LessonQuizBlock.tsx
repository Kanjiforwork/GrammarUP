'use client'

import Image from "next/image"
import { useState, useEffect } from 'react'

interface LessonQuizBlockProps {
  question: string
  options: string[]
  answerIndex: number
  explain: string
  isRemind?: boolean
  onAnswer?: (isCorrect: boolean, selectedAnswer: string) => void
}

export function LessonQuizBlock({ 
  question, 
  options, 
  answerIndex, 
  explain,
  isRemind = false,
  onAnswer
}: LessonQuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null)
    setHasSubmitted(false)
  }, [question])

  const handleSelect = (index: number) => {
    if (hasSubmitted) return
    setSelectedIndex(index)
  }

  const handleSubmit = () => {
    if (selectedIndex === null) return
    
    setHasSubmitted(true)
    const isCorrect = selectedIndex === answerIndex
    const selectedAnswer = options[selectedIndex]
    onAnswer?.(isCorrect, selectedAnswer)
  }

  const isCorrect = hasSubmitted && selectedIndex === answerIndex

  return (
    <div className="relative w-full">
      {/* Main content area with padding for bottom bar */}
      <div className="w-full pb-32">
        <div className="w-full max-w-4xl mx-auto p-2 flex flex-col justify-center">
          
          {/* Header - Kiểm tra bài học hoặc Nhắc lại kiến thức */}
          <div className="flex items-center gap-2">
            {isRemind ? (
              <>
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Nhắc lại kiến thức</h3>
                  <p className="text-sm text-amber-700">Chọn đáp án đúng nhất</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-teal-900">Kiểm tra bài học</h3>
                  <p className="text-sm text-teal-700">Chọn đáp án đúng nhất</p>
                </div>
              </>
            )}
          </div>

          {/* Character with speech bubble containing question */}
          <div className="flex items-start gap-8">
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
              <p className="text-2xl font-semibold text-gray-800">{question}</p>
              {/* Small triangle pointer */}
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Answer choices */}
          <div className="space-y-3 max-w-2xl mx-auto w-full">
            {options.map((option, index) => {
              const isSelected = selectedIndex === index
              const isThisCorrect = index === answerIndex
              const showResult = hasSubmitted && isSelected
              
              let borderColor = "border-gray-50"
              let bgColor = "bg-white hover:bg-white-50"
              let textColor = "text-gray-600"
              let badgeBgColor = "bg-gray-100"
              let badgeTextColor = "text-gray-600"
              
              if (isSelected && !hasSubmitted) {
                borderColor = "border-teal-400"
                bgColor = "bg-teal-50"
                badgeBgColor = "bg-teal-500"
                badgeTextColor = "text-white"
              }
              
              if (showResult) {
                if (isThisCorrect) {
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
                  disabled={hasSubmitted}
                  className={`w-full p-5 rounded-2xl text-left text-lg transition-all border-2 ${borderColor} ${bgColor} ${textColor} ${
                    hasSubmitted ? "cursor-not-allowed" : "cursor-pointer"
                  } flex items-center gap-4 shadow-md hover:shadow-xl`}
                >
                  {/* Number badge */}
                  <div className={`flex-shrink-0 w-12 h-12 ${badgeBgColor} ${badgeTextColor} rounded-xl flex items-center justify-center font-bold text-lg transition-colors`}>
                    {index + 1}
                  </div>
                  
                  {/* Choice text */}
                  <span className="flex-1 font-medium">{option}</span>
                  
                  {/* Checkmark or X */}
                  {showResult && (
                    <div className="flex-shrink-0">
                      {isThisCorrect ? (
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

          {/* Explanation - shown after submission */}
          {hasSubmitted && (
            <div className="max-w-2xl mx-auto w-full mt-6">
              <div className={`p-5 rounded-2xl border-2 shadow-md ${
                isCorrect 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      {isCorrect ? (
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      ) : (
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg mb-2 ${
                      isCorrect ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                    </h4>
                    <p className={`text-base leading-relaxed ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {explain}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar - fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex justify-end items-center">
          <button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedIndex === null
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md active:scale-[0.98]"
            }`}
          >
            KIỂM TRA
          </button>
        </div>
      </div>
    </div>
  )
}
