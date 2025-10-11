'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ThumbsUp, Award, BookOpen, RotateCcw, LogOut, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface ExerciseCompletionModalProps {
  isOpen: boolean
  score: number
  totalQuestions: number
  exerciseId: string
  onRetry: () => void
  onClose: () => void
}

export function ExerciseCompletionModal({ 
  isOpen, 
  score, 
  totalQuestions,
  exerciseId,
  onRetry,
  onClose 
}: ExerciseCompletionModalProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const isPerfect = score === totalQuestions
  const isGood = percentage >= 70
  const isFair = percentage >= 50

  const [streakData, setStreakData] = useState<{
    streak: number
    highestStreak: number
    completedExercises: number
  } | null>(null)
  const [isUpdatingStreak, setIsUpdatingStreak] = useState(false)

  // Trigger confetti effect and update streak when modal opens
  useEffect(() => {
    if (isOpen && !isUpdatingStreak) {
      // Update streak first
      updateStreak()
      
      // Delay confetti slightly for better effect
      setTimeout(() => {
        if (isPerfect) {
          // Perfect score - big celebration
          const duration = 3000
          const end = Date.now() + duration

          const frame = () => {
            confetti({
              particleCount: 50,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#14b8a6', '#0d9488', '#0f766e']
            })
            confetti({
              particleCount: 50,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#14b8a6', '#0d9488', '#0f766e']
            })

            if (Date.now() < end) {
              requestAnimationFrame(frame)
            }
          }
          frame()
        } else if (isGood) {
          // Good score - medium celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#14b8a6', '#0d9488', '#0f766e']
          })
        } else if (isFair) {
          // Fair score - small celebration
          confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#14b8a6', '#0d9488', '#0f766e']
          })
        }
      }, 200)
    }
  }, [isOpen, isPerfect, isGood, isFair, isUpdatingStreak])

  const updateStreak = async () => {
    setIsUpdatingStreak(true)
    try {
      const response = await fetch('/api/complete-exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          score,
          totalQuestions,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
        console.log('✅ Streak updated:', data)
      }
    } catch (error) {
      console.error('❌ Failed to update streak:', error)
    } finally {
      setIsUpdatingStreak(false)
    }
  }

  // Determine message, icon, and color based on score
  let message = ''
  let Icon = BookOpen
  let bgColor = ''
  let textColor = ''
  let iconColor = ''
  
  if (isPerfect) {
    message = 'Xuất sắc!'
    Icon = Trophy
    bgColor = 'bg-gradient-to-br from-yellow-50 to-yellow-100'
    textColor = 'text-yellow-700'
    iconColor = 'text-yellow-600'
  } else if (isGood) {
    message = 'Rất tốt!'
    Icon = Award
    bgColor = 'bg-gradient-to-br from-green-50 to-green-100'
    textColor = 'text-green-700'
    iconColor = 'text-green-600'
  } else if (isFair) {
    message = 'Khá đấy!'
    Icon = ThumbsUp
    bgColor = 'bg-gradient-to-br from-blue-50 to-blue-100'
    textColor = 'text-blue-700'
    iconColor = 'text-blue-600'
  } else {
    message = 'Cố gắng thêm!'
    Icon = BookOpen
    bgColor = 'bg-gradient-to-br from-gray-50 to-gray-100'
    textColor = 'text-gray-700'
    iconColor = 'text-gray-600'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Decorative Top Bar */}
        <div className={`h-2 ${isPerfect ? 'bg-yellow-400' : isGood ? 'bg-green-400' : isFair ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
        
        {/* Content */}
        <div className="p-8">
          {/* Dolphin Avatar */}
          <div className="flex justify-center mb-6">
            <Image
              src="/dolphin_hello.png"
              alt="Dolphin mascot"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Message with Icon */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Icon className={`w-16 h-16 ${iconColor}`} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Hoàn thành!
            </h2>
            <p className={`text-lg font-semibold ${textColor}`}>
              {message}
            </p>
          </div>

          {/* Score Display */}
          <div className={`${bgColor} rounded-2xl p-6 mb-4`}>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {score}<span className="text-3xl text-gray-600">/{totalQuestions}</span>
              </div>
              <div className="text-lg font-medium text-gray-700">
                Điểm của bạn
              </div>
              <div className="mt-3 text-2xl font-bold" style={{ color: isPerfect ? '#eab308' : isGood ? '#10b981' : isFair ? '#3b82f6' : '#6b7280' }}>
                {percentage}%
              </div>
            </div>
          </div>

          {/* Streak Display */}
          {streakData && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {streakData.streak} ngày
                  </div>
                  <div className="text-sm text-gray-600">
                    Streak hiện tại (Cao nhất: {streakData.highestStreak})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Retry Button */}
            <button
              onClick={onRetry}
              className="w-full px-6 py-4 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Làm lại</span>
            </button>

            {/* Exit Button */}
            <Link href="/exercise" onClick={onClose}>
              <button className="w-full px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <LogOut className="w-5 h-5" />
                <span>Thoát ra</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
