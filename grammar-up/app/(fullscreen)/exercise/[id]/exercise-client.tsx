'use client'

import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { MultipleChoice } from "@/components/MultipleChoice"
import { ClozeQuestion } from "@/components/ClozeQuestion"
import { OrderQuestion } from "@/components/OrderQuestion"
import { TranslateQuestion } from "@/components/TranslateQuestion"
import { useState, useEffect } from "react"
import { useSound } from '@/hooks/useSound'


type Question = {
  id: string
  type: "MCQ" | "CLOZE" | "ORDER" | "TRANSLATE"
  prompt: string
  concept: string
  choices?: string[]
  answerIndex?: number
  template?: string
  answers?: string[]
  tokens?: string[]
  vietnameseText?: string
  correctAnswer?: string
}

// Shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}




export default function ExerciseClient({ 
  questions, 
  exerciseTitle 
}: { 
  questions: Question[]
  exerciseTitle: string 
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const { playSound } = useSound()

  // Shuffle questions on mount
  useEffect(() => {
    const shuffled = shuffleArray(questions)
    setAllQuestions(shuffled)
  }, [questions])

  const currentQuestion = allQuestions[currentQuestionIndex]
  const progress = allQuestions.length > 0 ? ((currentQuestionIndex + 1) / allQuestions.length) * 100 : 0
  
  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    }
    
    // Move to next question
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Exercise completed - play finish sound
      playSound('finish')
      setTimeout(() => {
        alert(`Hoàn thành! Bạn trả lời đúng ${correctAnswers + (isCorrect ? 1 : 0)}/${allQuestions.length} câu`)
      }, 500)
    }
  }

  const handleSkip = () => {
    // Move to next question without counting as correct
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      playSound('finish')
      setTimeout(() => {
        alert(`Hoàn thành! Bạn trả lời đúng ${correctAnswers}/${allQuestions.length} câu`)
      }, 500)
    }
  }

  // Render appropriate component based on question type
  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case "MCQ":
        return (
          <MultipleChoice
            key={currentQuestion.id}
            prompt={currentQuestion.prompt}
            choices={currentQuestion.choices!}
            answerIndex={currentQuestion.answerIndex!}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />
        )
      
      case "CLOZE":
        return (
          <ClozeQuestion
            key={currentQuestion.id}
            prompt={currentQuestion.prompt}
            template={currentQuestion.template!}
            answers={currentQuestion.answers!}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />
        )
      
      case "ORDER":
        return (
          <OrderQuestion
            key={currentQuestion.id}
            prompt={currentQuestion.prompt}
            tokens={currentQuestion.tokens!}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />
        )
      
      case "TRANSLATE":
        return (
          <TranslateQuestion
            key={currentQuestion.id}
            prompt={currentQuestion.prompt}
            vietnameseText={currentQuestion.vietnameseText!}
            correctAnswer={currentQuestion.correctAnswer!}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col relative bg-gray-50">
      {/* Top bar - elegant style */}
      <div className="w-full p-4 flex items-center gap-4 shadow-sm relative z-10 bg-white border-b border-gray-200">
        {/* Close button - elegant circular style */}
        <Link 
          href="/exercise" 
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
        
        {/* Progress bar - elegant with better colors */}
        <div className="flex-1 max-w-2xl mx-auto">
          <Progress value={progress} className="h-3 bg-gray-100 [&>div]:bg-teal-500" />
        </div>
        
        {/* Spacer for symmetry */}
        <div className="w-10"></div>
      </div>
      
      {/* Main content - full height minus top bar */}
      <div className="flex-1 flex flex-col relative z-10">
        {renderQuestion()}
      </div>
    </div>
  )
}