// prisma/lesson/seed-future-perfect-continuous.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-future-perfect-continuous'
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
      title: 'Future Perfect Continuous',
      description: 'Thì tương lai hoàn thành tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 12,
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
        title: 'Thì tương lai hoàn thành tiếp diễn (Future Perfect Continuous)',
        subtitle: 'Dùng cho hành động sẽ đang kéo dài đến một thời điểm trong tương lai',
        kahootHint: 'Warm-up: 3 câu về hành động kéo dài đến thời điểm tương lai',
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
          'Future Perfect Continuous diễn tả hành động sẽ đang diễn ra và kéo dài cho đến một thời điểm hoặc hành động khác trong tương lai. Nhấn mạnh sự liên tục.',
        examples: [
          { en: 'By next year, I will have been working here for 10 years.', vi: 'Đến năm sau, tôi sẽ làm việc ở đây được 10 năm.' },
          { en: 'She will have been studying for 3 hours by 9pm.', vi: 'Cô ấy sẽ học được 3 tiếng vào lúc 9 giờ tối.' },
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
          'Khẳng định: S + will + have + been + V-ing + O\nPhủ định: S + will + not + have + been + V-ing\nNghi vấn: Will + S + have + been + V-ing?',
        notes: [
          'will have been dùng cho tất cả các chủ ngữ.',
          'Nhấn mạnh khoảng thời gian: for (khoảng thời gian), by (thời điểm).',
          'Dùng với: by, by the time, for, by next week/month/year.',
        ],
        examples: [
          { en: 'They will have been playing for 2 hours by 5pm.', vi: 'Họ sẽ chơi được 2 tiếng vào lúc 5 giờ chiều.' },
          { en: 'Will you have been waiting long when I arrive?', vi: 'Bạn sẽ đợi lâu chưa khi tôi đến?' },
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
          'Câu nào đúng với thì tương lai hoàn thành tiếp diễn?',
        options: ['S + will + have + V3', 'S + will + be + V-ing', 'S + will + have + been + V-ing'],
        answerIndex: 2,
        explain: 'Future Perfect Continuous: will + have + been + V-ing để nhấn mạnh quá trình kéo dài đến tương lai.',
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
        question: 'By next month, she ___ for 5 hours a day for a year.',
        options: ['will study', 'will have studied', 'will have been studying'],
        answerIndex: 2,
        explain: 'Quá trình kéo dài đến thời điểm tương lai (by next month, for a year) → will have been studying.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'I ___ English for 10 years by 2030.',
        options: ['will learn', 'will have learned', 'will have been learning'],
        answerIndex: 2,
        explain: 'Quá trình học kéo dài (for 10 years) đến thời điểm (by 2030) → will have been learning.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ they ___ all day by the time we arrive?',
        options: ['Will / work', 'Will / have worked', 'Will / have been working'],
        answerIndex: 2,
        explain: 'Câu hỏi về quá trình kéo dài (all day) → Will + S + have + been + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not ___ for long when the result comes.',
        options: ['will / wait', 'will / have waited', 'will / have been waiting'],
        answerIndex: 2,
        explain: 'Phủ định với quá trình chờ đợi → will not have been waiting.',
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
          'By 2025, we will have lived here for 20 years.',
          'By 2025, we will have been living here for 20 years.',
          'By 2025, we will be living here for 20 years.',
        ],
        answerIndex: 1,
        explain: 'Nhấn mạnh quá trình sống liên tục (for 20 years) đến thời điểm (by 2025) → will have been living.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Future Perfect Continuous for lesson:', LESSON_ID)

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
