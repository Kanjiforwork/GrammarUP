import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Past Simple Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-past-simple' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Past Simple exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-past-simple' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-past-simple' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-past-simple',
      title: 'Past Simple Exercise',
      description: 'Bài tập thì quá khứ đơn - 20 câu hỏi',
      lessonId: 'lesson-past-simple',
      sortOrder: 5,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ to Paris last year.',
      concept: 'past_simple_regular',
      level: 'A1',
      data: {
        choices: ['go', 'went', 'have gone', 'am going'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ her homework yesterday.',
      concept: 'past_simple_regular',
      level: 'A1',
      data: {
        choices: ['finish', 'finished', 'has finished', 'is finishing'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ football last weekend.',
      concept: 'past_simple_irregular',
      level: 'A2',
      data: {
        choices: ['play', 'played', 'have played', 'are playing'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ a book last night.',
      concept: 'past_simple_irregular',
      level: 'A1',
      data: {
        choices: ['read', 'reads', 'has read', 'is reading'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'We ___ TV yesterday evening.',
      concept: 'past_simple_irregular',
      level: 'A2',
      data: {
        choices: ['watch', 'watched', 'have watched', 'are watching'],
        answerIndex: 1,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to visit) London last summer.',
      concept: 'past_simple_regular',
      level: 'A1',
      data: {
        template: 'I {{1}} London last summer.',
        answers: ['visited'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to buy) a new car last month.',
      concept: 'past_simple_irregular',
      level: 'A2',
      data: {
        template: 'She {{1}} a new car last month.',
        answers: ['bought'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to go) to school yesterday.',
      concept: 'past_simple_negative',
      level: 'A2',
      data: {
        template: 'They {{1}} to school yesterday.',
        answers: ['did not go'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to eat) pizza for dinner.',
      concept: 'past_simple_irregular',
      level: 'A1',
      data: {
        template: 'He {{1}} pizza for dinner.',
        answers: ['ate'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to see) a movie last weekend.',
      concept: 'past_simple_irregular',
      level: 'A2',
      data: {
        template: 'We {{1}} a movie last weekend.',
        answers: ['saw'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['I', 'went', 'to', 'London', 'yesterday'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['She', 'finished', 'her', 'homework'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['They', 'played', 'football', 'last', 'weekend'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['He', 'bought', 'a', 'new', 'car', 'yesterday'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_simple_word_order',
      level: 'A1',
      data: {
        tokens: ['We', 'watched', 'TV', 'last', 'night'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_simple_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Tôi đã đi Paris năm ngoái.',
        correctAnswer: 'I went to Paris last year.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Cô ấy đã làm xong bài tập hôm qua.',
        correctAnswer: 'She finished her homework yesterday.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_simple_translation',
      level: 'A1',
      data: {
        vietnameseText: 'Họ đã chơi bóng đá cuối tuần trước.',
        correctAnswer: 'They played football last weekend.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Anh ấy đã mua một chiếc xe mới hôm qua.',
        correctAnswer: 'He bought a new car yesterday.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Chúng tôi đã xem phim cuối tuần trước.',
        correctAnswer: 'We saw a movie last weekend.',
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
        lessonId: 'lesson-past-simple',
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