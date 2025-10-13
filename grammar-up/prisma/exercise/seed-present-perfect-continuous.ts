import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Present Perfect Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-present-perfect-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Present Perfect Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-present-perfect-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-present-perfect-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-present-perfect-continuous',
      title: 'Present Perfect Continuous Exercise',
      description: 'Bài tập thì hiện tại hoàn thành tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-present-perfect-continuous',
      sortOrder: 4,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ English for three hours.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        choices: ['study', 'have studied', 'have been studying', 'am studying'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ all morning.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        choices: ['works', 'has worked', 'has been working', 'is working'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ for you since 2 PM.',
      concept: 'present_perfect_continuous_since',
      level: 'B1',
      data: {
        choices: ['wait', 'have waited', 'have been waiting', 'are waiting'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'How long ___ you ___ here?',
      concept: 'present_perfect_continuous_question',
      level: 'B2',
      data: {
        choices: ['do / live', 'have / lived', 'have / been living', 'are / living'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ his homework for two hours.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        choices: ['does', 'has done', 'has been doing', 'is doing'],
        answerIndex: 2,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to study) English for three years.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'I {{1}} English for three years.',
        answers: ['have been studying'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to work) here since 2020.',
      concept: 'present_perfect_continuous_since',
      level: 'B1',
      data: {
        template: 'She {{1}} here since 2020.',
        answers: ['has been working'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to play) football all afternoon.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'They {{1}} football all afternoon.',
        answers: ['have been playing'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to read) that book for weeks.',
      concept: 'present_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'He {{1}} that book for weeks.',
        answers: ['has been reading'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to wait) for the bus for 30 minutes.',
      concept: 'present_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'We {{1}} for the bus for 30 minutes.',
        answers: ['have been waiting'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['I', 'have', 'been', 'studying', 'English'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['She', 'has', 'been', 'working', 'all', 'day'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['They', 'have', 'been', 'waiting', 'for', 'hours'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['He', 'has', 'been', 'playing', 'football'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['We', 'have', 'been', 'learning', 'grammar', 'since', 'morning'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Tôi đã học tiếng Anh được 3 năm.',
        correctAnswer: 'I have been studying English for three years.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Cô ấy đã làm việc ở đây từ năm 2020.',
        correctAnswer: 'She has been working here since 2020.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Họ đã chơi bóng đá cả buổi chiều.',
        correctAnswer: 'They have been playing football all afternoon.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Anh ấy đã đọc cuốn sách đó được nhiều tuần.',
        correctAnswer: 'He has been reading that book for weeks.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Chúng tôi đã đợi xe buýt được 30 phút.',
        correctAnswer: 'We have been waiting for the bus for 30 minutes.',
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
        lessonId: 'lesson-present-perfect-continuous',
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