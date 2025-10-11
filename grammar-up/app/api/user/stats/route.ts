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

    // Count unique exercises with attempts (completed exercises)
    const completedExercisesCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT e.id) as count
      FROM "Exercise" e
      INNER JOIN "ExerciseQuestion" eq ON eq."exerciseId" = e.id
      INNER JOIN "Attempt" a ON a."questionId" = eq."questionId" AND a."userId" = ${dbUser.id}
    `

    // Count unique lessons with attempts (completed lessons)  
    const completedLessonsCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT q."lessonId") as count
      FROM "Question" q
      INNER JOIN "Attempt" a ON a."questionId" = q.id AND a."userId" = ${dbUser.id}
      WHERE q."lessonId" IS NOT NULL
    `

    // Return stats
    return NextResponse.json({
      streak: dbUser.streak,
      highestStreak: dbUser.highestStreak,
      completedExercises: Number(completedExercisesCount[0]?.count || 0),
      completedLessons: Number(completedLessonsCount[0]?.count || 0),
    })

  } catch (error) {
    console.error('❌ Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
