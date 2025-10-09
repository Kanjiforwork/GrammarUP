'use client'

import { ExerciseCard } from '@/components/ExerciseCard'
import { CreateExerciseModal } from '@/components/CreateExerciseModal'
import { CirclePlus } from "lucide-react"
import { useState, useEffect } from 'react'

export default function ExercisePage() {
  const [exercises, setExercises] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch exercises from API
    const fetchExercises = async () => {
      try {
        const response = await fetch('/api/exercises')
        if (response.ok) {
          const data = await response.json()
          setExercises(data)
        } else {
          console.error('Failed to fetch exercises')
        }
      } catch (error) {
        console.error('Error fetching exercises:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [])

  return (
    <>
      <div className="w-full min-h-screen bg-white">
        <div className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-8 py-8 relative">
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">
              Bài tập
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              Luyện tập ngữ pháp tiếng Anh - {exercises.length} bài tập
            </p>
            
            {/* Add Exercise Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-8 top-12 px-5 py-3 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-semibold"
            >
              <span>Thêm bài tập</span>
              <CirclePlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Đang tải bài tập...
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có bài tập nào
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {exercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  id={exercise.id}
                  title={exercise.title}
                  description={exercise.description || 'Luyện tập ngữ pháp'}
                  questions={exercise._count.exerciseQuestions}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <CreateExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
