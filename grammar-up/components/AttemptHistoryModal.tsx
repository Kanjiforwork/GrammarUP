'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, Trophy, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface AttemptRecord {
  exerciseId: string
  exerciseName: string
  score: number
  totalQuestions: number
  percentage: number
  completedAt: string
}

interface AttemptHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AttemptHistoryModal({ isOpen, onClose }: AttemptHistoryModalProps) {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [loadingExerciseId, setLoadingExerciseId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchAttempts(1)
    }
  }, [isOpen])

  const fetchAttempts = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/attempts?page=${page}`)
      if (response.ok) {
        const data = await response.json()
        setAttempts(data.attempts)
        setCurrentPage(data.pagination.currentPage)
        setTotalPages(data.pagination.totalPages)
        setHasMore(data.pagination.hasMore)
      }
    } catch (error) {
      console.error('Failed to fetch attempts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAttempts(newPage)
    }
  }

  const handleRetryClick = (exerciseId: string) => {
    setLoadingExerciseId(exerciseId)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`
    } else if (diffInHours < 48) {
      return 'Hôm qua'
    } else {
      return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-200'
    if (percentage >= 70) return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-200'
    if (percentage >= 50) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-200'
    return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white shadow-gray-200'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Lịch sử làm bài</h2>
            <p className="text-sm text-gray-500 mt-1">Xem lại các lần làm bài tập của bạn</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin mb-4" />
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">Chưa có lịch sử</p>
              <p className="text-sm text-gray-500">Bắt đầu làm bài tập để xem kết quả ở đây</p>
            </div>
          ) : (
            <div className="space-y-5">
              {attempts.map((attempt, index) => (
                <div
                  key={`${attempt.exerciseId}-${attempt.completedAt}-${index}`}
                  className="relative border border-gray-200 rounded-2xl p-5 transition-all"
                >
                  {/* Loading Overlay */}
                  {loadingExerciseId === attempt.exerciseId && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-gray-700">Đang tải...</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    {/* Left: Exercise info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">
                        {attempt.exerciseName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(attempt.completedAt)}</span>
                      </div>
                    </div>

  {/* Middle: Score badge */}
  <div className={`w-20 h-20 flex flex-col items-center px-4 py-3 rounded-xl border-2 }`}>
                      <div className="text-2xl text-gray-600 font-bold">
                        {attempt.percentage}%
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                    </div>

                    {/* Right: Retry button */}
                    <div className="shrink-0">
                      <Link href={`/exercise/${attempt.exerciseId}`}>
                        <button 
                          onClick={() => handleRetryClick(attempt.exerciseId)}
                          disabled={loadingExerciseId === attempt.exerciseId}
                          className="flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Làm lại</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-600">
              Trang <span className="font-semibold text-gray-900">{currentPage}</span> / {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
