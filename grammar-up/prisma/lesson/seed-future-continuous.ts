// prisma/lesson/seed-future-continuous.ts
import { PrismaClient, LessonBlockType } from '../../lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
})

const LESSON_ID = 'lesson-future-continuous'
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
      title: 'Future Continuous',
      description: 'Thì tương lai tiếp diễn',
      unitId: UNIT_ID,
      sortOrder: 10,
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
        title: 'Thì tương lai tiếp diễn (Future Continuous)',
        subtitle: 'Dùng cho hành động đang diễn ra tại một thời điểm trong tương lai',
        kahootHint: 'Warm-up: 3 câu về hành động đang diễn ra trong tương lai',
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
          'Future Continuous diễn tả hành động sẽ đang diễn ra tại một thời điểm cụ thể trong tương lai hoặc hành động đang diễn ra thì có hành động khác xen vào.',
        examples: [
          { en: 'I will be studying at 8pm tomorrow.', vi: 'Tôi sẽ đang học lúc 8 giờ tối ngày mai.' },
          { en: 'She will be working when you arrive.', vi: 'Cô ấy sẽ đang làm việc khi bạn đến.' },
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
          'Khẳng định: S + will + be + V-ing + O\nPhủ định: S + will + not + be + V-ing\nNghi vấn: Will + S + be + V-ing?',
        notes: [
          'will be dùng cho tất cả các chủ ngữ.',
          'Động từ thêm -ing: study → studying, run → running.',
          'Dùng với: at this time tomorrow, at 8pm next week, when, while.',
        ],
        examples: [
          { en: 'They will be playing football at 5pm tomorrow.', vi: 'Họ sẽ đang chơi bóng lúc 5 giờ chiều mai.' },
          { en: 'Will you be sleeping when I call?', vi: 'Bạn sẽ đang ngủ khi tôi gọi à?' },
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
          'Câu nào đúng với thì tương lai tiếp diễn?',
        options: ['S + will + V', 'S + will + be + V-ing', 'S + am/is/are + V-ing'],
        answerIndex: 1,
        explain: 'Future Continuous: will + be + V-ing để diễn tả hành động đang diễn ra trong tương lai.',
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
        question: 'I ___ at 7am tomorrow.',
        options: ['will sleep', 'will be sleeping', 'am sleeping'],
        answerIndex: 1,
        explain: 'Hành động đang diễn ra tại thời điểm tương lai → will + be + V-ing.',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 6,
      data: {
        quizType: 'MCQ',
        question: 'They ___ dinner when we arrive.',
        options: ['will have', 'will be having', 'have'],
        answerIndex: 1,
        explain: 'Hành động đang diễn ra (will be having) khi có hành động khác xen vào (arrive).',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 7,
      data: {
        quizType: 'MCQ',
        question: '___ she ___ a book at 10pm tonight?',
        options: ['Will / read', 'Will / be reading', 'Is / reading'],
        answerIndex: 1,
        explain: 'Câu hỏi về hành động đang diễn ra trong tương lai → Will + S + be + V-ing?',
        ui: 'MultipleChoice',
      },
    },
    {
      lessonId,
      type: LessonBlockType.MINIQUIZ,
      order: 8,
      data: {
        quizType: 'MCQ',
        question: 'He ___ not ___ to music at that time.',
        options: ['will / listen', 'will / be listening', 'is / listening'],
        answerIndex: 1,
        explain: 'Phủ định tương lai tiếp diễn → will + not + be + V-ing.',
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
          'We will study when you come tomorrow.',
          'We will be studying when you come tomorrow.',
          'We are studying when you come tomorrow.',
        ],
        answerIndex: 1,
        explain: 'Hành động đang diễn ra trong tương lai (will be studying) + hành động xen vào (come).',
        ui: 'MultipleChoice',
      },
    },
  ]
}

async function main() {
  console.log('🌱 Seeding Future Continuous for lesson:', LESSON_ID)

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
