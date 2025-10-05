import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function getCurrentUser() {
  console.log('🔍 [getCurrentUser] Starting...')
  
  try {
    // Lấy session từ Supabase (server-side)
    const supabase = await createClient()
    console.log('✅ [getCurrentUser] Supabase client created')
    
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('❌ [getCurrentUser] Supabase auth error:', error)
      return null
    }
    
    if (!supabaseUser) {
      console.log('⚠️ [getCurrentUser] No supabase user found')
      return null
    }
    
    console.log('✅ [getCurrentUser] Supabase user found:', supabaseUser.email)
    
    // Lấy user data từ Prisma database
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
      }
    })
    
    if (!user) {
      console.log('⚠️ [getCurrentUser] User not found in Prisma database:', supabaseUser.email)
    } else {
      console.log('✅ [getCurrentUser] User found in database:', user.username)
    }
    
    return user
  } catch (error) {
    console.error('❌ [getCurrentUser] Unexpected error:', error)
    return null
  }
}