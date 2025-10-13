// prisma/lesson/seed-present-simple.ts
import { PrismaClient, LessonBlockType } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-present-simple'
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
      title: 'Present Simple',
      description: 'Thì hiện tại đơn',
      unitId: UNIT_ID,
      sortOrder: 1,
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
        title: 'Thì hiện tại đơn (Present Simple)',
        subtitle: 'Dùng cho thói quen, sự thật, lịch trình',
        kahootHint: 'Warm-up: 3 câu đúng/sai về thói quen hằng ngày',
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
          'Present Simple diễn tả thói quen, sự thật hiển nhiên và lịch trình cố định.',
        examples: [
          { en: 'I drink tea every morning.', vi: 'Tôi uống trà mỗi sáng.' },
          { en: 'Water boils at 100°C.', vi: 'Nước sôi ở 100°C.' },
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
          'Khẳng định: S + V(s/es) + O\nPhủ định: S + do/does + not + V\nNghi vấn: Do/Does + S + V?',
        notes: [
          'He/She/It → thêm s/es cho động từ.',
          'I/You/We/They → dùng động từ nguyên mẫu.',
          'Does đi với he/she/it; Do đi với I/you/we/they.',
        ],
        examples: [
          { en: 'She works on Mondays.', vi: 'Cô ấy làm việc vào thứ Hai.' },
          { en: 'Do you like coffee?', vi: 'Bạn có thích cà phê không?' },
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
          'Câu nào đúng với chủ ngữ he/she/it trong thì hiện tại đơn?',
        options: ['S + V + O', 'S + V(s/es) + O', 'S + am/is/are + V-ing'],
        answerIndex: 1,
        explain: 'Với he/she/it, động từ thêm s/es: She works, He goes.',
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
        question: 'She ___ to school every day.',
        options: ['go', 'goes', 'going'],
        answerIndex: 1,
        explain: 'He/She/It → thêm s/es: goes.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'They ___ football on Sundays.',
        options: ['play', 'plays', 'playing'],
        answerIndex: 0,
        explain: 'They → động từ nguyên mẫu: play.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you like noodles?',
        options: ['Do', 'Does', 'Are'],
        answerIndex: 0,
        explain: 'Do dùng với you/we/they/I.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not watch TV at night.',
        options: ['do', 'does', 'is'],
        answerIndex: 1,
        explain: 'Phủ định: he → does not / doesn’t.',
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
          'She go to work by bus.',
          'She goes to work by bus.',
          'She going to work by bus.',
        ],
        answerIndex: 1,
        explain: 'He/She/It → goes.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Present Simple for lesson:', LESSON_ID)

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
