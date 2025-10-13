'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface LessonCardProps {
  id: number
  title: string
  description: string
  progress: number
  lessons: number
  duration: string
  index: number
  lessonId: string // Add lessonId for routing
}

export function LessonCard({ 
  id, 
  title, 
  description, 
  progress, 
  lessons,
  duration,
  lessonId,
  index 
}: LessonCardProps) {
  const isCompleted = progress === 100
  
  return (
    <Link href={`/lesson/${lessonId}`}>
      <div
        className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-teal-500 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
        style={{
          animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
        }}
      >
        <div className="flex items-start justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500 text-white font-bold text-sm">
                {id}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                {title}
              </h3>
              {isCompleted && (
                <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4 ml-11">
              {description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-500 ml-11">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{lessons} câu hỏi</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{duration}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Progress & Button */}
          <div className="flex flex-col items-end gap-3 min-w-[120px]">

            
            {/* Button */}
            <button className="px-6 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors">
              {isCompleted ? 'Ôn lại' : 'Bắt đầu'}
            </button>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Keyframes */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </Link>
  )
}