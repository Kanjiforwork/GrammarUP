import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ Đổi thành này

// ❌ XÓA dòng này:
// const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { userId, email, username } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await prisma.user.upsert({
      where: { email },
      update: {
        username,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        email,
        username,
        role: 'USER' as const,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Database sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    )
  }
}
