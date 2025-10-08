import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL, // Use direct connection, not pooled
    },
  },
})

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Unit
  const unit = await prisma.unit.create({
    data: {
      id: 'unit-tenses',
      title: 'English Tenses',
      description: '12 thì trong tiếng Anh',
      sortOrder: 1,
    },
  })
  console.log('✅ Created Unit:', unit.title)

  // 2. Create 12 Lessons (empty - no questions)
  const lessonsData = [
    {
      id: 'lesson-present-simple',
      title: 'Present Simple',
      description: 'Thì hiện tại đơn',
    },
    {
      id: 'lesson-present-continuous',
      title: 'Present Continuous',
      description: 'Thì hiện tại tiếp diễn',
    },
    {
      id: 'lesson-present-perfect',
      title: 'Present Perfect',
      description: 'Thì hiện tại hoàn thành',
    },
    {
      id: 'lesson-present-perfect-continuous',
      title: 'Present Perfect Continuous',
      description: 'Thì hiện tại hoàn thành tiếp diễn',
    },
    {
      id: 'lesson-past-simple',
      title: 'Past Simple',
      description: 'Thì quá khứ đơn',
    },
    {
      id: 'lesson-past-continuous',
      title: 'Past Continuous',
      description: 'Thì quá khứ tiếp diễn',
    },
    {
      id: 'lesson-past-perfect',
      title: 'Past Perfect',
      description: 'Thì quá khứ hoàn thành',
    },
    {
      id: 'lesson-past-perfect-continuous',
      title: 'Past Perfect Continuous',
      description: 'Thì quá khứ hoàn thành tiếp diễn',
    },
    {
      id: 'lesson-future-simple',
      title: 'Future Simple',
      description: 'Thì tương lai đơn',
    },
    {
      id: 'lesson-future-continuous',
      title: 'Future Continuous',
      description: 'Thì tương lai tiếp diễn',
    },
    {
      id: 'lesson-future-perfect',
      title: 'Future Perfect',
      description: 'Thì tương lai hoàn thành',
    },
    {
      id: 'lesson-future-perfect-continuous',
      title: 'Future Perfect Continuous',
      description: 'Thì tương lai hoàn thành tiếp diễn',
    },
  ]

  for (let i = 0; i < lessonsData.length; i++) {
    const lessonData = lessonsData[i]
    await prisma.lesson.create({
      data: {
        ...lessonData,
        unitId: unit.id,
        sortOrder: i + 1,
      },
    })
    console.log(`✅ Created Lesson ${i + 1}/12:`, lessonData.title)
  }

  console.log('🎉 Seed completed successfully!')
  console.log(`📦 Created 1 Unit with 12 empty Lessons`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })