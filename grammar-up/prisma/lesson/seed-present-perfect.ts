// prisma/lesson/seed-present-perfect.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-present-perfect'
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
      title: 'Present Perfect',
      description: 'Thì hiện tại hoàn thành',
      unitId: UNIT_ID,
      sortOrder: 3,
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
        title: 'Thì hiện tại hoàn thành (Present Perfect)',
        subtitle: 'Dùng cho hành động đã hoàn thành, kinh nghiệm, kết quả hiện tại',
        kahootHint: 'Warm-up: 3 câu về kinh nghiệm và hành động vừa mới xảy ra',
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
          'Present Perfect diễn tả hành động bắt đầu trong quá khứ và còn liên quan đến hiện tại, kinh nghiệm, hành động vừa mới hoàn thành.',
        examples: [
          { en: 'I have lived in Hanoi for 5 years.', vi: 'Tôi đã sống ở Hà Nội được 5 năm.' },
          { en: 'She has just finished her homework.', vi: 'Cô ấy vừa mới hoàn thành bài tập.' },
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
          'Khẳng định: S + have/has + V3/V-ed + O\nPhủ định: S + have/has + not + V3/V-ed\nNghi vấn: Have/Has + S + V3/V-ed?',
        notes: [
          'has → he/she/it; have → I/you/we/they.',
          'V3: động từ cột thứ 3 (bất quy tắc) hoặc V-ed (quy tắc).',
          'Dùng với: already, just, yet, ever, never, recently, for, since.',
        ],
        examples: [
          { en: 'They have visited Paris twice.', vi: 'Họ đã đến Paris hai lần.' },
          { en: 'Have you ever eaten sushi?', vi: 'Bạn đã từng ăn sushi chưa?' },
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
          'Câu nào đúng với thì hiện tại hoàn thành?',
        options: ['S + V(s/es) + O', 'S + am/is/are + V-ing', 'S + have/has + V3/V-ed'],
        answerIndex: 2,
        explain: 'Present Perfect dùng: have/has + V3/V-ed để diễn tả hành động liên quan đến hiện tại.',
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
        question: 'She ___ to Japan before.',
        options: ['goes', 'has gone', 'is going'],
        answerIndex: 1,
        explain: 'Kinh nghiệm (before) → have/has + V3: has gone.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'I ___ my keys. I cannot find them.',
        options: ['lose', 'have lost', 'am losing'],
        answerIndex: 1,
        explain: 'Kết quả ảnh hưởng đến hiện tại → have/has + V3: have lost.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you ever ___ Indian food?',
        options: ['Do / eat', 'Have / eaten', 'Are / eating'],
        answerIndex: 1,
        explain: 'Hỏi về kinh nghiệm (ever) → Have/Has + S + V3?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not finished his work yet.',
        options: ['does', 'is', 'has'],
        answerIndex: 2,
        explain: 'Phủ định với yet → have/has + not + V3: has not finished.',
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
          'We live here since 2020.',
          'We have lived here since 2020.',
          'We are living here since 2020.',
        ],
        answerIndex: 1,
        explain: 'Hành động bắt đầu quá khứ, tiếp tục hiện tại (since) → have/has + V3.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Present Perfect for lesson:', LESSON_ID)

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
