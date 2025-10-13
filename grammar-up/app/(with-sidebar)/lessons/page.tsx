'use client'

import { LessonCard } from '@/components/LessonCard'
import { CreateLessonModal } from '@/components/CreateLessonModal'
import { ProtectedRoute } from '@/components/protected-route'
import { CirclePlus, Search, BookOpen, UserRound } from "lucide-react"
import { useState, useEffect, useMemo } from 'react'

type FilterType = 'all' | 'official' | 'user'

function LessonsPageContent() {
  const [lessons, setLessons] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const fetchLessons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lessons')
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      } else {
        console.error('Failed to fetch lessons')
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLessons()
  }, [])

  const handleLessonCreated = () => {
    // Reload lessons after successful creation
    fetchLessons()
  }

  // Filter lessons based on search query and filter type
  const filteredLessons = useMemo(() => {
    let result = lessons
    
    // Apply source filter
    if (filterType === 'official') {
      result = result.filter(lesson => lesson.unit?.title !== 'Generated Lessons')
    } else if (filterType === 'user') {
      result = result.filter(lesson => lesson.unit?.title === 'Generated Lessons')
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(lesson => 
        lesson.title.toLowerCase().includes(query) ||
        lesson.description?.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [lessons, searchQuery, filterType])

  return (
    <>
      <div className="w-full min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-8 py-6">
            {/* Single Row: Title, Search Bar, Button */}
            <div className="flex items-center gap-6">
              {/* Left: Title and Count */}
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Khóa học
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {filteredLessons.length} bài học
                </p>
              </div>

              {/* Center: Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Right: Add Lesson Button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-shrink-0 px-5 py-3 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-semibold whitespace-nowrap"
                >
                  <span>Thêm bài học</span>
                  <CirclePlus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filterType === 'all'
                    ? 'bg-teal-50 text-teal-700 border-2 border-teal-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilterType('official')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  filterType === 'official'
                    ? 'bg-teal-50 text-teal-700 border-2 border-teal-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Bài chính thức</span>
              </button>
              <button
                onClick={() => setFilterType('user')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  filterType === 'user'
                    ? 'bg-teal-50 text-teal-700 border-2 border-teal-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <UserRound className="w-4 h-4" />
                <span>Bài của tôi</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Đang tải bài học...
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery || filterType !== 'all' ? (
                <div>
                  <p className="text-gray-500 mb-2">Không tìm thấy bài học nào</p>
                  <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                <p className="text-gray-500">Chưa có bài học nào</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-y-4">
              {filteredLessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  id={index + 1}
                  title={lesson.title}
                  description={lesson.description || 'Học ngữ pháp tiếng Anh'}
                  progress={0}
                  lessons={lesson._count?.blocks || 0}
                  duration={`${Math.ceil((lesson._count?.blocks || 0) * 2)} phút`}
                  lessonId={lesson.id}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Lesson Modal */}
      <CreateLessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLessonCreated}
      />
    </>
  )
}

export default function LessonsPage() {
  return (
    <ProtectedRoute message="Đăng nhập để xem khóa học">
      <LessonsPageContent />
    </ProtectedRoute>
  )
}
