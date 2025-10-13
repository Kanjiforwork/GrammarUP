import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import LessonClient from '../../lesson/[id]/lesson-client'

// Map slug to lesson ID
const SLUG_TO_LESSON_ID: Record<string, string> = {
  'lesson-present-simple': 'lesson-present-simple',
  // Add more mappings as needed
}

export default async function LessonSlugPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  
  // Lấy lessonId từ slug
  const lessonId = SLUG_TO_LESSON_ID[slug]
  
  if (!lessonId) {
    notFound()
  }

  // Fetch lesson data từ database
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: true,
      blocks: {
        include: {
          question: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!lesson) {
    notFound()
  }

  // Transform blocks data
  const blocks = lesson.blocks.map(block => ({
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
      unitTitle={lesson.unit?.title || ''}
      blocks={blocks}
    />
  )
}