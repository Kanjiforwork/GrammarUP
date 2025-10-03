'use client'

import Image from "next/image"
import { useState, useEffect } from "react"

interface OrderQuestionProps {
  prompt: string
  tokens: string[]
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
  showOceanBackground?: boolean
}

export function OrderQuestion({ prompt, tokens, onAnswer, onSkip, showOceanBackground = true }: OrderQuestionProps) {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [availableTokens, setAvailableTokens] = useState<string[]>([])
  const [hasChecked, setHasChecked] = useState(false)

  // Reset and shuffle tokens when question changes
  useEffect(() => {
    const shuffled = [...tokens].sort(() => Math.random() - 0.5)
    setAvailableTokens(shuffled)
    setSelectedTokens([])
    setHasChecked(false)
  }, [tokens])

  const handleTokenClick = (token: string, fromAvailable: boolean) => {
    if (hasChecked) return

    if (fromAvailable) {
      // Move from available to selected
      setAvailableTokens(availableTokens.filter(t => t !== token))
      setSelectedTokens([...selectedTokens, token])
    } else {
      // Move from selected back to available
      setSelectedTokens(selectedTokens.filter(t => t !== token))
      setAvailableTokens([...availableTokens, token])
    }
  }

  const handleCheck = () => {
    if (selectedTokens.length !== tokens.length) return
    
    if (!hasChecked) {
      setHasChecked(true)
    } else {
      const isCorrect = selectedTokens.every((token, idx) => token === tokens[idx])
      onAnswer(isCorrect)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const isCorrectOrder = hasChecked && selectedTokens.every((token, idx) => token === tokens[idx])
  const allSelected = selectedTokens.length === tokens.length

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
          
          {/* Selected tokens area - answer */}
          <div className={`max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-lg border-2 transition-all ${
            hasChecked
              ? isCorrectOrder
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : 'border-teal-200'
          }`}>
            <p className="text-sm font-semibold text-gray-600 mb-4">Câu trả lời của bạn:</p>
            <div className="min-h-[80px] flex flex-wrap gap-2 items-center">
              {selectedTokens.length === 0 ? (
                <p className="text-gray-400 italic">Chọn các từ bên dưới...</p>
              ) : (
                selectedTokens.map((token, index) => (
                  <button
                    key={index}
                    onClick={() => handleTokenClick(token, false)}
                    disabled={hasChecked}
                    className={`px-4 py-3 rounded-xl font-medium text-lg transition-all ${
                      hasChecked
                        ? 'cursor-not-allowed bg-gray-100 text-gray-600'
                        : 'bg-teal-100 text-teal-800 hover:bg-teal-200 cursor-pointer'
                    }`}
                  >
                    {token}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available tokens area */}
          <div className="max-w-3xl mx-auto w-full mt-6 bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-4">Chọn từ:</p>
            <div className="flex flex-wrap gap-2">
              {availableTokens.map((token, index) => (
                <button
                  key={index}
                  onClick={() => handleTokenClick(token, true)}
                  disabled={hasChecked}
                  className={`px-4 py-3 rounded-xl font-medium text-lg transition-all ${
                    hasChecked
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-800 hover:bg-teal-50 hover:text-teal-800 cursor-pointer'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Show correct answer after checking if wrong */}
          {hasChecked && !isCorrectOrder && (
            <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <p className="text-lg font-semibold text-blue-800 mb-2">Đáp án đúng:</p>
              <p className="text-xl text-blue-900">{tokens.join(' ')}</p>
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
            disabled={!allSelected}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              !allSelected
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