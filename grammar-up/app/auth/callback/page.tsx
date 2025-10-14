'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Starting auth callback...')
        
        // Supabase tự động xử lý hash params và set session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setError('Session error: ' + sessionError.message)
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (!session) {
          console.error('❌ No session found')
          setError('No session found')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        console.log('✅ Session established:', session.user.email)
        
        // Sync user to Prisma database
        try {
          const syncResponse = await fetch('/api/auth/sync-user', {
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

          if (!syncResponse.ok) {
            const errorData = await syncResponse.json()
            console.error('❌ Sync user failed:', errorData)
            // Still redirect to home even if sync fails
            console.log('⚠️ Continuing despite sync error...')
          } else {
            console.log('✅ User synced successfully')
          }
        } catch (syncError) {
          console.error('❌ Sync request error:', syncError)
          // Continue anyway
        }

        // Redirect to home
        console.log('✅ Redirecting to home...')
        router.push('/')
        
      } catch (error) {
        console.error('❌ Unexpected error:', error)
        setError('Unexpected error: ' + (error as Error).message)
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">Lỗi đăng nhập</p>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <p className="text-gray-500 text-sm">Đang chuyển về trang chủ...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-lg">Đang đăng nhập...</p>
          </>
        )}
      </div>
    </div>
  )
}