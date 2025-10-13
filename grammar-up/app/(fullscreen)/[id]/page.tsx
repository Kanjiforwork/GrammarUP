import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { getCurrentUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type PageProps = {
  params: { id: string }
}

async function LessonPageContent({ lessonId }: { lessonId: string }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      blocks: {
        orderBy: { order: 'asc' }
      },
      unit: true
    }
  })

  if (!lesson) {
    notFound()
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Link 
            href="/lessons"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </Link>
          
          <div className="mt-4">
            <div className="text-sm text-teal-600 font-medium mb-2">
              {lesson.unit.title}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {lesson.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {lesson.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="space-y-8">
          {lesson.blocks.map((block, index) => (
            <div
              key={block.id}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:border-teal-200 transition-all"
            >
              {/* Block Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
                    {block.type}
                  </div>
                  <div className="text-sm text-gray-500">
                    UI: {(block.data as any).ui || 'TextArea'}
                  </div>
                </div>
              </div>

              {/* Block Content - Raw JSON for now */}
              <div className="bg-white rounded-xl p-6 border border-gray-100">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-x-auto">
                  {JSON.stringify(block.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {lesson.blocks.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1">Chưa có nội dung</p>
            <p className="text-sm text-gray-500">Bài học này đang được xây dựng</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function LessonPage({ params }: PageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <ProtectedRoute message="Đăng nhập để xem bài học">
        <div />
      </ProtectedRoute>
    )
  }
  
  return <LessonPageContent lessonId={params.id} />
}
