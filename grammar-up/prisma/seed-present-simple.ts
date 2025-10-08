import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Present Simple Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-present-simple' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Present Simple exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-present-simple' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-present-simple' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create standalone Exercise (không link với lesson)
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-present-simple',
      title: 'Present Simple Exercise',
      description: 'Bài tập thì hiện tại đơn - 20 câu hỏi',
      lessonId: 'lesson-present-simple', // Link với lesson Present Simple
      sortOrder: 1,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'He ___ to school every day.',
      concept: 'present_simple_verb',
      level: 'A1',
      data: {
        choices: ['go', 'goes', 'is going', 'went'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ football on Sundays.',
      concept: 'present_simple_verb',
      level: 'A1',
      data: {
        choices: ['play', 'plays', 'is playing', 'played'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ coffee every morning.',
      concept: 'present_simple_frequency',
      level: 'A2',
      data: {
        choices: ['drinks', 'drink', 'is drinking', 'drank'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ TV after school.',
      concept: 'present_simple_routine',
      level: 'A1',
      data: {
        choices: ['watches', 'watch', 'is watching', 'watched'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'Mary ___ to music in her free time.',
      concept: 'present_simple_habit',
      level: 'A2',
      data: {
        choices: ['listens', 'listen', 'is listening', 'listened'],
        answerIndex: 0,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (not / to like) vegetables.',
      concept: 'present_simple_negative',
      level: 'A1',
      data: {
        template: 'I {{1}} vegetables.',
        answers: ['do not like'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to go) to work by bus.',
      concept: 'present_simple_verb',
      level: 'A1',
      data: {
        template: 'He {{1}} to work by bus.',
        answers: ['goes'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to read) books every night.',
      concept: 'present_simple_routine',
      level: 'A2',
      data: {
        template: 'They {{1}} books every night.',
        answers: ['read'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to live) in Hanoi.',
      concept: 'present_simple_fact',
      level: 'A1',
      data: {
        template: 'She {{1}} in Hanoi.',
        answers: ['lives'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to like) chocolate.',
      concept: 'present_simple_preference',
      level: 'A2',
      data: {
        template: 'He {{1}} chocolate.',
        answers: ['likes'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['She', 'goes', 'to', 'school', 'every', 'day'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['We', 'play', 'football', 'on', 'Saturday'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['He', 'drinks', 'coffee', 'in', 'the', 'morning'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['They', 'read', 'books', 'every', 'night'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'present_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['I', 'like', 'tea'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_simple_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Cô ấy đi làm mỗi ngày.',
        correctAnswer: 'She goes to work every day.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Họ chơi bóng vào cuối tuần.',
        correctAnswer: 'They play football on weekends.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_simple_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Tôi không thích rau.',
        correctAnswer: 'I do not like vegetables.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Anh ấy xem TV sau giờ học.',
        correctAnswer: 'He watches TV after school.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'present_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Cô ấy sống ở Hà Nội.',
        correctAnswer: 'She lives in Hanoi.',
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
        lessonId: 'lesson-present-simple', // Link với lesson
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