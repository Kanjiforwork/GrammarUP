import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Future Perfect Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-future-perfect-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Future Perfect Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-future-perfect-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-future-perfect-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-future-perfect-continuous',
      title: 'Future Perfect Continuous Exercise',
      description: 'Bài tập thì tương lai hoàn thành tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-future-perfect-continuous',
      sortOrder: 12,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'By next month, I ___ working here for five years.',
      concept: 'future_perfect_continuous_duration',
      level: 'B2',
      data: {
        choices: ['will work', 'will have worked', 'will be working', 'will have been working'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ studying for three hours by the time you arrive.',
      concept: 'future_perfect_continuous_by_time',
      level: 'B2',
      data: {
        choices: ['will study', 'will have studied', 'will be studying', 'will have been studying'],
        answerIndex: 3,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ not been traveling for long when they reach Paris.',
      concept: 'future_perfect_continuous_negative',
      level: 'B2',
      data: {
        choices: ['will', 'will have', 'will be', 'have'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'How long ___ you ___ been waiting by the time he arrives?',
      concept: 'future_perfect_continuous_question',
      level: 'B2',
      data: {
        choices: ['will / have', 'will / be', 'have / been', 'do / have'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'By 2026, we ___ living in this house for ten years.',
      concept: 'future_perfect_continuous_by_time',
      level: 'B2',
      data: {
        choices: ['will live', 'will have lived', 'will be living', 'will have been living'],
        answerIndex: 3,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to work) here for five years by next month.',
      concept: 'future_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'I {{1}} here for five years by next month.',
        answers: ['will have been working'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to study) for three hours by 9 PM.',
      concept: 'future_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'She {{1}} for three hours by 9 PM.',
        answers: ['will have been studying'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to play) for long when the rain starts.',
      concept: 'future_perfect_continuous_negative',
      level: 'B2',
      data: {
        template: 'They {{1}} for long when the rain starts.',
        answers: ['will not have been playing'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to travel) for 24 hours by the time we land.',
      concept: 'future_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'We {{1}} for 24 hours by the time we land.',
        answers: ['will have been traveling'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to run) for an hour by the time the race ends.',
      concept: 'future_perfect_continuous_duration',
      level: 'B2',
      data: {
        template: 'He {{1}} for an hour by the time the race ends.',
        answers: ['will have been running'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['I', 'will', 'have', 'been', 'working', 'for', 'five', 'years'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['She', 'will', 'have', 'been', 'studying', 'for', 'three', 'hours'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['They', 'will', 'have', 'been', 'traveling', 'for', '24', 'hours'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['Will', 'you', 'have', 'been', 'waiting', 'long'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['We', 'will', 'have', 'been', 'living', 'here', 'for', 'ten', 'years'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Tôi sẽ đã làm việc ở đây được năm năm vào tháng tới.',
        correctAnswer: 'I will have been working here for five years by next month.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Cô ấy sẽ đã học được ba giờ vào lúc 9 giờ tối.',
        correctAnswer: 'She will have been studying for three hours by 9 PM.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Họ sẽ chưa chơi được lâu khi trời bắt đầu mưa.',
        correctAnswer: 'They will not have been playing for long when the rain starts.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Bạn sẽ đã chờ bao lâu khi anh ấy đến?',
        correctAnswer: 'How long will you have been waiting by the time he arrives?',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Đến năm 2026, chúng tôi sẽ đã sống ở ngôi nhà này được mười năm.',
        correctAnswer: 'By 2026, we will have been living in this house for ten years.',
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
        lessonId: 'lesson-future-perfect-continuous',
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

  console.log('🎉 Seed completed for Future Perfect Continuous Exercise!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
