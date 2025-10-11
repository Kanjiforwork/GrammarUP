import ExerciseClient from './exercise-client'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { getCurrentUser } from '@/lib/auth/get-user'

type PageProps = {
  params: { id: string }
}

async function ExercisePageContent({ exerciseId }: { exerciseId: string }) {
  const exercise = await prisma.exercise.findUnique({
    where: {
      id: exerciseId
    },
    include: {
      exerciseQuestions: {
        include: {
          question: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  if (!exercise) {
    notFound()
  }

  const questions = exercise.exerciseQuestions.map((eq: any) => {
    const q = eq.question
    const data = q.data as any

    return {
      id: q.id,
      type: q.type as "MCQ" | "CLOZE" | "ORDER" | "TRANSLATE",
      prompt: q.prompt,
      concept: q.concept,
      choices: data.choices,
      answerIndex: data.answerIndex,
      template: data.template,
      answers: data.answers,
      tokens: data.tokens,
      vietnameseText: data.vietnameseText,
      correctAnswer: data.correctAnswer,
    }
  })

  return <ExerciseClient questions={questions} exerciseTitle={exercise.title} exerciseId={exercise.id} />
}

export default async function ExercisePage({ params }: PageProps) {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <ProtectedRoute message="Đăng nhập để làm bài tập">
        <div />
      </ProtectedRoute>
    )
  }
  
  return <ExercisePageContent exerciseId={params.id} />
}
