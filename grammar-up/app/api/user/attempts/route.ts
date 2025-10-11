import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function GET(request: NextRequest) {
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

    // Get pagination params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    // Get all exercises with attempts grouped by session
    const attempts = await prisma.attempt.findMany({
      where: {
        userId: dbUser.id
      },
      include: {
        question: {
          include: {
            exerciseQuestions: {
              include: {
                exercise: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Group attempts by exercise session (within 1 hour window)
    const sessionMap = new Map<string, {
      exerciseId: string
      exerciseName: string
      attempts: typeof attempts
      lastAttemptDate: Date
      score: number
      totalQuestions: number
      percentage: number
    }>()

    for (const attempt of attempts) {
      const exerciseLink = attempt.question.exerciseQuestions[0]
      if (!exerciseLink) continue

      const exercise = exerciseLink.exercise
      const sessionKey = `${exercise.id}-${Math.floor(attempt.createdAt.getTime() / (60 * 60 * 1000))}`

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, {
          exerciseId: exercise.id,
          exerciseName: exercise.title,
          attempts: [],
          lastAttemptDate: attempt.createdAt,
          score: 0,
          totalQuestions: 0,
          percentage: 0
        })
      }

      const session = sessionMap.get(sessionKey)!
      session.attempts.push(attempt)
      
      if (attempt.createdAt > session.lastAttemptDate) {
        session.lastAttemptDate = attempt.createdAt
      }
    }

    // Calculate scores for each session
    const sessions = Array.from(sessionMap.values()).map(session => {
      // Get unique questions in this exercise
      const exerciseQuestions = new Set<string>()
      session.attempts.forEach(a => {
        a.question.exerciseQuestions.forEach(eq => {
          if (eq.exerciseId === session.exerciseId) {
            exerciseQuestions.add(eq.questionId)
          }
        })
      })

      // Count correct answers
      const correctQuestions = new Set(
        session.attempts
          .filter(a => a.isCorrect)
          .map(a => a.questionId)
      )

      session.totalQuestions = exerciseQuestions.size
      session.score = correctQuestions.size
      session.percentage = Math.round((session.score / session.totalQuestions) * 100)

      return {
        exerciseId: session.exerciseId,
        exerciseName: session.exerciseName,
        score: session.score,
        totalQuestions: session.totalQuestions,
        percentage: session.percentage,
        completedAt: session.lastAttemptDate
      }
    })

    // Sort by completion date (newest first)
    sessions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    // Apply pagination
    const totalSessions = sessions.length
    const paginatedSessions = sessions.slice(skip, skip + limit)
    const totalPages = Math.ceil(totalSessions / limit)

    return NextResponse.json({
      attempts: paginatedSessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalSessions,
        hasMore: page < totalPages
      }
    })

  } catch (error) {
    console.error('❌ Error fetching attempt history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attempt history' },
      { status: 500 }
    )
  }
}
