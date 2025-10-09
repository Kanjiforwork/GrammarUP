import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        lesson: true,
        _count: {
          select: {
            exerciseQuestions: true,
          },
        },
      },
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
