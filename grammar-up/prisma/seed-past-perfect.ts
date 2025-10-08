import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Past Perfect Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-past-perfect' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Past Perfect exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-past-perfect' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-past-perfect' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-past-perfect',
      title: 'Past Perfect Exercise',
      description: 'Bài tập thì quá khứ hoàn thành - 20 câu hỏi',
      lessonId: 'lesson-past-perfect',
      sortOrder: 7,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'When I arrived, they ___ already ___.',
      concept: 'past_perfect_before_past',
      level: 'B1',
      data: {
        choices: ['have / left', 'had / left', 'were / leaving', 'did / leave'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ her homework before she went out.',
      concept: 'past_perfect_completion',
      level: 'B1',
      data: {
        choices: ['finished', 'had finished', 'has finished', 'was finishing'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'I ___ never ___ to Paris before that trip.',
      concept: 'past_perfect_experience',
      level: 'B1',
      data: {
        choices: ['have / been', 'had / been', 'was / being', 'did / go'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They were tired because they ___ all day.',
      concept: 'past_perfect_reason',
      level: 'B2',
      data: {
        choices: ['work', 'worked', 'had worked', 'have worked'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He realized he ___ his keys at home.',
      concept: 'past_perfect_realization',
      level: 'B1',
      data: {
        choices: ['forgot', 'had forgotten', 'has forgotten', 'was forgetting'],
        answerIndex: 1,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: When I arrived, she ___ (already / to leave).',
      concept: 'past_perfect_before_past',
      level: 'B1',
      data: {
        template: 'When I arrived, she {{1}}.',
        answers: ['had already left'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to finish) his work before 5 PM.',
      concept: 'past_perfect_completion',
      level: 'B1',
      data: {
        template: 'He {{1}} his work before 5 PM.',
        answers: ['had finished'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to eat) before I got home.',
      concept: 'past_perfect_before_past',
      level: 'B1',
      data: {
        template: 'They {{1}} before I got home.',
        answers: ['had eaten'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (not / to see) that movie before.',
      concept: 'past_perfect_negative',
      level: 'B1',
      data: {
        template: 'She {{1}} that movie before.',
        answers: ['had not seen'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to meet) him before the party.',
      concept: 'past_perfect_before_past',
      level: 'B1',
      data: {
        template: 'We {{1}} him before the party.',
        answers: ['had met'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['I', 'had', 'finished', 'my', 'homework'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['She', 'had', 'already', 'left'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['They', 'had', 'eaten', 'before', 'I', 'arrived'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['He', 'had', 'never', 'been', 'to', 'London'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_word_order',
      level: 'B1',
      data: {
        tokens: ['We', 'had', 'met', 'him', 'before'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Khi tôi đến, họ đã rời đi rồi.',
        correctAnswer: 'When I arrived, they had already left.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Cô ấy đã hoàn thành bài tập trước khi đi chơi.',
        correctAnswer: 'She had finished her homework before she went out.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Tôi chưa bao giờ đến Paris trước chuyến đi đó.',
        correctAnswer: 'I had never been to Paris before that trip.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Họ mệt vì đã làm việc cả ngày.',
        correctAnswer: 'They were tired because they had worked all day.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Anh ấy nhận ra đã quên chìa khóa ở nhà.',
        correctAnswer: 'He realized he had forgotten his keys at home.',
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
        lessonId: 'lesson-past-perfect',
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