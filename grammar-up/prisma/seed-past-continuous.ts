import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Past Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-past-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Past Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-past-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-past-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-past-continuous',
      title: 'Past Continuous Exercise',
      description: 'Bài tập thì quá khứ tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-past-continuous',
      sortOrder: 6,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ TV when you called.',
      concept: 'past_continuous_action',
      level: 'A2',
      data: {
        choices: ['watch', 'watched', 'was watching', 'am watching'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ to music at 8 PM last night.',
      concept: 'past_continuous_time',
      level: 'A2',
      data: {
        choices: ['listens', 'listened', 'was listening', 'is listening'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ football when it started raining.',
      concept: 'past_continuous_interrupted',
      level: 'B1',
      data: {
        choices: ['play', 'played', 'were playing', 'are playing'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'What ___ you ___ at 7 PM yesterday?',
      concept: 'past_continuous_question',
      level: 'B1',
      data: {
        choices: ['do / do', 'did / do', 'were / doing', 'are / doing'],
        answerIndex: 2,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He ___ his homework all afternoon.',
      concept: 'past_continuous_duration',
      level: 'A2',
      data: {
        choices: ['does', 'did', 'was doing', 'is doing'],
        answerIndex: 2,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to read) a book when the phone rang.',
      concept: 'past_continuous_interrupted',
      level: 'A2',
      data: {
        template: 'I {{1}} a book when the phone rang.',
        answers: ['was reading'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to cook) dinner at 6 PM.',
      concept: 'past_continuous_time',
      level: 'A2',
      data: {
        template: 'She {{1}} dinner at 6 PM.',
        answers: ['was cooking'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to study) when I arrived.',
      concept: 'past_continuous_interrupted',
      level: 'B1',
      data: {
        template: 'They {{1}} when I arrived.',
        answers: ['were studying'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (not / to sleep) at midnight.',
      concept: 'past_continuous_negative',
      level: 'B1',
      data: {
        template: 'He {{1}} at midnight.',
        answers: ['was not sleeping'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to watch) a movie all evening.',
      concept: 'past_continuous_duration',
      level: 'A2',
      data: {
        template: 'We {{1}} a movie all evening.',
        answers: ['were watching'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_continuous_word_order',
      level: 'A2',
      data: {
        tokens: ['I', 'was', 'reading', 'a', 'book'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_continuous_word_order',
      level: 'A2',
      data: {
        tokens: ['She', 'was', 'cooking', 'dinner'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['They', 'were', 'playing', 'football', 'at', '5', 'PM'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_continuous_word_order',
      level: 'A2',
      data: {
        tokens: ['He', 'was', 'studying', 'English'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['We', 'were', 'watching', 'TV', 'when', 'you', 'called'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_continuous_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Tôi đang xem TV khi bạn gọi.',
        correctAnswer: 'I was watching TV when you called.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_continuous_translation',
      level: 'A2',
      data: {
        vietnameseText: 'Cô ấy đang nấu bữa tối lúc 6 giờ tối.',
        correctAnswer: 'She was cooking dinner at 6 PM.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Họ đang chơi bóng đá khi trời bắt đầu mưa.',
        correctAnswer: 'They were playing football when it started raining.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Anh ấy đang làm bài tập cả buổi chiều.',
        correctAnswer: 'He was doing his homework all afternoon.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Chúng tôi đang học khi tôi đến.',
        correctAnswer: 'We were studying when I arrived.',
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
        lessonId: 'lesson-past-continuous',
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