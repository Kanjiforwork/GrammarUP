// prisma/lesson/seed-past-perfect-continuous.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-past-perfect-continuous'
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
      title: 'Past Perfect Continuous',
      description: 'Thì quá khứ hoàn thành tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 8,
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
        title: 'Thì quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)',
        subtitle: 'Dùng cho hành động đang diễn ra và kéo dài trước một thời điểm trong quá khứ',
        kahootHint: 'Warm-up: 3 câu về hành động kéo dài trước thời điểm trong quá khứ',
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
          'Past Perfect Continuous diễn tả hành động đang diễn ra và kéo dài cho đến một thời điểm hoặc hành động khác trong quá khứ. Nhấn mạnh sự liên tục của hành động.',
        examples: [
          { en: 'I had been waiting for two hours before the bus arrived.', vi: 'Tôi đã đợi được hai tiếng trước khi xe buýt đến.' },
          { en: 'She had been studying all night, so she was very tired.', vi: 'Cô ấy đã học suốt đêm nên rất mệt.' },
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
          'Khẳng định: S + had + been + V-ing + O\nPhủ định: S + had + not + been + V-ing\nNghi vấn: Had + S + been + V-ing?',
        notes: [
          'had dùng cho tất cả các chủ ngữ.',
          'Nhấn mạnh khoảng thời gian: for (khoảng thời gian), since (mốc thời gian).',
          'Dùng với: before, when, for, since, all day/night.',
        ],
        examples: [
          { en: 'They had been playing for an hour when it started raining.', vi: 'Họ đã chơi được một tiếng thì trời bắt đầu mưa.' },
          { en: 'Had you been working there long before you quit?', vi: 'Bạn đã làm việc ở đó lâu chưa trước khi nghỉ?' },
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
          'Câu nào đúng với thì quá khứ hoàn thành tiếp diễn?',
        options: ['S + was/were + V-ing', 'S + had + V3', 'S + had + been + V-ing'],
        answerIndex: 2,
        explain: 'Past Perfect Continuous: had + been + V-ing để nhấn mạnh hành động kéo dài trong quá khứ.',
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
        question: 'She ___ for 3 hours before she took a break.',
        options: ['had worked', 'had been working', 'was working'],
        answerIndex: 1,
        explain: 'Hành động kéo dài (for 3 hours) trước thời điểm khác → had been working.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'I ___ English for 5 years before I moved to the US.',
        options: ['learned', 'had learned', 'had been learning'],
        answerIndex: 2,
        explain: 'Quá trình học liên tục (for 5 years) trước khi chuyển đi → had been learning.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ they ___ all morning before the rain stopped?',
        options: ['Were / playing', 'Had / played', 'Had / been playing'],
        answerIndex: 2,
        explain: 'Câu hỏi về hành động kéo dài (all morning) → Had + S + been + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not ___ for long when he found the answer.',
        options: ['had / searched', 'had / been searching', 'was / searching'],
        answerIndex: 1,
        explain: 'Phủ định với quá trình tìm kiếm → had not been searching.',
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
          'We had been waited for an hour before the train came.',
          'We had been waiting for an hour before the train came.',
          'We had waiting for an hour before the train came.',
        ],
        answerIndex: 1,
        explain: 'Cấu trúc: had + been + V-ing (waiting, not waited).',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Past Perfect Continuous for lesson:', LESSON_ID)

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
