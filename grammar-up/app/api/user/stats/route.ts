import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = dbUser.id

    // Count unique exercises with attempts (completed exercises)
    const completedExercisesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT e.id) as count
      FROM "Exercise" e
      INNER JOIN "ExerciseQuestion" eq ON eq."exerciseId" = e.id
      INNER JOIN "Attempt" a ON a."questionId" = eq."questionId" AND a."userId" = ${userId}
      WHERE (e."createdById" = ${userId} OR e."source" = 'OFFICIAL')
    `

    // Count unique lessons with attempts (completed lessons)  
    const completedLessonsCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT q."lessonId") as count
      FROM "Question" q
      INNER JOIN "Lesson" l ON l.id = q."lessonId"
      INNER JOIN "Attempt" a ON a."questionId" = q.id AND a."userId" = ${userId}
      WHERE q."lessonId" IS NOT NULL
        AND (l."createdById" = ${userId} OR l."source" = 'OFFICIAL')
    `

    // ✅ FIXED: Get total exercises count (only user's + official)
    const totalExercises = await prisma.exercise.count({
      where: {
        OR: [
          { createdById: userId },
          { source: 'OFFICIAL' }
        ]
      }
    })

    // ✅ FIXED: Get total lessons count (only user's + official)
    const totalLessons = await prisma.lesson.count({
      where: {
        OR: [
          { createdById: userId },
          { source: 'OFFICIAL' }
        ]
      }
    })

    // Return stats
    return NextResponse.json({
      streak: dbUser.streak,
      highestStreak: dbUser.highestStreak,
      completedExercises: Number(completedExercisesCount[0]?.count || 0),
      completedLessons: Number(completedLessonsCount[0]?.count || 0),
      totalExercises,
      totalLessons,
    })

  } catch (error) {
    console.error('❌ Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
