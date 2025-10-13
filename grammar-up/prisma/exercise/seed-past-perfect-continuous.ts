import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Past Perfect Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-past-perfect-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Past Perfect Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-past-perfect-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-past-perfect-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-past-perfect-continuous',
      title: 'Past Perfect Continuous Exercise',
      description: 'Bài tập thì quá khứ hoàn thành tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-past-perfect-continuous',
      sortOrder: 8,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ for two hours when you arrived.',
      concept: 'past_perfect_continuous_duration',
      level: 'B1',
      data: {
        choices: ['waited', 'was waiting', 'have been waiting', 'had been waiting'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ English for five years before she moved to London.',
      concept: 'past_perfect_continuous_before_past',
      level: 'B2',
      data: {
        choices: ['studied', 'was studying', 'has been studying', 'had been studying'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ for three hours when the rain stopped.',
      concept: 'past_perfect_continuous_duration',
      level: 'B1',
      data: {
        choices: ['were running', 'ran', 'have been running', 'had been running'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'How long ___ you ___ before you found a job?',
      concept: 'past_perfect_continuous_question',
      level: 'B2',
      data: {
        choices: ['were / looking', 'did / look', 'have / been looking', 'had / been looking'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'He was tired because he ___ all day.',
      concept: 'past_perfect_continuous_cause',
      level: 'B1',
      data: {
        choices: ['worked', 'was working', 'has been working', 'had been working'],
        answerIndex: 3,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to study) for three hours before the exam started.',
      concept: 'past_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'I {{1}} for three hours before the exam started.',
        answers: ['had been studying'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to work) at the company for ten years when she resigned.',
      concept: 'past_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'She {{1}} at the company for ten years when she resigned.',
        answers: ['had been working'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (to wait) for an hour before the bus arrived.',
      concept: 'past_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'They {{1}} for an hour before the bus arrived.',
        answers: ['had been waiting'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (not / to sleep) well for weeks before he saw the doctor.',
      concept: 'past_perfect_continuous_negative',
      level: 'B2',
      data: {
        template: 'He {{1}} well for weeks before he saw the doctor.',
        answers: ['had not been sleeping'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to live) in Paris for five years before we moved to Tokyo.',
      concept: 'past_perfect_continuous_duration',
      level: 'B1',
      data: {
        template: 'We {{1}} in Paris for five years before we moved to Tokyo.',
        answers: ['had been living'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['I', 'had', 'been', 'waiting', 'for', 'two', 'hours'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['She', 'had', 'been', 'studying', 'English', 'for', 'five', 'years'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['They', 'had', 'been', 'living', 'there', 'before', 'they', 'moved'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['He', 'had', 'been', 'working', 'all', 'day'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'past_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['We', 'had', 'been', 'playing', 'for', 'an', 'hour', 'when', 'it', 'rained'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Tôi đã đang chờ hai giờ khi bạn đến.',
        correctAnswer: 'I had been waiting for two hours when you arrived.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Cô ấy đã học tiếng Anh được năm năm trước khi chuyển đến London.',
        correctAnswer: 'She had been studying English for five years before she moved to London.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Họ đã chạy được ba giờ khi trời ngừng mưa.',
        correctAnswer: 'They had been running for three hours when the rain stopped.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Anh ấy mệt vì anh ấy đã làm việc cả ngày.',
        correctAnswer: 'He was tired because he had been working all day.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'past_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Chúng tôi đã sống ở Paris được năm năm trước khi chuyển đến Tokyo.',
        correctAnswer: 'We had been living in Paris for five years before we moved to Tokyo.',
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
        lessonId: 'lesson-past-perfect-continuous',
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

  console.log('🎉 Seed completed for Past Perfect Continuous Exercise!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
