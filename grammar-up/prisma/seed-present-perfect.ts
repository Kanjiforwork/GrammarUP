import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Present Perfect Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-present-perfect' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Present Perfect exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-present-perfect' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-present-perfect' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-present-perfect',
      title: 'Present Perfect Exercise',
      description: 'Bài tập thì hiện tại hoàn thành - 20 câu hỏi',
      lessonId: 'lesson-present-perfect',
      sortOrder: 3,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ to Paris three times.',
      concept: 'present_perfect_experience',
      level: 'A2',
      data: {
        choices: ['go', 'went', 'have been', 'am going'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ her homework yet.',
      concept: 'present_perfect_yet',
      level: 'A2',
      data: {
        choices: ['didn\'t finish', 'hasn\'t finished', 'doesn\'t finish', 'isn\'t finishing'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ English for five years.',
      concept: 'present_perfect_duration',
      level: 'B1',
      data: {
        choices: ['learn', 'learned', 'have learned', 'are learning'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ just ___ his lunch.',
      concept: 'present_perfect_just',
      level: 'A2',
      data: {
        choices: ['has / finished', 'have / finished', 'is / finishing', 'did / finish'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'We ___ never ___ sushi before.',
      concept: 'present_perfect_never',
      level: 'B1',
      data: {
        choices: ['have / eaten', 'has / eaten', 'are / eating', 'did / eat'],
        answerIndex: 0,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to visit) Japan twice.',
      concept: 'present_perfect_experience',
      level: 'A2',
      data: {
        template: 'I {{1}} Japan twice.',
        answers: ['have visited'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to live) here since 2010.',
      concept: 'present_perfect_since',
      level: 'B1',
      data: {
        template: 'She {{1}} here since 2010.',
        answers: ['has lived'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to arrive) yet.',
      concept: 'present_perfect_yet',
      level: 'A2',
      data: {
        template: 'They {{1}} yet.',
        answers: ['have not arrived'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to lose) his keys.',
      concept: 'present_perfect_result',
      level: 'A2',
      data: {
        template: 'He {{1}} his keys.',
        answers: ['has lost'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to know) each other for ten years.',
      concept: 'present_perfect_duration',
      level: 'B1',
      data: {
        template: 'We {{1}} each other for ten years.',
        answers: ['have known'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_word_order',
      level: 'A2',
      data: {
        tokens: ['I', 'have', 'been', 'to', 'London'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_word_order',
      level: 'A2',
      data: {
        tokens: ['She', 'has', 'finished', 'her', 'work'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['They', 'have', 'lived', 'here', 'for', 'five', 'years'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['He', 'has', 'not', 'seen', 'that', 'movie'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_word_order',
      level: 'A2',
      data: {
        tokens: ['We', 'have', 'already', 'eaten'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Tôi đã từng đến Paris.',
        correctAnswer: 'I have been to Paris.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Cô ấy đã sống ở đây từ năm 2010.',
        correctAnswer: 'She has lived here since 2010.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Họ chưa đến.',
        correctAnswer: 'They have not arrived.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Anh ấy đã làm xong bài tập.',
        correctAnswer: 'He has finished his homework.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Chúng tôi đã biết nhau được 10 năm.',
        correctAnswer: 'We have known each other for ten years.',
      },
    },
  ]

  // Create questions
  const createdQuestions = []
  for (let i = 0; i < questionsData.length; i++) {
    const questionData = questionsData[i]
    const question = await prisma.question.create({
      data: {
        type: questionData.type as any,
        prompt: questionData.prompt,
        concept: questionData.concept,
        level: questionData.level as any,
        lessonId: 'lesson-present-perfect',
        data: questionData.data,
      },
    })
    createdQuestions.push(question)
    console.log(`  ✅ Created Question ${i + 1}/20: ${questionData.type} - ${questionData.concept}`)
  }

  // 3. Link questions to exercise
  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.exerciseQuestion.create({
      data: {
        exerciseId: exercise.id,
        questionId: createdQuestions[i].id,
        sortOrder: i + 1,
      },
    })
  }
  console.log(`  ✅ Linked ${createdQuestions.length} questions to exercise`)

  console.log('🎉 Seed completed successfully!')
  console.log(`📦 Created 1 Exercise with 20 Questions (5 MCQ + 5 CLOZE + 5 ORDER + 5 TRANSLATE)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })