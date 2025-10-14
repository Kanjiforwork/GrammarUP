// prisma/lesson/seed-past-perfect.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-past-perfect'
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
      title: 'Past Perfect',
      description: 'Thì quá khứ hoàn thành',
      unitId: UNIT_ID,
      sortOrder: 7,
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
        title: 'Thì quá khứ hoàn thành (Past Perfect)',
        subtitle: 'Dùng cho hành động xảy ra trước một hành động khác trong quá khứ',
        kahootHint: 'Warm-up: 3 câu về hành động xảy ra trước hành động khác trong quá khứ',
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
          'Past Perfect diễn tả hành động đã hoàn thành trước một hành động hoặc thời điểm khác trong quá khứ.',
        examples: [
          { en: 'When I arrived, she had already left.', vi: 'Khi tôi đến, cô ấy đã rời đi rồi.' },
          { en: 'He had finished his work before the meeting started.', vi: 'Anh ấy đã hoàn thành công việc trước khi cuộc họp bắt đầu.' },
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
          'Khẳng định: S + had + V3/V-ed + O\nPhủ định: S + had + not + V3/V-ed\nNghi vấn: Had + S + V3/V-ed?',
        notes: [
          'had dùng cho tất cả các chủ ngữ.',
          'V3: động từ cột thứ 3 (bất quy tắc) hoặc V-ed (quy tắc).',
          'Dùng với: before, after, by the time, when, already, just, never, until.',
        ],
        examples: [
          { en: 'They had eaten dinner before I called.', vi: 'Họ đã ăn tối trước khi tôi gọi.' },
          { en: 'Had you ever seen that movie before yesterday?', vi: 'Bạn đã từng xem bộ phim đó trước hôm qua chưa?' },
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
          'Câu nào đúng với thì quá khứ hoàn thành?',
        options: ['S + V2/V-ed', 'S + had + V3/V-ed', 'S + have/has + V3'],
        answerIndex: 1,
        explain: 'Past Perfect: had + V3/V-ed để diễn tả hành động xảy ra trước hành động khác trong quá khứ.',
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
        question: 'When I got home, my family ___ dinner.',
        options: ['ate', 'had eaten', 'have eaten'],
        answerIndex: 1,
        explain: 'Hành động xảy ra trước (had eaten) một hành động khác trong quá khứ (got home).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'She ___ her keys before she left.',
        options: ['loses', 'had lost', 'has lost'],
        answerIndex: 1,
        explain: 'Hành động mất chìa khóa (had lost) xảy ra trước khi rời đi (left).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you ___ English before you moved to London?',
        options: ['Did / study', 'Had / studied', 'Have / studied'],
        answerIndex: 1,
        explain: 'Câu hỏi về hành động xảy ra trước (had studied) hành động khác (moved).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'They ___ not finished the project when the boss arrived.',
        options: ['did', 'had', 'have'],
        answerIndex: 1,
        explain: 'Phủ định: had + not + V3 để nói chưa hoàn thành trước thời điểm khác.',
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
          'After he finished his homework, he had watched TV.',
          'After he had finished his homework, he watched TV.',
          'After he has finished his homework, he watched TV.',
        ],
        answerIndex: 1,
        explain: 'Hành động xảy ra trước (had finished) dùng Past Perfect, hành động sau (watched) dùng Past Simple.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Past Perfect for lesson:', LESSON_ID)

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
