import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Present Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-present-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Present Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-present-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-present-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-present-continuous',
      title: 'Present Continuous Exercise',
      description: 'Bài tập thì hiện tại tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-present-continuous',
      sortOrder: 2,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'She ___ a book right now.',
      concept: 'present_continuous_action',
      level: 'A1',
      data: {
        choices: ['reads', 'is reading', 'read', 'was reading'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ football at the moment.',
      concept: 'present_continuous_action',
      level: 'A1',
      data: {
        choices: ['play', 'are playing', 'played', 'plays'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'I ___ to music now.',
      concept: 'present_continuous_action',
      level: 'A2',
      data: {
        choices: ['listen', 'am listening', 'listened', 'listens'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ his homework at the moment.',
      concept: 'present_continuous_action',
      level: 'A1',
      data: {
        choices: ['does', 'is doing', 'did', 'do'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'We ___ TV right now.',
      concept: 'present_continuous_action',
      level: 'A2',
      data: {
        choices: ['watch', 'are watching', 'watched', 'watches'],
        answerIndex: 1,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to cook) dinner now.',
      concept: 'present_continuous_verb',
      level: 'A1',
      data: {
        template: 'She {{1}} dinner now.',
        answers: ['is cooking'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to study) English at the moment.',
      concept: 'present_continuous_verb',
      level: 'A1',
      data: {
        template: 'They {{1}} English at the moment.',
        answers: ['are studying'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (not / to sleep) right now.',
      concept: 'present_continuous_negative',
      level: 'A2',
      data: {
        template: 'I {{1}} right now.',
        answers: ['am not sleeping'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to run) in the park.',
      concept: 'present_continuous_verb',
      level: 'A1',
      data: {
        template: 'He {{1}} in the park.',
        answers: ['is running'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to learn) grammar now.',
      concept: 'present_continuous_verb',
      level: 'A2',
      data: {
        template: 'We {{1}} grammar now.',
        answers: ['are learning'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_continuous_word_order',
      level: 'A1',
      data: {
        tokens: ['She', 'is', 'reading', 'a', 'book', 'now'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_continuous_word_order',
      level: 'A1',
      data: {
        tokens: ['They', 'are', 'playing', 'football'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_continuous_word_order',
      level: 'A2',
      data: {
        tokens: ['I', 'am', 'studying', 'English', 'right', 'now'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_continuous_word_order',
      level: 'A2',
      data: {
        tokens: ['He', 'is', 'watching', 'TV', 'at', 'the', 'moment'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_continuous_word_order',
      level: 'A1',
      data: {
        tokens: ['We', 'are', 'eating', 'lunch'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_continuous_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Cô ấy đang đọc sách.',
        correctAnswer: 'She is reading a book.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_continuous_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Họ đang chơi bóng đá.',
        correctAnswer: 'They are playing football.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_continuous_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Tôi đang học tiếng Anh.',
        correctAnswer: 'I am studying English.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_continuous_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Anh ấy đang xem TV.',
        correctAnswer: 'He is watching TV.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_continuous_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Chúng tôi đang ăn trưa.',
        correctAnswer: 'We are eating lunch.',
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
        lessonId: 'lesson-present-continuous',
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