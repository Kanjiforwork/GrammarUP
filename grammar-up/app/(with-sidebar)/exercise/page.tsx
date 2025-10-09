import { ExerciseCard } from '@/components/ExerciseCard'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export default async function ExercisePage() {
  // Fetch all exercises from database
  const exercises = await prisma.exercise.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      lesson: true,
      _count: {
        select: {
          exerciseQuestions: true,
          
        },
      },
    },
  })

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-1">
            Bài tập
          </h1>
          <p className="text-sm text-gray-600">
            Luyện tập ngữ pháp tiếng Anh - {exercises.length} bài tập
          </p>
        </div>
      </div>

      {/* Exercises List */}
      <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex flex-col gap-4">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                id={index + 1}
                title={exercise.title}
                description={exercise.description || 'Luyện tập ngữ pháp'}
                questions={exercise._count.exerciseQuestions}
                index={index}
              />
            ))}
          </div>
      </div>
    </div>
  );
}