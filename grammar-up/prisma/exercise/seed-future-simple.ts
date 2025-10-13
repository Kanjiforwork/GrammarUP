import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Future Simple Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-future-simple' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Future Simple exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-future-simple' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-future-simple' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-future-simple',
      title: 'Future Simple Exercise',
      description: 'Bài tập thì tương lai đơn - 20 câu hỏi',
      lessonId: 'lesson-future-simple',
      sortOrder: 9,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ go to the party tomorrow.',
      concept: 'future_simple_will',
      level: 'A2',
      data: {
        choices: ['go', 'went', 'will go', 'am going'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ pass the exam if she studies hard.',
      concept: 'future_simple_prediction',
      level: 'A2',
      data: {
        choices: ['will', 'is', 'does', 'has'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ not come to the meeting.',
      concept: 'future_simple_negative',
      level: 'A2',
      data: {
        choices: ['do', 'are', 'will', 'have'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: '___ you help me with this problem?',
      concept: 'future_simple_question',
      level: 'A2',
      data: {
        choices: ['Do', 'Are', 'Will', 'Have'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'It ___ rain tomorrow according to the forecast.',
      concept: 'future_simple_prediction',
      level: 'B1',
      data: {
        choices: ['is', 'does', 'will', 'has'],
        answerIndex: 2,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to visit) my grandparents next weekend.',
      concept: 'future_simple_plan',
      level: 'A2',
      data: {
        template: 'I {{1}} my grandparents next weekend.',
        answers: ['will visit'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to call) you later.',
      concept: 'future_simple_promise',
      level: 'A2',
      data: {
        template: 'She {{1}} you later.',
        answers: ['will call'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to be) late for the meeting.',
      concept: 'future_simple_negative',
      level: 'A2',
      data: {
        template: 'They {{1}} late for the meeting.',
        answers: ['will not be'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to start) the project next month.',
      concept: 'future_simple_plan',
      level: 'B1',
      data: {
        template: 'We {{1}} the project next month.',
        answers: ['will start'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to finish) his homework before dinner.',
      concept: 'future_simple_prediction',
      level: 'A2',
      data: {
        template: 'He {{1}} his homework before dinner.',
        answers: ['will finish'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['I', 'will', 'go', 'to', 'school', 'tomorrow'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['She', 'will', 'not', 'come', 'today'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_simple_word_order',
      level: 'B1',
      data: {
        tokens: ['They', 'will', 'travel', 'to', 'Japan', 'next', 'year'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_simple_word_order',
      level: 'A2',
      data: {
        tokens: ['Will', 'you', 'help', 'me'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_simple_word_order',
      level: 'B1',
      data: {
        tokens: ['We', 'will', 'have', 'a', 'meeting', 'next', 'Monday'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Tôi sẽ đi học ngày mai.',
        correctAnswer: 'I will go to school tomorrow.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Cô ấy sẽ gọi cho bạn sau.',
        correctAnswer: 'She will call you later.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_simple_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Họ sẽ không đến hôm nay.',
        correctAnswer: 'They will not come today.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_simple_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Bạn sẽ giúp tôi chứ?',
        correctAnswer: 'Will you help me?',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_simple_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Chúng tôi sẽ đi du lịch Nhật Bản năm sau.',
        correctAnswer: 'We will travel to Japan next year.',
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
        lessonId: 'lesson-future-simple',
        data: questionData.data,
      },
    })
    createdQuestions.push(question)
    console.log(`✅ Created Question ${i + 1}/${questionsData.length}: ${question.type}`)
  }

  // 3. Link Questions to Exercise
  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.exerciseQuestion.create({
      data: {
        exerciseId: exercise.id,
        questionId: createdQuestions[i].id,
        sortOrder: i + 1,
      },
    })
  }
  console.log('✅ Linked all questions to exercise')

  console.log('🎉 Seed completed for Future Simple Exercise!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
