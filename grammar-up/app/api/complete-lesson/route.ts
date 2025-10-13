import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, blocksCompleted, totalBlocks } = body

    console.log('📚 Completing lesson:', { lessonId, blocksCompleted, totalBlocks })

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate streak
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let newStreak = 1
    let newHighestStreak = dbUser.highestStreak

    if (dbUser.lastActiveDate) {
      const lastActive = new Date(dbUser.lastActiveDate)
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
      const diffTime = today.getTime() - lastActiveDay.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Same day - keep current streak
        newStreak = dbUser.streak
      } else if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = dbUser.streak + 1
      } else {
        // Streak broken - reset to 1
        newStreak = 1
      }
    }

    // Update highest streak if needed
    if (newStreak > newHighestStreak) {
      newHighestStreak = newStreak
    }

    // Add lesson to completedLessons if not already there
    const completedLessons = dbUser.completedLessons || []
    const updatedCompletedLessons = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId]

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        streak: newStreak,
        highestStreak: newHighestStreak,
        lastActiveDate: now,
        completedLessons: updatedCompletedLessons
      }
    })

    console.log('✅ Lesson completed, streak updated:', {
      streak: newStreak,
      highestStreak: newHighestStreak,
      completedLessons: updatedCompletedLessons.length
    })

    return NextResponse.json({
      streak: updatedUser.streak,
      highestStreak: updatedUser.highestStreak,
      completedLessons: updatedCompletedLessons.length
    })

  } catch (error) {
    console.error('❌ Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}