'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ThumbsUp, Award, BookOpen, RotateCcw, LogOut, Flame } from 'lucide-react'
import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface LessonCompletionModalProps {
  isOpen: boolean
  lessonId: string
  lessonTitle: string
  blocksCompleted: number
  totalBlocks: number
  onRetry: () => void
  onClose: () => void
}

export function LessonCompletionModal({ 
  isOpen, 
  lessonId,
  lessonTitle,
  blocksCompleted,
  totalBlocks,
  onRetry,
  onClose 
}: LessonCompletionModalProps) {
  const percentage = Math.round((blocksCompleted / totalBlocks) * 100)
  const isPerfect = blocksCompleted === totalBlocks
  const isGood = percentage >= 70
  const isFair = percentage >= 50

  const [streakData, setStreakData] = useState<{
    streak: number
    highestStreak: number
    completedLessons: number
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
          // Perfect completion - reduced confetti
          confetti({
            particleCount: 15,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#14b8a6', '#0d9488', '#0f766e']
          })
          confetti({
            particleCount: 15,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#14b8a6', '#0d9488', '#0f766e']
          })
        } else if (isGood) {
          // Good completion - reduced confetti
          confetti({
            particleCount: 30,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#14b8a6', '#0d9488', '#0f766e']
          })
        } else if (isFair) {
          // Fair completion - reduced confetti
          confetti({
            particleCount: 20,
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
      const response = await fetch('/api/complete-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          blocksCompleted,
          totalBlocks,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
        console.log('✅ Lesson streak updated:', data)
      }
    } catch (error) {
      console.error('❌ Failed to update lesson streak:', error)
    } finally {
      setIsUpdatingStreak(false)
    }
  }

  // Determine message and icon based on completion
  let message = ''
  let Icon = BookOpen
  
  if (isPerfect) {
    message = 'Xuất sắc!'
    Icon = Trophy
  } else if (isGood) {
    message = 'Rất tốt!'
    Icon = Award
  } else if (isFair) {
    message = 'Khá đấy!'
    Icon = ThumbsUp
  } else {
    message = 'Cố gắng thêm!'
    Icon = BookOpen
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Decorative Top Bar */}
        <div className={`h-2 bg-teal-400`}></div>
        
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
              <Icon className="w-16 h-16 text-teal-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Hoàn thành!
            </h2>
            <p className="text-lg font-semibold text-gray-600">
              {message}
            </p>
          </div>

          {/* Score Display - White background with teal accent */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {blocksCompleted}<span className="text-3xl text-gray-600">/{totalBlocks}</span>
              </div>
              <div className="text-lg font-medium text-gray-700">
                Phần đã hoàn thành
              </div>
              <div className="mt-3 text-2xl font-bold text-teal-600">
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
              <span>Học lại</span>
            </button>

            {/* Exit Button */}
            <Link href="/lessons" onClick={onClose}>
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