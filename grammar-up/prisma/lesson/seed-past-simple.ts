// prisma/lesson/seed-past-simple.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-past-simple'
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
      title: 'Past Simple',
      description: 'Thì quá khứ đơn',
      unitId: UNIT_ID,
      sortOrder: 5,
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
        title: 'Thì quá khứ đơn (Past Simple)',
        subtitle: 'Dùng cho hành động đã hoàn thành trong quá khứ',
        kahootHint: 'Warm-up: 3 câu về hành động đã xảy ra và kết thúc trong quá khứ',
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
          'Past Simple diễn tả hành động đã xảy ra và hoàn thành ở một thời điểm cụ thể trong quá khứ.',
        examples: [
          { en: 'I visited Paris last year.', vi: 'Tôi đã đến Paris năm ngoái.' },
          { en: 'She finished her homework yesterday.', vi: 'Cô ấy đã hoàn thành bài tập hôm qua.' },
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
          'Khẳng định: S + V2/V-ed + O\nPhủ định: S + did + not + V + O\nNghi vấn: Did + S + V + O?',
        notes: [
          'V2: động từ cột 2 (bất quy tắc) hoặc V-ed (quy tắc).',
          'Phủ định và nghi vấn dùng did + động từ nguyên mẫu.',
          'Dùng với: yesterday, last week/month/year, ago, in + năm quá khứ.',
        ],
        examples: [
          { en: 'They went to the beach last summer.', vi: 'Họ đã đi biển mùa hè năm ngoái.' },
          { en: 'Did you see him yesterday?', vi: 'Bạn có gặp anh ấy hôm qua không?' },
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
          'Câu nào đúng với thì quá khứ đơn?',
        options: ['S + V(s/es)', 'S + V2/V-ed', 'S + have/has + V3'],
        answerIndex: 1,
        explain: 'Past Simple dùng V2 (quá khứ) hoặc V-ed cho động từ có quy tắc.',
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
        question: 'I ___ to London last month.',
        options: ['go', 'went', 'have gone'],
        answerIndex: 1,
        explain: 'Thời điểm cụ thể trong quá khứ (last month) → V2: went.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'She ___ a book yesterday.',
        options: ['reads', 'read', 'is reading'],
        answerIndex: 1,
        explain: 'Yesterday → Past Simple: read (phát âm /red/, quá khứ của read).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ you ___ TV last night?',
        options: ['Do / watch', 'Did / watch', 'Have / watched'],
        answerIndex: 1,
        explain: 'Câu hỏi quá khứ → Did + S + V (nguyên mẫu)?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'They ___ not come to the party.',
        options: ['do', 'did', 'does'],
        answerIndex: 1,
        explain: 'Phủ định quá khứ → did + not + V (nguyên mẫu).',
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
          'He goed to school yesterday.',
          'He went to school yesterday.',
          'He go to school yesterday.',
        ],
        answerIndex: 1,
        explain: 'Go là động từ bất quy tắc → quá khứ: went.',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Past Simple for lesson:', LESSON_ID)

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
