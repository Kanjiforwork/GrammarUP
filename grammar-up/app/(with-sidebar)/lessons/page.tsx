import { LessonCard } from '@/components/LessonCard'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export default async function LessonsPage() {
  // Fetch all lessons from database
  const lessons = await prisma.lesson.findMany({
    orderBy: {
      sortOrder: 'asc',
    },
    include: {
      unit: true,
      _count: {
        select: {
          questions: true,
          exercises: true,
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
            Khóa học
          </h1>
          <p className="text-sm text-gray-600">
            Học ngữ pháp tiếng Anh hiệu quả - 12 thì trong tiếng Anh
          </p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              id={index + 1}
              title={lesson.title}
              description={lesson.description || 'Học ngữ pháp tiếng Anh'}
              progress={0}
              lessons={lesson._count.questions}
              duration={`${Math.ceil(lesson._count.questions * 2)} phút`}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}