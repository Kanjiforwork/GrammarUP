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
  const [dropIndex, setDropIndex] = useState<number | null>(null)
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
      setAvailableTokens(availableTokens.filter(t => t !== token))
      setSelectedTokens([...selectedTokens, token])
    } else {
      setSelectedTokens(selectedTokens.filter(t => t !== token))
      setAvailableTokens([...availableTokens, token])
    }
  }

  const handleDragStart = (token: string, from: 'selected' | 'available', index: number) => {
    if (hasChecked) return
    setDraggedItem({ token, from, index })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropIndex(null)
  }

  // Handle drag over drop zones
  const handleDragOverDropZone = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChecked || !draggedItem) return
    setDropIndex(index)
  }

  // Handle drop on drop zone
  const handleDropOnZone = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasChecked || !draggedItem) return

    if (draggedItem.from === 'available') {
      // Moving from available to selected
      const newAvailable = availableTokens.filter(t => t !== draggedItem.token)
      const newSelected = [...selectedTokens]
      newSelected.splice(targetIndex, 0, draggedItem.token)
      
      setAvailableTokens(newAvailable)
      setSelectedTokens(newSelected)
    } else {
      // Reordering within selected
      const newSelected = [...selectedTokens]
      const [removed] = newSelected.splice(draggedItem.index, 1)
      
      // Adjust target index
      let adjustedIndex = targetIndex
      if (targetIndex > draggedItem.index) {
        adjustedIndex = targetIndex - 1
      }
      
      newSelected.splice(adjustedIndex, 0, removed)
      setSelectedTokens(newSelected)
    }

    setDraggedItem(null)
    setDropIndex(null)
  }

  // Drop back to available
  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault()
    if (hasChecked || !draggedItem || draggedItem.from !== 'selected') return

    const newSelected = selectedTokens.filter(t => t !== draggedItem.token)
    setSelectedTokens(newSelected)
    setAvailableTokens([...availableTokens, draggedItem.token])

    setDraggedItem(null)
    setDropIndex(null)
  }

  const handleCheck = () => {
    if (selectedTokens.length !== tokens.length) return
    
    if (!hasChecked) {
      setHasChecked(true)
      const isCorrect = selectedTokens.every((token, idx) => token === tokens[idx])
      playSound(isCorrect ? 'correct' : 'incorrect')
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
      <div className="w-full h-full overflow-auto pb-32">
        <div className="w-full max-w-4xl mx-auto p-8 flex flex-col justify-center min-h-full">
          {/* Character with speech bubble */}
          <div className="flex items-start gap-8 mb-12">
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
            
            <div className="relative bg-white -ml-12 px-8 py-6 mt-10 rounded-3xl rounded-tl-none shadow-lg border-2 border-teal-200">
              <p className="text-2xl font-semibold text-gray-800">{prompt}</p>
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-l-2 border-t-2 border-teal-200 transform rotate-45"></div>
            </div>
          </div>
          
          {/* Selected tokens area */}
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
            <div className="min-h-[80px] flex flex-wrap items-start gap-3">
              {selectedTokens.length === 0 ? (
                <div 
                  className="w-full h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl transition-colors hover:border-teal-400 hover:bg-teal-50/30"
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (!hasChecked && draggedItem) setDropIndex(0)
                  }}
                  onDrop={(e) => handleDropOnZone(e, 0)}
                >
                  <p className="text-gray-400 italic">Kéo thả từ vào đây...</p>
                </div>
              ) : (
                <>
                  {selectedTokens.map((token, index) => {
                    const isDragging = draggedItem?.token === token && draggedItem?.from === 'selected'
                    const showDropBefore = dropIndex === index && draggedItem && !isDragging
                    
                    return (
                      <div key={`${token}-${index}`} className="flex items-center" style={{ gap: '12px' }}>
                        {/* Drop zone BEFORE this token */}
                        {showDropBefore && (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onDrop={(e) => handleDropOnZone(e, index)}
                            className="h-14 bg-teal-50 border-2 border-dashed border-teal-400 rounded-xl flex items-center justify-center"
                            style={{ width: '80px', minWidth: '80px' }}
                          >
                            <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Token */}
                        <div
                          draggable={!hasChecked}
                          onDragStart={() => handleDragStart(token, 'selected', index)}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (!hasChecked && draggedItem && !isDragging) {
                              setDropIndex(index)
                            }
                          }}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleTokenClick(token, false)}
                          className={`px-5 py-3 rounded-xl font-medium text-lg shadow-sm transition-all ${
                            hasChecked
                              ? 'cursor-not-allowed bg-gray-50 text-gray-500 border border-gray-200'
                              : 'bg-teal-500 text-white hover:bg-teal-600 cursor-move hover:shadow-md'
                          } ${isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
                        >
                          {token}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Drop zone at the END - always visible when dragging */}
                  {draggedItem && (
                    <div
                      onDragEnter={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (!hasChecked) {
                          setDropIndex(selectedTokens.length)
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => handleDropOnZone(e, selectedTokens.length)}
                      className={`h-14 border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                        dropIndex === selectedTokens.length 
                          ? 'bg-teal-50 border-teal-400 w-20' 
                          : 'bg-gray-50 border-gray-300 w-16 opacity-50'
                      }`}
                      style={{ minWidth: dropIndex === selectedTokens.length ? '80px' : '64px' }}
                    >
                      <svg className={`w-6 h-6 transition-colors ${dropIndex === selectedTokens.length ? 'text-teal-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Available tokens area */}
          <div 
            className="max-w-3xl mx-auto w-full mt-6 bg-white p-8 rounded-2xl shadow-md border border-gray-100"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropToAvailable}
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
                        : 'bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:shadow-md cursor-move border border-gray-200 hover:border-teal-200'
                    } ${isDragging ? 'opacity-30' : 'opacity-100'}`}
                  >
                    {token}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Show correct answer if wrong */}
          {hasChecked && !isCorrectOrder && (
            <div className="max-w-3xl mx-auto w-full mt-6 bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Đáp án đúng:</p>
              <p className="text-xl text-blue-900 font-medium">{tokens.join(' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg ${
        showOceanBackground 
          ? 'bg-white/90 backdrop-blur-sm border-t border-gray-100' 
          : 'bg-white border-t border-gray-200'
      }`}>
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