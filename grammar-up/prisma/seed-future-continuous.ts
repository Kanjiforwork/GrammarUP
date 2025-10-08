import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Future Continuous Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-future-continuous' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Future Continuous exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-future-continuous' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-future-continuous' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-future-continuous',
      title: 'Future Continuous Exercise',
      description: 'Bài tập thì tương lai tiếp diễn - 20 câu hỏi',
      lessonId: 'lesson-future-continuous',
      sortOrder: 10,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ working at 8 PM tonight.',
      concept: 'future_continuous_specific_time',
      level: 'B1',
      data: {
        choices: ['will work', 'will be working', 'am working', 'work'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ studying when you arrive.',
      concept: 'future_continuous_action_in_progress',
      level: 'B1',
      data: {
        choices: ['will study', 'will be studying', 'studies', 'is studying'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ not traveling next month.',
      concept: 'future_continuous_negative',
      level: 'B1',
      data: {
        choices: ['will', 'will be', 'are', 'were'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'What ___ you ___ doing at this time tomorrow?',
      concept: 'future_continuous_question',
      level: 'B1',
      data: {
        choices: ['will / be', 'are / be', 'do / be', 'have / been'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'This time next week, we ___ lying on the beach.',
      concept: 'future_continuous_specific_time',
      level: 'B2',
      data: {
        choices: ['will lie', 'will be lying', 'are lying', 'lie'],
        answerIndex: 1,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to watch) TV at 9 PM tonight.',
      concept: 'future_continuous_specific_time',
      level: 'B1',
      data: {
        template: 'I {{1}} TV at 9 PM tonight.',
        answers: ['will be watching'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to sleep) when you call her.',
      concept: 'future_continuous_action_in_progress',
      level: 'B1',
      data: {
        template: 'She {{1}} when you call her.',
        answers: ['will be sleeping'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to work) tomorrow afternoon.',
      concept: 'future_continuous_negative',
      level: 'B1',
      data: {
        template: 'They {{1}} tomorrow afternoon.',
        answers: ['will not be working'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to travel) to Paris this time next month.',
      concept: 'future_continuous_specific_time',
      level: 'B2',
      data: {
        template: 'We {{1}} to Paris this time next month.',
        answers: ['will be traveling'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to play) football at 5 PM.',
      concept: 'future_continuous_specific_time',
      level: 'B1',
      data: {
        template: 'He {{1}} football at 5 PM.',
        answers: ['will be playing'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['I', 'will', 'be', 'working', 'at', '8', 'PM'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['She', 'will', 'be', 'studying', 'tomorrow', 'morning'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['They', 'will', 'be', 'traveling', 'to', 'Japan', 'next', 'week'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_continuous_word_order',
      level: 'B1',
      data: {
        tokens: ['Will', 'you', 'be', 'sleeping', 'at', 'midnight'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_continuous_word_order',
      level: 'B2',
      data: {
        tokens: ['We', 'will', 'not', 'be', 'working', 'this', 'time', 'tomorrow'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Tôi sẽ đang làm việc lúc 8 giờ tối nay.',
        correctAnswer: 'I will be working at 8 PM tonight.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Cô ấy sẽ đang học khi bạn đến.',
        correctAnswer: 'She will be studying when you arrive.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Họ sẽ không đi du lịch tháng sau.',
        correctAnswer: 'They will not be traveling next month.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_continuous_translation',
      level: 'B1',
      data: {
        vietnameseText: 'Bạn sẽ đang làm gì vào lúc này ngày mai?',
        correctAnswer: 'What will you be doing at this time tomorrow?',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_continuous_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Vào thời điểm này tuần sau, chúng tôi sẽ đang nằm trên bãi biển.',
        correctAnswer: 'This time next week, we will be lying on the beach.',
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
        lessonId: 'lesson-future-continuous',
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

  console.log('🎉 Seed completed for Future Continuous Exercise!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
