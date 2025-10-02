import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  
  // Validate next parameter để tránh open redirect
  const redirectTo = next.startsWith('/') ? next : '/'

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error.message)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
      }

      if (data.session) {
        console.log('User signed in:', data.user?.email)
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected_error`)
    }
  }

  // Nếu không có code hoặc thất bại
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
}