// prisma/lesson/seed-present-perfect-continuous.ts
import { config } from 'dotenv'
config() // Load .env file

import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { 
      url: process.env.DIRECT_URL || process.env.DATABASE_URL 
    },
  },
})

const LESSON_ID = 'lesson-present-perfect-continuous'
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
      title: 'Present Perfect Continuous',
      description: 'Thì hiện tại hoàn thành tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 4,
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
        title: 'Thì hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)',
        subtitle: 'Dùng cho hành động bắt đầu trong quá khứ, kéo dài và có thể vẫn tiếp tục',
        kahootHint: 'Warm-up: 3 câu về hành động kéo dài từ quá khứ đến hiện tại',
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
          'Present Perfect Continuous diễn tả hành động bắt đầu trong quá khứ, kéo dài đến hiện tại và có thể vẫn tiếp tục. Nhấn mạnh vào quá trình hơn là kết quả.',
        examples: [
          { en: 'I have been studying English for 3 hours.', vi: 'Tôi đã học tiếng Anh được 3 tiếng rồi.' },
          { en: 'She has been working here since 2020.', vi: 'Cô ấy đã làm việc ở đây từ năm 2020.' },
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
          'Khẳng định: S + have/has + been + V-ing + O\nPhủ định: S + have/has + not + been + V-ing\nNghi vấn: Have/Has + S + been + V-ing?',
        notes: [
          'has → he/she/it; have → I/you/we/they.',
          'Nhấn mạnh thời gian: for (khoảng thời gian), since (mốc thời gian).',
          'Dùng với: for, since, all day, all morning, recently.',
        ],
        examples: [
          { en: 'They have been playing football for 2 hours.', vi: 'Họ đã chơi bóng được 2 tiếng rồi.' },
          { en: 'Has he been waiting long?', vi: 'Anh ấy đã đợi lâu chưa?' },
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
          'Câu nào đúng với thì hiện tại hoàn thành tiếp diễn?',
        options: ['S + am/is/are + V-ing', 'S + have/has + V3', 'S + have/has + been + V-ing'],
        answerIndex: 2,
        explain: 'Present Perfect Continuous: have/has + been + V-ing để nhấn mạnh quá trình kéo dài.',
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
        question: 'She ___ for 30 minutes.',
        options: ['has been running', 'has run', 'is running'],
        answerIndex: 0,
        explain: 'Hành động kéo dài (for 30 minutes) → have/has + been + V-ing.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'I ___ English since 2018.',
        options: ['learn', 'have learned', 'have been learning'],
        answerIndex: 2,
        explain: 'Hành động tiếp diễn từ quá khứ (since 2018) → have been learning.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you ___ all day?',
        options: ['Do / work', 'Have / worked', 'Have / been working'],
        answerIndex: 2,
        explain: 'Câu hỏi về quá trình kéo dài (all day) → Have + S + been + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'They ___ not ___ TV for hours.',
        options: ['have / watched', 'have / been watching', 'are / watching'],
        answerIndex: 1,
        explain: 'Phủ định với khoảng thời gian → have not been watching.',
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
          'He has been lived here for 5 years.',
          'He has been living here for 5 years.',
          'He has living here for 5 years.',
        ],
        answerIndex: 1,
        explain: 'Cấu trúc: have/has + been + V-ing (living, not lived).',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Present Perfect Continuous for lesson:', LESSON_ID)

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
