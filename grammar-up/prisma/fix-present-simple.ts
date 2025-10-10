import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Present Simple exercise...')
  
  // Find the exercise
  const exercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-present-simple' }
  })
  
  if (!exercise) {
    console.log('❌ Exercise not found!')
    return
  }
  
  console.log('✅ Exercise found:', exercise.title)
  
  // Find questions by lessonId
  const questions = await prisma.question.findMany({
    where: {
      lessonId: 'lesson-present-simple'
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  console.log('📝 Found questions:', questions.length)
  
  if (questions.length === 0) {
    console.log('❌ No questions found!')
    return
  }
  
  // Delete existing ExerciseQuestions for this exercise
  await prisma.exerciseQuestion.deleteMany({
    where: {
      exerciseId: 'exercise-present-simple'
    }
  })
  
  console.log('🗑️  Deleted old exercise questions')
  
  // Create new ExerciseQuestion records
  for (let i = 0; i < questions.length; i++) {
    await prisma.exerciseQuestion.create({
      data: {
        exerciseId: 'exercise-present-simple',
        questionId: questions[i].id,
        sortOrder: i
      }
    })
  }
  
  console.log('✅ Created', questions.length, 'exercise questions')
  console.log('🎉 Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
