import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth/get-user'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { exerciseId, score, totalQuestions } = await request.json()

    // Validate input
    if (!exerciseId || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    let newStreak = 1
    let newHighestStreak = dbUser.highestStreak || 0

    // Calculate streak based on lastActiveDate
    if (dbUser.lastActiveDate) {
      const lastActive = new Date(dbUser.lastActiveDate)
      const lastActiveDay = new Date(
        lastActive.getFullYear(),
        lastActive.getMonth(),
        lastActive.getDate()
      )
      
      const dayDiff = Math.floor(
        (today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDiff === 0) {
        // Same day - keep current streak
        newStreak = dbUser.streak
      } else if (dayDiff === 1) {
        // Next day - increment streak
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

    // Add exerciseId to completedExercises if not already there
    const completedExercises = dbUser.completedExercises || []
    if (!completedExercises.includes(exerciseId)) {
      completedExercises.push(exerciseId)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        streak: newStreak,
        highestStreak: newHighestStreak,
        lastActiveDate: now,
        completedExercises: completedExercises,
      },
    })

    console.log(`✅ Updated user streak: ${updatedUser.streak} (highest: ${updatedUser.highestStreak})`)

    return NextResponse.json({
      success: true,
      streak: updatedUser.streak,
      highestStreak: updatedUser.highestStreak,
      completedExercises: updatedUser.completedExercises.length,
    })

  } catch (error) {
    console.error('❌ Error updating streak:', error)
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    )
  }
}
