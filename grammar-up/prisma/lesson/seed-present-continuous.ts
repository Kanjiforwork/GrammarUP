// prisma/lesson/seed-present-continuous.ts
import { PrismaClient, LessonBlockType } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-present-continuous'
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
      title: 'Present Continuous',
      description: 'Thì hiện tại tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 2,
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
        title: 'Thì hiện tại tiếp diễn (Present Continuous)',
        subtitle: 'Dùng cho hành động đang diễn ra, kế hoạch tương lai',
        kahootHint: 'Warm-up: 3 câu về hành động đang xảy ra',
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
          'Present Continuous diễn tả hành động đang diễn ra ngay lúc nói, hành động tạm thời, kế hoạch tương lai đã sắp xếp.',
        examples: [
          { en: 'I am studying English now.', vi: 'Tôi đang học tiếng Anh bây giờ.' },
          { en: 'She is flying to London tomorrow.', vi: 'Cô ấy sẽ bay đến London ngày mai.' },
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
          'Khẳng định: S + am/is/are + V-ing + O\nPhủ định: S + am/is/are + not + V-ing\nNghi vấn: Am/Is/Are + S + V-ing?',
        notes: [
          'am → I; is → he/she/it; are → you/we/they.',
          'Động từ thêm -ing: work → working, run → running, die → dying.',
          'Dùng với: now, at the moment, currently, right now.',
        ],
        examples: [
          { en: 'They are playing football now.', vi: 'Họ đang chơi bóng đá bây giờ.' },
          { en: 'Is he working at the moment?', vi: 'Anh ấy có đang làm việc lúc này không?' },
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
          'Câu nào đúng với thì hiện tại tiếp diễn?',
        options: ['S + V(s/es) + O', 'S + am/is/are + V-ing', 'S + have/has + V3'],
        answerIndex: 1,
        explain: 'Present Continuous dùng: am/is/are + V-ing để diễn tả hành động đang diễn ra.',
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
        question: 'She ___ a book right now.',
        options: ['reads', 'is reading', 'read'],
        answerIndex: 1,
        explain: 'Hành động đang diễn ra (right now) → am/is/are + V-ing: is reading.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'They ___ to music at the moment.',
        options: ['listen', 'are listening', 'listens'],
        answerIndex: 1,
        explain: 'They → are + V-ing: are listening.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you studying English now?',
        options: ['Do', 'Are', 'Is'],
        answerIndex: 1,
        explain: 'Câu hỏi với you → Are + S + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not watching TV now.',
        options: ['does', 'is', 'are'],
        answerIndex: 1,
        explain: 'Phủ định: he → is not + V-ing.',
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
          'We visiting Ha Long Bay next week.',
          'We are visiting Ha Long Bay next week.',
          'We visits Ha Long Bay next week.',
        ],
        answerIndex: 1,
        explain: 'Kế hoạch tương lai → am/is/are + V-ing: are visiting.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Present Continuous for lesson:', LESSON_ID)

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
