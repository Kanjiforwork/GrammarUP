// prisma/lesson/seed-future-perfect.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-future-perfect'
const UNIT_ID = 'unit-grammar-basics'

async function ensureLesson() {
  const existing = await prisma.lesson.findUnique({ where: { id: LESSON_ID } })
  if (existing) return existing

  // Create a minimal Unit if needed
  await prisma.unit.upsert({
    where: { id: UNIT_ID },
    update: {},
    create: {
      id: UNIT_ID,
      title: 'Grammar Basics',
      description: 'Các thì cơ bản',
      sortOrder: 1,
    },
  })

  return prisma.lesson.create({
    data: {
      id: LESSON_ID,
      title: 'Future Perfect',
      description: 'Thì tương lai hoàn thành',
      unitId: UNIT_ID,
      sortOrder: 11,
    },
  })
}

function buildBlocks(lessonId: string) {
  return [
    // 1) INTRO — Kahoot → Title → Intro component
    {
      lessonId,
      type: LessonBlockType.INTRO,
      order: 1,
      data: {
        title: 'Thì tương lai hoàn thành (Future Perfect)',
        subtitle: 'Dùng cho hành động sẽ hoàn thành trước một thời điểm trong tương lai',
        kahootHint: 'Warm-up: 3 câu về hành động sẽ hoàn thành trước thời điểm tương lai',
        cta: 'Bắt đầu học',
        ui: 'Intro',
      },
    },

    // 2) WHAT — Dùng để làm gì (2 ví dụ) → TextArea
    {
      lessonId,
      type: LessonBlockType.WHAT,
      order: 2,
      data: {
        heading: 'Dùng để làm gì?',
        content:
          'Future Perfect diễn tả hành động sẽ được hoàn thành trước một thời điểm hoặc hành động khác trong tương lai.',
        examples: [
          { en: 'I will have finished my homework by 9pm.', vi: 'Tôi sẽ hoàn thành bài tập trước 9 giờ tối.' },
          { en: 'She will have graduated by next year.', vi: 'Cô ấy sẽ tốt nghiệp vào năm sau.' },
        ],
        ui: 'TextArea',
      },
    },

    // 3) HOW — Cho ra cấu trúc → TextArea
    {
      lessonId,
      type: LessonBlockType.HOW,
      order: 3,
      data: {
        heading: 'Cấu trúc',
        content:
          'Khẳng định: S + will + have + V3/V-ed + O\nPhủ định: S + will + not + have + V3/V-ed\nNghi vấn: Will + S + have + V3/V-ed?',
        notes: [
          'will have dùng cho tất cả các chủ ngữ.',
          'V3: động từ cột thứ 3 (bất quy tắc) hoặc V-ed (quy tắc).',
          'Dùng với: by, by the time, before, by next week/month/year.',
        ],
        examples: [
          { en: 'They will have left by the time you arrive.', vi: 'Họ sẽ đã rời đi trước khi bạn đến.' },
          { en: 'Will you have completed the project by Friday?', vi: 'Bạn sẽ hoàn thành dự án trước thứ Sáu chứ?' },
        ],
        ui: 'TextArea',
      },
    },

    // 4) REMIND — Hỏi lại cấu trúc/dùng để làm gì → MCQ (1 câu)
    {
      lessonId,
      type: LessonBlockType.REMIND,
      order: 4,
      data: {
        quizType: 'MCQ',
        question:
          'Câu nào đúng với thì tương lai hoàn thành?',
        options: ['S + will + V', 'S + will + have + V3', 'S + will + be + V-ing'],
        answerIndex: 1,
        explain: 'Future Perfect: will + have + V3 để diễn tả hành động hoàn thành trước thời điểm tương lai.',
        ui: 'MultipleChoice',
      },
    },

    // 5) MINI QUIZ — 5 câu MCQ (mỗi block 1 câu)
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 5,
      data: {
        quizType: 'MCQ',
        question: 'By next month, I ___ here for 5 years.',
        options: ['will work', 'will have worked', 'will be working'],
        answerIndex: 1,
        explain: 'Hành động hoàn thành trước thời điểm (by next month) → will + have + V3.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'She ___ the book by tomorrow.',
        options: ['will finish', 'will have finished', 'will be finishing'],
        answerIndex: 1,
        explain: 'Hoàn thành trước thời điểm (by tomorrow) → will have finished.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you ___ dinner by 7pm?',
        options: ['Will / eat', 'Will / have eaten', 'Will / be eating'],
        answerIndex: 1,
        explain: 'Câu hỏi về hành động hoàn thành trước thời điểm → Will + S + have + V3?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'They ___ not ___ the project by the deadline.',
        options: ['will / finish', 'will / have finished', 'will / be finishing'],
        answerIndex: 1,
        explain: 'Phủ định: will + not + have + V3 để nói chưa hoàn thành trước thời hạn.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 9,
      data: {
        quizType: 'MCQ',
        question: 'Choose the correct sentence.',
        options: [
          'By 2030, robots will replace many jobs.',
          'By 2030, robots will have replaced many jobs.',
          'By 2030, robots will be replacing many jobs.',
        ],
        answerIndex: 1,
        explain: 'Hành động hoàn thành trước thời điểm cụ thể (by 2030) → will have replaced.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Future Perfect for lesson:', LESSON_ID)

  await ensureLesson()

  console.log('🧹 Cleaning old LessonBlocks…')
  await prisma.lessonBlock.deleteMany({ where: { lessonId: LESSON_ID } })

  const data = buildBlocks(LESSON_ID)
  const res = await prisma.lessonBlock.createMany({ data: data as any })
  console.log(`✅ Created ${res.count} LessonBlocks for ${LESSON_ID}`)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
