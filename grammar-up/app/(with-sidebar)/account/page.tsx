'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProtectedRoute } from '@/components/protected-route'
import { LogoutButton } from '@/components/logout-button'
import Image from 'next/image'
import { Mail, Calendar, TrendingUp, BookOpen, Target } from 'lucide-react'

interface UserStats {
  streak: number
  highestStreak: number
  completedExercises: number
  completedLessons: number
}

function AccountPageContent() {
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [joinDate, setJoinDate] = useState<string>('')
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    highestStreak: 0,
    completedExercises: 0,
    completedLessons: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserEmail(user.email || '')
        setUserName(user.user_metadata?.name || user.user_metadata?.full_name || 'Người dùng')
        setUserAvatar(user.user_metadata?.avatar_url || user.user_metadata?.picture || '')
        
        // Format join date
        const date = new Date(user.created_at)
        setJoinDate(date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }))

        // Fetch user stats from database
        try {
          const response = await fetch('/api/user/stats')
          if (response.ok) {
            const stats = await response.json()
            setUserStats(stats)
          }
        } catch (error) {
          console.error('Failed to fetch user stats:', error)
        }
      }
      
      setIsLoading(false)
    }
    
    loadUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-20 relative">
          {/* Logout Button - Top Right */}
          <div className="absolute bottom-8 right-8">
            <LogoutButton />
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-10">
            {/* Avatar */}
            <div className="relative shrink-0">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={120}
                  height={120}
                  className="rounded-full"
                  priority
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="text-4xl font-semibold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                {userName}
              </h1>
              <div className="flex flex-col md:flex-row gap-4 text-gray-600">
                <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                  <Mail className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium">{userEmail}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                  <Calendar className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium">Tham gia {joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-semibold text-gray-900 mb-16 tracking-tight">
          Thống kê học tập
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Streak Card */}
          <div className="group h-full">
            <div className="border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 transition-all duration-200 hover:border-gray-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Streak
                </span>
              </div>
              
              <div className="space-y-5 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-semibold text-gray-900 tracking-tight">
                    {userStats.streak}
                  </span>
                  <span className="text-lg text-gray-500 ml-1">ngày</span>
                </div>
                <div className="text-sm text-gray-500">
                  Kỷ lục: <span className="font-medium text-gray-900">{userStats.highestStreak} ngày</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lessons Card */}
          <div className="group h-full">
            <div className="border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 transition-all duration-200 hover:border-gray-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bài học
                </span>
              </div>
              
              <div className="space-y-5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-gray-900 tracking-tight">
                    {userStats.completedLessons}
                  </span>
                  <span className="text-3xl font-medium text-gray-300">/</span>
                  <span className="text-3xl font-medium text-gray-400">20</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-900">
                      {Math.round((userStats.completedLessons / 20) * 100)}%
                    </span>
                    <span className="text-gray-400 uppercase tracking-wide">
                      Hoàn thành
                    </span>
                  </div>
                  <div className="relative w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${(userStats.completedLessons / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercises Card */}
          <div className="group h-full">
            <div className="border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 transition-all duration-200 hover:border-gray-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Bài tập
                </span>
              </div>
              
              <div className="space-y-5 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-gray-900 tracking-tight">
                    {userStats.completedExercises}
                  </span>
                  <span className="text-3xl font-medium text-gray-300">/</span>
                  <span className="text-3xl font-medium text-gray-400">50</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-900">
                      {Math.round((userStats.completedExercises / 50) * 100)}%
                    </span>
                    <span className="text-gray-400 uppercase tracking-wide">
                      Hoàn thành
                    </span>
                  </div>
                  <div className="relative w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${(userStats.completedExercises / 50) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <ProtectedRoute message="Đăng nhập để xem tài khoản">
      <AccountPageContent />
    </ProtectedRoute>
  )
}
