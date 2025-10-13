'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface ExerciseCardProps {
  id: string
  title: string
  description: string
  questions: number
  index: number
  latestScore?: {
    score: number
    totalQuestions: number
    percentage: number
    completedAt: Date
  } | null
}

export function ExerciseCard({ 
  id, 
  title, 
  description, 
  questions,
  latestScore,
  index 
}: ExerciseCardProps) {
  return (
    <Link href={`/exercise/${id}`}>
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
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                {title}
              </h3>
              {latestScore && (
                <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>{questions} câu hỏi</span>
              </div>

              {/* Latest Score */}
              {latestScore && (
                <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-teal-700">
                    {latestScore.percentage}%
                  </span>
                  <span className="text-teal-600">
                    ({latestScore.score}/{latestScore.totalQuestions})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Button */}
          <div className="flex flex-col items-end gap-3 min-w-[120px]">
            <button className="px-6 py-2 bg-teal-500 text-white text-sm font-medium rounded-full hover:bg-teal-600 transition-colors">
              {latestScore ? 'Làm lại' : 'Bắt đầu'}
            </button>
          </div>
        </div>

        {/* Hover indicator - FIXED with overflow-hidden on parent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
