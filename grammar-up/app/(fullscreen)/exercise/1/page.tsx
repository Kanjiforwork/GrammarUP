import ExerciseClient from './exercise-client'
import { PrismaClient } from '@/lib/generated/prisma'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

export default async function ExercisePage() {
  // Fetch the first exercise (Present Simple)
  const exercise = await prisma.exercise.findFirst({
    where: {
      id: 'exercise-present-simple'
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

  // Transform questions to match the expected format
  const questions = exercise.exerciseQuestions.map((eq) => {
    const q = eq.question
    const data = q.data as any

    return {
      id: q.id,
      type: q.type as "MCQ" | "CLOZE" | "ORDER" | "TRANSLATE",
      prompt: q.prompt,
      concept: q.concept,
      // Type-specific data
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