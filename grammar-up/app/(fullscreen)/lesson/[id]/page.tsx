import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { getCurrentUser } from '@/lib/auth/get-user'
import LessonClient from './lesson-client'

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

  const blocks = lesson.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    order: block.order,
    data: block.data
  }))

  return (
    <LessonClient
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      lessonDescription={lesson.description || ''}
      unitTitle={lesson.unit.title}
      blocks={blocks}
    />
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
