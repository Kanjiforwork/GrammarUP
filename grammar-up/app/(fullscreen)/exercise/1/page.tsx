'use client'

import Link from "next/link";
import { Progress } from "@/components/ui/progress"
import { MultipleChoice } from "@/components/MultipleChoice"
import { ClozeQuestion } from "@/components/ClozeQuestion"
import { OrderQuestion } from "@/components/OrderQuestion"
import { OceanBackground } from "@/components/OceanBackground"
import { useState, useEffect } from "react"
import questionsData from "@/lib/data/exercise/Present prefect/present_prefect.json"

type Question = {
  id: string
  type: "MCQ" | "CLOZE" | "ORDER"
  prompt: string
  concept: string
  choices?: string[]
  answerIndex?: number
  template?: string
  answers?: string[]
  tokens?: string[]
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

export default function Exercise() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [showOceanBackground, setShowOceanBackground] = useState(false)

  // Shuffle questions on mount
  useEffect(() => {
    const shuffled = shuffleArray(questionsData as Question[])
    setAllQuestions(shuffled)
  }, [])

  // Check ocean background setting
  useEffect(() => {
    const oceanBgEnabled = localStorage.getItem('oceanBackground') === 'true'
    setShowOceanBackground(oceanBgEnabled)
  }, [])

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
      // Exercise completed
      alert(`Hoàn thành! Bạn trả lời đúng ${correctAnswers + (isCorrect ? 1 : 0)}/${allQuestions.length} câu`)
    }
  }

  const handleSkip = () => {
    // Move to next question without counting as correct
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      alert(`Hoàn thành! Bạn trả lời đúng ${correctAnswers}/${allQuestions.length} câu`)
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
            showOceanBackground={showOceanBackground}
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
            showOceanBackground={showOceanBackground}
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
            showOceanBackground={showOceanBackground}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`w-full min-h-screen flex flex-col relative ${!showOceanBackground ? 'bg-white' : ''}`}>
      {/* Ocean Background - only show if enabled */}
      {showOceanBackground && <OceanBackground />}
      
      {/* Top bar with HIGH TRANSPARENCY */}
      <div className="w-full bg-white/20 border-b border-white/30 p-4 flex items-center gap-4 shadow-sm relative z-10">
        {/* Close button */}
        <Link 
          href="/exercise" 
          className="text-teal-800 hover:text-teal-900 transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28" 
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
          <Progress value={progress} className="h-4 bg-white/50 [&>div]:bg-teal-500" />
        </div>
        
        {/* Spacer */}
        <div className="w-7"></div>
      </div>
      
      {/* Main content - full height minus top bar */}
      <div className="flex-1 flex flex-col relative z-10">
        {renderQuestion()}
      </div>
    </div>
  );
}