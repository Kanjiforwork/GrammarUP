import ExerciseClient from './exercise-client'  // ✅ Không có .tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

type PageProps = {
  params: { id: string }
}

export default async function ExercisePage({ params }: PageProps) {
  const exerciseId = params.id
  
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

  return <ExerciseClient questions={questions} exerciseTitle={exercise.title} />
}
