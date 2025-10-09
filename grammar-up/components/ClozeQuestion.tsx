'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'
import { AIFeedback } from './ai-feedback'

interface ClozeQuestionProps {
  prompt: string
  template: string
  answers: string[]
  onAnswer: (isCorrect: boolean) => void
  onSkip: () => void
}

export function ClozeQuestion({ prompt, template, answers, onAnswer, onSkip }: ClozeQuestionProps) {
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(answers.length).fill(''))
  const [availableTokens, setAvailableTokens] = useState<string[]>([])
  const [hasChecked, setHasChecked] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{token: string, from: 'answer' | 'available', index: number} | null>(null)
  const [aiTutorLoading, setAiTutorLoading] = useState(false)
  const { playSound } = useSound()

  // Reset and shuffle tokens when question changes
  useEffect(() => {
    const shuffled = [...answers].sort(() => Math.random() - 0.5)
    setAvailableTokens(shuffled)
    setUserAnswers(Array(answers.length).fill(''))
    setHasChecked(false)
  }, [template, answers])

  const handleTokenClick = (token: string, fromAvailable: boolean, answerIndex?: number) => {
    if (hasChecked) return

    if (fromAvailable) {
      // Tìm chỗ trống đầu tiên để điền
      const emptyIndex = userAnswers.findIndex(ans => ans === '')
      if (emptyIndex !== -1) {
        const newAnswers = [...userAnswers]
        newAnswers[emptyIndex] = token
        setUserAnswers(newAnswers)
        setAvailableTokens(availableTokens.filter(t => t !== token))
      }
    } else {
      // Xóa từ khỏi answer và trả về available
      if (answerIndex !== undefined) {
        const newAnswers = [...userAnswers]
        newAnswers[answerIndex] = ''
        setUserAnswers(newAnswers)
        setAvailableTokens([...availableTokens, token])
      }
    }
  }

  const handleDragStart = (token: string, from: 'answer' | 'available', index: number) => {
    if (hasChecked) return
    setDraggedItem({ token, from, index })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDropOnBlank = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChecked || !draggedItem) return

    if (draggedItem.from === 'available') {
      // Kéo từ available vào blank
      const newAnswers = [...userAnswers]
      const oldToken = newAnswers[targetIndex]
      newAnswers[targetIndex] = draggedItem.token
      
      const newAvailable = availableTokens.filter(t => t !== draggedItem.token)
      if (oldToken) {
        newAvailable.push(oldToken)
      }
      
      setUserAnswers(newAnswers)
      setAvailableTokens(newAvailable)
    } else {
      // Swap giữa 2 blanks
      const newAnswers = [...userAnswers]
      const temp = newAnswers[targetIndex]
      newAnswers[targetIndex] = draggedItem.token
      newAnswers[draggedItem.index] = temp
      setUserAnswers(newAnswers)
    }

    setDraggedItem(null)
  }

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    if (hasChecked || !draggedItem || draggedItem.from !== 'answer') return

    const newAnswers = [...userAnswers]
    newAnswers[draggedItem.index] = ''
    setUserAnswers(newAnswers)
    setAvailableTokens([...availableTokens, draggedItem.token])

    setDraggedItem(null)
  }

  const handleCheck = () => {
    const allFilled = userAnswers.every(ans => ans.trim() !== '')
    if (!allFilled) return
    
    if (!hasChecked) {
      setHasChecked(true)
      const isCorrect = userAnswers.every((ans, idx) => 
        ans.trim().toLowerCase() === answers[idx].trim().toLowerCase()
      )
      playSound(isCorrect ? 'correct' : 'incorrect')
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

  // Parse template and create blanks with drag & drop
  const renderTemplate = () => {
    const parts = template.split(/(\{\{\d+\}\})/)
    
    return (
      <div className="text-2xl font-semibold text-gray-800 flex flex-wrap items-center gap-2">
        {parts.map((part, index) => {
          const match = part.match(/\{\{(\d+)\}\}/)
          if (match) {
            const blankIndex = parseInt(match[1]) - 1
            const userAnswer = userAnswers[blankIndex]
            const correctAnswer = answers[blankIndex]
            const isCorrect = hasChecked && userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
            const isWrong = hasChecked && userAnswer && userAnswer.trim().toLowerCase() !== correctAnswer.trim().toLowerCase()
            const isDragging = draggedItem?.token === userAnswer && draggedItem?.from === 'answer' && draggedItem?.index === blankIndex
            
            return (
              <div
                key={index}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnBlank(e, blankIndex)}
                className={`inline-flex items-center justify-center min-w-[120px] px-4 py-2 border-2 rounded-xl transition-all font-medium ${
                  userAnswer
                    ? hasChecked
                      ? isCorrect
                        ? 'border-green-400 bg-green-50 text-green-700 cursor-not-allowed'
                        : 'border-red-400 bg-red-50 text-red-700 cursor-not-allowed'
                      : 'border-teal-400 bg-teal-500 text-white cursor-move'
                    : 'border-dashed border-gray-300 bg-gray-50 text-gray-400'
                } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
              >
                {userAnswer ? (
                  <span
                    draggable={!hasChecked && userAnswer !== ''}
                    onDragStart={() => handleDragStart(userAnswer, 'answer', blankIndex)} 
                    onDragEnd={handleDragEnd}
                    onClick={() => handleTokenClick(userAnswer, false, blankIndex)}
                  >
                    {userAnswer}
                  </span>
                ) : (
                  <span>...</span>
                )}
              </div>
            )
          }
          return <span key={index}>{part}</span>
        })}
      </div>
    )
  }

  const allFilled = userAnswers.every(ans => ans.trim() !== '')
  const hasWrongAnswer = hasChecked && userAnswers.some((ans, idx) => ans.trim().toLowerCase() !== answers[idx].trim().toLowerCase())

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
          
          {/* Template with blanks */}
          <div className={`max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-md border transition-all ${
            hasChecked
              ? !hasWrongAnswer
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
              : 'border-gray-100'
          }`}>
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Điền từ vào chỗ trống:
            </p>
            {renderTemplate()}
          </div>

          {/* Available tokens area */}
          <div 
            className="max-w-3xl mx-auto w-full mt-6 bg-white p-8 rounded-2xl shadow-md border border-gray-100"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropToAvailable}
          >
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Chọn từ:</p>
            <div className="flex flex-wrap gap-3">
              {availableTokens.length === 0 ? (
                <p className="text-gray-400 italic">Tất cả từ đã được sử dụng</p>
              ) : (
                availableTokens.map((token, index) => {
                  const isDragging = draggedItem?.token === token && draggedItem?.from === 'available'
                  
                  return (
                    <div
                      key={index}
                      draggable={!hasChecked}
                      onDragStart={() => handleDragStart(token, 'available', index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTokenClick(token, true)}
                      className={`px-5 py-3 rounded-xl font-medium text-lg transition-all shadow-sm ${
                        hasChecked
                          ? 'cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md cursor-move border border-gray-200 hover:border-teal-200'
                      } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                    >
                      {token}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Show correct answer if wrong */}
          {hasWrongAnswer && (
            <>
              <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Đáp án đúng:</p>
                <p className="text-xl text-blue-900 font-medium">{answers.join(', ')}</p>
              </div>
              
              {/* AI Feedback */}
              <div className="max-w-3xl mx-auto w-full">
                <AIFeedback
                  question={prompt}
                  userAnswer={userAnswers.join(', ')}
                  correctAnswer={answers.join(', ')}
                  questionType="cloze"
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
            disabled={hasChecked}
            className="px-6 py-3 font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-0 disabled:cursor-not-allowed active:scale-95"
          >
            BỎ QUA
          </button>
          
          <button
            onClick={handleCheck}
            disabled={!allFilled || (hasChecked && aiTutorLoading)}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              !allFilled || (hasChecked && aiTutorLoading)
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