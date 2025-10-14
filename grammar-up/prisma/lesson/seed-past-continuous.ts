// prisma/lesson/seed-past-continuous.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-past-continuous'
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
      title: 'Past Continuous',
      description: 'Thì quá khứ tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 6,
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
        title: 'Thì quá khứ tiếp diễn (Past Continuous)',
        subtitle: 'Dùng cho hành động đang diễn ra tại một thời điểm trong quá khứ',
        kahootHint: 'Warm-up: 3 câu về hành động đang diễn ra trong quá khứ',
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
          'Past Continuous diễn tả hành động đang diễn ra tại một thời điểm cụ thể trong quá khứ hoặc hành động đang diễn ra thì có hành động khác xen vào.',
        examples: [
          { en: 'I was watching TV at 8pm last night.', vi: 'Tôi đang xem TV lúc 8 giờ tối hôm qua.' },
          { en: 'She was cooking when I called.', vi: 'Cô ấy đang nấu ăn khi tôi gọi.' },
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
          'Khẳng định: S + was/were + V-ing + O\nPhủ định: S + was/were + not + V-ing\nNghi vấn: Was/Were + S + V-ing?',
        notes: [
          'was → I/he/she/it; were → you/we/they.',
          'Thường dùng với when, while để nối 2 hành động.',
          'Dùng với: at this time yesterday, at 8pm last night, when, while.',
        ],
        examples: [
          { en: 'They were playing football when it started raining.', vi: 'Họ đang chơi bóng thì trời bắt đầu mưa.' },
          { en: 'Was he studying at 9pm?', vi: 'Anh ấy có đang học lúc 9 giờ tối không?' },
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
          'Câu nào đúng với thì quá khứ tiếp diễn?',
        options: ['S + V2/V-ed', 'S + was/were + V-ing', 'S + am/is/are + V-ing'],
        answerIndex: 1,
        explain: 'Past Continuous: was/were + V-ing để diễn tả hành động đang diễn ra trong quá khứ.',
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
        question: 'I ___ at 7am yesterday.',
        options: ['sleep', 'slept', 'was sleeping'],
        answerIndex: 2,
        explain: 'Hành động đang diễn ra tại thời điểm cụ thể → was/were + V-ing.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'They ___ dinner when I arrived.',
        options: ['have', 'had', 'were having'],
        answerIndex: 2,
        explain: 'Hành động đang diễn ra (were having) khi có hành động khác xen vào (arrived).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ she ___ a book at 10pm?',
        options: ['Did / read', 'Was / reading', 'Is / reading'],
        answerIndex: 1,
        explain: 'Câu hỏi về hành động đang diễn ra → Was/Were + S + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not listening to music.',
        options: ['is', 'was', 'did'],
        answerIndex: 1,
        explain: 'Phủ định quá khứ tiếp diễn → was/were + not + V-ing.',
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
          'We studied when the phone rang.',
          'We were studying when the phone rang.',
          'We are studying when the phone rang.',
        ],
        answerIndex: 1,
        explain: 'Hành động đang diễn ra (were studying) + hành động xen vào (rang).',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Past Continuous for lesson:', LESSON_ID)

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
