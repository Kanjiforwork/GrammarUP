const { PrismaClient } = require('./lib/generated/prisma')

async function testLesson() {
  const prisma = new PrismaClient()
  
  try {
    // Check all lessons
    const allLessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true
      }
    })
    
    console.log('All lessons in database:')
    console.log(allLessons)
    
    // Check specific lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: 'lesson-present-simple' },
      include: {
        unit: true,
        blocks: true
      }
    })
    
    console.log('\nLesson present-simple:')
    console.log(lesson)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLesson()