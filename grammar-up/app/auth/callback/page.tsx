'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase tự động xử lý hash params và set session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          router.push('/login?error=session_failed')
          return
        }

        if (session) {
          console.log('Session established:', session.user.email)
          
          // Sync user to Prisma database
          await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.full_name || 
                       session.user.user_metadata?.name || 
                       session.user.email?.split('@')[0],
            }),
          })

          // Redirect to home
          router.push('/')
        } else {
          console.error('No session found')
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/login?error=unexpected')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-lg">Đang đăng nhập...</p>
      </div>
    </div>
  )
}