import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL,
    },
  },
})

async function main() {
  console.log('🌱 Starting seed for Future Perfect Exercise...')

  // Clean up existing data first
  const existingExercise = await prisma.exercise.findUnique({
    where: { id: 'exercise-future-perfect' },
  })

  if (existingExercise) {
    console.log('🧹 Cleaning existing Future Perfect exercise...')
    await prisma.exerciseQuestion.deleteMany({
      where: { exerciseId: 'exercise-future-perfect' },
    })
    await prisma.exercise.delete({
      where: { id: 'exercise-future-perfect' },
    })
    console.log('✅ Cleaned old data')
  }

  // 1. Create Exercise
  const exercise = await prisma.exercise.create({
    data: {
      id: 'exercise-future-perfect',
      title: 'Future Perfect Exercise',
      description: 'Bài tập thì tương lai hoàn thành - 20 câu hỏi',
      lessonId: 'lesson-future-perfect',
      sortOrder: 11,
    },
  })
  console.log('✅ Created Exercise:', exercise.title)

  // 2. Create 20 Questions
  const questionsData = [
    // 5 MCQ
    {
      type: 'MCQ',
      prompt: 'I ___ finished my homework by 9 PM.',
      concept: 'future_perfect_completion',
      level: 'B2',
      data: {
        choices: ['will finish', 'will have finished', 'will be finishing', 'have finished'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'She ___ graduated by next June.',
      concept: 'future_perfect_by_time',
      level: 'B2',
      data: {
        choices: ['will graduate', 'will have graduated', 'will be graduating', 'has graduated'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: 'They ___ not completed the project by Friday.',
      concept: 'future_perfect_negative',
      level: 'B2',
      data: {
        choices: ['will', 'will have', 'will be', 'have'],
        answerIndex: 1,
      },
    },
    {
      type: 'MCQ',
      prompt: '___ you ___ finished your work by 5 PM?',
      concept: 'future_perfect_question',
      level: 'B2',
      data: {
        choices: ['Will / have', 'Will / be', 'Have / been', 'Do / have'],
        answerIndex: 0,
      },
    },
    {
      type: 'MCQ',
      prompt: 'By 2030, they ___ built the new bridge.',
      concept: 'future_perfect_by_time',
      level: 'B2',
      data: {
        choices: ['will build', 'will have built', 'will be building', 'have built'],
        answerIndex: 1,
      },
    },

    // 5 CLOZE
    {
      type: 'CLOZE',
      prompt: 'Complete: I ___ (to finish) the report by tomorrow.',
      concept: 'future_perfect_completion',
      level: 'B2',
      data: {
        template: 'I {{1}} the report by tomorrow.',
        answers: ['will have finished'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: She ___ (to leave) before you arrive.',
      concept: 'future_perfect_before_action',
      level: 'B2',
      data: {
        template: 'She {{1}} before you arrive.',
        answers: ['will have left'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: They ___ (not / to complete) the work by next week.',
      concept: 'future_perfect_negative',
      level: 'B2',
      data: {
        template: 'They {{1}} the work by next week.',
        answers: ['will not have completed'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: We ___ (to live) here for 10 years by next month.',
      concept: 'future_perfect_duration',
      level: 'B2',
      data: {
        template: 'We {{1}} here for 10 years by next month.',
        answers: ['will have lived'],
      },
    },
    {
      type: 'CLOZE',
      prompt: 'Complete: He ___ (to read) all the books by the end of the year.',
      concept: 'future_perfect_completion',
      level: 'B2',
      data: {
        template: 'He {{1}} all the books by the end of the year.',
        answers: ['will have read'],
      },
    },

    // 5 ORDER
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['I', 'will', 'have', 'finished', 'by', '9', 'PM'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['She', 'will', 'have', 'graduated', 'by', 'next', 'June'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['They', 'will', 'have', 'completed', 'the', 'project', 'by', 'Friday'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['Will', 'you', 'have', 'finished', 'by', '5', 'PM'],
      },
    },
    {
      type: 'ORDER',
      prompt: 'Arrange the words in correct order:',
      concept: 'future_perfect_word_order',
      level: 'B2',
      data: {
        tokens: ['We', 'will', 'have', 'lived', 'here', 'for', '10', 'years'],
      },
    },

    // 5 TRANSLATE
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Tôi sẽ hoàn thành bài tập về nhà trước 9 giờ tối.',
        correctAnswer: 'I will have finished my homework by 9 PM.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Cô ấy sẽ tốt nghiệp vào tháng Sáu năm sau.',
        correctAnswer: 'She will have graduated by next June.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Họ sẽ không hoàn thành dự án trước thứ Sáu.',
        correctAnswer: 'They will not have completed the project by Friday.',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Bạn sẽ hoàn thành công việc trước 5 giờ chiều chứ?',
        correctAnswer: 'Will you have finished your work by 5 PM?',
      },
    },
    {
      type: 'TRANSLATE',
      prompt: 'Dịch câu sau sang tiếng Anh:',
      concept: 'future_perfect_translation',
      level: 'B2',
      data: {
        vietnameseText: 'Đến năm 2030, họ sẽ xây xong cây cầu mới.',
        correctAnswer: 'By 2030, they will have built the new bridge.',
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
        lessonId: 'lesson-future-perfect',
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

  console.log('🎉 Seed completed for Future Perfect Exercise!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
