'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { IntroBlock } from "@/components/lesson/IntroBlock"
import { TextAreaBlock } from "@/components/lesson/TextAreaBlock"
import { LessonQuizBlock } from "@/components/lesson/LessonQuizBlock"
import { LessonCompletionModal } from "@/components/LessonCompletionModal"
import { AIFeedback } from "@/components/ai-feedback"
import { useState, useEffect } from "react"
import { ArrowRight, CheckCircle } from "lucide-react"

type Block = {
  id: string
  type: string
  order: number
  data: any
}

export default function LessonClient({
  lessonId,
  lessonTitle,
  lessonDescription,
  unitTitle,
  blocks
}: {
  lessonId: string
  lessonTitle: string
  lessonDescription: string
  unitTitle: string
  blocks: Block[]
}) {
  const router = useRouter()
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set())
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Quiz state - reset khi chuyển block
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizCorrect, setQuizCorrect] = useState(false)
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)

  // Loading states for completion buttons
  const [isNavigating, setIsNavigating] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)

  const currentBlock = blocks[currentBlockIndex]
  const progress = blocks.length > 0 ? ((currentBlockIndex + 1) / blocks.length) * 100 : 0

  // Reset quiz state khi chuyển block
  useEffect(() => {
    setQuizSubmitted(false)
    setQuizCorrect(false)
    setUserAnswer('')
    setAiLoading(false)
  }, [currentBlockIndex])

  const handleNext = () => {
    // Mark current block as completed
    setCompletedBlocks(prev => new Set([...prev, currentBlockIndex]))

    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1)
    }
  }

  const handleQuizAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    setQuizSubmitted(true)
    setQuizCorrect(isCorrect)
    setUserAnswer(selectedAnswer)
  }

  const handleNavigateBack = () => {
    setIsNavigating(true)
    router.push('/lessons')
  }

  const handleRestart = async () => {
    setIsRestarting(true)
    // Delay nhẹ để UX mượt hơn
    await new Promise(resolve => setTimeout(resolve, 300))
    setCurrentBlockIndex(0)
    setCompletedBlocks(new Set())
    setIsCompleted(false)
    setIsRestarting(false)
  }

  const renderBlock = () => {
    if (!currentBlock) return null

    const data = currentBlock.data as any

    switch (currentBlock.type) {
      case 'INTRO':
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <IntroBlock
                title={data.title}
                subtitle={data.subtitle}
                kahootHint={data.kahootHint}
                cta="Bắt đầu"
                onStart={handleNext}
              />
            </div>
          </div>
        )

      case 'WHAT':
      case 'HOW':
        return (
          <div className="w-full h-full pb-32 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto p-8 flex flex-col justify-center min-h-full">
              <TextAreaBlock
                heading={data.heading}
                content={data.content}
                examples={data.examples}
                notes={data.notes}
              />
            </div>
          </div>
        )

      case 'REMIND':
      case 'MINIQUIZ':
        const isQuizBlock = currentBlock.type === 'MINIQUIZ'
        const quizNumber = isQuizBlock 
          ? blocks.filter(b => b.type === 'MINIQUIZ').findIndex(b => b.id === currentBlock.id) + 1
          : 0
        const totalQuizzes = blocks.filter(b => b.type === 'MINIQUIZ').length

        return (
          <div className="w-full h-full pb-10 overflow-y-auto">
            <div className="w-full max-w-4xl mx-auto p-8 flex flex-col justify-center min-h-full">
              <div className="space-y-2">
                {/* Quiz header for MINIQUIZ */}
                {isQuizBlock && (
                  <div className="flex items-center gap-2">
                  
                  </div>
                )}

                <LessonQuizBlock
                  key={currentBlock.id} // Force remount khi chuyển block
                  question={data.question}
                  options={data.options}
                  answerIndex={data.answerIndex}
                  explain={data.explain}
                  isRemind={currentBlock.type === 'REMIND'}
                  onAnswer={handleQuizAnswer}
                />

                {/* AI Feedback - chỉ show khi làm sai */}
                {quizSubmitted && !quizCorrect && (
                  <AIFeedback
                    question={data.question}
                    userAnswer={userAnswer}
                    correctAnswer={data.options[data.answerIndex]}
                    questionType="MCQ"
                    show={true}
                    onLoadingChange={setAiLoading}
                  />
                )}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-gray-500">Unknown block type: {currentBlock.type}</p>
              <button
                onClick={handleNext}
                className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg"
              >
                Skip
              </button>
            </div>
          </div>
        )
    }
  }

  // Helper function to determine if we can show navigation
  const shouldShowBottomBar = () => {
    if (!currentBlock) return false
    
    const blockType = currentBlock.type
    
    // Don't show bottom bar for INTRO blocks (they handle their own navigation)
    if (blockType === 'INTRO') return false
    
    // For quiz blocks, only show after submission
    if (blockType === 'REMIND' || blockType === 'MINIQUIZ') {
      return quizSubmitted
    }
    
    // Show for other block types
    return true
  }

  // Helper function to determine button states
  const getNavigationState = () => {
    const canGoBack = currentBlockIndex > 0
    const canGoNext = true
    const isLoading = aiLoading
    
    return {
      canGoBack,
      canGoNext: canGoNext && !isLoading,
      isLoading
    }
  }

  // Completion screen
  if (isCompleted) {
    return (
      <LessonCompletionModal
        isOpen={true}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        blocksCompleted={completedBlocks.size}
        totalBlocks={blocks.length}
        onRetry={handleRestart}
        onClose={() => setIsCompleted(false)}
      />
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative bg-gray-50">
      {/* Top bar */}
      <div className="w-full p-4 flex items-center gap-4 shadow-sm relative z-10 bg-white border-b border-gray-200">
        {/* Close button */}
        <Link 
          href="/lessons" 
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </Link>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <Progress value={progress} className="h-3 bg-gray-100 [&>div]:bg-teal-500" />
        </div>
        
        {/* Block counter */}
        <div className="w-auto px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
          {currentBlockIndex + 1} / {blocks.length}
        </div>
      </div>
      
      {/* Main content - full height minus top bar */}
      <div className="flex-1 flex flex-col relative z-10">
        {renderBlock()}
      </div>

      {/* Bottom bar - similar to MultipleChoice and ClozeQuestion */}
      {shouldShowBottomBar() && (
        <div className="fixed bottom-0 left-0 right-0 w-full p-6 shadow-lg bg-white border-t border-gray-200 z-20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={!getNavigationState().canGoBack}
              className="px-6 py-3 font-semibold text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-0 disabled:cursor-not-allowed active:scale-95"
            >
              QUAY LẠI
            </button>
            
            <button
              onClick={handleNext}
              disabled={!getNavigationState().canGoNext}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all ${
                !getNavigationState().canGoNext
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {currentBlockIndex === blocks.length - 1 ? "HOÀN THÀNH" : "TIẾP TỤC"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
