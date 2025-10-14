import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('🔄 [sync-user] Starting...')
    
    const body = await request.json()
    const { userId, email, username } = body
    
    console.log('📦 [sync-user] Received:', { userId, email, username })

    if (!userId || !email) {
      console.error('❌ [sync-user] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('💾 [sync-user] Upserting user...')
    
    const user = await prisma.user.upsert({
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

    console.log('✅ [sync-user] Success:', user.email)
    return NextResponse.json({ success: true, user })
    
  } catch (error) {
    console.error('❌ [sync-user] Database error:', error)
    console.error('Stack:', (error as Error).stack)
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
