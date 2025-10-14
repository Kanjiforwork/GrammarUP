// prisma/lesson/seed-future-simple.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-future-simple'
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
      title: 'Future Simple',
      description: 'Thì tương lai đơn',
      unitId: UNIT_ID,
      sortOrder: 9,
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
        title: 'Thì tương lai đơn (Future Simple)',
        subtitle: 'Dùng cho hành động sẽ xảy ra trong tương lai, dự đoán, lời hứa',
        kahootHint: 'Warm-up: 3 câu về kế hoạch và dự đoán tương lai',
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
          'Future Simple diễn tả hành động sẽ xảy ra trong tương lai, dự đoán, lời hứa, quyết định đưa ra ngay lúc nói.',
        examples: [
          { en: 'I will call you tomorrow.', vi: 'Tôi sẽ gọi cho bạn vào ngày mai.' },
          { en: 'It will rain tonight.', vi: 'Tối nay trời sẽ mưa.' },
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
          'Khẳng định: S + will + V (nguyên mẫu) + O\nPhủ định: S + will + not (won\'t) + V\nNghi vấn: Will + S + V?',
        notes: [
          'will dùng cho tất cả các chủ ngữ.',
          'Dạng rút gọn: will not = won\'t.',
          'Dùng với: tomorrow, next week/month/year, soon, in the future.',
        ],
        examples: [
          { en: 'They will travel to Japan next year.', vi: 'Họ sẽ đi du lịch Nhật Bản năm sau.' },
          { en: 'Will you help me with this?', vi: 'Bạn sẽ giúp tôi việc này chứ?' },
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
          'Câu nào đúng với thì tương lai đơn?',
        options: ['S + V(s/es)', 'S + will + V', 'S + am/is/are + V-ing'],
        answerIndex: 1,
        explain: 'Future Simple: will + V (nguyên mẫu) để diễn tả hành động tương lai.',
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
        question: 'I ___ you the book tomorrow.',
        options: ['give', 'will give', 'am giving'],
        answerIndex: 1,
        explain: 'Hành động tương lai (tomorrow) → will + V: will give.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'She ___ be 18 next month.',
        options: ['will', 'is', 'does'],
        answerIndex: 0,
        explain: 'Next month → Future Simple: will be.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ they ___ to the party?',
        options: ['Do / come', 'Will / come', 'Are / coming'],
        answerIndex: 1,
        explain: 'Câu hỏi tương lai → Will + S + V?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not go to school tomorrow.',
        options: ['does', 'will', 'is'],
        answerIndex: 1,
        explain: 'Phủ định tương lai → will + not + V: will not go.',
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
          'I will helps you with your homework.',
          'I will help you with your homework.',
          'I will to help you with your homework.',
        ],
        answerIndex: 1,
        explain: 'Cấu trúc: will + V (nguyên mẫu), không thêm s hoặc to.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Future Simple for lesson:', LESSON_ID)

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
