'use client'

import Image from "next/image"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'

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
  const [draggedItem, setDraggedItem] = useState<{token: string, from: 'selected' | 'available', index: number} | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const { playSound } = useSound()

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

  // Drag & Drop handlers
  const handleDragStart = (token: string, from: 'selected' | 'available', index: number) => {
    if (hasChecked) return
    setDraggedItem({ token, from, index })
  }

  const handleDragOverSelected = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (hasChecked || !draggedItem) return

    // Only update if target index actually changed
    if (dropTargetIndex !== targetIndex) {
      setDropTargetIndex(targetIndex)
    }
  }

  const handleDropOnToken = (targetIndex: number) => {
    if (hasChecked || !draggedItem) return

    if (draggedItem.from === 'available') {
      // Dragging from available to selected - insert at target position
      const newAvailableTokens = availableTokens.filter(t => t !== draggedItem.token)
      const newSelectedTokens = [...selectedTokens]
      newSelectedTokens.splice(targetIndex, 0, draggedItem.token)
      
      setAvailableTokens(newAvailableTokens)
      setSelectedTokens(newSelectedTokens)
    } else if (draggedItem.from === 'selected' && draggedItem.index !== targetIndex) {
      // Reordering within selected
      const newTokens = [...selectedTokens]
      const [movedToken] = newTokens.splice(draggedItem.index, 1)
      const insertIndex = targetIndex > draggedItem.index ? targetIndex - 1 : targetIndex
      newTokens.splice(insertIndex, 0, movedToken)
      
      setSelectedTokens(newTokens)
    }

    // Reset drag state immediately
    setDraggedItem(null)
    setDropTargetIndex(null)
  }

  const handleDragOverSelectedArea = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropSelectedArea = (e: React.DragEvent) => {
    e.preventDefault()
    if (hasChecked || !draggedItem) return

    // If dragging from available and dropping in empty area or at the end
    if (draggedItem.from === 'available') {
      const newAvailableTokens = availableTokens.filter(t => t !== draggedItem.token)
      const newSelectedTokens = [...selectedTokens, draggedItem.token]
      
      setAvailableTokens(newAvailableTokens)
      setSelectedTokens(newSelectedTokens)
    }

    // Reset drag state
    setDraggedItem(null)
    setDropTargetIndex(null)
  }

  const handleDragOverAvailable = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropAvailable = () => {
    if (hasChecked || !draggedItem || draggedItem.from !== 'selected') return

    // Move from selected back to available
    const newSelectedTokens = selectedTokens.filter(t => t !== draggedItem.token)
    const newAvailableTokens = [...availableTokens, draggedItem.token]
    
    setSelectedTokens(newSelectedTokens)
    setAvailableTokens(newAvailableTokens)

    // Reset drag state
    setDraggedItem(null)
    setDropTargetIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropTargetIndex(null)
  }

  const handleCheck = () => {
    if (selectedTokens.length !== tokens.length) return
    
    if (!hasChecked) {
      // First click - Check answer and play sound
      setHasChecked(true)
      const isCorrect = selectedTokens.every((token, idx) => token === tokens[idx])
      playSound(isCorrect ? 'correct' : 'incorrect')
    } else {
      // Second click - Continue to next question
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
          
          {/* Selected tokens area - answer with drag & drop */}
          <div className={`max-w-3xl mx-auto w-full bg-white p-8 rounded-2xl shadow-md border transition-all ${
            hasChecked
              ? isCorrectOrder
                ? 'border-green-400 bg-green-50'
                : 'border-red-400 bg-red-50'
              : 'border-gray-100'
          }`}>
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">
              Câu trả lời của bạn:
            </p>
            <div 
              className="min-h-[80px] flex flex-wrap gap-2 items-center"
              onDragOver={handleDragOverSelectedArea}
              onDrop={handleDropSelectedArea}
            >
              {selectedTokens.length === 0 ? (
                <p className="text-gray-400 italic">Chọn các từ bên dưới...</p>
              ) : (
                selectedTokens.map((token, index) => {
                  const isDragging = draggedItem?.token === token && draggedItem?.from === 'selected'
                  
                  return (
                    <div
                      key={`${token}-${index}`}
                      draggable={!hasChecked}
                      onDragStart={() => handleDragStart(token, 'selected', index)}
                      onDragOver={(e) => handleDragOverSelected(e, index)}
                      onDrop={() => handleDropOnToken(index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTokenClick(token, false)}
                      className={`px-5 py-3 rounded-xl font-medium text-lg transition-all shadow-sm ${
                        hasChecked
                          ? 'cursor-not-allowed bg-gray-50 text-gray-500 border border-gray-200'
                          : 'bg-teal-500 text-white hover:bg-teal-600 cursor-move active:scale-95'
                      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
                    >
                      {token}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Available tokens area - draggable */}
          <div 
            className="max-w-3xl mx-auto w-full mt-6 bg-white p-8 rounded-2xl shadow-md border border-gray-100"
            onDragOver={handleDragOverAvailable}
            onDrop={handleDropAvailable}
          >
            <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Chọn từ:</p>
            <div className="flex flex-wrap gap-2">
              {availableTokens.map((token, index) => {
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
                        : 'bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md cursor-move border border-gray-200 hover:border-teal-200 active:scale-95'
                    } ${isDragging ? 'opacity-50 scale-95' : ''}`}
                  >
                    {token}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Show correct answer after checking if wrong */}
          {hasChecked && !isCorrectOrder && (
            <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Đáp án đúng:</p>
              <p className="text-xl text-blue-900 font-medium">{tokens.join(' ')}</p>
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
            disabled={!allSelected}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
              !allSelected
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